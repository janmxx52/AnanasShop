<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        $name = $this->faker->unique()->words(3, true);
        $base = $this->faker->randomFloat(2, 10000, 2000000);
        $hasSale = $this->faker->boolean(30);

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->lexify('????'),
            'description' => $this->faker->paragraph(),
            'base_price' => $base,
            'sale_price' => $hasSale ? round($base - $this->faker->randomFloat(2, 1000, $base * 0.3), 2) : null,
            'is_featured' => $this->faker->boolean(10),
            'is_active' => $this->faker->boolean(95),
        ];
    }
}
