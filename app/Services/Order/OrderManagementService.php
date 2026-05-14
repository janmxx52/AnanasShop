<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Repositories\OrderRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderManagementService
{
    private const CUSTOMER_CANCELABLE_STATUSES = ['pending', 'confirmed'];

    private const ADMIN_STATUS_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['processing', 'cancelled'],
        'processing' => ['shipping', 'cancelled'],
        'shipping' => ['delivered', 'returned', 'cancelled'],
        'delivered' => [],
        'cancelled' => [],
        'returned' => [],
    ];

    public function __construct(private OrderRepository $orderRepository)
    {
    }

    public function listCustomerOrders(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->paginateForCustomer($user->id, $perPage);
    }

    public function showCustomerOrder(User $user, string $orderCode): Order
    {
        return $this->orderRepository->findCustomerByCode($user->id, $orderCode);
    }

    public function cancelCustomerOrder(User $user, string $orderCode): Order
    {
        return DB::transaction(function () use ($user, $orderCode) {
            $order = $this->orderRepository->lockCustomerByCode($user->id, $orderCode);

            if (!in_array($order->status, self::CUSTOMER_CANCELABLE_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'status' => 'Order cannot be cancelled in current status',
                ]);
            }

            $this->cancelOrder($order);

            return $this->orderRepository->findCustomerByCode($user->id, $orderCode);
        });
    }

    public function listAdminOrders(int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->paginateForAdmin($perPage);
    }

    public function showAdminOrder(string $orderCode): Order
    {
        return $this->orderRepository->findByCode($orderCode);
    }

    public function updateOrderStatusByAdmin(string $orderCode, string $newStatus): Order
    {
        return DB::transaction(function () use ($orderCode, $newStatus) {
            $order = $this->orderRepository->lockByCode($orderCode);

            $currentStatus = $order->status;
            $allowedTransitions = self::ADMIN_STATUS_TRANSITIONS[$currentStatus] ?? [];
            if (!in_array($newStatus, $allowedTransitions, true)) {
                throw ValidationException::withMessages([
                    'status' => "Invalid status transition from {$currentStatus} to {$newStatus}",
                ]);
            }

            if ($newStatus === 'cancelled') {
                $this->cancelOrder($order);
            } else {
                $order->status = $newStatus;
                if ($newStatus === 'delivered' && $order->payment_method === 'cod') {
                    $order->payment_status = 'paid';
                }
                $order->save();
            }

            return $this->orderRepository->findByCode($orderCode);
        });
    }

    private function cancelOrder(Order $order): void
    {
        if ($order->status === 'cancelled') {
            throw ValidationException::withMessages([
                'status' => 'Order is already cancelled',
            ]);
        }

        $orderItems = OrderItem::query()
            ->where('order_id', $order->id)
            ->whereNotNull('product_variant_id')
            ->get();

        $restoreByVariant = $orderItems
            ->groupBy('product_variant_id')
            ->map(static fn ($items) => (int) $items->sum('quantity'));

        if ($restoreByVariant->isNotEmpty()) {
            $variantIds = $restoreByVariant->keys()->map(static fn ($id) => (int) $id)->all();

            $variants = ProductVariant::query()
                ->whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($restoreByVariant as $variantId => $quantityToRestore) {
                $variant = $variants->get((int) $variantId);
                if (!$variant) {
                    continue;
                }

                $variant->stock = $variant->stock + $quantityToRestore;
                $variant->save();
            }
        }

        if ($order->voucher_id) {
            $voucher = Voucher::query()->whereKey($order->voucher_id)->lockForUpdate()->first();

            if ($voucher) {
                $usages = VoucherUsage::query()
                    ->where('voucher_id', $order->voucher_id)
                    ->where('order_id', $order->id)
                    ->whereNull('revoked_at')
                    ->lockForUpdate()
                    ->get();

                if ($usages->isNotEmpty()) {
                    $now = now();
                    VoucherUsage::query()
                        ->whereIn('id', $usages->pluck('id')->all())
                        ->update(['revoked_at' => $now]);

                    $voucher->used_count = max(0, $voucher->used_count - $usages->count());
                    $voucher->save();
                }
            }
        }

        $order->status = 'cancelled';
        $order->payment_status = 'cancelled';
        $order->save();
    }
}
