<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\ReviewIndexRequest;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\Review\ReviewResource;
use App\Models\Product;
use App\Services\Review\ReviewService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService)
    {
    }

    public function index(ReviewIndexRequest $request, string $slug)
    {
        $product = Product::query()->where('slug', $slug)->where('is_active', true)->first();
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $perPage = max(1, min(50, (int) $request->input('per_page', 12)));
        $reviews = $this->reviewService->paginateApprovedByProduct($product, $perPage);

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews)->resolve(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(StoreReviewRequest $request, string $slug)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $product = Product::query()->where('slug', $slug)->where('is_active', true)->first();
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $review = $this->reviewService->createForProduct($user, $product, $request->validated());

        return response()->json([
            'success' => true,
            'data' => (new ReviewResource($review))->resolve(),
        ], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        try {
            $this->reviewService->deleteOwnReview($user, $id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review deleted',
        ]);
    }
}
