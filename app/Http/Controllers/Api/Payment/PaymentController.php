<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    use ApiResponse;

    public function checkout(): JsonResponse
    {
        return $this->notImplemented();
    }

    public function callback(): JsonResponse
    {
        return $this->notImplemented();
    }
}
