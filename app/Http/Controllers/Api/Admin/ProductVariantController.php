<?php

namespace App\Http\Controllers\Api\Admin;

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
    public function index(Product $product, Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $variants = $product->variants()->orderBy('id', 'asc')->paginate($perPage);
        return response()->json($variants);
    }

    public function store(AdminProductVariantStoreRequest $request, Product $product)
    {
        $data = $request->validated();

        // Prevent duplicate size+color for same product
        if (ProductVariant::where('product_id', $product->id)
            ->where('size', $data['size'])
            ->where('color', $data['color'])->exists()) {
            return response()->json([
                'message' => 'Variant already exists for this product',
                'errors' => ['variant' => ['Duplicate size+color for product']],
            ], 422);
        }

        $data['product_id'] = $product->id;
        $variant = ProductVariant::create($data);

        return response()->json((new AdminProductVariantResource($variant))->resolve(), 201);
    }

    public function show(Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json((new AdminProductVariantResource($variant))->resolve());
    }

    public function update(AdminProductVariantUpdateRequest $request, Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $data = $request->validated();

        $newSize = $data['size'] ?? $variant->size;
        $newColor = $data['color'] ?? $variant->color;

        if (ProductVariant::where('product_id', $product->id)
            ->where('size', $newSize)
            ->where('color', $newColor)
            ->where('id', '!=', $variant->id)
            ->exists()) {
            return response()->json([
                'message' => 'Variant already exists for this product',
                'errors' => ['variant' => ['Duplicate size+color for product']],
            ], 422);
        }

        $variant->update($data);

        return response()->json((new AdminProductVariantResource($variant))->resolve());
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        // If variant referenced in order_items, prevent deletion (no soft delete schema)
        $referenced = false;
        if (Schema::hasTable('order_items')) {
            $referenced = DB::table('order_items')->where('product_variant_id', $variant->id)->exists();
        }
        if ($referenced) {
            return response()->json(['message' => 'Variant cannot be deleted because it is referenced in orders'], 400);
        }

        $variant->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
