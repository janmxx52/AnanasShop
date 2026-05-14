<?php

namespace App\Http\Controllers\Api\Voucher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Voucher\VoucherService;
use Illuminate\Validation\ValidationException;

class VoucherController extends Controller
{
    public function check(Request $request, VoucherService $service)
    {
        $request->validate(['code' => ['required', 'string']]);
        try {
            $result = $service->checkVoucherByCode($request, $request->input('code'));
            return response()->json(['success' => true, 'data' => [
                'code' => $result['voucher']->code,
                'type' => $result['voucher']->type,
                'value' => $result['voucher']->value,
                'subtotal' => $result['subtotal'],
                'discount' => $result['discount'],
                'total_after' => $result['total_after'],
            ]]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Invalid voucher', 'errors' => $e->errors()], 422);
        }
    }

    public function apply(Request $request)
    {
        return response()->json(['success' => false, 'message' => 'Not implemented'], 501);
    }
}
