<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class VoucherTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_voucher()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $payload = [
            'code' => 'TEST10',
            'type' => 'percent',
            'value' => 10,
            'max_discount' => 100,
            'min_order_amount' => 0,
            'usage_limit' => 10,
            'usage_per_user' => 2,
            'is_active' => 1,
        ];

        $create = $this->postJson('/api/admin/vouchers', $payload);
        $create->assertStatus(201)->assertJsonPath('data.code', 'TEST10');

        $id = $create->json('data.id');

        $list = $this->getJson('/api/admin/vouchers');
        $list->assertStatus(200)->assertJsonStructure(['success', 'message', 'data', 'meta']);

        $show = $this->getJson("/api/admin/vouchers/{$id}");
        $show->assertStatus(200)->assertJsonPath('data.code', 'TEST10');

        $update = $this->putJson("/api/admin/vouchers/{$id}", ['code' => 'TEST11', 'type' => 'fixed', 'value' => 50]);
        $update->assertStatus(200)->assertJsonPath('data.code', 'TEST11');

        $delete = $this->deleteJson("/api/admin/vouchers/{$id}");
        $delete->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseHas('vouchers', ['id' => $id, 'is_active' => 0]);
    }

    public function test_guest_can_check_valid_voucher()
    {
        $product = Product::factory()->create(['base_price' => 1000, 'sale_price' => null]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10, 'price_adjustment' => 0]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        $cart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 2]);

        $voucher = Voucher::create(['code' => 'FIXED10', 'type' => 'fixed', 'value' => 100, 'min_order_amount' => 0, 'usage_limit' => null, 'usage_per_user' => 1, 'is_active' => 1]);

        $resp = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/vouchers/check', ['code' => 'FIXED10']);
        $resp->assertStatus(200);
        $this->assertEquals(100.0, (float) $resp->json('data.discount'));

        $this->assertDatabaseCount('voucher_usages', 0);
        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id, 'used_count' => 0]);
    }

    public function test_user_can_check_valid_voucher()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $product = Product::factory()->create(['base_price' => 500, 'sale_price' => null]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10, 'price_adjustment' => 0]);

        $cart = Cart::create(['user_id' => $user->id]);
        $cart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 1]);

        $voucher = Voucher::create(['code' => 'PERC10', 'type' => 'percent', 'value' => 10, 'max_discount' => 100, 'min_order_amount' => 0, 'usage_limit' => null, 'usage_per_user' => 1, 'is_active' => 1]);

        $resp = $this->postJson('/api/vouchers/check', ['code' => 'PERC10']);
        $resp->assertStatus(200);
        $this->assertEquals(50.0, (float) $resp->json('data.discount'));

        $this->assertDatabaseCount('voucher_usages', 0);
    }

    public function test_invalid_code_returns_error()
    {
        $guestToken = (string) Str::uuid();
        $resp = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/vouchers/check', ['code' => 'NOPE']);
        $resp->assertStatus(422)->assertJsonStructure(['errors']);
    }

    public function test_min_order_amount_enforced()
    {
        $product = Product::factory()->create(['base_price' => 100, 'sale_price' => null]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10, 'price_adjustment' => 0]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        $cart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 1]);

        $voucher = Voucher::create(['code' => 'MIN1000', 'type' => 'fixed', 'value' => 50, 'min_order_amount' => 1000, 'is_active' => 1]);

        $resp = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/vouchers/check', ['code' => 'MIN1000']);
        $resp->assertStatus(422)->assertJsonStructure(['errors']);
    }

    public function test_percent_max_discount_and_fixed_behavior()
    {
        $product = Product::factory()->create(['base_price' => 2000, 'sale_price' => null]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10, 'price_adjustment' => 0]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        $cart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 2]);

        // percent with max_discount
        $pv = Voucher::create(['code' => 'PCT50', 'type' => 'percent', 'value' => 50, 'max_discount' => 100, 'min_order_amount' => 0, 'is_active' => 1]);
        $resp = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/vouchers/check', ['code' => 'PCT50']);
        // subtotal = 4000, 50% = 2000 but capped to 100
        $resp->assertStatus(200);
        $this->assertEquals(100.0, (float) $resp->json('data.discount'));

        // fixed greater than subtotal
        $fv = Voucher::create(['code' => 'FIXBIG', 'type' => 'fixed', 'value' => 10000, 'min_order_amount' => 0, 'is_active' => 1]);
        $resp2 = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/vouchers/check', ['code' => 'FIXBIG']);
        $resp2->assertStatus(200);
        $this->assertEquals(4000.0, (float) $resp2->json('data.discount'));
    }

    public function test_usage_limit_and_usage_per_user_enforced()
    {
        $user = User::factory()->create();

        $voucher = Voucher::create(['code' => 'LIMIT1', 'type' => 'fixed', 'value' => 10, 'usage_limit' => 1, 'usage_per_user' => 1, 'is_active' => 1]);

        // create one usage to exhaust total usage
        VoucherUsage::create(['voucher_id' => $voucher->id, 'user_id' => $user->id]);

        $this->actingAs($user, 'sanctum');
        $resp = $this->postJson('/api/vouchers/check', ['code' => 'LIMIT1']);
        $resp->assertStatus(422)->assertJsonStructure(['errors']);

        // test usage_per_user
        $voucher2 = Voucher::create(['code' => 'USER1', 'type' => 'fixed', 'value' => 10, 'usage_limit' => null, 'usage_per_user' => 1, 'is_active' => 1]);
        VoucherUsage::create(['voucher_id' => $voucher2->id, 'user_id' => $user->id]);
        $resp2 = $this->postJson('/api/vouchers/check', ['code' => 'USER1']);
        $resp2->assertStatus(422)->assertJsonStructure(['errors']);
    }

    public function test_checking_does_not_mutate_usage_or_counts()
    {
        $product = Product::factory()->create(['base_price' => 1000, 'sale_price' => null]);
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 10, 'price_adjustment' => 0]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        $cart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 1]);

        $voucher = Voucher::create(['code' => 'KEEP', 'type' => 'fixed', 'value' => 100, 'is_active' => 1]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/vouchers/check', ['code' => 'KEEP'])->assertStatus(200);

        $this->assertDatabaseCount('voucher_usages', 0);
        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id, 'used_count' => 0]);
    }

    public function test_voucher_subtotal_uses_same_price_as_product_resource()
    {
        $product = Product::factory()->create([
            'base_price' => 120000,
            'sale_price' => 100000,
            'is_active' => true,
        ]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => 10,
            'price_adjustment' => 5000,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        $cart->items()->create(['product_variant_id' => $variant->id, 'quantity' => 3]);

        Voucher::create([
            'code' => 'PRICECHECK',
            'type' => 'fixed',
            'value' => 1000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
        ]);

        $productResponse = $this->getJson('/api/products/' . $product->slug);
        $productResponse->assertStatus(200);
        $displayedVariantPrice = (float) $productResponse->json('data.variants.0.price');

        $response = $this->withHeader('X-Guest-Token', $guestToken)
            ->postJson('/api/vouchers/check', ['code' => 'PRICECHECK']);

        $response->assertStatus(200)
            ->assertJsonPath('data.discount', 1000);
        $this->assertEquals(round($displayedVariantPrice * 3, 2), (float) $response->json('data.subtotal'));
    }

    public function test_voucher_check_and_checkout_return_same_discount_for_same_cart()
    {
        $product = Product::factory()->create([
            'base_price' => 200000,
            'sale_price' => null,
            'is_active' => true,
        ]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => 10,
            'price_adjustment' => 10000,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        $cart->items()->create([
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        Voucher::create([
            'code' => 'CONSISTCHECK',
            'type' => 'percent',
            'value' => 20,
            'max_discount' => 50000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
        ]);

        $checkResponse = $this->withHeader('X-Guest-Token', $guestToken)
            ->postJson('/api/vouchers/check', ['code' => 'CONSISTCHECK']);

        $checkResponse->assertStatus(200);

        $checkoutResponse = $this->withHeader('X-Guest-Token', $guestToken)
            ->postJson('/api/checkout/guest', [
                'full_name' => 'Discount Consistency',
                'email' => 'consistency@example.com',
                'phone' => '0900999888',
                'shipping_address' => 'Consistency Street',
                'voucher_code' => 'CONSISTCHECK',
            ]);

        $checkoutResponse->assertStatus(201);

        $this->assertEquals(
            (float) $checkResponse->json('data.subtotal'),
            (float) $checkoutResponse->json('data.subtotal')
        );
        $this->assertEquals(
            (float) $checkResponse->json('data.discount'),
            (float) $checkoutResponse->json('data.discount_amount')
        );
    }
}
