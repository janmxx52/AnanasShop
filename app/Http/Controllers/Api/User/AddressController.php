<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class AddressController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->notImplemented();
    }

    public function store(): JsonResponse
    {
        return $this->notImplemented();
    }

    public function show(int $id): JsonResponse
    {
        return $this->notImplemented();
    }

    public function update(int $id): JsonResponse
    {
        return $this->notImplemented();
    }

    public function destroy(int $id): JsonResponse
    {
        return $this->notImplemented();
    }

    public function setDefault(int $id): JsonResponse
    {
        return $this->notImplemented();
    }
}
