<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandStoreRequest;
use App\Http\Requests\Admin\BrandUpdateRequest;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $brands = Brand::orderBy('name', 'asc')->paginate($perPage);

        return $this->paginated($brands, 'Lấy danh sách thương hiệu thành công.');
    }

    public function store(BrandStoreRequest $request)
    {
        $data = $request->validated();
        $brand = Brand::create($data);

        return $this->success($brand, 'Tạo thương hiệu thành công.', 201);
    }

    public function show($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        return $this->success($brand, 'Lấy thông tin thương hiệu thành công.');
    }

    public function update(BrandUpdateRequest $request, $id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        $brand->update($request->validated());

        return $this->success($brand, 'Cập nhật thương hiệu thành công.');
    }

    public function destroy($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        $brand->delete();

        return $this->success(null, 'Xóa thương hiệu thành công.');
    }
}
