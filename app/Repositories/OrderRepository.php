<?php

namespace App\Repositories;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository
{
    public function paginateForCustomer(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->where('user_id', $userId)
            ->with(['voucher'])
            ->latest('id')
            ->paginate($perPage);
    }

    public function paginateForAdmin(int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with(['voucher', 'user'])
            ->latest('id')
            ->paginate($perPage);
    }

    public function findCustomerByCode(int $userId, string $orderCode): Order
    {
        return Order::query()
            ->where('user_id', $userId)
            ->where('code', $orderCode)
            ->with(['items', 'voucher'])
            ->firstOrFail();
    }

    public function findByCode(string $orderCode): Order
    {
        return Order::query()
            ->where('code', $orderCode)
            ->with(['items', 'voucher', 'user'])
            ->firstOrFail();
    }

    public function lockCustomerByCode(int $userId, string $orderCode): Order
    {
        return Order::query()
            ->where('user_id', $userId)
            ->where('code', $orderCode)
            ->lockForUpdate()
            ->firstOrFail();
    }

    public function lockByCode(string $orderCode): Order
    {
        return Order::query()
            ->where('code', $orderCode)
            ->lockForUpdate()
            ->firstOrFail();
    }
}
