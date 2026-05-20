<?php

namespace App\Services\Dashboard;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\Carbon;

class DashboardAnalyticsService
{
    public function getAnalytics(): array
    {
        $now = now();
        $todayStart = $now->copy()->startOfDay();
        $todayEnd = $now->copy()->endOfDay();
        $thisMonthStart = $now->copy()->startOfMonth();
        $thisMonthEnd = $now->copy()->endOfMonth();
        $lastMonthStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonthNoOverflow()->endOfMonth();

        $todayRevenue = $this->sumRevenueBetween($todayStart, $todayEnd);
        $thisMonthRevenue = $this->sumRevenueBetween($thisMonthStart, $thisMonthEnd);
        $lastMonthRevenue = $this->sumRevenueBetween($lastMonthStart, $lastMonthEnd);

        $thisMonthOrders = $this->countOrdersBetween($thisMonthStart, $thisMonthEnd);
        $lastMonthOrders = $this->countOrdersBetween($lastMonthStart, $lastMonthEnd);

        $thisMonthNewCustomers = $this->countUsersBetween($thisMonthStart, $thisMonthEnd);
        $lastMonthNewCustomers = $this->countUsersBetween($lastMonthStart, $lastMonthEnd);

        [$labels, $revenueSeries, $orderSeries] = $this->buildMonthlySeries($now);

        return [
            'metrics' => [
                'today_revenue' => $todayRevenue,
                'this_month_revenue' => $thisMonthRevenue,
                'last_month_revenue' => $lastMonthRevenue,
                'revenue_growth_percent' => $this->calculateGrowthPercent($thisMonthRevenue, $lastMonthRevenue),
                'order_growth_percent' => $this->calculateGrowthPercent($thisMonthOrders, $lastMonthOrders),
                'customer_growth_percent' => $this->calculateGrowthPercent($thisMonthNewCustomers, $lastMonthNewCustomers),
            ],
            'revenue_chart' => [
                'range' => '12m',
                'labels' => $labels,
                'series' => $revenueSeries,
            ],
            'order_chart' => [
                'range' => '12m',
                'labels' => $labels,
                'series' => $orderSeries,
            ],
            'order_status' => $this->buildOrderStatusBreakdown(),
            'inventory' => $this->buildInventoryBreakdown(),
            'recent_orders' => $this->buildRecentOrders(),
            'top_selling_products' => $this->buildTopSellingProducts(),
        ];
    }

    private function sumRevenueBetween(Carbon $start, Carbon $end): float
    {
        return (float) Order::query()
            ->where('status', 'delivered')
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total');
    }

    private function countOrdersBetween(Carbon $start, Carbon $end): int
    {
        return (int) Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    private function countUsersBetween(Carbon $start, Carbon $end): int
    {
        return (int) User::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    private function calculateGrowthPercent(float|int $current, float|int $previous): float
    {
        $currentValue = (float) $current;
        $previousValue = (float) $previous;

        if ($previousValue == 0.0) {
            if ($currentValue > 0.0) {
                return 100.0;
            }

            return 0.0;
        }

        return round((($currentValue - $previousValue) / $previousValue) * 100, 2);
    }

    /**
     * @return array{0: array<int, string>, 1: array<int, float>, 2: array<int, int>}
     */
    private function buildMonthlySeries(Carbon $now): array
    {
        $labels = [];
        $revenueSeries = [];
        $orderSeries = [];

        for ($index = 11; $index >= 0; $index--) {
            $month = $now->copy()->subMonthsNoOverflow($index);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $labels[] = $month->format('Y-m');
            $revenueSeries[] = $this->sumRevenueBetween($monthStart, $monthEnd);
            $orderSeries[] = $this->countOrdersBetween($monthStart, $monthEnd);
        }

        return [$labels, $revenueSeries, $orderSeries];
    }

    /**
     * @return array<string, int>
     */
    private function buildOrderStatusBreakdown(): array
    {
        $base = [
            'pending' => 0,
            'confirmed' => 0,
            'processing' => 0,
            'shipping' => 0,
            'delivered' => 0,
            'cancelled' => 0,
            'returned' => 0,
        ];

        $counts = Order::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        foreach ($base as $status => $value) {
            $base[$status] = (int) ($counts[$status] ?? 0);
        }

        return $base;
    }

    /**
     * @return array<string, int>
     */
    private function buildInventoryBreakdown(): array
    {
        return [
            'in_stock' => ProductVariant::query()->where('stock', '>', 5)->count(),
            'low_stock' => ProductVariant::query()
                ->where('stock', '>', 0)
                ->where('stock', '<=', 5)
                ->count(),
            'out_of_stock' => ProductVariant::query()->where('stock', '<=', 0)->count(),
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
            ->selectRaw('order_items.product_id as product_id, MIN(order_items.product_name) as product_name, SUM(order_items.quantity) as total_sold, SUM(order_items.line_total) as revenue, MIN(order_items.image_url) as image_url')
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
                    'image_url' => $row->image_url ? (string) $row->image_url : null,
                ];
            })
            ->all();
    }
}

