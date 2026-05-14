<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderStoreRequest;
use App\Http\Resources\Order\OrderResource;
use App\Services\Order\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(['success' => false, 'message' => 'Not implemented'], 501);
    }

    public function store(OrderStoreRequest $request, OrderService $orderService)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $order = $orderService->checkoutUser($request, $user, $request->validated());

        return response()->json([
            'success' => true,
            'data' => (new OrderResource($order->load(['items', 'voucher'])))->resolve(),
        ], 201);
    }

    public function show(string $code)
    {
        return response()->json(['success' => false, 'message' => 'Not implemented'], 501);
    }

    public function cancel(Request $request, string $code)
    {
        return response()->json(['success' => false, 'message' => 'Not implemented'], 501);
    }
}
