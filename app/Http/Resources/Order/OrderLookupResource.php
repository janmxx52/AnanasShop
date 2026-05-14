<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderLookupResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'order_code' => $this->code,
            'order_status' => $this->status,
            'order_date' => $this->created_at,
            'order_items' => OrderItemResource::collection($this->whenLoaded('items')),
            'quantity' => (int) $this->items->sum('quantity'),
            'total' => (float) $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'shipping_address' => $this->lookup_masked_shipping_address,
            'status_timeline' => $this->lookup_status_timeline ?? [],
        ];
    }
}

