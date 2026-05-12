<?php

namespace App\Services\Cloudinary;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class CloudinaryService
{
    /**
     * Upload a file to Cloudinary (or fallback to local storage).
     * Returns ['url' => string, 'public_id' => ?string]
     */
    public function upload(UploadedFile $file): array
    {
        try {
            if (class_exists('\\Cloudinary\\Uploader')) {
                $path = $file->getPathname();
                $result = \Cloudinary\Uploader::upload($path, ['folder' => 'ananas/avatars']);
                return [
                    'url' => $result['secure_url'] ?? $result['url'] ?? null,
                    'public_id' => $result['public_id'] ?? null,
                ];
            }
        } catch (\Throwable $e) {
            Log::warning('Cloudinary upload failed: ' . $e->getMessage());
        }

        // Fallback: store in local 'public' disk
        $stored = $file->store('public/avatars');
        return [
            'url' => Storage::url($stored),
            'public_id' => null,
        ];
    }

    /**
     * Delete by public id (if available).
     */
    public function delete(?string $publicId): bool
    {
        if (empty($publicId)) {
            return false;
        }

        try {
            if (class_exists('\\Cloudinary\\Uploader')) {
                \Cloudinary\Uploader::destroy($publicId);
                return true;
            }
        } catch (\Throwable $e) {
            Log::warning('Cloudinary delete failed: ' . $e->getMessage());
        }

        return false;
    }
}
