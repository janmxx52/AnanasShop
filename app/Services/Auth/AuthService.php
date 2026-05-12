<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class AuthService
{
    public function __construct(private UserRepositoryInterface $users, private ?CloudinaryService $cloudinary = null)
    {
    }

    public function register(array $data, ?string $deviceName = null): array
    {
        $user = $this->users->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'] ?? 'customer',
        ]);

        $tokenResult = $user->createToken($deviceName ?? 'api');
        $accessToken = $tokenResult->accessToken;

        // Set expires_at if the column exists
        $expiresAt = Carbon::now()->addDays(30);
        if (Schema::hasColumn('personal_access_tokens', 'expires_at') && $accessToken) {
            $accessToken->expires_at = $expiresAt;
            $accessToken->save();
        }

        return [
            'user' => $user,
            'token' => $tokenResult->plainTextToken,
            'expires_at' => $expiresAt,
        ];
    }

    public function login(string $email, string $password, ?string $deviceName = null): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            return [];
        }

        if ($user->is_banned) {
            return [];
        }

        $tokenResult = $user->createToken($deviceName ?? 'api');
        $accessToken = $tokenResult->accessToken;

        $expiresAt = Carbon::now()->addDays(30);
        if (Schema::hasColumn('personal_access_tokens', 'expires_at') && $accessToken) {
            $accessToken->expires_at = $expiresAt;
            $accessToken->save();
        }

        $user->last_login_at = Carbon::now();
        $user->save();

        return [
            'user' => $user,
            'token' => $tokenResult->plainTextToken,
            'expires_at' => $expiresAt,
        ];
    }

    public function logoutCurrent(User $user): void
    {
        $this->users->revokeCurrentToken($user);
    }

    public function logoutAll(User $user): void
    {
        $this->users->revokeAllTokens($user);
    }

    public function updateProfile(User $user, array $data): User
    {
        $update = [];
        if (isset($data['name'])) {
            $update['name'] = $data['name'];
        }
        if (array_key_exists('phone', $data)) {
            $update['phone'] = $data['phone'];
        }

        // Handle avatar upload if file provided and Cloudinary service available
        if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile && $this->cloudinary) {
            // delete previous if exists
            if (! empty($user->avatar_public_id)) {
                $this->cloudinary->delete($user->avatar_public_id);
            }

            $res = $this->cloudinary->upload($data['avatar']);
            $update['avatar'] = $res['url'] ?? $user->avatar;
            if (array_key_exists('public_id', $res)) {
                $update['avatar_public_id'] = $res['public_id'];
            }
        } elseif (isset($data['avatar']) && is_string($data['avatar'])) {
            $update['avatar'] = $data['avatar'];
        }

        return $this->users->update($user, $update);
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword, ?int $currentTokenId = null): bool
    {
        if (! Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->password = Hash::make($newPassword);
        $user->password_changed_at = Carbon::now();
        $user->save();

        // Revoke other tokens except current (if provided)
        if ($currentTokenId) {
            \Laravel\Sanctum\PersonalAccessToken::where('tokenable_type', get_class($user))
                ->where('tokenable_id', $user->getKey())
                ->where('id', '!=', $currentTokenId)
                ->delete();
        } else {
            \Laravel\Sanctum\PersonalAccessToken::where('tokenable_type', get_class($user))
                ->where('tokenable_id', $user->getKey())
                ->delete();
        }

        return true;
    }
}
