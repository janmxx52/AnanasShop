<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryBrandTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_category_and_brand_routes()
    {
        $endpoints = [
            ['get', '/api/admin/categories'],
            ['post', '/api/admin/categories', ['name' => 'X']],
            ['get', '/api/admin/categories/1'],
            ['put', '/api/admin/categories/1', ['name' => 'X']],
            ['delete', '/api/admin/categories/1'],
            ['get', '/api/admin/brands'],
            ['post', '/api/admin/brands', ['name' => 'B']],
            ['get', '/api/admin/brands/1'],
            ['put', '/api/admin/brands/1', ['name' => 'B2']],
            ['delete', '/api/admin/brands/1'],
        ];

        foreach ($endpoints as $ep) {
            [$method, $url, $data] = array_pad($ep, 3, []);
            $response = $this->json(strtoupper($method), $url, $data ?: []);
            $response->assertStatus(401);
        }
    }

    public function test_customer_cannot_access_admin_category_and_brand_routes()
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/admin/categories')->assertStatus(403);
        $this->getJson('/api/admin/brands')->assertStatus(403);
    }

    public function test_admin_can_create_update_delete_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        // Create
        $create = $this->postJson('/api/admin/categories', ['name' => 'Shoes']);
        $create->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Shoes');

        $this->assertDatabaseHas('categories', ['name' => 'Shoes']);

        $id = $create->json('data.id');

        // Update
        $update = $this->putJson("/api/admin/categories/{$id}", ['name' => 'Footwear']);
        $update->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Footwear');
        $this->assertDatabaseHas('categories', ['name' => 'Footwear']);

        // Delete
        $delete = $this->deleteJson("/api/admin/categories/{$id}");
        $delete->assertStatus(200)->assertJsonPath('success', true);
        $this->assertDatabaseMissing('categories', ['id' => $id]);
    }

    public function test_admin_can_create_update_delete_brand()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        // Create
        $create = $this->postJson('/api/admin/brands', ['name' => 'Acme']);
        $create->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Acme');

        $this->assertDatabaseHas('brands', ['name' => 'Acme']);

        $id = $create->json('data.id');

        // Update
        $update = $this->putJson("/api/admin/brands/{$id}", ['name' => 'AcmeCo']);
        $update->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'AcmeCo');
        $this->assertDatabaseHas('brands', ['name' => 'AcmeCo']);

        // Delete
        $delete = $this->deleteJson("/api/admin/brands/{$id}");
        $delete->assertStatus(200)->assertJsonPath('success', true);
        $this->assertDatabaseMissing('brands', ['id' => $id]);
    }
}
