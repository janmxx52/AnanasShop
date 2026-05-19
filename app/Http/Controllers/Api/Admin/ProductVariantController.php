<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminProductVariantStoreRequest;
use App\Http\Requests\Admin\AdminProductVariantUpdateRequest;
use App\Http\Resources\Admin\AdminProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductVariantController extends Controller
{
    use ApiResponse;

    public function index(Product $product, Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $variants = $product->variants()->orderBy('id', 'asc')->paginate($perPage);

        return $this->paginated(AdminProductVariantResource::collection($variants), 'Lấy danh sách biến thể thành công.');
    }

    public function store(AdminProductVariantStoreRequest $request, Product $product)
    {
        $data = $request->validated();

        // Prevent duplicate size+color for same product
        if (ProductVariant::where('product_id', $product->id)
            ->where('size', $data['size'])
            ->where('color', $data['color'])->exists()) {
            return $this->error(
                'Biến thể này đã tồn tại cho sản phẩm.',
                ['variant' => ['Biến thể trùng tổ hợp size và màu.']],
                422
            );
        }

        $data['product_id'] = $product->id;
        $variant = ProductVariant::create($data);

        return $this->success((new AdminProductVariantResource($variant))->resolve(), 'Tạo biến thể thành công.', 201);
    }

    public function show(Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        return $this->success((new AdminProductVariantResource($variant))->resolve(), 'Lấy thông tin biến thể thành công.');
    }

    public function update(AdminProductVariantUpdateRequest $request, Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        $data = $request->validated();

        $newSize = $data['size'] ?? $variant->size;
        $newColor = $data['color'] ?? $variant->color;

        if (ProductVariant::where('product_id', $product->id)
            ->where('size', $newSize)
            ->where('color', $newColor)
            ->where('id', '!=', $variant->id)
            ->exists()) {
            return $this->error(
                'Biến thể này đã tồn tại cho sản phẩm.',
                ['variant' => ['Biến thể trùng tổ hợp size và màu.']],
                422
            );
        }

        $variant->update($data);

        return $this->success((new AdminProductVariantResource($variant))->resolve(), 'Cập nhật biến thể thành công.');
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        // If variant referenced in order_items, prevent deletion (no soft delete schema)
        $referenced = false;
        if (Schema::hasTable('order_items')) {
            $referenced = DB::table('order_items')->where('product_variant_id', $variant->id)->exists();
        }
        if ($referenced) {
            return $this->error('Không thể xóa biến thể vì đã phát sinh trong đơn hàng.', null, 400);
        }

        $variant->delete();

        return $this->success(null, 'Xóa biến thể thành công.');
    }
}
