<?php

namespace App\Services\Review;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewService
{
    public function __construct(private CloudinaryService $cloudinaryService)
    {
    }

    public function paginateApprovedByProduct(Product $product, int $perPage): LengthAwarePaginator
    {
        return Review::query()
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->with(['user', 'reviewImages'])
            ->latest('id')
            ->paginate($perPage);
    }

    public function createForProduct(User $user, Product $product, array $payload): Review
    {
        $orderItem = OrderItem::query()->with('order')->find($payload['order_item_id']);
        if (!$orderItem || !$orderItem->order) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Không tìm thấy sản phẩm trong đơn hàng.',
            ]);
        }

        if ((int) $orderItem->order->user_id !== (int) $user->id) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Bạn chỉ có thể đánh giá sản phẩm thuộc đơn hàng của chính mình.',
            ]);
        }

        if ($orderItem->order->status !== 'delivered') {
            throw ValidationException::withMessages([
                'order_item_id' => 'Bạn chỉ có thể đánh giá sau khi đơn hàng đã giao thành công.',
            ]);
        }

        if ((int) $orderItem->product_id !== (int) $product->id) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Sản phẩm trong đơn hàng không khớp với sản phẩm đang đánh giá.',
            ]);
        }

        if (Review::query()->where('order_item_id', $orderItem->id)->exists()) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Sản phẩm này trong đơn hàng đã được đánh giá trước đó.',
            ]);
        }

        $files = $payload['images'] ?? [];
        $uploadedImages = $this->uploadReviewImages($files);

        try {
            $review = DB::transaction(function () use ($user, $product, $orderItem, $payload, $uploadedImages) {
                $review = Review::query()->create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'order_item_id' => $orderItem->id,
                    'rating' => (int) $payload['rating'],
                    'comment' => $payload['comment'] ?? null,
                    'is_approved' => true,
                ]);

                if (!empty($uploadedImages)) {
                    $review->reviewImages()->createMany($uploadedImages);
                }

                return $review;
            });
        } catch (\Throwable $throwable) {
            $this->cleanupUploadedImages($uploadedImages);
            throw $throwable;
        }

        return $review->load(['user', 'reviewImages']);
    }

    public function deleteOwnReview(User $user, int $reviewId): void
    {
        $review = Review::query()
            ->where('id', $reviewId)
            ->where('user_id', $user->id)
            ->with('reviewImages')
            ->first();

        if (!$review) {
            throw new ModelNotFoundException('Không tìm thấy đánh giá.');
        }

        foreach ($review->reviewImages as $image) {
            if (!empty($image->public_id)) {
                $this->cloudinaryService->delete($image->public_id);
            }
        }

        $review->delete();
    }

    /**
     * @param array<int, UploadedFile> $files
     * @return array<int, array<string, mixed>>
     */
    private function uploadReviewImages(array $files): array
    {
        $uploadedImages = [];

        foreach (array_values($files) as $index => $file) {
            $uploaded = $this->cloudinaryService->uploadToFolder($file, 'ananas/reviews');
            $uploadedImages[] = [
                'image_url' => $uploaded['url'] ?? null,
                'public_id' => $uploaded['public_id'] ?? null,
                'sort_order' => $index,
            ];
        }

        return $uploadedImages;
    }

    /**
     * @param array<int, array<string, mixed>> $uploadedImages
     */
    private function cleanupUploadedImages(array $uploadedImages): void
    {
        foreach ($uploadedImages as $image) {
            $publicId = $image['public_id'] ?? null;
            if (!empty($publicId)) {
                $this->cloudinaryService->delete($publicId);
            }
        }
    }
}
