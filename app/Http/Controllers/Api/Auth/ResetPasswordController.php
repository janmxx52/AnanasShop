<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ResetPasswordController extends Controller
{
    use ApiResponse;

    public function reset(): JsonResponse
    {
        return $this->notImplemented();
    }
}
