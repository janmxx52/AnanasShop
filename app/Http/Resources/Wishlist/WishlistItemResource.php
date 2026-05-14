<?php

namespace App\Http\Resources\Wishlist;

use Illuminate\Http\Resources\Json\JsonResource;

class WishlistItemResource extends JsonResource
{
    public function toArray($request): array
    {
        $product = $this->product;
        $primaryImage = $product?->images?->firstWhere('is_primary', true)?->url
            ?? $product?->images?->sortBy('sort_order')->first()?->url;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'base_price' => (float) $product->base_price,
                'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
                'is_active' => (bool) $product->is_active,
                'primary_image' => $primaryImage,
            ] : null,
        ];
    }
}

