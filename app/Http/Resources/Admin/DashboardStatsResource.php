<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'total_users' => (int) data_get($this->resource, 'total_users', 0),
            'total_products' => (int) data_get($this->resource, 'total_products', 0),
            'total_orders' => (int) data_get($this->resource, 'total_orders', 0),
            'total_revenue' => (float) data_get($this->resource, 'total_revenue', 0),
            'pending_orders' => (int) data_get($this->resource, 'pending_orders', 0),
            'cancelled_orders' => (int) data_get($this->resource, 'cancelled_orders', 0),
            'delivered_orders' => (int) data_get($this->resource, 'delivered_orders', 0),
            'low_stock_variants' => (int) data_get($this->resource, 'low_stock_variants', 0),
            'out_of_stock_variants' => (int) data_get($this->resource, 'out_of_stock_variants', 0),
            'total_reviews' => (int) data_get($this->resource, 'total_reviews', 0),
            'average_rating' => (float) data_get($this->resource, 'average_rating', 0),
            'recent_orders' => data_get($this->resource, 'recent_orders', []),
            'top_selling_products' => data_get($this->resource, 'top_selling_products', []),
        ];
    }
}
