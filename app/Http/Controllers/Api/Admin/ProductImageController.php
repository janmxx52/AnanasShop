<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminProductImageStoreRequest;
use App\Http\Resources\Admin\AdminProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    use ApiResponse;

    public function __construct(private CloudinaryService $cloudinary)
    {
    }

    public function index(Product $product): JsonResponse
    {
        $images = $product->images()->orderByDesc('is_primary')->orderBy('sort_order')->get();

        return $this->success(AdminProductImageResource::collection($images)->resolve(), 'Lấy danh sách ảnh sản phẩm thành công.');
    }

    public function store(AdminProductImageStoreRequest $request, Product $product): JsonResponse
    {
        $file = $request->file('file');

        // Upload first
        $uploaded = $this->cloudinary->upload($file);
        $url = $uploaded['url'] ?? null;
        $publicId = $uploaded['public_id'] ?? null;

        if (empty($url)) {
            return $this->error('Tải ảnh lên thất bại.', null, 500);
        }

        // Use transaction to enforce max count and primary swap
        try {
            $image = null;
            DB::transaction(function () use ($product, $request, $url, $publicId, &$image) {
                $images = ProductImage::where('product_id', $product->id)->lockForUpdate()->get();
                if ($images->count() >= 10) {
                    throw new \Exception('max_images');
                }

                if ($request->boolean('is_primary')) {
                    ProductImage::where('product_id', $product->id)->where('is_primary', true)->update(['is_primary' => false]);
                }

                $image = ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $url,
                    'public_id' => $publicId,
                    'sort_order' => $request->input('sort_order', 0),
                    'is_primary' => $request->boolean('is_primary'),
                ]);
            });

            return $this->success((new AdminProductImageResource($image))->resolve(), 'Tải ảnh lên thành công.', 201);
        } catch (\Exception $e) {
            // Try to clean up uploaded remote asset if exists
            if (!empty($publicId)) {
                $this->cloudinary->delete($publicId);
            }
            if ($e->getMessage() === 'max_images') {
                return $this->error('Đã đạt giới hạn số lượng ảnh tối đa cho sản phẩm.', null, 422);
            }

            return $this->error('Lưu ảnh thất bại.', null, 500);
        }
    }

    public function destroy(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        // If public_id exists, delete remote first
        if (!empty($image->public_id)) {
            $ok = $this->cloudinary->delete($image->public_id);
            if (!$ok) {
                return $this->error('Xóa ảnh trên hệ thống lưu trữ thất bại.', null, 500);
            }
        }

        $image->delete();

        return $this->success(null, 'Xóa ảnh thành công.');
    }

    public function setPrimary(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        DB::transaction(function () use ($product, $image) {
            ProductImage::where('product_id', $product->id)->where('is_primary', true)->update(['is_primary' => false]);
            $image->is_primary = true;
            $image->save();
        });

        return $this->success((new AdminProductImageResource($image->fresh()))->resolve(), 'Cập nhật ảnh đại diện thành công.');
    }
}
