<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    protected static array $sizes = ['XS','S','M','L','XL','XXL'];
    protected static array $colors = ['Black','White','Red','Blue','Green','Yellow','Gray','Purple','Pink'];

    public function definition()
    {
        $size = $this->faker->randomElement(self::$sizes);
        $color = $this->faker->randomElement(self::$colors);

        return [
            'product_id' => null,
            'size' => $size,
            'color' => $color,
            'color_hex' => $this->faker->hexColor(),
            'sku' => strtoupper('SKU-' . Str::random(8)),
            'stock' => $this->faker->numberBetween(0, 100),
            'price_adjustment' => $this->faker->randomFloat(2, -50000, 50000),
        ];
    }
}
