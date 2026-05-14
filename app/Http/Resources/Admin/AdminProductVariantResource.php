<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductVariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'size' => $this->size,
            'color' => $this->color,
            'color_hex' => $this->color_hex,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'price_adjustment' => $this->price_adjustment,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
