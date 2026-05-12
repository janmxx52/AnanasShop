<?php

namespace Database\Factories;

use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    public function definition()
    {
        $seed = Str::random(8);
        return [
            'product_id' => null,
            'url' => 'https://picsum.photos/seed/' . $seed . '/800/800',
            'public_id' => 'seed-' . $seed,
            'sort_order' => 0,
            'is_primary' => false,
        ];
    }
}
