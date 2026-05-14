<?php

namespace App\Http\Resources\Cart;

use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray($request): array
    {
        $items = $this->items()->with(['variant.product'])->get();

        $itemResources = CartItemResource::collection($items)->resolve();

        $total = array_reduce($itemResources, function ($carry, $item) {
            return $carry + ($item['subtotal'] ?? 0);
        }, 0);

        return [
            'id' => $this->id,
            'owner' => $this->user_id ? ['type' => 'user', 'user_id' => $this->user_id] : ['type' => 'guest', 'guest_token' => $this->guest_token],
            'items' => $itemResources,
            'total' => round($total, 2),
        ];
    }
}
