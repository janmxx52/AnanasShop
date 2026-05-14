<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderLookupRequest;
use App\Http\Resources\Order\OrderLookupResource;
use App\Services\Order\OrderLookupService;

class OrderLookupController extends Controller
{
    public function store(OrderLookupRequest $request, OrderLookupService $orderLookupService)
    {
        $order = $orderLookupService->lookup($request->validated());

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => (new OrderLookupResource($order))->resolve(),
        ]);
    }
}

