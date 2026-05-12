<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Requests\ProductShowRequest;
use App\Http\Resources\ProductResource;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    protected ProductRepository $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }

    public function index(ProductIndexRequest $request)
    {
        $filters = $request->validated();
        $perPage = (int) ($request->input('per_page', 12));

        $products = $this->repository->paginate($filters, $perPage);

        return ProductResource::collection($products);
    }

    public function show(ProductShowRequest $request, string $slug)
    {
        $product = $this->repository->findBySlugWithRelations($slug);

        if (!$product || !$product->is_active) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return new ProductResource($product);
    }
}
