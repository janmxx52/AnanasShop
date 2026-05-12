<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'token' => $this->resource['token'] ?? null,
            'expires_at' => isset($this->resource['expires_at']) ? $this->resource['expires_at']->toDateTimeString() : null,
            'user' => isset($this->resource['user']) ? new UserResource($this->resource['user']) : null,
        ];
    }
}
