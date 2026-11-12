<?php

namespace App\Http\Controllers\Api\Category;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $perPage = (int) $request->query('per_page', 12);
        
        $categories = Category::where('is_active', true)
            ->with('products')
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc')
            ->paginate($perPage);

        return $this->paginated(
            CategoryResource::collection($categories),
            'Lấy danh sách danh mục thành công.'
        );
    }

    public function show(string $slug): \Illuminate\Http\JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with(['products' => function ($query) {
                $query->where('is_active', true)->whereNull('deleted_at');
            }])
            ->first();

        if (!$category) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        // Format response with product details if products are loaded
        $categoryData = (new CategoryResource($category))->resolve();
        
        if (!empty($category->products)) {
            $categoryData['products'] = ProductResource::collection($category->products)->resolve();
        }

        return $this->success($categoryData, 'Lấy thông tin danh mục thành công.');
    }
}
