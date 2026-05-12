<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    private function tokenExists(Request $request): bool
    {
        $bearer = $request->bearerToken();
        if (! $bearer) {
            return true;
        }

        if (str_contains($bearer, '|')) {
            [$id] = explode('|', $bearer, 2);
            return DB::table('personal_access_tokens')->where('id', $id)->exists();
        }

        $hash = hash('sha256', $bearer);
        return DB::table('personal_access_tokens')->where('token', $hash)->exists();
    }

    public function me(Request $request): JsonResponse
    {
        if ($request->bearerToken() && ! $this->tokenExists($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $payload = ['success' => true, 'data' => new UserResource($request->user())];

        return response()->json($payload);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($request->bearerToken() && ! $this->tokenExists($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $data = $request->only(['name', 'phone']);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar');
        } elseif ($request->filled('avatar')) {
            $data['avatar'] = $request->input('avatar');
        }

        $user = $this->authService->updateProfile($user, $data);

        return response()->json(['success' => true, 'data' => new UserResource($user)]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($request->bearerToken() && ! $this->tokenExists($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $ok = $this->authService->changePassword(
            $user,
            $request->input('current_password'),
            $request->input('password'),
            $request->user()->currentAccessToken()?->id ?? null
        );

        if (! $ok) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect'], 422);
        }

        return response()->json(['success' => true, 'message' => 'Password updated']);
    }
}
