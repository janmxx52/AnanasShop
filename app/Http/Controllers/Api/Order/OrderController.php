<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderStoreRequest;
use App\Http\Resources\Order\OrderResource;
use App\Services\Order\OrderManagementService;
use App\Services\Order\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request, OrderManagementService $orderManagementService)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $orders = $orderManagementService->listCustomerOrders($user, $perPage);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders)->resolve(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
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

    public function show(Request $request, string $order_code, OrderManagementService $orderManagementService)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $order = $orderManagementService->showCustomerOrder($user, $order_code);

        return response()->json([
            'success' => true,
            'data' => (new OrderResource($order))->resolve(),
        ]);
    }

    public function cancel(Request $request, string $order_code, OrderManagementService $orderManagementService)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $order = $orderManagementService->cancelCustomerOrder($user, $order_code);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled',
            'data' => (new OrderResource($order))->resolve(),
        ]);
    }
}
