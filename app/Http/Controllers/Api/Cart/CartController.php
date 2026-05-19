<?php

namespace App\Http\Controllers\Api\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\Cart\CartResource;
use App\Http\Resources\Cart\CartItemResource;
use App\Models\CartItem;
use App\Services\Cart\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $service)
    {
    }

    public function index(Request $request)
    {
        [$cart, $guestToken] = $this->service->getOrCreateCartFromRequest($request);
        $payload = (new CartResource($cart))->resolve();
        $resp = response()->json($payload);
        if ($guestToken) {
            $resp->header('X-Guest-Token', $guestToken);
        }
        return $resp;
    }

    public function addItem(AddCartItemRequest $request)
    {
        [$cart, $guestToken] = $this->service->getOrCreateCartFromRequest($request);
        $variantId = (int) $request->input('product_variant_id');
        $qty = (int) $request->input('quantity', 1);

        $item = $this->service->addItem($cart, $variantId, $qty);

        $resp = response()->json((new CartItemResource($item))->resolve(), 201);
        if ($guestToken) $resp->header('X-Guest-Token', $guestToken);
        return $resp;
    }

    public function updateItem(UpdateCartItemRequest $request, $itemId)
    {
        [$cart, $guestToken] = $this->service->getOrCreateCartFromRequest($request);
        $item = CartItem::findOrFail($itemId);
        $qty = (int) $request->input('quantity');

        $updated = $this->service->updateItem($cart, $item, $qty);

        if (is_null($updated)) {
            return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng.']);
        }

        $resp = response()->json((new CartItemResource($updated))->resolve());
        if ($guestToken) $resp->header('X-Guest-Token', $guestToken);
        return $resp;
    }

    public function removeItem(Request $request, $itemId)
    {
        [$cart, $guestToken] = $this->service->getOrCreateCartFromRequest($request);
        $item = CartItem::findOrFail($itemId);
        $this->service->removeItem($cart, $item);
        $resp = response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng.']);
        if ($guestToken) $resp->header('X-Guest-Token', $guestToken);
        return $resp;
    }

    public function clear(Request $request)
    {
        [$cart, $guestToken] = $this->service->getOrCreateCartFromRequest($request);
        $this->service->clearCart($cart);
        $resp = response()->json(['message' => 'Đã xóa toàn bộ sản phẩm trong giỏ hàng.']);
        if ($guestToken) $resp->header('X-Guest-Token', $guestToken);
        return $resp;
    }

    public function merge(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Bạn cần đăng nhập để thực hiện thao tác này.'], 401);

        $guestToken = $request->header('X-Guest-Token');
        if (!$guestToken) return response()->json(['message' => 'Thiếu mã giỏ hàng khách.'], 400);

        $result = $this->service->mergeGuestCart($guestToken, $user);

        $cart = $result['cart'] ?? null;
        $payload = $cart ? (new CartResource($cart))->resolve() : null;
        return response()->json(['warnings' => $result['warnings'], 'data' => $payload]);
    }
}

