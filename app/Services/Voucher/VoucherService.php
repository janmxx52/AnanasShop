<?php

namespace App\Services\Voucher;

use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VoucherService
{
    public function checkVoucherByCode(Request $request, string $code): array
    {
        $voucher = Voucher::where('code', $code)->first();
        if (!$voucher) {
            throw ValidationException::withMessages(['code' => 'Voucher not found']);
        }

        if (!$voucher->is_active) {
            throw ValidationException::withMessages(['code' => 'Voucher is inactive']);
        }

        $now = now();
        if ($voucher->starts_at && $now->lt($voucher->starts_at)) {
            throw ValidationException::withMessages(['code' => 'Voucher not started']);
        }
        if ($voucher->expires_at && $now->gt($voucher->expires_at)) {
            throw ValidationException::withMessages(['code' => 'Voucher expired']);
        }

        // determine cart subtotal
        [$cart] = $this->resolveCartFromRequest($request);

        $items = $cart ? $cart->items()->with(['variant.product'])->get() : collect([]);
        $subtotal = $items->reduce(function ($carry, $item) {
            $variant = $item->variant;
            $product = $variant?->product;
            $base = $product?->sale_price ?? $product?->base_price;
            $priceAdjustment = $variant?->price_adjustment ?? 0;
            $unit = isset($base) ? round($base + $priceAdjustment, 2) : 0;
            return $carry + ($unit * $item->quantity);
        }, 0.0);

        if ($subtotal < $voucher->min_order_amount) {
            throw ValidationException::withMessages(['code' => 'Minimum order amount not met']);
        }

        // usage limit
        $totalUsed = VoucherUsage::where('voucher_id', $voucher->id)->count();
        if ($voucher->usage_limit && $totalUsed >= $voucher->usage_limit) {
            throw ValidationException::withMessages(['code' => 'Voucher usage limit reached']);
        }

        // usage per user
        $user = $request->user();
        $guestToken = $request->header('X-Guest-Token');
        $usedByCurrent = 0;
        if ($user) {
            $usedByCurrent = VoucherUsage::where('voucher_id', $voucher->id)->where('user_id', $user->id)->count();
        } elseif ($guestToken) {
            $usedByCurrent = VoucherUsage::where('voucher_id', $voucher->id)->where('guest_token', $guestToken)->count();
        }

        if ($voucher->usage_per_user && $usedByCurrent >= $voucher->usage_per_user) {
            throw ValidationException::withMessages(['code' => 'Voucher usage per user exceeded']);
        }

        // compute discount
        $discount = 0.0;
        if ($voucher->type === 'percent') {
            $discount = round($subtotal * ((float) $voucher->value / 100.0), 2);
            if ($voucher->max_discount !== null) {
                $discount = min($discount, (float) $voucher->max_discount);
            }
        } else {
            $discount = min((float) $voucher->value, $subtotal);
        }

        $discount = round($discount, 2);

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
