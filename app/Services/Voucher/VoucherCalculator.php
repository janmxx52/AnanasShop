<?php

namespace App\Services\Voucher;

use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Validation\ValidationException;

class VoucherCalculator
{
    public function resolveByCode(
        string $code,
        float $subtotal,
        ?int $userId = null,
        ?string $guestToken = null,
        string $errorField = 'code',
        bool $lockForUpdate = false
    ): array {
        $query = Voucher::query()->where('code', $code);
        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $voucher = $query->first();
        if (!$voucher) {
            throw ValidationException::withMessages([$errorField => 'Voucher not found']);
        }

        $discount = $this->calculateDiscount(
            voucher: $voucher,
            subtotal: $subtotal,
            userId: $userId,
            guestToken: $guestToken,
            errorField: $errorField,
        );

        return [$voucher, $discount];
    }

    public function calculateDiscount(
        Voucher $voucher,
        float $subtotal,
        ?int $userId = null,
        ?string $guestToken = null,
        string $errorField = 'code'
    ): float {
        $this->assertVoucherIsApplicable(
            voucher: $voucher,
            subtotal: $subtotal,
            userId: $userId,
            guestToken: $guestToken,
            errorField: $errorField,
        );

        $discount = 0.0;
        if ($voucher->type === 'percent') {
            $discount = round($subtotal * ((float) $voucher->value / 100), 2);
            if ($voucher->max_discount !== null) {
                $discount = min($discount, (float) $voucher->max_discount);
            }
        } else {
            $discount = min((float) $voucher->value, $subtotal);
        }

        return round($discount, 2);
    }

    private function assertVoucherIsApplicable(
        Voucher $voucher,
        float $subtotal,
        ?int $userId,
        ?string $guestToken,
        string $errorField
    ): void {
        if (!$voucher->is_active) {
            throw ValidationException::withMessages([$errorField => 'Voucher is inactive']);
        }

        $now = now();
        if ($voucher->starts_at && $now->lt($voucher->starts_at)) {
            throw ValidationException::withMessages([$errorField => 'Voucher not started']);
        }
        if ($voucher->expires_at && $now->gt($voucher->expires_at)) {
            throw ValidationException::withMessages([$errorField => 'Voucher expired']);
        }

        if ($subtotal < (float) $voucher->min_order_amount) {
            throw ValidationException::withMessages([$errorField => 'Minimum order amount not met']);
        }

        $this->assertUsageLimit($voucher, $errorField);
        $this->assertUsagePerUser($voucher, $userId, $guestToken, $errorField);
    }

    private function assertUsageLimit(Voucher $voucher, string $errorField): void
    {
        $totalUsed = VoucherUsage::query()
            ->where('voucher_id', $voucher->id)
            ->whereNull('revoked_at')
            ->count();

        if ($voucher->usage_limit !== null && $totalUsed >= $voucher->usage_limit) {
            throw ValidationException::withMessages([$errorField => 'Voucher usage limit reached']);
        }
    }

    private function assertUsagePerUser(
        Voucher $voucher,
        ?int $userId,
        ?string $guestToken,
        string $errorField
    ): void {
        if (!$voucher->usage_per_user) {
            return;
        }

        $usedByCurrent = 0;
        if ($userId) {
            $usedByCurrent = VoucherUsage::query()
                ->where('voucher_id', $voucher->id)
                ->where('user_id', $userId)
                ->whereNull('revoked_at')
                ->count();
        } elseif ($guestToken) {
            $usedByCurrent = VoucherUsage::query()
                ->where('voucher_id', $voucher->id)
                ->where('guest_token', $guestToken)
                ->whereNull('revoked_at')
                ->count();
        }

        if ($usedByCurrent >= $voucher->usage_per_user) {
            throw ValidationException::withMessages([$errorField => 'Voucher usage per user exceeded']);
        }
    }
}
