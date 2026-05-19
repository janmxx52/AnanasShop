<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wishlist\WishlistIndexRequest;
use App\Http\Requests\Wishlist\WishlistToggleRequest;
use App\Http\Resources\Wishlist\WishlistItemResource;
use App\Services\Wishlist\WishlistService;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct(private WishlistService $wishlistService)
    {
    }

    public function index(WishlistIndexRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để thực hiện thao tác này.'], 401);
        }

        $perPage = max(1, min(50, (int) $request->input('per_page', 12)));
        $wishlists = $this->wishlistService->paginateForUser($user, $perPage);

        return response()->json([
            'success' => true,
            'data' => WishlistItemResource::collection($wishlists)->resolve(),
            'meta' => [
                'current_page' => $wishlists->currentPage(),
                'last_page' => $wishlists->lastPage(),
                'per_page' => $wishlists->perPage(),
                'total' => $wishlists->total(),
            ],
        ]);
    }

    public function toggle(WishlistToggleRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để thực hiện thao tác này.'], 401);
        }

        $result = $this->wishlistService->toggle($user, (int) $request->validated('product_id'));

        return response()->json([
            'success' => true,
            'message' => $result['action'] === 'added' ? 'Đã thêm vào danh sách yêu thích.' : 'Đã xóa khỏi danh sách yêu thích.',
            'action' => $result['action'],
            'data' => isset($result['wishlist']) ? (new WishlistItemResource($result['wishlist']))->resolve() : [
                'product_id' => $result['product_id'],
            ],
        ]);
    }

    public function destroy(Request $request, int $product)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để thực hiện thao tác này.'], 401);
        }

        $this->wishlistService->remove($user, $product);

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa khỏi danh sách yêu thích.',
        ]);
    }
}
