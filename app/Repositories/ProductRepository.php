<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::query()->where('is_active', true)
            ->with(['variants', 'images', 'category', 'brand']);

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if (!empty($filters['category'])) {
            $cat = $filters['category'];
            if (is_numeric($cat)) {
                $query->where('category_id', (int) $cat);
            } else {
                $category = Category::where('slug', $cat)->first();
                if ($category) {
                    $query->where('category_id', $category->id);
                }
            }
        }

        if (!empty($filters['brand'])) {
            $b = $filters['brand'];
            if (is_numeric($b)) {
                $query->where('brand_id', (int) $b);
            } else {
                $brand = Brand::where('slug', $b)->first();
                if ($brand) {
                    $query->where('brand_id', $brand->id);
                }
            }
        }

        if (!empty($filters['size']) || !empty($filters['color'])) {
            $size = $filters['size'] ?? null;
            $color = $filters['color'] ?? null;

            $query->whereHas('variants', function ($qb) use ($size, $color) {
                if ($size) {
                    $qb->where('size', $size);
                }
                if ($color) {
                    $qb->where('color', $color);
                }
            });
        }

        if (!empty($filters['min_price'])) {
            $query->where('base_price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('base_price', '<=', $filters['max_price']);
        }

        $sort = $filters['sort'] ?? null;
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('base_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('base_price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'featured':
                $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($perPage);
    }

    public function findBySlugWithRelations(string $slug): ?Product
    {
        return Product::with(['variants', 'images', 'category', 'brand'])->where('slug', $slug)->first();
    }

    public function findByIdWithRelations(int $id): ?Product
    {
        return Product::with(['variants', 'images', 'category', 'brand'])->find($id);
    }
}
