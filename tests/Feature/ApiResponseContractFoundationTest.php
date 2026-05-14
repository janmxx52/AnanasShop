<?php

namespace Tests\Feature;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Tests\TestCase;

class ApiResponseContractFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_not_implemented_returns_501_with_error_envelope(): void
    {
        $this->getJson('/api/categories')
            ->assertStatus(501)
            ->assertExactJson([
                'success' => false,
                'message' => 'Feature not implemented',
                'errors' => null,
            ]);
    }

    public function test_success_helper_returns_standard_envelope(): void
    {
        $controller = new class extends Controller
        {
            use ApiResponse;

            public function respond()
            {
                return $this->success(['id' => 1], 'Created', 201);
            }
        };

        $response = $controller->respond();

        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame([
            'success' => true,
            'message' => 'Created',
            'data' => ['id' => 1],
        ], $response->getData(true));
    }

    public function test_error_helper_returns_standard_envelope(): void
    {
        $controller = new class extends Controller
        {
            use ApiResponse;

            public function respond()
            {
                return $this->error('Validation failed', ['field' => ['Required']], 422);
            }
        };

        $response = $controller->respond();

        $this->assertSame(422, $response->getStatusCode());
        $this->assertSame([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => ['field' => ['Required']],
        ], $response->getData(true));
    }

    public function test_paginated_helper_returns_data_and_meta_shape(): void
    {
        $controller = new class extends Controller
        {
            use ApiResponse;

            public function respond(LengthAwarePaginator $paginator)
            {
                return $this->paginated($paginator, 'Fetched');
            }
        };

        $paginator = new LengthAwarePaginator(
            items: [['id' => 1], ['id' => 2]],
            total: 10,
            perPage: 2,
            currentPage: 2
        );

        $response = $controller->respond($paginator);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame([
            'success' => true,
            'message' => 'Fetched',
            'data' => [
                ['id' => 1],
                ['id' => 2],
            ],
            'meta' => [
                'current_page' => 2,
                'per_page' => 2,
                'total' => 10,
                'last_page' => 5,
            ],
        ], $response->getData(true));
    }
}
