<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandStoreRequest;
use App\Http\Requests\Admin\BrandUpdateRequest;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $brands = Brand::orderBy('name', 'asc')->paginate($perPage);
        return response()->json($brands);
    }

    public function store(BrandStoreRequest $request)
    {
        $data = $request->validated();
        $brand = Brand::create($data);
        return response()->json($brand, 201);
    }

    public function show($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($brand);
    }

    public function update(BrandUpdateRequest $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $brand->update($request->validated());
        return response()->json($brand);
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
