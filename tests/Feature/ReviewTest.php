<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Mockery\MockInterface;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_review()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        $this->postJson("/api/products/{$product->slug}/reviews", [
            'order_item_id' => $orderItem->id,
            'rating' => 5,
            'comment' => 'Great',
        ])->assertStatus(401);
    }

    public function test_user_can_review_delivered_order_item()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 5,
                'comment' => 'Great quality',
            ])->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_item_id', $orderItem->id)
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $orderItem->id,
            'rating' => 5,
            'is_approved' => 1,
        ]);
    }

    public function test_user_cannot_review_order_item_from_non_delivered_order()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'processing');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 4,
            ])->assertStatus(422)
            ->assertJsonValidationErrors(['order_item_id']);
    }

    public function test_user_cannot_review_another_users_order_item()
    {
        $owner = User::factory()->create();
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($owner, $product, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 4,
            ])->assertStatus(422)
            ->assertJsonValidationErrors(['order_item_id']);
    }

    public function test_user_cannot_review_order_item_that_does_not_belong_to_product_slug()
    {
        $user = User::factory()->create();
        $productA = Product::factory()->create(['is_active' => true]);
        $productB = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $productA, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$productB->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 4,
            ])->assertStatus(422)
            ->assertJsonValidationErrors(['order_item_id']);
    }

    public function test_user_cannot_review_same_order_item_twice()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 5,
            ])->assertStatus(201);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 4,
            ])->assertStatus(422)
            ->assertJsonValidationErrors(['order_item_id']);
    }

    public function test_user_can_review_same_product_again_if_different_delivered_order_item()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItemA = $this->createOrderItem($user, $product, 'delivered');
        $orderItemB = $this->createOrderItem($user, $product, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItemA->id,
                'rating' => 5,
            ])->assertStatus(201);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItemB->id,
                'rating' => 4,
            ])->assertStatus(201);

        $this->assertSame(2, Review::query()->where('product_id', $product->id)->count());
    }

    public function test_rating_must_be_integer_between_1_and_5()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 0,
            ])->assertStatus(422)->assertJsonValidationErrors(['rating']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/products/{$product->slug}/reviews", [
                'order_item_id' => $orderItem->id,
                'rating' => 6,
            ])->assertStatus(422)->assertJsonValidationErrors(['rating']);
    }

    public function test_product_reviews_can_be_listed_publicly()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $orderItem->id,
            'rating' => 5,
            'comment' => 'Public review',
            'is_approved' => true,
        ]);

        $response = $this->getJson("/api/products/{$product->slug}/reviews");
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.rating', 5);
    }

    public function test_only_approved_reviews_are_listed_publicly_if_is_approved_exists()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItemA = $this->createOrderItem($user, $product, 'delivered');
        $orderItemB = $this->createOrderItem($user, $product, 'delivered');

        Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $orderItemA->id,
            'rating' => 5,
            'comment' => 'Approved review',
            'is_approved' => true,
        ]);

        Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $orderItemB->id,
            'rating' => 1,
            'comment' => 'Hidden review',
            'is_approved' => false,
        ]);

        $response = $this->getJson("/api/products/{$product->slug}/reviews");
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.comment', 'Approved review');
    }

    public function test_avg_rating_and_review_count_are_calculated_correctly_on_product_list()
    {
        $user = User::factory()->create();
        $productA = Product::factory()->create(['is_active' => true]);
        $productB = Product::factory()->create(['is_active' => true]);

        $this->createReviewRecord($user, $productA, 5, true);
        $this->createReviewRecord($user, $productA, 3, true);
        $this->createReviewRecord($user, $productA, 1, false);
        $this->createReviewRecord($user, $productB, 2, true);

        $response = $this->getJson('/api/products?per_page=50');
        $response->assertStatus(200);

        $products = collect($response->json('data'));
        $productAData = $products->firstWhere('id', $productA->id);
        $productBData = $products->firstWhere('id', $productB->id);

        $this->assertNotNull($productAData);
        $this->assertNotNull($productBData);
        $this->assertSame(4.0, (float) $productAData['rating_avg']);
        $this->assertSame(2, (int) $productAData['review_count']);
        $this->assertSame(2.0, (float) $productBData['rating_avg']);
        $this->assertSame(1, (int) $productBData['review_count']);
    }

    public function test_avg_rating_and_review_count_are_calculated_correctly_on_product_detail()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        $this->createReviewRecord($user, $product, 4, true);
        $this->createReviewRecord($user, $product, 2, true);
        $this->createReviewRecord($user, $product, 1, false);

        $response = $this->getJson("/api/products/{$product->slug}");
        $response->assertStatus(200);

        $payload = $response->json('data') ?? $response->json();

        $this->assertSame(3.0, (float) $payload['rating_avg']);
        $this->assertSame(2, (int) $payload['review_count']);
    }

    public function test_user_can_delete_own_review()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $review = $this->createReviewRecord($user, $product, 5, true);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/reviews/{$review->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_user_cannot_delete_another_users_review()
    {
        $owner = User::factory()->create();
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $review = $this->createReviewRecord($owner, $product, 5, true);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/reviews/{$review->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('reviews', ['id' => $review->id]);
    }

    public function test_review_images_max_3()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        $files = [
            $this->fakeImageFile('r1.jpg'),
            $this->fakeImageFile('r2.jpg'),
            $this->fakeImageFile('r3.jpg'),
            $this->fakeImageFile('r4.jpg'),
        ];

        $response = $this->actingAs($user, 'sanctum')->post(
            "/api/products/{$product->slug}/reviews",
            [
                'order_item_id' => $orderItem->id,
                'rating' => 5,
                'images' => $files,
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(422)->assertJsonValidationErrors(['images']);
    }

    public function test_cloudinary_service_is_mocked_in_tests_for_review_image_upload()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $orderItem = $this->createOrderItem($user, $product, 'delivered');
        $file = $this->fakeImageFile('review-image.jpg');

        $this->mock(CloudinaryService::class, function (MockInterface $mock) {
            $mock->shouldReceive('uploadToFolder')
                ->once()
                ->andReturn([
                    'url' => 'https://cdn.example.com/review-image.jpg',
                    'public_id' => 'reviews/public-id-1',
                ]);
            $mock->shouldReceive('delete')->zeroOrMoreTimes();
        });

        $response = $this->actingAs($user, 'sanctum')->post(
            "/api/products/{$product->slug}/reviews",
            [
                'order_item_id' => $orderItem->id,
                'rating' => 5,
                'images' => [$file],
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(201)->assertJsonPath('success', true);

        $reviewId = $response->json('data.id');
        $this->assertDatabaseHas('review_images', [
            'review_id' => $reviewId,
            'image_url' => 'https://cdn.example.com/review-image.jpg',
            'public_id' => 'reviews/public-id-1',
        ]);
    }

    private function createReviewRecord(User $user, Product $product, int $rating, bool $approved): Review
    {
        $orderItem = $this->createOrderItem($user, $product, 'delivered');

        return Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $orderItem->id,
            'rating' => $rating,
            'comment' => 'Review ' . $rating,
            'is_approved' => $approved,
        ]);
    }

    private function createOrderItem(User $user, Product $product, string $status): OrderItem
    {
        $variantIndex = ProductVariant::query()
            ->where('product_id', $product->id)
            ->count() + 1;

        $variant = ProductVariant::factory()->for($product)->create([
            'size' => 'S' . $variantIndex,
            'color' => 'Color ' . $variantIndex,
            'stock' => 10,
            'price_adjustment' => 0,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'guest_name' => null,
            'guest_email' => null,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '0900000000',
            'voucher_id' => null,
            'code' => 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6)),
            'status' => $status,
            'subtotal' => 100000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 130000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => $user->name,
            'shipping_phone' => '0900000000',
            'shipping_address' => 'Test Address',
            'note' => null,
        ]);

        return $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_name' => 'Size M / Color Black',
            'sku' => $variant->sku,
            'image_url' => null,
            'unit_price' => 100000,
            'quantity' => 1,
            'line_total' => 100000,
            'variant_info' => ['size' => 'M', 'color' => 'Black'],
        ]);
    }

    private function fakeImageFile(string $name): UploadedFile
    {
        $pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgCz8P6gAAAAASUVORK5CYII=';
        $content = base64_decode($pngBase64);

        return UploadedFile::fake()->createWithContent($name, $content);
    }
}
