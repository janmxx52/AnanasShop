<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\VoucherUsage;
use App\Services\Cart\CartService;
use App\Services\Voucher\VoucherCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    private const SHIPPING_FEE = 30000.0;
    private const FREE_SHIPPING_THRESHOLD = 500000.0;

    public function __construct(
        private CartService $cartService,
        private VoucherCalculator $voucherCalculator
    )
    {
    }

    public function checkoutGuest(Request $request, array $payload): Order
    {
        $this->assertCodOnly($payload['payment_method'] ?? null);

        return $this->checkout(
            request: $request,
            user: null,
            guestName: $payload['full_name'],
            guestEmail: $payload['email'],
            shippingName: $payload['full_name'],
            shippingPhone: $payload['phone'],
            shippingAddress: $payload['shipping_address'],
            voucherCode: $payload['voucher_code'] ?? null,
            note: $payload['note'] ?? null,
        );
    }

    public function checkoutUser(Request $request, User $user, array $payload): Order
    {
        $this->assertCodOnly($payload['payment_method'] ?? null);

        return $this->checkout(
            request: $request,
            user: $user,
            guestName: null,
            guestEmail: null,
            shippingName: $payload['shipping_name'],
            shippingPhone: $payload['shipping_phone'],
            shippingAddress: $payload['shipping_address'],
            voucherCode: $payload['voucher_code'] ?? null,
            note: $payload['note'] ?? null,
        );
    }

    private function checkout(
        Request $request,
        ?User $user,
        ?string $guestName,
        ?string $guestEmail,
        string $shippingName,
        string $shippingPhone,
        string $shippingAddress,
        ?string $voucherCode,
        ?string $note
    ): Order {
        return DB::transaction(function () use (
            $request,
            $user,
            $guestName,
            $guestEmail,
            $shippingName,
            $shippingPhone,
            $shippingAddress,
            $voucherCode,
            $note
        ) {
            [$cart] = $this->cartService->getOrCreateCartFromRequest($request);

            $cart = Cart::query()->whereKey($cart->id)->lockForUpdate()->first();
            if (!$cart) {
                throw ValidationException::withMessages(['cart' => 'Không tìm thấy giỏ hàng.']);
            }

            $cartItems = CartItem::query()
                ->where('cart_id', $cart->id)
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Giỏ hàng đang trống.']);
            }

            $variantIds = $cartItems->pluck('product_variant_id')->unique()->values()->all();

            $variants = ProductVariant::query()
                ->with(['product.images'])
                ->whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;
            $snapshotItems = [];

            foreach ($cartItems as $cartItem) {
                $variant = $variants->get($cartItem->product_variant_id);
                $product = $variant?->product;

                if (!$variant || !$product || !$product->is_active) {
                    throw ValidationException::withMessages([
                        'cart_items' => "Biến thể {$cartItem->product_variant_id} không còn khả dụng.",
                    ]);
                }

                if ($variant->stock < $cartItem->quantity) {
                    throw ValidationException::withMessages([
                        'cart_items' => "Biến thể {$variant->id} không đủ tồn kho.",
                    ]);
                }

                $unitPrice = $variant->finalPrice($product);
                $lineTotal = round($unitPrice * $cartItem->quantity, 2);

                $subtotal += $lineTotal;

                $variantName = $this->buildVariantName($variant->size, $variant->color);
                $imageUrl = $product->images->firstWhere('is_primary', true)?->url
                    ?? $product->images->sortBy('sort_order')->first()?->url;

                $snapshotItems[] = [
                    'variant' => $variant,
                    'quantity' => $cartItem->quantity,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'product_name' => $product->name,
                    'variant_name' => $variantName,
                    'sku' => $variant->sku,
                    'image_url' => $imageUrl,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'variant_info' => [
                        'size' => $variant->size,
                        'color' => $variant->color,
                        'color_hex' => $variant->color_hex,
                        'sku' => $variant->sku,
                        'price_adjustment' => (float) $variant->price_adjustment,
                    ],
                ];
            }

            $subtotal = round($subtotal, 2);

            [$voucher, $discountAmount] = $this->resolveVoucher(
                voucherCode: $voucherCode,
                subtotal: $subtotal,
                userId: $user?->id,
                guestToken: $cart->guest_token
            );

            $shippingFee = $this->calculateShippingFee($subtotal);
            $total = round($subtotal - $discountAmount + $shippingFee, 2);

            $order = Order::create([
                'user_id' => $user?->id,
                'guest_name' => $guestName,
                'guest_email' => $guestEmail,
                'customer_name' => $user ? $shippingName : ($guestName ?? $shippingName),
                'customer_email' => $user?->email ?? $guestEmail,
                'customer_phone' => $shippingPhone,
                'voucher_id' => $voucher?->id,
                'code' => $this->generateUniqueOrderCode(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'shipping_fee' => $shippingFee,
                'total' => $total,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'shipping_name' => $shippingName,
                'shipping_phone' => $shippingPhone,
                'shipping_address' => $shippingAddress,
                'note' => $note,
            ]);

            foreach ($snapshotItems as $snapshotItem) {
                $order->items()->create([
                    'product_id' => $snapshotItem['product_id'],
                    'product_variant_id' => $snapshotItem['product_variant_id'],
                    'product_name' => $snapshotItem['product_name'],
                    'variant_name' => $snapshotItem['variant_name'],
                    'sku' => $snapshotItem['sku'],
                    'image_url' => $snapshotItem['image_url'],
                    'unit_price' => $snapshotItem['unit_price'],
                    'quantity' => $snapshotItem['quantity'],
                    'line_total' => $snapshotItem['line_total'],
                    'variant_info' => $snapshotItem['variant_info'],
                ]);

                $variant = $snapshotItem['variant'];
                $variant->stock = $variant->stock - $snapshotItem['quantity'];
                $variant->save();
            }

            if ($voucher) {
                VoucherUsage::create([
                    'voucher_id' => $voucher->id,
                    'user_id' => $user?->id,
                    'guest_token' => $cart->guest_token,
                    'order_id' => $order->id,
                ]);

                $voucher->increment('used_count');
            }

            CartItem::query()->where('cart_id', $cart->id)->delete();

            return $order->load(['items', 'voucher']);
        });
    }

    private function resolveVoucher(
        ?string $voucherCode,
        float $subtotal,
        ?int $userId,
        ?string $guestToken
    ): array {
        if (!$voucherCode) {
            return [null, 0.0];
        }

        return $this->voucherCalculator->resolveByCode(
            code: $voucherCode,
            subtotal: $subtotal,
            userId: $userId,
            guestToken: $guestToken,
            errorField: 'voucher_code',
            lockForUpdate: true
        );
    }

    private function calculateShippingFee(float $subtotal): float
    {
        return $subtotal >= self::FREE_SHIPPING_THRESHOLD ? 0.0 : self::SHIPPING_FEE;
    }

    private function generateUniqueOrderCode(): string
    {
        do {
            $code = 'ANS-' . now()->format('dmY') . '-' . Str::upper(Str::random(6));
        } while (Order::query()->where('code', $code)->exists());

        return $code;
    }

    private function buildVariantName(?string $size, ?string $color): string
    {
        $parts = [];
        if ($size) {
            $parts[] = 'Kích thước ' . $size;
        }
        if ($color) {
            $parts[] = 'Màu ' . $color;
        }

        return $parts ? implode(' / ', $parts) : 'Mặc định';
    }

    private function assertCodOnly(?string $paymentMethod): void
    {
        if ($paymentMethod !== null && $paymentMethod !== 'cod') {
            throw ValidationException::withMessages([
                'payment_method' => 'Hiện chỉ hỗ trợ phương thức thanh toán COD.',
            ]);
        }
    }
}
