<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BrandFactory extends Factory
{
    protected $model = Brand::class;

    public function definition()
    {
        $name = $this->faker->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->lexify('????'),
            'logo' => $this->faker->imageUrl(400, 200),
            'description' => $this->faker->sentence(),
            'is_active' => $this->faker->boolean(95),
        ];
    }
}
