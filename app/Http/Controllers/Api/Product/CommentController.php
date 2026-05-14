<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    use ApiResponse;

    public function index(string $slug): JsonResponse
    {
        return $this->notImplemented();
    }

    public function store(string $slug): JsonResponse
    {
        return $this->notImplemented();
    }

    public function destroy(int $id): JsonResponse
    {
        return $this->notImplemented();
    }
}
