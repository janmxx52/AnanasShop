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

        return $this->paginated($brands, 'Brands fetched');
    }

    public function store(BrandStoreRequest $request)
    {
        $data = $request->validated();
        $brand = Brand::create($data);

        return $this->success($brand, 'Brand created', 201);
    }

    public function show($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return $this->error('Not found', null, 404);
        }

        return $this->success($brand, 'Brand fetched');
    }

    public function update(BrandUpdateRequest $request, $id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return $this->error('Not found', null, 404);
        }

        $brand->update($request->validated());

        return $this->success($brand, 'Brand updated');
    }

    public function destroy($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return $this->error('Not found', null, 404);
        }

        $brand->delete();

        return $this->success(null, 'Brand deleted');
    }
}
