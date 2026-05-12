<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\AuthResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $request->only(['name', 'email', 'password', 'phone']);
        $device = $request->input('device_name');

        $result = $this->authService->register($payload, $device);

        return response()->json([
            'success' => true,
            'data' => new AuthResource($result),
        ], 201);
    }
}
