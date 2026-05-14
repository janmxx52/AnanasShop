<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wishlist_routes()
    {
        $product = Product::factory()->create(['is_active' => true]);

        $this->getJson('/api/wishlist')->assertStatus(401);
        $this->postJson('/api/wishlist/toggle', ['product_id' => $product->id])->assertStatus(401);
        $this->deleteJson("/api/wishlist/{$product->id}")->assertStatus(401);
    }

    public function test_user_can_add_product_to_wishlist_via_toggle()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/wishlist/toggle', ['product_id' => $product->id])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('action', 'added');

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_remove_product_from_wishlist_via_toggle()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/wishlist/toggle', ['product_id' => $product->id])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('action', 'removed');

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_list_own_wishlist()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $productA = Product::factory()->create(['is_active' => true]);
        $productB = Product::factory()->create(['is_active' => true]);
        $otherProduct = Product::factory()->create(['is_active' => true]);

        Wishlist::create(['user_id' => $user->id, 'product_id' => $productA->id]);
        Wishlist::create(['user_id' => $user->id, 'product_id' => $productB->id]);
        Wishlist::create(['user_id' => $otherUser->id, 'product_id' => $otherProduct->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/wishlist');

        $response->assertStatus(200)->assertJsonPath('success', true);

        $productIds = collect($response->json('data'))->pluck('product.id')->all();
        $this->assertContains($productA->id, $productIds);
        $this->assertContains($productB->id, $productIds);
        $this->assertNotContains($otherProduct->id, $productIds);
    }

    public function test_wishlist_list_is_paginated()
    {
        $user = User::factory()->create();

        for ($index = 1; $index <= 15; $index++) {
            $product = Product::factory()->create(['is_active' => true]);
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
        }

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/wishlist?per_page=12');

        $response->assertStatus(200)
            ->assertJsonPath('meta.per_page', 12)
            ->assertJsonPath('meta.total', 15);

        $this->assertCount(12, $response->json('data'));
    }

    public function test_user_cannot_wishlist_inactive_product()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => false]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/wishlist/toggle', ['product_id' => $product->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_cannot_wishlist_soft_deleted_product()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $product->delete();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/wishlist/toggle', ['product_id' => $product->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_duplicate_wishlist_is_prevented()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        try {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $this->fail('Duplicate wishlist row should violate unique(user_id, product_id).');
        } catch (QueryException $exception) {
            $this->assertTrue(true);
        }

        $this->assertSame(1, Wishlist::where('user_id', $user->id)->where('product_id', $product->id)->count());
    }

    public function test_delete_removes_existing_wishlist_item()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/wishlist/{$product->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_delete_is_idempotent_when_item_does_not_exist()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/wishlist/{$product->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_cannot_affect_another_users_wishlist_item()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        Wishlist::create([
            'user_id' => $otherUser->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/wishlist/{$product->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $otherUser->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_response_includes_product_data()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        ProductImage::factory()->for($product)->create([
            'is_primary' => true,
            'url' => 'https://cdn.example.com/wishlist-primary.jpg',
            'sort_order' => 0,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/wishlist/toggle', ['product_id' => $product->id])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product.id', $product->id)
            ->assertJsonPath('data.product.name', $product->name)
            ->assertJsonPath('data.product.slug', $product->slug)
            ->assertJsonPath('data.product.primary_image', 'https://cdn.example.com/wishlist-primary.jpg');
    }
}

