<?php

namespace App\Http\Controllers\Api\Brand;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    use ApiResponse;

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $perPage = (int) $request->query('per_page', 12);
        
        $brands = Brand::where('is_active', true)
            ->with('products')
            ->orderBy('name', 'asc')
            ->paginate($perPage);

        return $this->paginated(
            BrandResource::collection($brands),
            'Lấy danh sách thương hiệu thành công.'
        );
    }

    public function show(string $slug): \Illuminate\Http\JsonResponse
    {
        $brand = Brand::where('slug', $slug)
            ->where('is_active', true)
            ->with(['products' => function ($query) {
                $query->where('is_active', true)->whereNull('deleted_at');
            }])
            ->first();

        if (!$brand) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        // Format response with product details if products are loaded
        $brandData = (new BrandResource($brand))->resolve();
        
        if (!empty($brand->products)) {
            $brandData['products'] = ProductResource::collection($brand->products)->resolve();
        }

        return $this->success($brandData, 'Lấy thông tin thương hiệu thành công.');
    }
}
