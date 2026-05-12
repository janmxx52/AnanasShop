<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->fill($data);
        $user->save();

        return $user;
    }

    public function revokeAllTokens(User $user): void
    {
        \Laravel\Sanctum\PersonalAccessToken::where('tokenable_type', get_class($user))
            ->where('tokenable_id', $user->getKey())
            ->delete();
    }

    public function revokeCurrentToken(User $user): void
    {
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
            return;
        }

        // Fallback: try to delete by token present in request header
        try {
            $request = app('request');
            $bearer = $request->bearerToken();
            if ($bearer) {
                $parts = explode('|', $bearer);
                $plain = end($parts);
                $hash = hash('sha256', $plain);
                \Laravel\Sanctum\PersonalAccessToken::where('token', $hash)->delete();
            }
        } catch (\Throwable $e) {
            // ignore fallback errors
        }
    }
}
