<?php

namespace App\Http\Controllers\Api\Category;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->notImplemented();
    }

    public function show(string $slug): JsonResponse
    {
        return $this->notImplemented();
    }
}
