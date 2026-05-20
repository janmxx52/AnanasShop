<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DashboardAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-05-20 10:00:00'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_guest_cannot_access_dashboard_analytics()
    {
        $this->getJson('/api/admin/dashboard/analytics')->assertStatus(401);
    }

    public function test_customer_cannot_access_dashboard_analytics()
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics')
            ->assertStatus(403);
    }

    public function test_admin_can_get_dashboard_analytics_successfully()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Lấy dữ liệu phân tích dashboard thành công.');
    }

    public function test_dashboard_analytics_response_has_expected_shape()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200)->assertJsonPath('success', true);

        $data = $response->json('data');

        $this->assertArrayHasKey('metrics', $data);
        $this->assertArrayHasKey('revenue_chart', $data);
        $this->assertArrayHasKey('order_chart', $data);
        $this->assertArrayHasKey('order_status', $data);
        $this->assertArrayHasKey('inventory', $data);
        $this->assertArrayHasKey('recent_orders', $data);
        $this->assertArrayHasKey('top_selling_products', $data);

        $this->assertArrayHasKey('today_revenue', $data['metrics']);
        $this->assertArrayHasKey('this_month_revenue', $data['metrics']);
        $this->assertArrayHasKey('last_month_revenue', $data['metrics']);
        $this->assertArrayHasKey('revenue_growth_percent', $data['metrics']);
        $this->assertArrayHasKey('order_growth_percent', $data['metrics']);
        $this->assertArrayHasKey('customer_growth_percent', $data['metrics']);
    }

    public function test_revenue_chart_returns_exactly_twelve_months()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200);

        $labels = $response->json('data.revenue_chart.labels');
        $series = $response->json('data.revenue_chart.series');

        $this->assertSame('12m', $response->json('data.revenue_chart.range'));
        $this->assertCount(12, $labels);
        $this->assertCount(12, $series);
        $this->assertSame('2025-06', $labels[0]);
        $this->assertSame('2026-05', $labels[11]);
    }

    public function test_cancelled_orders_are_not_counted_in_revenue_while_delivered_paid_are_counted()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createOrder([
            'status' => 'delivered',
            'payment_status' => 'paid',
            'total' => 150000,
            'created_at' => now()->copy()->startOfMonth()->addDay(),
        ]);
        $this->createOrder([
            'status' => 'cancelled',
            'payment_status' => 'paid',
            'total' => 900000,
            'created_at' => now()->copy()->startOfMonth()->addDays(2),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200);
        $this->assertSame(150000.0, (float) $response->json('data.metrics.this_month_revenue'));
    }

    public function test_order_status_breakdown_is_correct()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->createOrder(['status' => 'pending']);
        $this->createOrder(['status' => 'confirmed']);
        $this->createOrder(['status' => 'processing']);
        $this->createOrder(['status' => 'shipping']);
        $this->createOrder(['status' => 'delivered']);
        $this->createOrder(['status' => 'cancelled']);
        $this->createOrder(['status' => 'returned']);
        $this->createOrder(['status' => 'delivered']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200)
            ->assertJsonPath('data.order_status.pending', 1)
            ->assertJsonPath('data.order_status.confirmed', 1)
            ->assertJsonPath('data.order_status.processing', 1)
            ->assertJsonPath('data.order_status.shipping', 1)
            ->assertJsonPath('data.order_status.delivered', 2)
            ->assertJsonPath('data.order_status.cancelled', 1)
            ->assertJsonPath('data.order_status.returned', 1);
    }

    public function test_inventory_breakdown_is_correct()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['is_active' => true]);

        ProductVariant::factory()->for($product)->create(['size' => 'S1', 'color' => 'Black', 'stock' => 0]);
        ProductVariant::factory()->for($product)->create(['size' => 'S2', 'color' => 'White', 'stock' => -1]);
        ProductVariant::factory()->for($product)->create(['size' => 'S3', 'color' => 'Red', 'stock' => 1]);
        ProductVariant::factory()->for($product)->create(['size' => 'S4', 'color' => 'Blue', 'stock' => 5]);
        ProductVariant::factory()->for($product)->create(['size' => 'S5', 'color' => 'Green', 'stock' => 6]);
        ProductVariant::factory()->for($product)->create(['size' => 'S6', 'color' => 'Gray', 'stock' => 20]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200)
            ->assertJsonPath('data.inventory.out_of_stock', 2)
            ->assertJsonPath('data.inventory.low_stock', 2)
            ->assertJsonPath('data.inventory.in_stock', 2);
    }

    public function test_growth_percent_handles_divide_by_zero_without_error()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'created_at' => now()->copy()->subMonthsNoOverflow(2)->startOfMonth()->addDay(),
            'updated_at' => now()->copy()->subMonthsNoOverflow(2)->startOfMonth()->addDay(),
        ]);

        $this->createOrder([
            'status' => 'delivered',
            'payment_status' => 'paid',
            'total' => 250000,
            'created_at' => now()->copy()->startOfMonth()->addDays(3),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200);

        $this->assertSame(100.0, (float) $response->json('data.metrics.revenue_growth_percent'));
        $this->assertSame(100.0, (float) $response->json('data.metrics.order_growth_percent'));
        $this->assertSame(100.0, (float) $response->json('data.metrics.customer_growth_percent'));
    }

    public function test_recent_orders_and_top_selling_products_have_expected_shape()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['is_active' => true, 'name' => 'Ananas Test Product']);

        $recentOrder = $this->createOrder([
            'status' => 'delivered',
            'payment_status' => 'paid',
            'created_at' => now()->copy()->subMinute(),
            'customer_name' => 'Nguyen Van A',
        ]);

        $this->createOrderItem($recentOrder, $product, 2, 260000, '/ananas-assets/products/demo.jpg');

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/analytics');

        $response->assertStatus(200);

        $recentOrderData = $response->json('data.recent_orders.0');
        $this->assertArrayHasKey('order_code', $recentOrderData);
        $this->assertArrayHasKey('status', $recentOrderData);
        $this->assertArrayHasKey('payment_status', $recentOrderData);
        $this->assertArrayHasKey('total', $recentOrderData);
        $this->assertArrayHasKey('created_at', $recentOrderData);
        $this->assertArrayHasKey('customer_name', $recentOrderData);

        $topSelling = $response->json('data.top_selling_products.0');
        $this->assertArrayHasKey('product_id', $topSelling);
        $this->assertArrayHasKey('product_name', $topSelling);
        $this->assertArrayHasKey('total_sold', $topSelling);
        $this->assertArrayHasKey('revenue', $topSelling);
        $this->assertArrayHasKey('image_url', $topSelling);
    }

    private function createOrder(array $overrides = []): Order
    {
        $createdAt = $overrides['created_at'] ?? now();

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
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ], $overrides);

        return Order::create($attributes);
    }

    private function createOrderItem(
        Order $order,
        ?Product $product,
        int $quantity,
        float $lineTotal,
        ?string $imageUrl = null
    ): void {
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
            'image_url' => $imageUrl,
            'unit_price' => $quantity > 0 ? round($lineTotal / $quantity, 2) : 0,
            'quantity' => $quantity,
            'line_total' => $lineTotal,
            'variant_info' => $variant ? ['size' => $variant->size, 'color' => $variant->color] : null,
        ]);
    }

    private function makeOrderCode(): string
    {
        return 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6));
    }
}
