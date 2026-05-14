<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUpdateOrderStatusRequest;
use App\Http\Resources\Order\OrderResource;
use App\Services\Order\OrderManagementService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request, OrderManagementService $orderManagementService)
    {
        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $orders = $orderManagementService->listAdminOrders($perPage);

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

    public function show(string $order_code, OrderManagementService $orderManagementService)
    {
        $order = $orderManagementService->showAdminOrder($order_code);

        return response()->json([
            'success' => true,
            'data' => (new OrderResource($order))->resolve(),
        ]);
    }

    public function updateStatus(
        AdminUpdateOrderStatusRequest $request,
        string $order_code,
        OrderManagementService $orderManagementService
    ) {
        $order = $orderManagementService->updateOrderStatusByAdmin(
            $order_code,
            (string) $request->input('status')
        );

        return response()->json([
            'success' => true,
            'data' => (new OrderResource($order))->resolve(),
        ]);
    }
}
