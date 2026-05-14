<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dashboard_stats()
    {
        $this->getJson('/api/admin/dashboard/stats')->assertStatus(401);
    }

    public function test_customer_cannot_access_dashboard_stats()
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(403);
    }

    public function test_admin_can_view_dashboard_stats()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_response_has_expected_keys()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonPath('success', true);

        $data = $response->json('data');
        $expectedKeys = [
            'total_users',
            'total_products',
            'total_orders',
            'total_revenue',
            'pending_orders',
            'cancelled_orders',
            'delivered_orders',
            'low_stock_variants',
            'out_of_stock_variants',
            'total_reviews',
            'average_rating',
            'recent_orders',
            'top_selling_products',
        ];

        foreach ($expectedKeys as $key) {
            $this->assertArrayHasKey($key, $data);
        }
    }

    public function test_total_revenue_counts_only_delivered_and_paid_orders()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createOrder(['status' => 'delivered', 'payment_status' => 'paid', 'total' => 100000]);
        $this->createOrder(['status' => 'delivered', 'payment_status' => 'pending', 'total' => 200000]);
        $this->createOrder(['status' => 'pending', 'payment_status' => 'paid', 'total' => 300000]);
        $this->createOrder(['status' => 'cancelled', 'payment_status' => 'paid', 'total' => 400000]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(200);

        $this->assertSame(100000.0, (float) $response->json('data.total_revenue'));
    }

    public function test_pending_cancelled_delivered_order_counts_are_correct()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createOrder(['status' => 'pending']);
        $this->createOrder(['status' => 'pending']);
        $this->createOrder(['status' => 'cancelled']);
        $this->createOrder(['status' => 'delivered']);
        $this->createOrder(['status' => 'delivered']);
        $this->createOrder(['status' => 'delivered']);
        $this->createOrder(['status' => 'processing']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.total_orders', 7)
            ->assertJsonPath('data.pending_orders', 2)
            ->assertJsonPath('data.cancelled_orders', 1)
            ->assertJsonPath('data.delivered_orders', 3);
    }

    public function test_low_stock_variants_calculated_correctly()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['is_active' => true]);

        ProductVariant::factory()->for($product)->create(['size' => 'S1', 'color' => 'Color 1', 'stock' => 1]);
        ProductVariant::factory()->for($product)->create(['size' => 'S2', 'color' => 'Color 2', 'stock' => 5]);
        ProductVariant::factory()->for($product)->create(['size' => 'S3', 'color' => 'Color 3', 'stock' => 6]);
        ProductVariant::factory()->for($product)->create(['size' => 'S4', 'color' => 'Color 4', 'stock' => 0]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonPath('data.low_stock_variants', 2);
    }

    public function test_out_of_stock_variants_calculated_correctly()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['is_active' => true]);

        ProductVariant::factory()->for($product)->create(['size' => 'S1', 'color' => 'Color 1', 'stock' => 0]);
        ProductVariant::factory()->for($product)->create(['size' => 'S2', 'color' => 'Color 2', 'stock' => 0]);
        ProductVariant::factory()->for($product)->create(['size' => 'S3', 'color' => 'Color 3', 'stock' => 2]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonPath('data.out_of_stock_variants', 2);
    }

    public function test_total_reviews_counts_only_approved_reviews()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createReviewRecord(5, true);
        $this->createReviewRecord(4, true);
        $this->createReviewRecord(1, false);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonPath('data.total_reviews', 2);
    }

    public function test_average_rating_calculates_only_approved_reviews()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createReviewRecord(5, true);
        $this->createReviewRecord(3, true);
        $this->createReviewRecord(1, false);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(200);

        $this->assertSame(4.0, (float) $response->json('data.average_rating'));
    }

    public function test_average_rating_is_zero_when_no_reviews()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonPath('data.total_reviews', 0);

        $this->assertSame(0.0, (float) $response->json('data.average_rating'));
    }

    public function test_recent_orders_limited_to_five()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        for ($index = 0; $index < 6; $index++) {
            $this->createOrder(['created_at' => now()->subMinutes($index)]);
        }

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data.recent_orders'));
    }

    public function test_recent_orders_does_not_expose_unnecessary_pii()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createOrder([
            'customer_name' => 'Private User',
            'customer_email' => 'private@example.com',
            'customer_phone' => '0900111222',
            'shipping_phone' => '0900333444',
            'shipping_address' => 'Secret Address',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(200);

        $recentOrder = $response->json('data.recent_orders.0');
        $this->assertArrayHasKey('order_code', $recentOrder);
        $this->assertArrayHasKey('status', $recentOrder);
        $this->assertArrayHasKey('payment_status', $recentOrder);
        $this->assertArrayHasKey('total', $recentOrder);
        $this->assertArrayHasKey('created_at', $recentOrder);
        $this->assertArrayHasKey('customer_name', $recentOrder);

        $this->assertArrayNotHasKey('shipping_address', $recentOrder);
        $this->assertArrayNotHasKey('shipping_phone', $recentOrder);
        $this->assertArrayNotHasKey('customer_email', $recentOrder);
        $this->assertArrayNotHasKey('customer_phone', $recentOrder);
        $this->assertArrayNotHasKey('guest_email', $recentOrder);
    }

    public function test_top_selling_products_calculated_by_quantity_from_delivered_paid_orders()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $productA = Product::factory()->create(['is_active' => true]);
        $productB = Product::factory()->create(['is_active' => true]);

        $orderA = $this->createOrder(['status' => 'delivered', 'payment_status' => 'paid']);
        $orderB = $this->createOrder(['status' => 'delivered', 'payment_status' => 'paid']);
        $orderC = $this->createOrder(['status' => 'delivered', 'payment_status' => 'paid']);
        $orderIgnored = $this->createOrder(['status' => 'delivered', 'payment_status' => 'pending']);

        $this->createOrderItem($orderA, $productA, 2, 200000);
        $this->createOrderItem($orderB, $productA, 3, 300000);
        $this->createOrderItem($orderC, $productB, 1, 120000);
        $this->createOrderItem($orderIgnored, $productB, 10, 1200000);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(200);

        $topSelling = collect($response->json('data.top_selling_products'));

        $productAStats = $topSelling->firstWhere('product_id', $productA->id);
        $productBStats = $topSelling->firstWhere('product_id', $productB->id);

        $this->assertNotNull($productAStats);
        $this->assertNotNull($productBStats);
        $this->assertSame(5, (int) $productAStats['total_sold']);
        $this->assertSame(500000.0, (float) $productAStats['revenue']);
        $this->assertSame(1, (int) $productBStats['total_sold']);
        $this->assertSame(120000.0, (float) $productBStats['revenue']);
    }

    public function test_top_selling_products_ignores_order_items_with_null_product_id()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['is_active' => true]);
        $order = $this->createOrder(['status' => 'delivered', 'payment_status' => 'paid']);

        $this->createOrderItem($order, $product, 1, 100000);
        $this->createOrderItem($order, null, 50, 5000000);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(200);

        $topSelling = collect($response->json('data.top_selling_products'));
        $this->assertSame(1, $topSelling->count());

        $stats = $topSelling->first();
        $this->assertSame($product->id, (int) $stats['product_id']);
        $this->assertSame(1, (int) $stats['total_sold']);
        $this->assertSame(100000.0, (float) $stats['revenue']);
    }

    private function createOrder(array $overrides = []): Order
    {
        $now = $overrides['created_at'] ?? now();

        $attributes = array_merge([
            'user_id' => User::factory()->create()->id,
            'guest_name' => null,
            'guest_email' => null,
            'customer_name' => 'Customer',
            'customer_email' => 'customer+' . Str::lower(Str::random(8)) . '@example.com',
            'customer_phone' => '0900000000',
            'voucher_id' => null,
            'code' => $this->makeOrderCode(),
            'status' => 'pending',
            'subtotal' => 100000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 130000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => 'Customer',
            'shipping_phone' => '0900000000',
            'shipping_address' => 'Address',
            'note' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ], $overrides);

        return Order::create($attributes);
    }

    private function createOrderItem(Order $order, ?Product $product, int $quantity, float $lineTotal): void
    {
        $variant = null;
        if ($product) {
            $variantIndex = ProductVariant::query()
                ->where('product_id', $product->id)
                ->count() + 1;

            $variant = ProductVariant::factory()->for($product)->create([
                'size' => 'S' . $variantIndex,
                'color' => 'Color ' . $variantIndex,
                'stock' => 20,
                'price_adjustment' => 0,
            ]);
        }

        $order->items()->create([
            'product_id' => $product?->id,
            'product_variant_id' => $variant?->id,
            'product_name' => $product?->name ?? 'Unknown product',
            'variant_name' => $variant ? ('Size ' . $variant->size . ' / Color ' . $variant->color) : 'N/A',
            'sku' => $variant?->sku,
            'image_url' => null,
            'unit_price' => $quantity > 0 ? round($lineTotal / $quantity, 2) : 0,
            'quantity' => $quantity,
            'line_total' => $lineTotal,
            'variant_info' => $variant ? ['size' => $variant->size, 'color' => $variant->color] : null,
        ]);
    }

    private function createReviewRecord(int $rating, bool $approved): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => 10,
            'price_adjustment' => 0,
        ]);

        $order = $this->createOrder([
            'user_id' => $user->id,
            'status' => 'delivered',
            'payment_status' => 'paid',
        ]);

        $orderItem = $order->items()->create([
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

        Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $orderItem->id,
            'rating' => $rating,
            'comment' => 'Dashboard review',
            'is_approved' => $approved,
        ]);
    }

    private function makeOrderCode(): string
    {
        return 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6));
    }
}
