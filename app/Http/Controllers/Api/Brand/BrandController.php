<?php

namespace App\Http\Controllers\Api\Brand;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
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
