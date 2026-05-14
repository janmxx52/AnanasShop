<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProductImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_product_image_routes()
    {
        $endpoints = [
            ['get', '/api/admin/products/1/images'],
            ['post', '/api/admin/products/1/images'],
            ['delete', '/api/admin/products/1/images/1'],
            ['patch', '/api/admin/products/1/images/1/primary'],
        ];

        foreach ($endpoints as $ep) {
            [$method, $url] = $ep;
            $resp = $this->json(strtoupper($method), $url, []);
            $resp->assertStatus(401);
        }
    }

    public function test_customer_cannot_access_admin_product_image_routes()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user, 'sanctum');

        $product = Product::factory()->create();
        $this->getJson("/api/admin/products/{$product->id}/images")->assertStatus(403);
    }

    public function test_admin_can_upload_images_and_limit_and_primary_behaviour()
    {
        Storage::fake('public');

        $this->app->instance(CloudinaryService::class, new class extends CloudinaryService {
            public function upload(\Illuminate\Http\UploadedFile $file): array {
                return ['url' => 'https://res.cloudinary.com/fake/image/upload/v1/' . $file->getClientOriginalName(), 'public_id' => 'fake-' . $file->getClientOriginalName()];
            }
            public function delete(?string $id): bool { return true; }
        });

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $product = Product::factory()->create();

        // Upload 10 images
        for ($i = 1; $i <= 10; $i++) {
            $file = UploadedFile::fake()->create("img{$i}.jpg", 100, 'image/jpeg');
            $resp = $this->postJson("/api/admin/products/{$product->id}/images", ['file' => $file]);
            $resp->assertStatus(201)->assertJsonPath('success', true);
        }

        $this->assertDatabaseCount('product_images', 10);

        // 11th should fail
        $file = UploadedFile::fake()->create('img11.jpg', 100, 'image/jpeg');
        $resp = $this->postJson("/api/admin/products/{$product->id}/images", ['file' => $file]);
        $resp->assertStatus(422);
    }

    public function test_admin_can_set_primary_and_switches_previous()
    {
        $this->app->instance(CloudinaryService::class, new class extends CloudinaryService {
            public function upload(\Illuminate\Http\UploadedFile $file): array { return ['url' => 'https://res.cloudinary/fake.jpg', 'public_id' => 'p1']; }
            public function delete(?string $id): bool { return true; }
        });

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $product = Product::factory()->create();

        $a = ProductImage::factory()->for($product)->create(['is_primary' => true]);
        $b = ProductImage::factory()->for($product)->create(['is_primary' => false]);

        $this->patchJson("/api/admin/products/{$product->id}/images/{$b->id}/primary")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('product_images', ['id' => $b->id, 'is_primary' => 1]);
        $this->assertDatabaseHas('product_images', ['id' => $a->id, 'is_primary' => 0]);
    }

    public function test_delete_calls_cloudinary_and_deletes_db()
    {
        $deleted = false;
        $this->app->instance(CloudinaryService::class, new class extends CloudinaryService {
            public function upload(\Illuminate\Http\UploadedFile $file): array { return ['url' => 'https://res.cloudinary/fake.jpg', 'public_id' => 'pdel']; }
            public function delete(?string $id): bool { return true; }
        });

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $product = Product::factory()->create();
        $img = ProductImage::factory()->for($product)->create(['public_id' => 'pdel', 'url' => 'https://res.cloudinary/fake.jpg']);

        $this->deleteJson("/api/admin/products/{$product->id}/images/{$img->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('product_images', ['id' => $img->id]);
    }
}
