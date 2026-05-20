<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardAnalyticsResource extends JsonResource
{
    public function toArray($request): array
    {
        $metrics = data_get($this->resource, 'metrics', []);
        $revenueChart = data_get($this->resource, 'revenue_chart', []);
        $orderChart = data_get($this->resource, 'order_chart', []);
        $statusSource = data_get($this->resource, 'order_status', []);
        $inventorySource = data_get($this->resource, 'inventory', []);
        $recentOrders = data_get($this->resource, 'recent_orders', []);
        $topSellingProducts = data_get($this->resource, 'top_selling_products', []);

        $orderStatus = [
            'pending' => (int) data_get($statusSource, 'pending', 0),
            'confirmed' => (int) data_get($statusSource, 'confirmed', 0),
            'processing' => (int) data_get($statusSource, 'processing', 0),
            'shipping' => (int) data_get($statusSource, 'shipping', 0),
            'delivered' => (int) data_get($statusSource, 'delivered', 0),
            'cancelled' => (int) data_get($statusSource, 'cancelled', 0),
            'returned' => (int) data_get($statusSource, 'returned', 0),
        ];

        $inventory = [
            'in_stock' => (int) data_get($inventorySource, 'in_stock', 0),
            'low_stock' => (int) data_get($inventorySource, 'low_stock', 0),
            'out_of_stock' => (int) data_get($inventorySource, 'out_of_stock', 0),
        ];

        return [
            'metrics' => [
                'today_revenue' => (float) data_get($metrics, 'today_revenue', 0),
                'this_month_revenue' => (float) data_get($metrics, 'this_month_revenue', 0),
                'last_month_revenue' => (float) data_get($metrics, 'last_month_revenue', 0),
                'revenue_growth_percent' => (float) data_get($metrics, 'revenue_growth_percent', 0),
                'order_growth_percent' => (float) data_get($metrics, 'order_growth_percent', 0),
                'customer_growth_percent' => (float) data_get($metrics, 'customer_growth_percent', 0),
            ],
            'revenue_chart' => [
                'range' => (string) data_get($revenueChart, 'range', '12m'),
                'labels' => collect(data_get($revenueChart, 'labels', []))
                    ->map(static fn ($label): string => (string) $label)
                    ->values()
                    ->all(),
                'series' => collect(data_get($revenueChart, 'series', []))
                    ->map(static fn ($point): float => (float) $point)
                    ->values()
                    ->all(),
            ],
            'order_chart' => [
                'range' => (string) data_get($orderChart, 'range', '12m'),
                'labels' => collect(data_get($orderChart, 'labels', []))
                    ->map(static fn ($label): string => (string) $label)
                    ->values()
                    ->all(),
                'series' => collect(data_get($orderChart, 'series', []))
                    ->map(static fn ($point): int => (int) $point)
                    ->values()
                    ->all(),
            ],
            'order_status' => $orderStatus,
            'inventory' => $inventory,
            'recent_orders' => collect($recentOrders)
                ->map(static function ($order): array {
                    return [
                        'order_code' => (string) data_get($order, 'order_code'),
                        'status' => (string) data_get($order, 'status'),
                        'payment_status' => (string) data_get($order, 'payment_status'),
                        'total' => (float) data_get($order, 'total', 0),
                        'created_at' => data_get($order, 'created_at'),
                        'customer_name' => data_get($order, 'customer_name'),
                    ];
                })
                ->values()
                ->all(),
            'top_selling_products' => collect($topSellingProducts)
                ->map(static function ($product): array {
                    return [
                        'product_id' => (int) data_get($product, 'product_id', 0),
                        'product_name' => (string) data_get($product, 'product_name', ''),
                        'total_sold' => (int) data_get($product, 'total_sold', 0),
                        'revenue' => (float) data_get($product, 'revenue', 0),
                        'image_url' => data_get($product, 'image_url'),
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}
