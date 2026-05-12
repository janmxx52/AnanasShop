<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        $product = $this->resource;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'base_price' => (float) $product->base_price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'is_featured' => (bool) $product->is_featured,
            'is_active' => (bool) $product->is_active,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
            ] : null,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'variants' => $this->whenLoaded('variants', function () {
                $product = $this->resource;
                return $product->variants->map(function ($v) use ($product) {
                    return [
                        'id' => $v->id,
                        'size' => $v->size,
                        'color' => $v->color,
                        'color_hex' => $v->color_hex,
                        'sku' => $v->sku,
                        'stock' => (int) $v->stock,
                        'price' => (float) round($product->base_price + $v->price_adjustment, 2),
                    ];
                });
            }),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(function ($img) {
                    return [
                        'id' => $img->id,
                        'url' => $img->url,
                        'is_primary' => (bool) $img->is_primary,
                        'sort_order' => (int) $img->sort_order,
                    ];
                });
            }),
            'created_at' => $product->created_at?->toIso8601String(),
            'updated_at' => $product->updated_at?->toIso8601String(),
            'links' => [
                'self' => url('/api/products/' . $product->slug),
            ],
        ];
    }
}
