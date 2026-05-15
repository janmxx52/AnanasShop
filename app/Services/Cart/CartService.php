<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function getOrCreateCartFromRequest(Request $request): array
    {
        $user = $request->user('sanctum') ?? $request->user();
        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id], ['guest_token' => null]);
            return [$cart, null];
        }

        $guestToken = $request->header('X-Guest-Token');
        if ($guestToken) {
            $cart = Cart::firstOrCreate(['guest_token' => $guestToken]);
            return [$cart, null];
        }

        $guestToken = (string) Str::uuid();
        $cart = Cart::create(['guest_token' => $guestToken]);
        return [$cart, $guestToken];
    }

    public function addItem(Cart $cart, int $variantId, int $qty = 1): CartItem
    {
        return DB::transaction(function () use ($cart, $variantId, $qty) {
            $variant = ProductVariant::findOrFail($variantId);

            $product = $variant->product;
            if (!$product || !$product->is_active) {
                throw ValidationException::withMessages(['product_variant_id' => 'Product is inactive']);
            }

            if ($variant->stock <= 0) {
                throw ValidationException::withMessages(['product_variant_id' => 'Variant is out of stock']);
            }

            $existing = CartItem::where('cart_id', $cart->id)->where('product_variant_id', $variantId)->first();
            $desired = ($existing ? $existing->quantity : 0) + $qty;

            if ($desired > $variant->stock) {
                throw ValidationException::withMessages(['quantity' => 'Exceeds available stock']);
            }

            if ($existing) {
                $existing->quantity = $desired;
                $existing->save();
                return $existing;
            }

            return CartItem::create([
                'cart_id' => $cart->id,
                'product_variant_id' => $variantId,
                'quantity' => $qty,
            ]);
        });
    }

    public function updateItem(Cart $cart, CartItem $item, int $qty): ?CartItem
    {
        if ($item->cart_id !== $cart->id) {
            abort(404);
        }

        if ($qty === 0) {
            $item->delete();
            return null;
        }

        return DB::transaction(function () use ($item, $qty) {
            $variant = ProductVariant::findOrFail($item->product_variant_id);

            $product = $variant->product;
            if (!$product || !$product->is_active) {
                throw ValidationException::withMessages(['product_variant_id' => 'Product is inactive']);
            }

            if ($qty < 1) {
                throw ValidationException::withMessages(['quantity' => 'Quantity must be at least 1']);
            }
            if ($qty > $variant->stock) {
                throw ValidationException::withMessages(['quantity' => 'Exceeds available stock']);
            }

            $item->quantity = $qty;
            $item->save();
            return $item;
        });
    }

    public function removeItem(Cart $cart, CartItem $item): void
    {
        if ($item->cart_id !== $cart->id) abort(404);
        $item->delete();
    }

    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function mergeGuestCart(string $guestToken, $user): array
    {
        return DB::transaction(function () use ($guestToken, $user) {
            $guestCart = Cart::where('guest_token', $guestToken)->lockForUpdate()->first();
            if (!$guestCart) return ['warnings' => [] , 'cart' => null];

            $userCart = Cart::firstOrCreate(['user_id' => $user->id], ['guest_token' => null]);

            $warnings = [];

            foreach ($guestCart->items as $gItem) {
                $variant = ProductVariant::find($gItem->product_variant_id);
                if (!$variant || $variant->stock <= 0) {
                    $warnings[] = "Variant {$gItem->product_variant_id} unavailable";
                    continue;
                }

                $product = $variant->product;
                if (!$product || !$product->is_active) {
                    $warnings[] = "Variant {$gItem->product_variant_id} unavailable or product inactive";
                    continue;
                }

                $existing = $userCart->items()->where('product_variant_id', $gItem->product_variant_id)->first();
                $desired = ($existing ? $existing->quantity : 0) + $gItem->quantity;
                $allowed = min($desired, $variant->stock);

                if ($allowed <= 0) {
                    $warnings[] = "Variant {$gItem->product_variant_id} out of stock";
                    continue;
                }

                if ($existing) {
                    $existing->quantity = $allowed;
                    $existing->save();
                } else {
                    $userCart->items()->create([
                        'product_variant_id' => $gItem->product_variant_id,
                        'quantity' => $allowed,
                    ]);
                }

                if ($allowed < $desired) {
                    $warnings[] = "Quantity for variant {$gItem->product_variant_id} capped to {$allowed} due to stock";
                }
            }

            // delete guest cart
            $guestCart->delete();

            return ['warnings' => $warnings, 'cart' => $userCart];
        });
    }
}
