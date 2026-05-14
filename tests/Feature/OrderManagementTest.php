<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_orders_endpoint()
    {
        $this->getJson('/api/orders')->assertStatus(401);
    }

    public function test_user_can_list_own_orders()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        [$orderA] = $this->createOrderForUser($user, status: 'pending');
        [$orderB] = $this->createOrderForUser($user, status: 'confirmed');
        [$otherOrder] = $this->createOrderForUser($otherUser, status: 'pending');

        $this->actingAs($user, 'sanctum');
        $response = $this->getJson('/api/orders');

        $response->assertStatus(200)->assertJsonPath('success', true);
        $codes = collect($response->json('data'))->pluck('code')->all();

        $this->assertContains($orderA->code, $codes);
        $this->assertContains($orderB->code, $codes);
        $this->assertNotContains($otherOrder->code, $codes);
    }

    public function test_user_can_show_own_order_by_order_code()
    {
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'pending');

        $this->actingAs($user, 'sanctum');
        $this->getJson("/api/orders/{$order->code}")
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', $order->code);
    }

    public function test_user_cannot_show_other_users_order()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        [$otherOrder] = $this->createOrderForUser($otherUser, status: 'pending');

        $this->actingAs($user, 'sanctum');
        $this->getJson("/api/orders/{$otherOrder->code}")->assertStatus(404);
    }

    public function test_user_can_cancel_pending_order()
    {
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'pending');

        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/orders/{$order->code}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_user_can_cancel_confirmed_order()
    {
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'confirmed');

        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/orders/{$order->code}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_user_cannot_cancel_processing_shipping_delivered_order()
    {
        $user = User::factory()->create();

        foreach (['processing', 'shipping', 'delivered'] as $status) {
            [$order] = $this->createOrderForUser($user, status: $status);
            $this->actingAs($user, 'sanctum');

            $this->postJson("/api/orders/{$order->code}/cancel")
                ->assertStatus(422)
                ->assertJsonValidationErrors(['status']);
        }
    }

    public function test_cancel_restores_stock()
    {
        $user = User::factory()->create();
        [$order, $variant] = $this->createOrderForUser($user, status: 'pending', variantStock: 5, quantity: 2);

        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/orders/{$order->code}/cancel")->assertStatus(200);

        $variant->refresh();
        $this->assertSame(7, $variant->stock);
    }

    public function test_cancel_restores_voucher_usage_by_setting_revoked_at()
    {
        $user = User::factory()->create();
        [$order, $variant, $voucher] = $this->createOrderForUser($user, status: 'pending', withVoucher: true);

        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/orders/{$order->code}/cancel")->assertStatus(200);

        $usage = VoucherUsage::where('order_id', $order->id)->where('voucher_id', $voucher->id)->first();
        $this->assertNotNull($usage);
        $this->assertNotNull($usage->revoked_at);
    }

    public function test_cancel_decrements_voucher_used_count()
    {
        $user = User::factory()->create();
        [$order, $variant, $voucher] = $this->createOrderForUser($user, status: 'pending', withVoucher: true);

        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/orders/{$order->code}/cancel")->assertStatus(200);

        $voucher->refresh();
        $this->assertSame(0, (int) $voucher->used_count);
    }

    public function test_cancel_twice_does_not_double_restore_stock_or_voucher()
    {
        $user = User::factory()->create();
        [$order, $variant, $voucher] = $this->createOrderForUser(
            $user,
            status: 'pending',
            withVoucher: true,
            variantStock: 5,
            quantity: 2
        );

        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/orders/{$order->code}/cancel")->assertStatus(200);
        $this->postJson("/api/orders/{$order->code}/cancel")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        $variant->refresh();
        $voucher->refresh();

        $this->assertSame(7, $variant->stock);
        $this->assertSame(0, (int) $voucher->used_count);
        $this->assertSame(0, VoucherUsage::where('order_id', $order->id)->whereNull('revoked_at')->count());
    }

    public function test_admin_can_list_orders()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $this->createOrderForUser($user, status: 'pending');
        $this->createGuestOrder(status: 'confirmed');

        $this->actingAs($admin, 'sanctum');
        $response = $this->getJson('/api/admin/orders');
        $response->assertStatus(200)->assertJsonPath('success', true);

        $this->assertGreaterThanOrEqual(2, count($response->json('data')));
    }

    public function test_admin_can_show_order()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'pending');

        $this->actingAs($admin, 'sanctum');
        $this->getJson("/api/admin/orders/{$order->code}")
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', $order->code);
    }

    public function test_admin_can_update_valid_status()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'pending');

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'confirmed'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');
    }

    public function test_admin_can_cancel_non_delivered_order()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'shipping');

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'cancelled'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_admin_cannot_cancel_delivered_order()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'delivered');

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'cancelled'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_invalid_status_transition_returns_error()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        [$order] = $this->createOrderForUser($user, status: 'pending');

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'shipping'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    private function createOrderForUser(
        User $user,
        string $status,
        bool $withVoucher = false,
        int $variantStock = 5,
        int $quantity = 2
    ): array {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => $variantStock,
            'price_adjustment' => 0,
        ]);

        $voucher = null;
        if ($withVoucher) {
            $voucher = Voucher::create([
                'code' => strtoupper('V-' . Str::random(8)),
                'type' => 'fixed',
                'value' => 10000,
                'min_order_amount' => 0,
                'usage_limit' => null,
                'usage_per_user' => 1,
                'used_count' => 1,
                'is_active' => 1,
            ]);
        }

        $order = Order::create([
            'user_id' => $user->id,
            'guest_name' => null,
            'guest_email' => null,
            'voucher_id' => $voucher?->id,
            'code' => $this->makeOrderCode(),
            'status' => $status,
            'subtotal' => 100000,
            'discount_amount' => $withVoucher ? 10000 : 0,
            'shipping_fee' => 30000,
            'total' => $withVoucher ? 120000 : 130000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => $user->name,
            'shipping_phone' => '0900000000',
            'shipping_address' => 'Address',
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_name' => 'Size M / Color Black',
            'sku' => $variant->sku,
            'image_url' => null,
            'unit_price' => 50000,
            'quantity' => $quantity,
            'line_total' => 50000 * $quantity,
            'variant_info' => ['size' => 'M', 'color' => 'Black'],
        ]);

        if ($withVoucher && $voucher) {
            VoucherUsage::create([
                'voucher_id' => $voucher->id,
                'user_id' => $user->id,
                'guest_token' => null,
                'order_id' => $order->id,
                'revoked_at' => null,
            ]);
        }

        return [$order, $variant, $voucher];
    }

    private function createGuestOrder(string $status): Order
    {
        return Order::create([
            'user_id' => null,
            'guest_name' => 'Guest',
            'guest_email' => 'guest@example.com',
            'voucher_id' => null,
            'code' => $this->makeOrderCode(),
            'status' => $status,
            'subtotal' => 100000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 130000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => 'Guest',
            'shipping_phone' => '0900000000',
            'shipping_address' => 'Guest Address',
        ]);
    }

    private function makeOrderCode(): string
    {
        return 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6));
    }
}
