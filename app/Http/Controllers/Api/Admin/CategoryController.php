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

        return $this->paginated($categories, 'Categories fetched');
    }

    public function store(CategoryStoreRequest $request)
    {
        $data = $request->validated();
        $category = Category::create($data);

        return $this->success($category, 'Category created', 201);
    }

    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->error('Not found', null, 404);
        }

        return $this->success($category, 'Category fetched');
    }

    public function update(CategoryUpdateRequest $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->error('Not found', null, 404);
        }

        $category->update($request->validated());

        return $this->success($category, 'Category updated');
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->error('Not found', null, 404);
        }

        $category->delete();

        return $this->success(null, 'Category deleted');
    }
}
