<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\AbstractPaginator;

trait ApiResponse
{
    protected function success($data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function paginated($paginatorOrResource, string $message = 'OK', int $status = 200): JsonResponse
    {
        [$data, $meta] = $this->extractPaginatedDataAndMeta($paginatorOrResource);

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
        ], $status);
    }

    protected function error(string $message, $errors = null, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    protected function notImplemented(): JsonResponse
    {
        return $this->error('Feature not implemented', null, 501);
    }

    private function extractPaginatedDataAndMeta($source): array
    {
        if ($source instanceof JsonResource) {
            $resolved = $source->response()->getData(true);
            $data = $resolved['data'] ?? [];
            $resolvedMeta = $resolved['meta'] ?? [];

            return [$data, $this->normalizeMeta($resolvedMeta)];
        }

        if ($source instanceof AbstractPaginator) {
            return [
                $source->items(),
                $this->normalizeMeta([
                    'current_page' => $source->currentPage(),
                    'per_page' => $source->perPage(),
                    'total' => method_exists($source, 'total') ? $source->total() : null,
                    'last_page' => method_exists($source, 'lastPage') ? $source->lastPage() : null,
                ]),
            ];
        }

        if (is_array($source)) {
            $data = $source['data'] ?? $source;
            $meta = $source['meta'] ?? [];

            return [$data, $this->normalizeMeta($meta)];
        }

        return [[], $this->normalizeMeta([])];
    }

    private function normalizeMeta(array $meta): array
    {
        return [
            'current_page' => array_key_exists('current_page', $meta) ? (int) $meta['current_page'] : 1,
            'per_page' => array_key_exists('per_page', $meta) ? (int) $meta['per_page'] : 0,
            'total' => array_key_exists('total', $meta) && $meta['total'] !== null ? (int) $meta['total'] : 0,
            'last_page' => array_key_exists('last_page', $meta) && $meta['last_page'] !== null ? (int) $meta['last_page'] : 1,
        ];
    }
}
