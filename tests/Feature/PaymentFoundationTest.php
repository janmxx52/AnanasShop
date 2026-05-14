<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PaymentFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_cod_creates_order_with_payment_status_pending()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 120000, stock: 5);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Payment',
            'email' => 'guest.payment@example.com',
            'phone' => '0900008888',
            'shipping_address' => 'Payment Street',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.payment_method', 'cod')
            ->assertJsonPath('data.payment_status', 'pending');
    }

    public function test_admin_marks_cod_order_delivered_then_payment_status_becomes_paid()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $order = $this->createCodOrderForUser($user, status: 'pending', paymentStatus: 'pending');

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'confirmed'])->assertStatus(200);
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'processing'])->assertStatus(200);
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'shipping'])->assertStatus(200);

        $response = $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'delivered']);
        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'delivered')
            ->assertJsonPath('data.payment_status', 'paid');
    }

    public function test_customer_cancelling_cod_order_sets_payment_status_cancelled()
    {
        $user = User::factory()->create();
        $order = $this->createCodOrderForUser($user, status: 'pending', paymentStatus: 'pending');

        $this->actingAs($user, 'sanctum');
        $response = $this->postJson("/api/orders/{$order->code}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.payment_status', 'cancelled');
    }

    public function test_admin_cancelling_cod_order_sets_payment_status_cancelled()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $order = $this->createCodOrderForUser($user, status: 'shipping', paymentStatus: 'pending');

        $this->actingAs($admin, 'sanctum');
        $response = $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'cancelled']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.payment_status', 'cancelled');
    }

    public function test_non_delivered_cod_order_remains_pending()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $order = $this->createCodOrderForUser($user, status: 'pending', paymentStatus: 'pending');

        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'confirmed'])
            ->assertStatus(200)
            ->assertJsonPath('data.payment_status', 'pending');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'processing'])
            ->assertStatus(200)
            ->assertJsonPath('data.payment_status', 'pending');
        $this->patchJson("/api/admin/orders/{$order->code}/status", ['status' => 'shipping'])
            ->assertStatus(200)
            ->assertJsonPath('data.payment_status', 'pending');
    }

    public function test_payment_status_cannot_be_changed_directly_by_normal_order_status_payload()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $order = $this->createCodOrderForUser($user, status: 'pending', paymentStatus: 'pending');

        $this->actingAs($admin, 'sanctum');
        $response = $this->patchJson("/api/admin/orders/{$order->code}/status", [
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['payment_status']);

        $order->refresh();
        $this->assertSame('pending', $order->payment_status);
        $this->assertSame('pending', $order->status);
    }

    public function test_failed_is_not_used_for_cod_cancel()
    {
        $user = User::factory()->create();
        $order = $this->createCodOrderForUser($user, status: 'confirmed', paymentStatus: 'pending');

        $this->actingAs($user, 'sanctum');
        $response = $this->postJson("/api/orders/{$order->code}/cancel");
        $response->assertStatus(200)->assertJsonPath('data.payment_status', 'cancelled');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'cancelled',
        ]);
        $this->assertDatabaseMissing('orders', [
            'id' => $order->id,
            'payment_status' => 'failed',
        ]);
    }

    private function createCodOrderForUser(User $user, string $status = 'pending', string $paymentStatus = 'pending'): Order
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 100000, stock: 10);

        $order = Order::create([
            'user_id' => $user->id,
            'guest_name' => null,
            'guest_email' => null,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '0900000000',
            'voucher_id' => null,
            'code' => $this->makeOrderCode(),
            'status' => $status,
            'subtotal' => 100000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 130000,
            'payment_method' => 'cod',
            'payment_status' => $paymentStatus,
            'shipping_name' => $user->name,
            'shipping_phone' => '0900000000',
            'shipping_address' => 'Address',
            'note' => null,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_name' => 'Size M / Color Black',
            'sku' => $variant->sku,
            'image_url' => null,
            'unit_price' => 50000,
            'quantity' => 2,
            'line_total' => 100000,
            'variant_info' => ['size' => 'M', 'color' => 'Black'],
        ]);

        return $order;
    }

    private function createProductVariant(float $basePrice, int $stock): array
    {
        $product = Product::factory()->create([
            'base_price' => $basePrice,
            'sale_price' => null,
            'is_active' => true,
        ]);

        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => $stock,
            'price_adjustment' => 0,
            'size' => 'M',
            'color' => 'Black',
            'sku' => strtoupper('SKU-' . Str::random(8)),
        ]);

        return [$product, $variant];
    }

    private function makeOrderCode(): string
    {
        return 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6));
    }
}
