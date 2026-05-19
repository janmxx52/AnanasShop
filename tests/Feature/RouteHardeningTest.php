<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class RouteHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_routes_are_not_duplicated_from_web_routes(): void
    {
        $routes = collect(app('router')->getRoutes());

        $loginRoutes = $routes->filter(function ($route) {
            return $route->uri() === 'api/auth/login'
                && in_array('POST', $route->methods(), true);
        });

        $productsRoutes = $routes->filter(function ($route) {
            return $route->uri() === 'api/products'
                && in_array('GET', $route->methods(), true);
        });

        $this->assertCount(1, $loginRoutes);
        $this->assertCount(1, $productsRoutes);
    }

    public function test_out_of_scope_public_endpoints_return_501_json(): void
    {
        $cases = [
            ['GET', '/api/categories', []],
            ['GET', '/api/categories/ao-thun', []],
            ['GET', '/api/brands', []],
            ['GET', '/api/brands/ananas', []],
            ['GET', '/api/products/demo/comments', []],
            ['POST', '/api/auth/forgot-password', ['email' => 'demo@example.com']],
            ['POST', '/api/auth/reset-password', ['email' => 'demo@example.com', 'token' => 'x', 'password' => 'Password1']],
            ['GET', '/api/payments/callback', []],
            ['POST', '/api/payments/callback', []],
        ];

        foreach ($cases as [$method, $uri, $payload]) {
            $this->json($method, $uri, $payload)
                ->assertStatus(501)
                ->assertExactJson([
                    'success' => false,
                    'message' => 'Chức năng này chưa được hỗ trợ.',
                    'errors' => null,
                ]);
        }
    }

    public function test_out_of_scope_protected_endpoints_return_501_json_after_authentication(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $cases = [
            ['POST', '/api/payments/checkout', []],
            ['GET', '/api/addresses', []],
            ['POST', '/api/addresses', []],
            ['GET', '/api/addresses/1', []],
            ['PUT', '/api/addresses/1', []],
            ['DELETE', '/api/addresses/1', []],
            ['PUT', '/api/addresses/1/default', []],
            ['POST', '/api/products/demo/comments', ['comment' => 'test']],
            ['DELETE', '/api/comments/1', []],
        ];

        foreach ($cases as [$method, $uri, $payload]) {
            $this->json($method, $uri, $payload)
                ->assertStatus(501)
                ->assertExactJson([
                    'success' => false,
                    'message' => 'Chức năng này chưa được hỗ trợ.',
                    'errors' => null,
                ]);
        }
    }

    public function test_out_of_scope_admin_endpoints_return_501_json_for_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $cases = [
            ['GET', '/api/admin/dashboard/revenue', []],
        ];

        foreach ($cases as [$method, $uri, $payload]) {
            $this->json($method, $uri, $payload)
                ->assertStatus(501)
                ->assertExactJson([
                    'success' => false,
                    'message' => 'Chức năng này chưa được hỗ trợ.',
                    'errors' => null,
                ]);
        }
    }

    public function test_route_list_command_runs_successfully(): void
    {
        $exitCode = Artisan::call('route:list');

        $this->assertSame(0, $exitCode);
    }
}
