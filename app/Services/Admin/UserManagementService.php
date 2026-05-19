<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserManagementService
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = User::query();

        if (!empty($filters['with_trashed'])) {
            $query->withTrashed();
        }

        if (!empty($filters['q'])) {
            $keyword = trim((string) $filters['q']);
            $query->where(function ($builder) use ($keyword) {
                $builder->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('phone', 'like', "%{$keyword}%");
            });
        }

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (array_key_exists('is_banned', $filters)) {
            $query->where('is_banned', (bool) $filters['is_banned']);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function findById(int $id, bool $withTrashed = true): ?User
    {
        $query = User::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    public function create(array $payload): User
    {
        return User::create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
            'phone' => $payload['phone'] ?? null,
            'role' => $payload['role'],
            'is_banned' => (bool) ($payload['is_banned'] ?? false),
        ]);
    }

    public function update(User $actor, User $target, array $payload): User
    {
        $this->assertNotSelfBan($actor, $target, $payload);
        $this->assertNotSelfDowngrade($actor, $target, $payload);

        $target->fill($payload);
        $target->save();

        if (array_key_exists('is_banned', $payload) && (bool) $payload['is_banned']) {
            $target->tokens()->delete();
        }

        return $target->refresh();
    }

    public function ban(User $actor, User $target): User
    {
        if ($actor->id === $target->id) {
            throw ValidationException::withMessages([
                'user' => 'Bạn không thể tự khóa chính tài khoản quản trị của mình.',
            ]);
        }

        if (!$target->is_banned) {
            $target->is_banned = true;
            $target->save();
        }

        $target->tokens()->delete();

        return $target->refresh();
    }

    public function unban(User $target): User
    {
        if ($target->is_banned) {
            $target->is_banned = false;
            $target->save();
        }

        return $target->refresh();
    }

    public function softDelete(User $actor, User $target): void
    {
        if ($actor->id === $target->id) {
            throw ValidationException::withMessages([
                'user' => 'Bạn không thể tự xóa chính tài khoản quản trị của mình.',
            ]);
        }

        if ($target->orders()->exists()) {
            throw ValidationException::withMessages([
                'user' => 'Không thể xóa người dùng đã có đơn hàng. Bạn có thể khóa tài khoản này.',
            ]);
        }

        $target->delete();
    }

    private function assertNotSelfBan(User $actor, User $target, array $payload): void
    {
        if (
            $actor->id === $target->id
            && array_key_exists('is_banned', $payload)
            && (bool) $payload['is_banned'] === true
        ) {
            throw ValidationException::withMessages([
                'is_banned' => 'Bạn không thể tự khóa chính tài khoản quản trị của mình.',
            ]);
        }
    }

    private function assertNotSelfDowngrade(User $actor, User $target, array $payload): void
    {
        if (
            $actor->id === $target->id
            && array_key_exists('role', $payload)
            && $actor->role === 'admin'
            && $payload['role'] !== 'admin'
        ) {
            throw ValidationException::withMessages([
                'role' => 'Bạn không thể tự hạ quyền tài khoản quản trị của mình.',
            ]);
        }
    }
}
