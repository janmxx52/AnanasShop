<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\GuestCheckoutRequest;
use App\Http\Resources\Order\OrderResource;
use App\Services\Order\OrderService;

class GuestCheckoutController extends Controller
{
    public function store(GuestCheckoutRequest $request, OrderService $orderService)
    {
        $order = $orderService->checkoutGuest($request, $request->validated());

        return response()->json([
            'success' => true,
            'data' => (new OrderResource($order->load(['items', 'voucher'])))->resolve(),
        ], 201);
    }
}
