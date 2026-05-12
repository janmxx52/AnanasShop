<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\Category;
use App\Models\Brand;
use Carbon\Carbon;

class ProductPublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_only_active_products_and_excludes_inactive_and_soft_deleted()
    {
        $active = Product::factory()->create(['is_active' => true]);
        $inactive = Product::factory()->create(['is_active' => false]);
        $deleted = Product::factory()->create(['is_active' => true]);
        $deleted->delete();

        $resp = $this->getJson('/api/products');
        $resp->assertStatus(200);

        $data = $resp->json('data');
        $slugs = array_column($data, 'slug');

        $this->assertContains($active->slug, $slugs);
        $this->assertNotContains($inactive->slug, $slugs);
        $this->assertNotContains($deleted->slug, $slugs);
    }

    public function test_search_by_name_returns_matching_product()
    {
        $match = Product::factory()->create(['name' => 'UniqueProductSearchName', 'is_active' => true]);
        $other = Product::factory()->create(['is_active' => true]);

        $resp = $this->getJson('/api/products?q=UniqueProductSearchName');
        $resp->assertStatus(200);
        $data = $resp->json('data');

        $this->assertCount(1, $data);
        $this->assertEquals($match->slug, $data[0]['slug']);
    }

    public function test_filter_by_category()
    {
        $cat = Category::factory()->create(['slug' => 'cat-test']);
        $in = Product::factory()->for($cat)->create(['is_active' => true]);
        $out = Product::factory()->create(['is_active' => true]);

        $resp = $this->getJson('/api/products?category=cat-test');
        $resp->assertStatus(200);

        $data = $resp->json('data');
        $this->assertTrue(collect($data)->pluck('slug')->contains($in->slug));
        $this->assertFalse(collect($data)->pluck('slug')->contains($out->slug));
    }

    public function test_filter_by_brand()
    {
        $brand = Brand::factory()->create(['slug' => 'brand-test']);
        $in = Product::factory()->for($brand)->create(['is_active' => true]);
        $out = Product::factory()->create(['is_active' => true]);

        $resp = $this->getJson('/api/products?brand=brand-test');
        $resp->assertStatus(200);

        $data = $resp->json('data');
        $this->assertTrue(collect($data)->pluck('slug')->contains($in->slug));
        $this->assertFalse(collect($data)->pluck('slug')->contains($out->slug));
    }

    public function test_filter_by_size()
    {
        $p1 = Product::factory()->create(['is_active' => true]);
        ProductVariant::factory()->for($p1)->create(['size' => 'M', 'stock' => 5]);

        $p2 = Product::factory()->create(['is_active' => true]);
        ProductVariant::factory()->for($p2)->create(['size' => 'L', 'stock' => 5]);

        $resp = $this->getJson('/api/products?size=M');
        $resp->assertStatus(200);

        $data = $resp->json('data');
        $this->assertTrue(collect($data)->pluck('slug')->contains($p1->slug));
        $this->assertFalse(collect($data)->pluck('slug')->contains($p2->slug));
    }

    public function test_filter_by_color()
    {
        $p1 = Product::factory()->create(['is_active' => true]);
        ProductVariant::factory()->for($p1)->create(['color' => 'Red', 'stock' => 3]);

        $p2 = Product::factory()->create(['is_active' => true]);
        ProductVariant::factory()->for($p2)->create(['color' => 'Blue', 'stock' => 3]);

        $resp = $this->getJson('/api/products?color=Red');
        $resp->assertStatus(200);

        $data = $resp->json('data');
        $this->assertTrue(collect($data)->pluck('slug')->contains($p1->slug));
        $this->assertFalse(collect($data)->pluck('slug')->contains($p2->slug));
    }

    public function test_filter_by_min_max_price()
    {
        $cheap = Product::factory()->create(['base_price' => 1000, 'is_active' => true]);
        $exp = Product::factory()->create(['base_price' => 5000, 'is_active' => true]);

        $resp = $this->getJson('/api/products?min_price=2000');
        $resp->assertStatus(200);
        $data = $resp->json('data');
        $this->assertTrue(collect($data)->pluck('slug')->contains($exp->slug));
        $this->assertFalse(collect($data)->pluck('slug')->contains($cheap->slug));
    }

    public function test_sort_newest_and_price_orders()
    {
        $old = Product::factory()->create(['created_at' => Carbon::now()->subDays(5), 'is_active' => true]);
        $new = Product::factory()->create(['created_at' => Carbon::now(), 'is_active' => true]);

        $resp = $this->getJson('/api/products?sort=newest');
        $resp->assertStatus(200);
        $this->assertEquals($new->slug, $resp->json('data')[0]['slug']);

        // Create two products with extreme prices to assert ordering deterministically
        $pLow = Product::factory()->create(['base_price' => 1, 'is_active' => true]);
        $pHigh = Product::factory()->create(['base_price' => 99999999, 'is_active' => true]);

        $respAsc = $this->getJson('/api/products?sort=price_asc');
        $respAsc->assertStatus(200);
        $this->assertEquals($pLow->slug, $respAsc->json('data')[0]['slug']);

        $respDesc = $this->getJson('/api/products?sort=price_desc');
        $respDesc->assertStatus(200);
        $this->assertEquals($pHigh->slug, $respDesc->json('data')[0]['slug']);
    }

    public function test_show_returns_product_detail_and_404_on_inactive_or_missing()
    {
        $product = Product::factory()->create(['is_active' => true]);
        ProductVariant::factory()->for($product)->create(['size' => 'M', 'color' => 'Black']);
        ProductImage::factory()->for($product)->create(['is_primary' => true]);

        $resp = $this->getJson('/api/products/' . $product->slug);
        $resp->assertStatus(200);
        $body = $resp->json();
        if (array_key_exists('data', $body)) {
            $this->assertArrayHasKey('id', $body['data']);
            $this->assertArrayHasKey('variants', $body['data']);
            $this->assertArrayHasKey('images', $body['data']);
        } else {
            $this->assertArrayHasKey('id', $body);
            $this->assertArrayHasKey('variants', $body);
            $this->assertArrayHasKey('images', $body);
        }

        $inactive = Product::factory()->create(['is_active' => false]);
        $this->getJson('/api/products/' . $inactive->slug)->assertStatus(404);

        $this->getJson('/api/products/non-existent-slug')->assertStatus(404);
    }
}
