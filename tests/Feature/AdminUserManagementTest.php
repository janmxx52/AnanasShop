<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_user_routes(): void
    {
        $target = User::factory()->create();

        $this->getJson('/api/admin/users')->assertStatus(401);
        $this->getJson("/api/admin/users/{$target->id}")->assertStatus(401);
        $this->postJson('/api/admin/users', [])->assertStatus(401);
        $this->putJson("/api/admin/users/{$target->id}", ['name' => 'Nope'])->assertStatus(401);
        $this->patchJson("/api/admin/users/{$target->id}/ban")->assertStatus(401);
        $this->patchJson("/api/admin/users/{$target->id}/unban")->assertStatus(401);
        $this->deleteJson("/api/admin/users/{$target->id}")->assertStatus(401);
    }

    public function test_customer_cannot_access_admin_user_routes(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $target = User::factory()->create();

        $this->actingAs($customer, 'sanctum');

        $this->getJson('/api/admin/users')->assertStatus(403);
        $this->patchJson("/api/admin/users/{$target->id}/ban")->assertStatus(403);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(3)->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'message', 'data', 'meta'])
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.remember_token')
            ->assertJsonMissingPath('data.0.tokens');
    }

    public function test_admin_can_show_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['phone' => '0900000000', 'role' => 'customer', 'is_banned' => false]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->getJson("/api/admin/users/{$target->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $target->id)
            ->assertJsonPath('data.email', $target->email)
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token')
            ->assertJsonMissingPath('data.tokens');
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson('/api/admin/users', [
            'name' => 'Created User',
            'email' => 'created-user@example.com',
            'password' => 'Password1',
            'phone' => '0911111111',
            'role' => 'customer',
            'is_banned' => false,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'created-user@example.com')
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');

        $this->assertDatabaseHas('users', [
            'email' => 'created-user@example.com',
            'role' => 'customer',
            'is_banned' => 0,
        ]);
    }

    public function test_create_user_duplicate_email_returns_422(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['email' => 'dup@example.com']);

        $this->actingAs($admin, 'sanctum');

        $this->postJson('/api/admin/users', [
            'name' => 'Duplicate',
            'email' => 'dup@example.com',
            'password' => 'Password1',
            'role' => 'customer',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'customer', 'is_banned' => false]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name' => 'Updated Name',
            'phone' => '0922222222',
            'role' => 'admin',
            'is_banned' => false,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'Updated Name',
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_ban_other_user_successfully(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'customer', 'is_banned' => false]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/admin/users/{$target->id}/ban");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_banned', true);

        $this->assertDatabaseHas('users', ['id' => $target->id, 'is_banned' => 1]);
    }

    public function test_ban_user_revokes_all_tokens(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['is_banned' => false]);
        $target->createToken('device-1');
        $target->createToken('device-2');

        $this->assertCount(2, $target->tokens);

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/users/{$target->id}/ban")->assertStatus(200);

        $target->refresh();
        $this->assertTrue((bool) $target->is_banned);
        $this->assertSame(0, $target->tokens()->count());
    }

    public function test_admin_can_unban_other_user_successfully(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['is_banned' => true]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/admin/users/{$target->id}/unban");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_banned', false);

        $this->assertDatabaseHas('users', ['id' => $target->id, 'is_banned' => 0]);
    }

    public function test_admin_cannot_ban_self(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/users/{$admin->id}/ban")
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['user']);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $this->deleteJson("/api/admin/users/{$admin->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['user']);
    }

    public function test_admin_cannot_downgrade_own_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $this->putJson("/api/admin/users/{$admin->id}", [
            'role' => 'customer',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_admin_delete_user_without_orders_soft_deletes_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create();

        $this->actingAs($admin, 'sanctum');

        $this->deleteJson("/api/admin/users/{$target->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_admin_delete_user_with_orders_is_blocked(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create();
        $this->createOrderForUser($target);

        $this->actingAs($admin, 'sanctum');

        $this->deleteJson("/api/admin/users/{$target->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['user']);

        $this->assertDatabaseHas('users', ['id' => $target->id, 'deleted_at' => null]);
    }

    public function test_banned_user_cannot_login_regression_still_passes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create([
            'email' => 'blocked-login@example.com',
            'password' => bcrypt('Password1'),
            'is_banned' => false,
        ]);

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/admin/users/{$target->id}/ban")->assertStatus(200);

        $this->postJson('/api/auth/login', [
            'email' => 'blocked-login@example.com',
            'password' => 'Password1',
        ])->assertStatus(401);
    }

    private function createOrderForUser(User $user): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'guest_name' => null,
            'guest_email' => null,
            'voucher_id' => null,
            'code' => 'TEST-ORDER-' . $user->id,
            'status' => 'pending',
            'subtotal' => 100000,
            'discount_amount' => 0,
            'shipping_fee' => 30000,
            'total' => 130000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_name' => 'Order User',
            'shipping_phone' => '0900000000',
            'shipping_address' => '123 Order Street',
            'note' => null,
        ]);
    }
}

