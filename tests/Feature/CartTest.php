<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_add_and_view_cart()
    {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10, 'price_adjustment' => 0]);

        $guestToken = (string) Str::uuid();

        $resp = $this->withHeader('X-Guest-Token', $guestToken)
            ->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2]);

        $resp->assertStatus(201);

        $this->assertDatabaseHas('carts', ['guest_token' => $guestToken]);
        $this->assertDatabaseHas('cart_items', ['product_variant_id' => $variant->id, 'quantity' => 2]);

        $get = $this->withHeader('X-Guest-Token', $guestToken)->getJson('/api/cart');
        $get->assertStatus(200)->assertJsonStructure(['id','owner','items','total']);
    }

    public function test_user_can_add_update_and_remove_item()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 5]);

        $add = $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2]);
        $add->assertStatus(201);

        $itemId = $add->json('id');
        $this->assertDatabaseHas('cart_items', ['id' => $itemId, 'quantity' => 2]);

        // update to 3
        $this->putJson("/api/cart/items/{$itemId}", ['quantity' => 3])->assertStatus(200);
        $this->assertDatabaseHas('cart_items', ['id' => $itemId, 'quantity' => 3]);

        // update to 0 => removed
        $this->putJson("/api/cart/items/{$itemId}", ['quantity' => 0])->assertStatus(200);
        $this->assertDatabaseMissing('cart_items', ['id' => $itemId]);
    }

    public function test_bearer_token_on_public_cart_routes_resolves_user_cart()
    {
        $user = User::factory()->create();
        $token = $user->createToken('cart-test')->plainTextToken;

        $guestToken = (string) Str::uuid();
        $guestCart = Cart::create(['guest_token' => $guestToken]);

        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10]);

        $guestCart->items()->create([
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2])
            ->assertStatus(201);

        $cartResponse = $this
            ->withHeaders([
                'Authorization' => "Bearer {$token}",
                'X-Guest-Token' => $guestToken,
            ])
            ->getJson('/api/cart');

        $cartResponse->assertStatus(200);
        $cartResponse->assertJsonPath('owner.type', 'user');
        $cartResponse->assertJsonPath('owner.user_id', $user->id);
        $cartResponse->assertJsonPath('items.0.quantity', 2);

        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
        $this->assertDatabaseHas('carts', ['guest_token' => $guestToken]);
        $this->assertDatabaseHas('cart_items', ['cart_id' => $guestCart->id, 'quantity' => 1]);
    }

    public function test_add_twice_sums_and_respects_stock()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 4]);

        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 3])->assertStatus(201);

        // adding 2 more should fail because 3+2 > 4
        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2])->assertStatus(422);
    }

    public function test_merge_guest_cart_into_user_cart()
    {
        $user = User::factory()->create();

        // guest cart
        $guestToken = (string) Str::uuid();
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2])->assertStatus(201);

        // user already has 1 of same variant
        $this->actingAs($user, 'sanctum');
        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 1])->assertStatus(201);

        // merge
        $resp = $this->withHeader('X-Guest-Token', $guestToken)->actingAs($user, 'sanctum')->postJson('/api/cart/merge');
        $resp->assertStatus(200);

        // guest cart removed
        $this->assertDatabaseMissing('carts', ['guest_token' => $guestToken]);

        // user cart now has quantity 3 for the variant
        $this->assertDatabaseHas('cart_items', ['product_variant_id' => $variant->id, 'quantity' => 3]);
    }

    public function test_cannot_add_variant_from_inactive_product()
    {
        $guestToken = (string) Str::uuid();
        $product = Product::factory()->create(['is_active' => false]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 5]);

        $resp = $this->withHeader('X-Guest-Token', $guestToken)
            ->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 1]);

        $resp->assertStatus(422);
        $this->assertDatabaseMissing('cart_items', ['product_variant_id' => $variant->id]);
    }

    public function test_merge_skips_inactive_product_and_warns()
    {
        $user = User::factory()->create();

        $guestToken = (string) Str::uuid();
        $product = Product::factory()->create(['is_active' => false]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10]);

        // create a guest cart with the inactive variant (simulate older guest cart)
        $guestCart = Cart::create(['guest_token' => $guestToken]);
        $guestCart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 2]);

        $resp = $this->withHeader('X-Guest-Token', $guestToken)->actingAs($user, 'sanctum')->postJson('/api/cart/merge');
        $resp->assertStatus(200);

        $warnings = $resp->json('warnings');
        $this->assertNotEmpty($warnings);
        $this->assertContains("Variant {$variant->id} unavailable or product inactive", $warnings);

        // ensure guest cart removed
        $this->assertDatabaseMissing('carts', ['guest_token' => $guestToken]);
    }

    public function test_cart_total_uses_same_price_as_product_resource()
    {
        $guestToken = (string) Str::uuid();

        $product = Product::factory()->create([
            'base_price' => 120000,
            'sale_price' => 100000,
            'is_active' => true,
        ]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => 10,
            'price_adjustment' => 5000,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)
            ->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2])
            ->assertStatus(201);

        $productResponse = $this->getJson('/api/products/' . $product->slug);
        $productResponse->assertStatus(200);
        $displayedVariantPrice = (float) $productResponse->json('data.variants.0.price');

        $cartResponse = $this->withHeader('X-Guest-Token', $guestToken)->getJson('/api/cart');
        $cartResponse->assertStatus(200);

        $this->assertSame($displayedVariantPrice, (float) $cartResponse->json('items.0.unit_price'));
        $this->assertSame(round($displayedVariantPrice * 2, 2), (float) $cartResponse->json('total'));
    }
}
