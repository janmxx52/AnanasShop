<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminProductIndexRequest;
use App\Http\Requests\Admin\AdminProductStatusRequest;
use App\Http\Requests\Admin\AdminProductStoreRequest;
use App\Http\Requests\Admin\AdminProductUpdateRequest;
use App\Http\Resources\Admin\AdminProductResource;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(AdminProductIndexRequest $request)
    {
        $query = Product::with(['category', 'brand']);

        if ($request->boolean('with_trashed')) {
            $query = $query->withTrashed();
        }

        if ($q = $request->query('q')) {
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($cat = $request->query('category')) {
            if (is_numeric($cat)) {
                $query->where('category_id', (int) $cat);
            } else {
                $query->whereHas('category', function ($qb) use ($cat) {
                    $qb->where('slug', $cat);
                });
            }
        }

        if ($b = $request->query('brand')) {
            if (is_numeric($b)) {
                $query->where('brand_id', (int) $b);
            } else {
                $query->whereHas('brand', function ($qb) use ($b) {
                    $qb->where('slug', $b);
                });
            }
        }

        if (!is_null($request->query('is_active'))) {
            $query->where('is_active', (bool) $request->query('is_active'));
        }

        $perPage = (int) $request->query('per_page', 20);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return $this->paginated(AdminProductResource::collection($products), 'Products fetched');
    }

    public function store(AdminProductStoreRequest $request)
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        } else {
            $data['slug'] = $this->generateUniqueSlug($data['slug']);
        }

        $product = Product::create($data);

        $resource = (new AdminProductResource($product->load(['category', 'brand'])))->resolve();

        return $this->success($resource, 'Product created', 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand'])->withTrashed()->find($id);
        if (!$product) {
            return $this->error('Not found', null, 404);
        }

        return $this->success((new AdminProductResource($product))->resolve(), 'Product fetched');
    }

    public function update(AdminProductUpdateRequest $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return $this->error('Not found', null, 404);
        }

        $data = $request->validated();

        if (isset($data['slug']) && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'] ?? $product->name, $product->id);
        }

        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        $resource = (new AdminProductResource($product->load(['category', 'brand'])))->resolve();

        return $this->success($resource, 'Product updated');
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return $this->error('Not found', null, 404);
        }

        $product->delete();

        return $this->success(null, 'Product deleted');
    }

    public function restore($id)
    {
        $product = Product::withTrashed()->find($id);
        if (!$product) {
            return $this->error('Not found', null, 404);
        }

        if (!$product->trashed()) {
            return $this->error('Not trashed', null, 400);
        }

        $product->restore();
        $resource = (new AdminProductResource($product->load(['category', 'brand'])))->resolve();

        return $this->success($resource, 'Product restored');
    }

    public function status(AdminProductStatusRequest $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return $this->error('Not found', null, 404);
        }

        $product->is_active = (bool) $request->input('is_active');
        $product->save();
        $resource = (new AdminProductResource($product->load(['category', 'brand'])))->resolve();

        return $this->success($resource, 'Product status updated');
    }

    private function generateUniqueSlug(string $base, $ignoreId = null): string
    {
        $slug = Str::slug($base);
        $original = $slug;
        $i = 1;
        while (Product::where('slug', $slug)->when($ignoreId, function ($q) use ($ignoreId) {
            $q->where('id', '!=', $ignoreId);
        })->exists()) {
            $slug = $original . '-' . $i;
            $i++;
            if ($i > 100) {
                $slug = $original . '-' . uniqid();
                break;
            }
        }

        return $slug;
    }
}

