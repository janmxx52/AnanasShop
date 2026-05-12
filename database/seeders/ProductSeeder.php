<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('ProductSeeder should not run in production.');
            return;
        }

        // ensure parents exist
        $categories = Category::all();
        if ($categories->isEmpty()) {
            $categories = Category::factory()->count(8)->create();
        }

        $brands = Brand::all();
        if ($brands->isEmpty()) {
            $brands = Brand::factory()->count(12)->create();
        }

        $productCount = 200;

        DB::transaction(function () use ($categories, $brands, $productCount) {
            for ($i = 0; $i < $productCount; $i++) {
                $category = $categories->random();
                $brand = $brands->random();

                $product = Product::factory()->for($category)->for($brand)->create();

                // create variants (ensure unique size+color per product)
                $sizes = ['XS','S','M','L','XL','XXL'];
                $colors = ['Black','White','Red','Blue','Green','Yellow','Gray','Purple','Pink'];

                $variantsToCreate = rand(1, 6);
                $used = [];

                for ($v = 0; $v < $variantsToCreate; $v++) {
                    $attempts = 0;
                    do {
                        $size = $sizes[array_rand($sizes)];
                        $color = $colors[array_rand($colors)];
                        $key = $size . '|' . $color;
                        $attempts++;
                    } while (isset($used[$key]) && $attempts < 10);

                    if (isset($used[$key])) {
                        // fallback: pick combination by index
                        $size = $sizes[$v % count($sizes)];
                        $color = $colors[$v % count($colors)];
                        $key = $size . '|' . $color;
                    }

                    $used[$key] = true;

                    ProductVariant::factory()->for($product)->create([
                        'size' => $size,
                        'color' => $color,
                        'sku' => strtoupper('SKU-' . Str::random(8)),
                        'stock' => rand(0, 120),
                    ]);
                }

                // create images (1..6), mark one primary
                $imagesCount = rand(1, 6);
                $primary = rand(0, $imagesCount - 1);

                for ($img = 0; $img < $imagesCount; $img++) {
                    ProductImage::factory()->for($product)->create([
                        'url' => 'https://picsum.photos/seed/' . $product->id . '-' . $img . '/800/800',
                        'public_id' => 'seed-' . $product->id . '-' . $img,
                        'sort_order' => $img,
                        'is_primary' => $img === $primary,
                    ]);
                }
            }
        });
    }
}
