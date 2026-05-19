<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AnanasCatalogSeeder extends Seeder
{
    private const CATEGORY_CONFIG = [
        'giay' => [
            'name' => 'Giày',
            'description' => 'Giày Ananas cho phong cách hằng ngày và streetwear.',
            'base_price_min' => 950000,
            'base_price_step' => 70000,
            'base_price_step_count' => 13,
            'sizes' => ['39', '40', '41', '42', '43'],
            'price_adjustments' => [
                '39' => -20000,
                '40' => 0,
                '41' => 0,
                '42' => 20000,
                '43' => 30000,
            ],
        ],
        'ao' => [
            'name' => 'Áo',
            'description' => 'Áo Ananas với phom dáng cơ bản, dễ phối đồ.',
            'base_price_min' => 290000,
            'base_price_step' => 60000,
            'base_price_step_count' => 9,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'price_adjustments' => [
                'S' => -10000,
                'M' => 0,
                'L' => 10000,
                'XL' => 20000,
            ],
        ],
        'phu-kien' => [
            'name' => 'Phụ kiện',
            'description' => 'Phụ kiện Ananas hoàn thiện outfit hằng ngày.',
            'base_price_min' => 120000,
            'base_price_step' => 35000,
            'base_price_step_count' => 8,
            'sizes' => ['ONE'],
            'price_adjustments' => [],
        ],
        'vo' => [
            'name' => 'Vớ',
            'description' => 'Vớ Ananas chất liệu êm, thoáng, phù hợp đi hằng ngày.',
            'base_price_min' => 80000,
            'base_price_step' => 15000,
            'base_price_step_count' => 5,
            'sizes' => ['ONE'],
            'price_adjustments' => [],
        ],
        'van-truot' => [
            'name' => 'Ván trượt',
            'description' => 'Ván trượt Ananas cho nhu cầu luyện tập và biểu diễn.',
            'base_price_min' => 490000,
            'base_price_step' => 120000,
            'base_price_step_count' => 6,
            'sizes' => ['ONE'],
            'price_adjustments' => [],
        ],
    ];

    private const COLOR_PALETTE = [
        ['name' => 'Black', 'hex' => '#111111', 'sku' => 'BLACK'],
        ['name' => 'White', 'hex' => '#F5F5F5', 'sku' => 'WHITE'],
        ['name' => 'Gray', 'hex' => '#8A8A8A', 'sku' => 'GRAY'],
        ['name' => 'Beige', 'hex' => '#D9C7A5', 'sku' => 'BEIGE'],
        ['name' => 'Navy', 'hex' => '#1F3159', 'sku' => 'NAVY'],
        ['name' => 'Olive', 'hex' => '#596A39', 'sku' => 'OLIVE'],
        ['name' => 'Brown', 'hex' => '#7B4A2E', 'sku' => 'BROWN'],
        ['name' => 'Red', 'hex' => '#BB2F2A', 'sku' => 'RED'],
    ];

    private const COLOR_KEYWORD_MAP = [
        'black' => ['name' => 'Black', 'hex' => '#111111', 'sku' => 'BLACK'],
        'white' => ['name' => 'White', 'hex' => '#F5F5F5', 'sku' => 'WHITE'],
        'gray' => ['name' => 'Gray', 'hex' => '#8A8A8A', 'sku' => 'GRAY'],
        'grey' => ['name' => 'Gray', 'hex' => '#8A8A8A', 'sku' => 'GRAY'],
        'beige' => ['name' => 'Beige', 'hex' => '#D9C7A5', 'sku' => 'BEIGE'],
        'navy' => ['name' => 'Navy', 'hex' => '#1F3159', 'sku' => 'NAVY'],
        'olive' => ['name' => 'Olive', 'hex' => '#596A39', 'sku' => 'OLIVE'],
        'brown' => ['name' => 'Brown', 'hex' => '#7B4A2E', 'sku' => 'BROWN'],
        'red' => ['name' => 'Red', 'hex' => '#BB2F2A', 'sku' => 'RED'],
    ];

    private bool $hasProductCodeColumn = false;
    private int $categoryCount = 0;
    private int $brandCount = 0;
    private int $productCount = 0;
    private int $variantCount = 0;
    private int $imageCount = 0;

    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->error('AnanasCatalogSeeder should not run in production.');

            return;
        }

        $productsRoot = base_path('ananas-fashion-frontend/public/ananas-assets/products');
        if (! File::isDirectory($productsRoot)) {
            $this->command?->error("Ananas assets folder not found: {$productsRoot}");

            return;
        }

        $this->hasProductCodeColumn = Schema::hasColumn('products', 'product_code');

        DB::transaction(function () use ($productsRoot): void {
            $brand = $this->seedBrand();
            $categoryMap = $this->seedCategories($productsRoot);
            $this->seedProducts($productsRoot, $brand, $categoryMap);
        });

        $this->command?->info(
            "Ananas demo catalog seeded: {$this->categoryCount} categories, {$this->brandCount} brand, {$this->productCount} products, {$this->variantCount} variants, {$this->imageCount} images."
        );
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(string $productsRoot): array
    {
        $categoryMap = [];
        $sortOrder = 1;

        foreach (self::CATEGORY_CONFIG as $categorySlug => $config) {
            if (! File::isDirectory($productsRoot.DIRECTORY_SEPARATOR.$categorySlug)) {
                continue;
            }

            $category = Category::query()->updateOrCreate(
                ['slug' => $categorySlug],
                [
                    'parent_id' => null,
                    'name' => $config['name'],
                    'image' => null,
                    'description' => $config['description'],
                    'sort_order' => $sortOrder,
                    'is_active' => true,
                ]
            );

            $categoryMap[$categorySlug] = $category;
            $this->categoryCount++;
            $sortOrder++;
        }

        return $categoryMap;
    }

    private function seedBrand(): Brand
    {
        $brand = Brand::query()->updateOrCreate(
            ['slug' => 'ananas'],
            [
                'name' => 'Ananas',
                'logo' => '/ananas-assets/misc/ananas_logo.svg',
                'description' => 'Ananas demo brand cho local development.',
                'is_active' => true,
            ]
        );

        $this->brandCount = 1;

        return $brand;
    }

    /**
     * @param array<string, Category> $categoryMap
     */
    private function seedProducts(string $productsRoot, Brand $brand, array $categoryMap): void
    {
        foreach ($categoryMap as $categorySlug => $category) {
            $categoryDir = $productsRoot.DIRECTORY_SEPARATOR.$categorySlug;
            $productDirectories = File::directories($categoryDir);

            natsort($productDirectories);

            foreach ($productDirectories as $productDirectory) {
                $productCode = strtoupper(basename($productDirectory));
                $imageFiles = $this->collectImageFiles($productDirectory);

                if ($imageFiles === []) {
                    continue;
                }

                $slug = Str::slug($categorySlug.'-'.$productCode);
                $pricing = $this->resolvePricing($categorySlug, $productCode);
                $productName = $this->buildProductName($categorySlug, $productCode);
                $attributes = ['slug' => $slug];
                $payload = [
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'name' => $productName,
                    'description' => "Sản phẩm {$productName} thuộc catalog demo Ananas. Mã sản phẩm: {$productCode}.",
                    'base_price' => $pricing['base_price'],
                    'sale_price' => $pricing['sale_price'],
                    'is_featured' => $this->isFeaturedProduct($productCode),
                    'is_active' => true,
                    'deleted_at' => null,
                ];

                if ($this->hasProductCodeColumn) {
                    $payload['product_code'] = $productCode;
                }

                $product = Product::withTrashed()->updateOrCreate($attributes, $payload);

                if ($product->trashed()) {
                    $product->restore();
                }

                $product->variants()->delete();
                $product->images()->delete();

                $this->seedVariantsForProduct($product, $categorySlug, $productCode, $imageFiles);
                $this->seedImagesForProduct($product, $categorySlug, $productCode, $imageFiles);

                $this->productCount++;
            }
        }
    }

    /**
     * @return list<string>
     */
    private function collectImageFiles(string $productDirectory): array
    {
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        $files = [];

        foreach (File::files($productDirectory) as $file) {
            $extension = strtolower($file->getExtension());
            if (! in_array($extension, $allowedExtensions, true)) {
                continue;
            }

            $files[] = $file->getFilename();
        }

        natsort($files);

        return array_values($files);
    }

    /**
     * @return array{base_price: float, sale_price: float|null}
     */
    private function resolvePricing(string $categorySlug, string $productCode): array
    {
        $config = self::CATEGORY_CONFIG[$categorySlug];
        $hash = abs(crc32($categorySlug.'-'.$productCode));

        $basePrice = $config['base_price_min'] + (($hash % $config['base_price_step_count']) * $config['base_price_step']);
        $basePrice = (float) round($basePrice, 2);

        if ($hash % 4 !== 0) {
            return [
                'base_price' => $basePrice,
                'sale_price' => null,
            ];
        }

        $discountPercent = 10 + ($hash % 16);
        $salePrice = (float) round($basePrice * ((100 - $discountPercent) / 100), 2);

        return [
            'base_price' => $basePrice,
            'sale_price' => $salePrice,
        ];
    }

    private function isFeaturedProduct(string $productCode): bool
    {
        return abs(crc32($productCode)) % 6 === 0;
    }

    private function buildProductName(string $categorySlug, string $productCode): string
    {
        $categoryName = self::CATEGORY_CONFIG[$categorySlug]['name'] ?? 'Sản phẩm';

        return "{$categoryName} Ananas {$productCode}";
    }

    /**
     * @param list<string> $imageFiles
     */
    private function seedVariantsForProduct(Product $product, string $categorySlug, string $productCode, array $imageFiles): void
    {
        $config = self::CATEGORY_CONFIG[$categorySlug];
        $sizes = $config['sizes'];
        $priceAdjustments = $config['price_adjustments'];
        $color = $this->resolveColorFromImageFiles($categorySlug, $productCode, $imageFiles);

        foreach ($sizes as $size) {
            $normalizedSize = strtoupper($size === 'ONE' ? 'ONESIZE' : $size);
            $stock = 10 + (abs(crc32($productCode.'-'.$normalizedSize)) % 41);
            $priceAdjustment = (float) ($priceAdjustments[$size] ?? 0);

            ProductVariant::query()->create([
                'product_id' => $product->id,
                'size' => $size === 'ONE' ? 'One Size' : $size,
                'color' => $color['name'],
                'color_hex' => $color['hex'],
                'sku' => "{$productCode}-{$normalizedSize}-{$color['sku']}",
                'stock' => $stock,
                'price_adjustment' => $priceAdjustment,
            ]);

            $this->variantCount++;
        }
    }

    /**
     * @param list<string> $imageFiles
     * @return array{name: string, hex: string, sku: string}
     */
    private function resolveColorFromImageFiles(string $categorySlug, string $productCode, array $imageFiles): array
    {
        $imageNames = strtolower(implode(' ', $imageFiles));

        foreach (self::COLOR_KEYWORD_MAP as $keyword => $color) {
            if (str_contains($imageNames, $keyword)) {
                return $color;
            }
        }

        $index = abs(crc32($categorySlug.'-'.$productCode)) % count(self::COLOR_PALETTE);

        return self::COLOR_PALETTE[$index];
    }

    /**
     * @param list<string> $imageFiles
     */
    private function seedImagesForProduct(Product $product, string $categorySlug, string $productCode, array $imageFiles): void
    {
        $primaryImage = $this->resolvePrimaryImage($imageFiles);

        foreach ($imageFiles as $index => $imageFile) {
            $url = "/ananas-assets/products/{$categorySlug}/{$productCode}/{$imageFile}";

            ProductImage::query()->create([
                'product_id' => $product->id,
                'url' => $url,
                'public_id' => "local:ananas-assets/products/{$categorySlug}/{$productCode}/{$imageFile}",
                'sort_order' => $index,
                'is_primary' => $imageFile === $primaryImage,
            ]);

            $this->imageCount++;
        }
    }

    /**
     * @param list<string> $imageFiles
     */
    private function resolvePrimaryImage(array $imageFiles): string
    {
        foreach ($imageFiles as $imageFile) {
            $lowerFile = strtolower($imageFile);
            if (str_contains($lowerFile, '_front_01')) {
                return $imageFile;
            }
        }

        foreach ($imageFiles as $imageFile) {
            $lowerFile = strtolower($imageFile);
            if (str_contains($lowerFile, '_front_')) {
                return $imageFile;
            }
        }

        return $imageFiles[0];
    }
}
