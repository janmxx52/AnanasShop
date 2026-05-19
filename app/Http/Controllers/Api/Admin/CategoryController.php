<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryStoreRequest;
use App\Http\Requests\Admin\CategoryUpdateRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $categories = Category::orderBy('sort_order', 'asc')->paginate($perPage);

        return $this->paginated($categories, 'Lấy danh sách danh mục thành công.');
    }

    public function store(CategoryStoreRequest $request)
    {
        $data = $request->validated();
        $category = Category::create($data);

        return $this->success($category, 'Tạo danh mục thành công.', 201);
    }

    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        return $this->success($category, 'Lấy thông tin danh mục thành công.');
    }

    public function update(CategoryUpdateRequest $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        $category->update($request->validated());

        return $this->success($category, 'Cập nhật danh mục thành công.');
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        $category->delete();

        return $this->success(null, 'Xóa danh mục thành công.');
    }
}
