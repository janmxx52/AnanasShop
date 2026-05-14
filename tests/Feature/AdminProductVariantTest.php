<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductVariantTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_variant_routes()
    {
        $endpoints = [
            ['get', '/api/admin/products/1/variants'],
            ['post', '/api/admin/products/1/variants', ['size' => 'M', 'color' => 'Black', 'stock' => 10]],
            ['get', '/api/admin/products/1/variants/1'],
            ['put', '/api/admin/products/1/variants/1', ['size' => 'L']],
            ['delete', '/api/admin/products/1/variants/1'],
        ];

        foreach ($endpoints as $ep) {
            [$method, $url, $data] = array_pad($ep, 3, []);
            $response = $this->json(strtoupper($method), $url, $data ?: []);
            $response->assertStatus(401);
        }
    }

    public function test_customer_cannot_access_variant_routes()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user, 'sanctum');

        $product = Product::factory()->create();

        $this->getJson("/api/admin/products/{$product->id}/variants")->assertStatus(403);
    }

    public function test_admin_can_create_update_and_delete_variant()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $product = Product::factory()->create();

        // Create
        $create = $this->postJson("/api/admin/products/{$product->id}/variants", [
            'size' => 'M',
            'color' => 'Black',
            'stock' => 5,
            'price_adjustment' => 0,
        ]);
        $create->assertStatus(201)->assertJsonFragment(['size' => 'M', 'color' => 'Black']);
        $variantId = $create->json('id');

        // Update
        $update = $this->putJson("/api/admin/products/{$product->id}/variants/{$variantId}", [
            'stock' => 10
        ]);
        $update->assertStatus(200)->assertJsonFragment(['stock' => 10]);

        // Delete
        $delete = $this->deleteJson("/api/admin/products/{$product->id}/variants/{$variantId}");
        $delete->assertStatus(200);
        $this->assertDatabaseMissing('product_variants', ['id' => $variantId]);
    }

    public function test_cannot_create_duplicate_variant_for_same_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $product = Product::factory()->create();

        $this->postJson("/api/admin/products/{$product->id}/variants", [
            'size' => 'M',
            'color' => 'Red',
            'stock' => 3,
        ])->assertStatus(201);

        $this->postJson("/api/admin/products/{$product->id}/variants", [
            'size' => 'M',
            'color' => 'Red',
            'stock' => 2,
        ])->assertStatus(422);
    }

    public function test_can_create_same_variant_on_different_products()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $p1 = Product::factory()->create();
        $p2 = Product::factory()->create();

        $a = $this->postJson("/api/admin/products/{$p1->id}/variants", [
            'size' => 'L', 'color' => 'Blue', 'stock' => 4
        ]);
        $a->assertStatus(201);

        $b = $this->postJson("/api/admin/products/{$p2->id}/variants", [
            'size' => 'L', 'color' => 'Blue', 'stock' => 2
        ]);
        $b->assertStatus(201);
    }

    public function test_variant_route_must_belong_to_correct_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $p1 = Product::factory()->create();
        $p2 = Product::factory()->create();

        $create = $this->postJson("/api/admin/products/{$p1->id}/variants", [
            'size' => 'S', 'color' => 'Green', 'stock' => 1
        ])->assertStatus(201);

        $variantId = $create->json('id');

        // Try to access variant under a different product
        $this->getJson("/api/admin/products/{$p2->id}/variants/{$variantId}")->assertStatus(404);
    }
}
