<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_checkout_successfully()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 100000, stock: 10);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest One',
            'email' => 'guest@example.com',
            'phone' => '0900000000',
            'shipping_address' => '123 Street, District 1',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer.user_id', null)
            ->assertJsonPath('data.customer.guest_name', 'Guest One')
            ->assertJsonPath('data.shipping.address', '123 Street, District 1');

        $this->assertDatabaseHas('orders', [
            'guest_name' => 'Guest One',
            'guest_email' => 'guest@example.com',
            'payment_method' => 'cod',
        ]);
    }

    public function test_authenticated_user_can_checkout_successfully()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        [$product, $variant] = $this->createProductVariant(basePrice: 150000, stock: 10);
        $cart = Cart::create(['user_id' => $user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->postJson('/api/orders', [
            'shipping_name' => 'Customer One',
            'shipping_phone' => '0911111111',
            'shipping_address' => '456 Street, District 2',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer.user_id', $user->id)
            ->assertJsonPath('data.customer.guest_name', null)
            ->assertJsonPath('data.shipping.name', 'Customer One');

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_name' => 'Customer One',
            'payment_method' => 'cod',
        ]);
    }

    public function test_cannot_checkout_empty_cart()
    {
        $guestToken = (string) Str::uuid();
        Cart::create(['guest_token' => $guestToken]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Empty',
            'email' => 'empty@example.com',
            'phone' => '0900000001',
            'shipping_address' => 'No item address',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['cart']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_cannot_checkout_if_stock_insufficient()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 120000, stock: 1);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Low Stock',
            'email' => 'stock@example.com',
            'phone' => '0900000002',
            'shipping_address' => '789 Street',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['cart_items']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_deducts_stock()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 100000, stock: 8);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Stock',
            'email' => 'deduct@example.com',
            'phone' => '0900000003',
            'shipping_address' => 'Deduct Street',
        ])->assertStatus(201);

        $variant->refresh();
        $this->assertSame(5, $variant->stock);
    }

    public function test_checkout_clears_cart()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 100000, stock: 8);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Clear Cart',
            'email' => 'clear@example.com',
            'phone' => '0900000004',
            'shipping_address' => 'Clear Street',
        ])->assertStatus(201);

        $this->assertDatabaseMissing('cart_items', ['cart_id' => $cart->id]);
    }

    public function test_order_items_snapshot_fields_are_saved()
    {
        [$product, $variant] = $this->createProductVariant(
            basePrice: 100000,
            stock: 8,
            salePrice: 90000,
            priceAdjustment: 5000,
            size: '42',
            color: 'White',
            sku: 'SKU-SNAPSHOT'
        );
        ProductImage::create([
            'product_id' => $product->id,
            'url' => 'https://cdn.example.com/primary.jpg',
            'public_id' => 'primary-1',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Snapshot',
            'email' => 'snapshot@example.com',
            'phone' => '0900000005',
            'shipping_address' => 'Snapshot Street',
        ]);

        $response->assertStatus(201);
        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'product_name' => $product->name,
            'variant_name' => 'Size 42 / Color White',
            'sku' => 'SKU-SNAPSHOT',
            'image_url' => 'https://cdn.example.com/primary.jpg',
            'unit_price' => 95000.00,
            'quantity' => 2,
            'line_total' => 190000.00,
        ]);
    }

    public function test_voucher_discount_is_applied()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 200000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'FIXED10K',
            'type' => 'fixed',
            'value' => 10000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Voucher',
            'email' => 'voucher@example.com',
            'phone' => '0900000006',
            'shipping_address' => 'Voucher Street',
            'voucher_code' => $voucher->code,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.discount_amount', 10000)
            ->assertJsonPath('data.total', 220000);
    }

    public function test_voucher_used_count_increments_only_after_successful_checkout()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 200000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'COUNT1',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
            'used_count' => 0,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Count',
            'email' => 'count@example.com',
            'phone' => '0900000007',
            'shipping_address' => 'Count Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(201);

        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id, 'used_count' => 1]);
    }

    public function test_voucher_usages_created_only_after_successful_checkout()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 200000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'USAGE1',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
            'used_count' => 0,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Usage',
            'email' => 'usage@example.com',
            'phone' => '0900000008',
            'shipping_address' => 'Usage Street',
            'voucher_code' => $voucher->code,
        ]);

        $response->assertStatus(201);

        $orderId = $response->json('data.id');
        $this->assertDatabaseHas('voucher_usages', [
            'voucher_id' => $voucher->id,
            'user_id' => null,
            'guest_token' => $guestToken,
            'order_id' => $orderId,
        ]);
    }

    public function test_checkout_user_with_voucher_creates_usage_with_user_id_and_null_guest_token()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        [$product, $variant] = $this->createProductVariant(basePrice: 200000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'USERMAP',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
            'used_count' => 0,
        ]);

        $cart = Cart::create(['user_id' => $user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->postJson('/api/orders', [
            'shipping_name' => 'Voucher User',
            'shipping_phone' => '0922222222',
            'shipping_address' => 'User Voucher Street',
            'voucher_code' => $voucher->code,
        ]);

        $response->assertStatus(201);

        $orderId = $response->json('data.id');
        $this->assertDatabaseHas('voucher_usages', [
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
            'guest_token' => null,
            'order_id' => $orderId,
        ]);
    }

    public function test_checkout_enforces_voucher_usage_limit()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 200000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'LIMITHARD',
            'type' => 'fixed',
            'value' => 10000,
            'min_order_amount' => 0,
            'usage_limit' => 1,
            'usage_per_user' => 5,
            'is_active' => 1,
            'used_count' => 1,
        ]);

        VoucherUsage::create([
            'voucher_id' => $voucher->id,
            'guest_token' => (string) Str::uuid(),
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Limit',
            'email' => 'limit@example.com',
            'phone' => '0900000012',
            'shipping_address' => 'Limit Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(422)->assertJsonValidationErrors(['voucher_code']);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('voucher_usages', 1);
    }

    public function test_checkout_enforces_voucher_usage_per_user()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        [$product, $variant] = $this->createProductVariant(basePrice: 200000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'PERUSERHARD',
            'type' => 'fixed',
            'value' => 10000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
            'used_count' => 1,
        ]);

        VoucherUsage::create([
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
        ]);

        $cart = Cart::create(['user_id' => $user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->postJson('/api/orders', [
            'shipping_name' => 'Limit User',
            'shipping_phone' => '0933333333',
            'shipping_address' => 'Per User Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(422)->assertJsonValidationErrors(['voucher_code']);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('voucher_usages', 1);
    }

    public function test_checkout_rejects_inactive_voucher()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 150000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'INACTIVEV',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 0,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Inactive',
            'email' => 'inactive@example.com',
            'phone' => '0900000013',
            'shipping_address' => 'Inactive Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(422)->assertJsonValidationErrors(['voucher_code']);
    }

    public function test_checkout_rejects_not_started_voucher()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 150000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'NOTSTARTV',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'starts_at' => now()->addDay(),
            'is_active' => 1,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Not Started',
            'email' => 'notstarted@example.com',
            'phone' => '0900000014',
            'shipping_address' => 'Not Started Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(422)->assertJsonValidationErrors(['voucher_code']);
    }

    public function test_checkout_rejects_expired_voucher()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 150000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'EXPIREDV',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'expires_at' => now()->subDay(),
            'is_active' => 1,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Expired',
            'email' => 'expired@example.com',
            'phone' => '0900000015',
            'shipping_address' => 'Expired Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(422)->assertJsonValidationErrors(['voucher_code']);
    }

    public function test_checkout_percent_voucher_respects_max_discount()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 300000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'PCTMAX',
            'type' => 'percent',
            'value' => 50,
            'max_discount' => 100000,
            'min_order_amount' => 0,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Percent',
            'email' => 'percent@example.com',
            'phone' => '0900000016',
            'shipping_address' => 'Percent Street',
            'voucher_code' => $voucher->code,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.subtotal', 600000)
            ->assertJsonPath('data.discount_amount', 100000)
            ->assertJsonPath('data.shipping_fee', 0)
            ->assertJsonPath('data.total', 500000);
    }

    public function test_voucher_check_failure_does_not_create_order()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 100000, stock: 5);
        $voucher = Voucher::create([
            'code' => 'MIN500K',
            'type' => 'fixed',
            'value' => 10000,
            'min_order_amount' => 500000,
            'usage_limit' => null,
            'usage_per_user' => 1,
            'is_active' => 1,
            'used_count' => 0,
        ]);

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Fail',
            'email' => 'fail@example.com',
            'phone' => '0900000009',
            'shipping_address' => 'Fail Street',
            'voucher_code' => $voucher->code,
        ])->assertStatus(422)->assertJsonValidationErrors(['voucher_code']);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('voucher_usages', 0);
        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id, 'used_count' => 0]);
    }

    public function test_shipping_fee_is_30000_when_subtotal_below_500000()
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
            'full_name' => 'Guest Shipping 30K',
            'email' => 'ship30@example.com',
            'phone' => '0900000010',
            'shipping_address' => 'Ship Street',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.shipping_fee', 30000);
    }

    public function test_shipping_fee_is_zero_when_subtotal_at_least_500000()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 250000, stock: 5);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Shipping Free',
            'email' => 'ship0@example.com',
            'phone' => '0900000011',
            'shipping_address' => 'Ship Free Street',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.shipping_fee', 0);
    }

    public function test_checkout_fails_when_product_becomes_inactive_after_added_to_cart()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 120000, stock: 5);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $product->update(['is_active' => false]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Product Inactive',
            'email' => 'inactive-product@example.com',
            'phone' => '0900000017',
            'shipping_address' => 'Inactive Product Street',
        ])->assertStatus(422)->assertJsonValidationErrors(['cart_items']);
    }

    public function test_checkout_fails_when_variant_stock_becomes_zero_after_added_to_cart()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 120000, stock: 3);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $variant->update(['stock' => 0]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Variant Zero',
            'email' => 'variant-zero@example.com',
            'phone' => '0900000018',
            'shipping_address' => 'Variant Zero Street',
        ])->assertStatus(422)->assertJsonValidationErrors(['cart_items']);
    }

    public function test_checkout_rejects_non_cod_payment_method()
    {
        [$product, $variant] = $this->createProductVariant(basePrice: 120000, stock: 5);
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Payment',
            'email' => 'payment@example.com',
            'phone' => '0900000019',
            'shipping_address' => 'Payment Street',
            'payment_method' => 'vnpay',
        ])->assertStatus(422)->assertJsonValidationErrors(['payment_method']);
    }

    public function test_checkout_order_item_unit_price_is_consistent_with_product_display_price()
    {
        [$product, $variant] = $this->createProductVariant(
            basePrice: 120000,
            stock: 10,
            salePrice: 100000,
            priceAdjustment: 5000
        );
        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $productResponse = $this->getJson('/api/products/' . $product->slug);
        $productResponse->assertStatus(200);
        $displayedVariantPrice = (float) $productResponse->json('data.variants.0.price');

        $response = $this->withHeader('X-Guest-Token', $guestToken)->postJson('/api/checkout/guest', [
            'full_name' => 'Guest Pricing',
            'email' => 'guest-pricing@example.com',
            'phone' => '0900000099',
            'shipping_address' => 'Pricing Street',
        ]);

        $response->assertStatus(201);
        $this->assertEquals($displayedVariantPrice, (float) $response->json('data.subtotal'));

        $orderId = $response->json('data.id');
        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'product_variant_id' => $variant->id,
            'unit_price' => $displayedVariantPrice,
        ]);
    }

    private function createProductVariant(
        float $basePrice,
        int $stock,
        ?float $salePrice = null,
        float $priceAdjustment = 0,
        string $size = 'M',
        string $color = 'Black',
        ?string $sku = null
    ): array {
        $product = Product::factory()->create([
            'base_price' => $basePrice,
            'sale_price' => $salePrice,
            'is_active' => true,
        ]);

        $variant = ProductVariant::factory()->for($product)->create([
            'stock' => $stock,
            'price_adjustment' => $priceAdjustment,
            'size' => $size,
            'color' => $color,
            'sku' => $sku ?? strtoupper('SKU-' . Str::random(8)),
        ]);

        return [$product, $variant];
    }
}
