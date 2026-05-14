<?php

namespace App\Services\Dashboard;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;

class DashboardStatsService
{
    public function getStats(): array
    {
        $reviewAggregate = Review::query()
            ->where('is_approved', true)
            ->selectRaw('COUNT(*) as total_reviews, AVG(rating) as average_rating')
            ->first();

        return [
            'total_users' => User::query()->count(),
            'total_products' => Product::query()->count(),
            'total_orders' => Order::query()->count(),
            'total_revenue' => (float) Order::query()
                ->where('status', 'delivered')
                ->where('payment_status', 'paid')
                ->sum('total'),
            'pending_orders' => Order::query()->where('status', 'pending')->count(),
            'cancelled_orders' => Order::query()->where('status', 'cancelled')->count(),
            'delivered_orders' => Order::query()->where('status', 'delivered')->count(),
            'low_stock_variants' => ProductVariant::query()
                ->where('stock', '>', 0)
                ->where('stock', '<=', 5)
                ->count(),
            'out_of_stock_variants' => ProductVariant::query()
                ->where('stock', 0)
                ->count(),
            'total_reviews' => (int) ($reviewAggregate?->total_reviews ?? 0),
            'average_rating' => round((float) ($reviewAggregate?->average_rating ?? 0), 2),
            'recent_orders' => $this->buildRecentOrders(),
            'top_selling_products' => $this->buildTopSellingProducts(),
        ];
    }

    private function buildRecentOrders(): array
    {
        return Order::query()
            ->select(['code', 'status', 'payment_status', 'total', 'created_at', 'customer_name', 'guest_name'])
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(static function (Order $order): array {
                return [
                    'order_code' => $order->code,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'created_at' => $order->created_at?->toIso8601String(),
                    'customer_name' => $order->customer_name ?? $order->guest_name,
                ];
            })
            ->all();
    }

    private function buildTopSellingProducts(): array
    {
        return OrderItem::query()
            ->selectRaw('order_items.product_id as product_id, MIN(order_items.product_name) as product_name, SUM(order_items.quantity) as total_sold, SUM(order_items.line_total) as revenue')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNotNull('order_items.product_id')
            ->where('orders.status', 'delivered')
            ->where('orders.payment_status', 'paid')
            ->groupBy('order_items.product_id')
            ->orderByRaw('SUM(order_items.quantity) DESC')
            ->orderBy('order_items.product_id')
            ->limit(5)
            ->get()
            ->map(static function ($row): array {
                return [
                    'product_id' => (int) $row->product_id,
                    'product_name' => (string) $row->product_name,
                    'total_sold' => (int) $row->total_sold,
                    'revenue' => (float) $row->revenue,
                ];
            })
            ->all();
    }
}
