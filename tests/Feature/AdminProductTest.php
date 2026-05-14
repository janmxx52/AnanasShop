<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_product_routes()
    {
        $endpoints = [
            ['get', '/api/admin/products'],
            ['post', '/api/admin/products', ['name' => 'P']],
            ['get', '/api/admin/products/1'],
            ['put', '/api/admin/products/1', ['name' => 'P2']],
            ['delete', '/api/admin/products/1'],
            ['post', '/api/admin/products/1/restore'],
            ['patch', '/api/admin/products/1/status', ['is_active' => 1]],
        ];

        foreach ($endpoints as $ep) {
            [$method, $url, $data] = array_pad($ep, 3, []);
            $response = $this->json(strtoupper($method), $url, $data ?: []);
            $response->assertStatus(401);
        }
    }

    public function test_customer_cannot_access_admin_product_routes()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/admin/products')->assertStatus(403);
    }

    public function test_admin_can_create_update_soft_delete_restore_and_toggle()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $category = Category::factory()->create();
        $brand = Brand::factory()->create();

        // Create
        $create = $this->postJson('/api/admin/products', [
            'name' => 'Test Product',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 100,
            'sale_price' => 90,
        ]);

        $create->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Test Product');

        $id = $create->json('data.id');
        $this->assertDatabaseHas('products', ['id' => $id, 'name' => 'Test Product']);

        // Update
        $update = $this->putJson("/api/admin/products/{$id}", ['name' => 'Updated Product']);
        $update->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Product');
        $this->assertDatabaseHas('products', ['id' => $id, 'name' => 'Updated Product']);

        // Soft delete
        $delete = $this->deleteJson("/api/admin/products/{$id}");
        $delete->assertStatus(200);
        $this->assertSoftDeleted('products', ['id' => $id]);

        // Restore
        $restore = $this->postJson("/api/admin/products/{$id}/restore");
        $restore->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $id);
        $this->assertDatabaseHas('products', ['id' => $id, 'deleted_at' => null]);

        // Toggle active
        $toggle = $this->patchJson("/api/admin/products/{$id}/status", ['is_active' => false]);
        $toggle->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', false);
        $this->assertDatabaseHas('products', ['id' => $id, 'is_active' => 0]);
    }

    public function test_slug_must_be_unique()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $category = Category::factory()->create();
        $brand = Brand::factory()->create();

        $a = $this->postJson('/api/admin/products', [
            'name' => 'Unique Name',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 50,
        ]);
        $a->assertStatus(201);
        $slugA = $a->json('data.slug');

        $b = $this->postJson('/api/admin/products', [
            'name' => 'Unique Name',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 60,
        ]);
        $b->assertStatus(201);
        $slugB = $b->json('data.slug');

        $this->assertNotEquals($slugA, $slugB);
    }
}
