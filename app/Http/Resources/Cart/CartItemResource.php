<?php

namespace App\Http\Resources\Cart;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;

class CartItemResource extends JsonResource
{
    public function toArray($request): array
    {
        $variant = $this->whenLoaded('variant');
        if ($variant instanceof MissingValue) {
            $variant = $this->resource->variant ?? null;
        }

        $product = $variant?->product;

        $base = $product?->sale_price ?? $product?->base_price;
        $priceAdjustment = $variant?->price_adjustment ?? 0;
        $unitPrice = isset($base) ? round($base + $priceAdjustment, 2) : null;

        return [
            'id' => $this->id,
            'product_id' => $product?->id,
            'variant_id' => $variant?->id,
            'quantity' => $this->quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice !== null ? round($unitPrice * $this->quantity, 2) : null,
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
            ] : null,
            'variant' => $variant ? [
                'id' => $variant->id,
                'size' => $variant->size,
                'color' => $variant->color,
                'sku' => $variant->sku,
            ] : null,
        ];
    }
}
