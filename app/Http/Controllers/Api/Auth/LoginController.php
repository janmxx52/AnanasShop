<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\AuthResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only(['email', 'password']);
        $device = $request->input('device_name');

        $result = $this->authService->login($credentials['email'], $credentials['password'], $device);

        if (empty($result)) {
            return response()->json(['success' => false, 'message' => 'Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa.'], 401);
        }

        return response()->json(['success' => true, 'data' => new AuthResource($result)], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $bearer = $request->bearerToken();
        if ($bearer) {
            $parts = explode('|', $bearer);
            $plain = end($parts);
            $hash = hash('sha256', $plain);
            \Laravel\Sanctum\PersonalAccessToken::where('token', $hash)->delete();
        } else {
            // fallback
            $this->authService->logoutCurrent($user);
        }

        return response()->json(['success' => true, 'message' => 'Đăng xuất thành công.'], 200);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();

        \Laravel\Sanctum\PersonalAccessToken::where('tokenable_type', get_class($user))
            ->where('tokenable_id', $user->getKey())
            ->delete();

        return response()->json(['success' => true, 'message' => 'Đăng xuất khỏi tất cả thiết bị thành công.'], 200);
    }
}
