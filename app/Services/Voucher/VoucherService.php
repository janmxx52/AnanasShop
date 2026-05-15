<?php

namespace App\Services\Voucher;

use Illuminate\Http\Request;

class VoucherService
{
    public function __construct(private VoucherCalculator $voucherCalculator)
    {
    }

    public function checkVoucherByCode(Request $request, string $code): array
    {
        [$cart] = $this->resolveCartFromRequest($request);
        $user = $request->user('sanctum') ?? $request->user();

        $items = $cart ? $cart->items()->with(['variant.product'])->get() : collect([]);
        $subtotal = $items->reduce(function ($carry, $item) {
            $variant = $item->variant;
            $product = $variant?->product;
            $unit = $variant && $product ? $variant->finalPrice($product) : 0;
            return $carry + ($unit * $item->quantity);
        }, 0.0);

        [$voucher, $discount] = $this->voucherCalculator->resolveByCode(
            code: $code,
            subtotal: round($subtotal, 2),
            userId: $user?->id,
            guestToken: $request->header('X-Guest-Token'),
            errorField: 'code',
            lockForUpdate: false
        );

        return [
            'voucher' => $voucher,
            'subtotal' => round($subtotal, 2),
            'discount' => $discount,
            'total_after' => round($subtotal - $discount, 2),
        ];
    }

    protected function resolveCartFromRequest(Request $request)
    {
        // lazy-resolve cart using CartService if exists
        if (class_exists('\App\Services\Cart\CartService')) {
            $cartService = app('\App\Services\Cart\CartService');
            return $cartService->getOrCreateCartFromRequest($request);
        }

        return [null, null];
    }
}
