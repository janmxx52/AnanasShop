<?php

namespace App\Services\Wishlist;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class WishlistService
{
    public function paginateForUser(User $user, int $perPage = 12): LengthAwarePaginator
    {
        return Wishlist::query()
            ->where('user_id', $user->id)
            ->whereHas('product', function ($query) {
                $query->where('is_active', true);
            })
            ->with([
                'product' => function ($query) {
                    $query->with([
                        'images' => function ($imageQuery) {
                            $imageQuery->orderByDesc('is_primary')
                                ->orderBy('sort_order')
                                ->orderBy('id');
                        },
                    ]);
                },
            ])
            ->latest('id')
            ->paginate($perPage);
    }

    public function toggle(User $user, int $productId): array
    {
        $existing = Wishlist::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();

            return [
                'action' => 'removed',
                'product_id' => $productId,
            ];
        }

        $product = Product::query()
            ->whereKey($productId)
            ->where('is_active', true)
            ->first();

        if (!$product) {
            throw ValidationException::withMessages([
                'product_id' => 'Product is unavailable',
            ]);
        }

        $wishlist = Wishlist::query()->firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $productId,
        ]);

        $wishlist->load([
            'product.images' => function ($query) {
                $query->orderByDesc('is_primary')
                    ->orderBy('sort_order')
                    ->orderBy('id');
            },
        ]);

        return [
            'action' => 'added',
            'wishlist' => $wishlist,
        ];
    }

    public function remove(User $user, int $productId): void
    {
        Wishlist::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();
    }
}

