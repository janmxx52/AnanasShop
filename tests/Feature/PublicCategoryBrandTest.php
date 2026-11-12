<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;

class PublicCategoryBrandTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_active_categories()
    {
        $active1 = Category::factory()->create(['is_active' => true, 'name' => 'Giày']);
        $active2 = Category::factory()->create(['is_active' => true, 'name' => 'Áo']);
        $inactive = Category::factory()->create(['is_active' => false, 'name' => 'Inactive']);

        $resp = $this->getJson('/api/categories');

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'is_active']
                ],
                'meta'
            ]);

        $data = $resp->json('data');
        $slugs = array_column($data, 'slug');

        $this->assertContains($active1->slug, $slugs);
        $this->assertContains($active2->slug, $slugs);
        $this->assertNotContains($inactive->slug, $slugs);
    }

    public function test_guest_can_view_category_detail_by_slug()
    {
        $category = Category::factory()->create(['is_active' => true, 'name' => 'Test Category']);

        $resp = $this->getJson("/api/categories/{$category->slug}");

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'slug', 'is_active']
            ])
            ->assertJsonPath('data.slug', $category->slug)
            ->assertJsonPath('data.name', $category->name);
    }

    public function test_category_detail_returns_404_for_inactive_category()
    {
        $category = Category::factory()->create(['is_active' => false]);

        $resp = $this->getJson("/api/categories/{$category->slug}");

        $resp->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_category_detail_returns_404_for_not_found_category()
    {
        $resp = $this->getJson('/api/categories/nonexistent-slug');

        $resp->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_category_detail_returns_only_active_products()
    {
        $category = Category::factory()->create(['is_active' => true]);
        
        $active = Product::factory()->for($category)->create(['is_active' => true]);
        $inactive = Product::factory()->for($category)->create(['is_active' => false]);
        $deleted = Product::factory()->for($category)->create(['is_active' => true]);
        $deleted->delete();

        $resp = $this->getJson("/api/categories/{$category->slug}");

        $resp->assertStatus(200);
        
        $data = $resp->json('data');
        $this->assertNotEmpty($data['products']);

        $productSlugs = array_column($data['products'], 'slug');
        $this->assertContains($active->slug, $productSlugs);
        $this->assertNotContains($inactive->slug, $productSlugs);
        $this->assertNotContains($deleted->slug, $productSlugs);
    }

    public function test_guest_can_list_active_brands()
    {
        $active1 = Brand::factory()->create(['is_active' => true, 'name' => 'Ananas']);
        $active2 = Brand::factory()->create(['is_active' => true, 'name' => 'Nike']);
        $inactive = Brand::factory()->create(['is_active' => false, 'name' => 'Inactive']);

        $resp = $this->getJson('/api/brands');

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'is_active']
                ],
                'meta'
            ]);

        $data = $resp->json('data');
        $slugs = array_column($data, 'slug');

        $this->assertContains($active1->slug, $slugs);
        $this->assertContains($active2->slug, $slugs);
        $this->assertNotContains($inactive->slug, $slugs);
    }

    public function test_guest_can_view_brand_detail_by_slug()
    {
        $brand = Brand::factory()->create(['is_active' => true, 'name' => 'Test Brand']);

        $resp = $this->getJson("/api/brands/{$brand->slug}");

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'slug', 'is_active']
            ])
            ->assertJsonPath('data.slug', $brand->slug)
            ->assertJsonPath('data.name', $brand->name);
    }

    public function test_brand_detail_returns_404_for_inactive_brand()
    {
        $brand = Brand::factory()->create(['is_active' => false]);

        $resp = $this->getJson("/api/brands/{$brand->slug}");

        $resp->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_brand_detail_returns_404_for_not_found_brand()
    {
        $resp = $this->getJson('/api/brands/nonexistent-slug');

        $resp->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_brand_detail_returns_only_active_products()
    {
        $brand = Brand::factory()->create(['is_active' => true]);
        
        $active = Product::factory()->for($brand)->create(['is_active' => true]);
        $inactive = Product::factory()->for($brand)->create(['is_active' => false]);
        $deleted = Product::factory()->for($brand)->create(['is_active' => true]);
        $deleted->delete();

        $resp = $this->getJson("/api/brands/{$brand->slug}");

        $resp->assertStatus(200);
        
        $data = $resp->json('data');
        $this->assertNotEmpty($data['products']);

        $productSlugs = array_column($data['products'], 'slug');
        $this->assertContains($active->slug, $productSlugs);
        $this->assertNotContains($inactive->slug, $productSlugs);
        $this->assertNotContains($deleted->slug, $productSlugs);
    }

    public function test_category_list_is_paginated()
    {
        Category::factory()->create(['is_active' => true]);
        Category::factory(15)->create(['is_active' => true]);

        $resp = $this->getJson('/api/categories?per_page=5');

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'meta' => ['current_page', 'per_page', 'total', 'last_page']
            ]);

        $meta = $resp->json('meta');
        $this->assertEquals(5, $meta['per_page']);
        $this->assertGreaterThan(1, $meta['last_page']);
    }

    public function test_brand_list_is_paginated()
    {
        Brand::factory()->create(['is_active' => true]);
        Brand::factory(15)->create(['is_active' => true]);

        $resp = $this->getJson('/api/brands?per_page=5');

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'meta' => ['current_page', 'per_page', 'total', 'last_page']
            ]);

        $meta = $resp->json('meta');
        $this->assertEquals(5, $meta['per_page']);
        $this->assertGreaterThan(1, $meta['last_page']);
    }
}
