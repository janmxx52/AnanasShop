<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_and_login_flow()
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
            'device_name' => 'phpunit',
        ];

        $resp = $this->postJson('/api/auth/register', $payload);
        $resp->assertStatus(201)->assertJsonStructure(['success', 'data' => ['token', 'expires_at', 'user']]);

        $login = $this->postJson('/api/auth/login', ['email' => 'test@example.com', 'password' => 'Password1']);
        $login->assertStatus(200)->assertJsonStructure(['success', 'data' => ['token', 'expires_at', 'user']]);
    }

    public function test_banned_user_cannot_login()
    {
        $user = User::factory()->create(['email' => 'banned@example.com', 'password' => bcrypt('Password1'), 'is_banned' => true]);

        $resp = $this->postJson('/api/auth/login', ['email' => 'banned@example.com', 'password' => 'Password1']);
        $resp->assertStatus(401);
    }

    public function test_logout_revokes_token()
    {
        $user = User::factory()->create(['email' => 'logout@example.com', 'password' => bcrypt('Password1')]);
        $login = $this->postJson('/api/auth/login', ['email' => 'logout@example.com', 'password' => 'Password1']);
        $token = $login->json('data.token');

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $resp->assertStatus(200);

        $resp2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $resp2->assertStatus(401);
    }

    public function test_logout_all_revokes_all_tokens()
    {
        $user = User::factory()->create(['email' => 'all@example.com', 'password' => bcrypt('Password1')]);
        $t1 = $user->createToken('d1')->plainTextToken;
        $t2 = $user->createToken('d2')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $t1)->postJson('/api/auth/logout-all')->assertStatus(200);

        $this->withHeader('Authorization', 'Bearer ' . $t1)->getJson('/api/auth/me')->assertStatus(401);
        $this->withHeader('Authorization', 'Bearer ' . $t2)->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_update_profile_upload_avatar_uses_cloudinary()
    {
        Storage::fake('public');

        $user = User::factory()->create(['email' => 'avatar@example.com', 'password' => bcrypt('Password1')]);
        $login = $this->postJson('/api/auth/login', ['email' => 'avatar@example.com', 'password' => 'Password1']);
        $token = $login->json('data.token');

        // Bind a fake Cloudinary service (must be instance of CloudinaryService)
        $this->app->instance(CloudinaryService::class, new class extends CloudinaryService {
            public function upload(\Illuminate\Http\UploadedFile $file): array {
                return ['url' => 'https://res.cloudinary.com/fake/image/upload/v1/avatar.jpg', 'public_id' => 'fake-id'];
            }
            public function delete(?string $id): bool { return true; }
        });

        $file = UploadedFile::fake()->create('avatar.jpg', 100);

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->put('/api/auth/me', ['name' => 'New Name', 'avatar' => $file]);

        $resp->assertStatus(200)->assertJsonPath('data.avatar', 'https://res.cloudinary.com/fake/image/upload/v1/avatar.jpg');
    }

    public function test_change_password_revokes_other_tokens()
    {
        $user = User::factory()->create(['email' => 'cp@example.com', 'password' => bcrypt('Oldpass1')]);
        $token1 = $user->createToken('d1')->plainTextToken;
        $token2 = $user->createToken('d2')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->putJson('/api/auth/me/password', [
                'current_password' => 'Oldpass1',
                'password' => 'NewPass1',
                'password_confirmation' => 'NewPass1',
            ])->assertStatus(200);

        // token2 should be revoked
        $this->withHeader('Authorization', 'Bearer ' . $token2)
            ->getJson('/api/auth/me')
            ->assertStatus(401);

        // token1 should still be valid
        $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->getJson('/api/auth/me')
            ->assertStatus(200);
    }
}
