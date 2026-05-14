<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'value' => $this->value,
            'min_order_amount' => $this->min_order_amount,
            'max_discount' => $this->max_discount,
            'usage_limit' => $this->usage_limit,
            'usage_per_user' => $this->usage_per_user,
            'used_count' => $this->used_count,
            'starts_at' => $this->starts_at?->toDateTimeString(),
            'expires_at' => $this->expires_at?->toDateTimeString(),
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
