<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'size', 'color', 'color_hex', 'sku', 'stock', 'price_adjustment',
    ];

    protected $casts = [
        'stock' => 'integer',
        'price_adjustment' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'product_variant_id');
    }

    public function finalPrice(?Product $product = null): float
    {
        $resolvedProduct = $product ?? $this->product;
        $displayPrice = $resolvedProduct ? $resolvedProduct->displayPrice() : 0.0;

        return round($displayPrice + (float) $this->price_adjustment, 2);
    }
}
