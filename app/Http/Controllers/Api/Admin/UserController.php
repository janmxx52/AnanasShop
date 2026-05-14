<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->notImplemented();
    }

    public function show(int $id): JsonResponse
    {
        return $this->notImplemented();
    }

    public function ban(int $id): JsonResponse
    {
        return $this->notImplemented();
    }
}
