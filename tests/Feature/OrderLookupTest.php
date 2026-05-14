<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_lookup_order_by_order_code_and_email()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'guest.lookup@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_code', $order->code);
    }

    public function test_guest_can_lookup_order_by_order_code_and_phone()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'phone' => '0900001234',
        ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_code', $order->code);
    }

    public function test_user_order_can_lookup_by_order_code_and_email()
    {
        $user = User::factory()->create(['email' => 'user.lookup@example.com']);
        $order = $this->createUserOrder($user, [
            'customer_email' => 'user.lookup@example.com',
        ]);

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'user.lookup@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_code', $order->code);
    }

    public function test_user_order_can_lookup_by_order_code_and_phone()
    {
        $user = User::factory()->create();
        $order = $this->createUserOrder($user, [
            'customer_phone' => '0911112222',
            'shipping_phone' => '0911112222',
        ]);

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'phone' => '0911112222',
        ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_code', $order->code);
    }

    public function test_lookup_fails_if_only_order_code_provided()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'phone']);
    }

    public function test_lookup_fails_if_email_mismatch()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'wrong@example.com',
        ])->assertStatus(404)
            ->assertJsonPath('message', 'Không tìm thấy đơn hàng');
    }

    public function test_lookup_fails_if_phone_mismatch()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'phone' => '0999999999',
        ])->assertStatus(404)
            ->assertJsonPath('message', 'Không tìm thấy đơn hàng');
    }

    public function test_lookup_fails_if_both_email_and_phone_provided_but_only_one_matches()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'guest.lookup@example.com',
            'phone' => '0999999999',
        ])->assertStatus(404)
            ->assertJsonPath('message', 'Không tìm thấy đơn hàng');
    }

    public function test_failed_lookup_returns_generic_message_only()
    {
        $order = $this->createGuestOrder();

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'mismatch@example.com',
        ])->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ])
            ->assertJsonMissingPath('errors')
            ->assertJsonMissingPath('data');
    }

    public function test_failed_lookup_does_not_leak_email_phone_or_address()
    {
        $order = $this->createGuestOrder([
            'guest_email' => 'secret-guest@example.com',
            'customer_email' => 'secret-customer@example.com',
            'customer_phone' => '0901111222',
            'shipping_phone' => '0901111222',
            'shipping_address' => '12345678901234567890-SECRET-ADDRESS',
        ]);

        $response = $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'wrong@example.com',
        ])->assertStatus(404)
            ->assertJsonPath('message', 'Không tìm thấy đơn hàng');

        $response->assertDontSee('secret-guest@example.com');
        $response->assertDontSee('secret-customer@example.com');
        $response->assertDontSee('0901111222');
        $response->assertDontSee('12345678901234567890-SECRET-ADDRESS');
    }

    public function test_success_response_masks_shipping_address()
    {
        $order = $this->createGuestOrder([
            'shipping_address' => '12345678901234567890ABCDEFGH',
        ]);

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'guest.lookup@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('data.shipping_address', '12345678901234567890****');
    }

    public function test_response_contains_status_timeline()
    {
        $order = $this->createGuestOrder([
            'status' => 'shipping',
        ]);

        $response = $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'phone' => '0900001234',
        ])->assertStatus(200)
            ->assertJsonPath('data.status_timeline.0.status', 'pending')
            ->assertJsonPath('data.status_timeline.3.status', 'shipping')
            ->assertJsonPath('data.status_timeline.3.state', 'current')
            ->assertJsonPath('data.status_timeline.4.status', 'delivered')
            ->assertJsonPath('data.status_timeline.4.state', 'pending');

        $this->assertIsArray($response->json('data.status_timeline'));
    }

    public function test_throttle_applies_to_lookup_endpoint()
    {
        $order = $this->createGuestOrder();

        for ($index = 1; $index <= 10; $index++) {
            $this->postJson('/api/orders/lookup', [
                'order_code' => $order->code,
                'email' => 'wrong@example.com',
            ])->assertStatus(404);
        }

        $this->postJson('/api/orders/lookup', [
            'order_code' => $order->code,
            'email' => 'wrong@example.com',
        ])->assertStatus(429);
    }

    private function createGuestOrder(array $overrides = []): Order
    {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => 10,
            'price_adjustment' => 0,
        ]);

        $order = Order::create(array_merge([
            'user_id' => null,
            'guest_name' => 'Guest Lookup',
            'guest_email' => 'guest.lookup@example.com',
            'customer_name' => 'Guest Lookup',
            'customer_email' => 'guest.lookup@example.com',
            'customer_phone' => '0900001234',
            'voucher_id' => null,
            'code' => $this->makeOrderCode(),
            'status' => 'pending',
            'subtotal' => 120000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 150000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => 'Guest Lookup',
            'shipping_phone' => '0900001234',
            'shipping_address' => '12345678901234567890 Ward 1, District 1',
            'note' => null,
        ], $overrides));

        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_name' => 'Size M / Color Black',
            'sku' => $variant->sku,
            'image_url' => null,
            'unit_price' => 120000,
            'quantity' => 1,
            'line_total' => 120000,
            'variant_info' => ['size' => 'M', 'color' => 'Black'],
        ]);

        return $order;
    }

    private function createUserOrder(User $user, array $overrides = []): Order
    {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => 10,
            'price_adjustment' => 0,
        ]);

        $order = Order::create(array_merge([
            'user_id' => $user->id,
            'guest_name' => null,
            'guest_email' => null,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '0911111111',
            'voucher_id' => null,
            'code' => $this->makeOrderCode(),
            'status' => 'confirmed',
            'subtotal' => 180000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 210000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => $user->name,
            'shipping_phone' => '0911111111',
            'shipping_address' => '11112222333344445555 Main Road',
            'note' => null,
        ], $overrides));

        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_name' => 'Size L / Color White',
            'sku' => $variant->sku,
            'image_url' => null,
            'unit_price' => 180000,
            'quantity' => 1,
            'line_total' => 180000,
            'variant_info' => ['size' => 'L', 'color' => 'White'],
        ]);

        return $order;
    }

    private function makeOrderCode(): string
    {
        return 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6));
    }
}

