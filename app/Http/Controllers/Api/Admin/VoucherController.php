<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VoucherStoreRequest;
use App\Http\Requests\Admin\VoucherUpdateRequest;
use App\Http\Resources\Admin\VoucherResource;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $q = Voucher::query();
        $perPage = (int) $request->input('per_page', 15);
        return response()->json(['success' => true, 'data' => VoucherResource::collection($q->paginate($perPage))]);
    }

    public function store(VoucherStoreRequest $request)
    {
        $data = $request->validated();
        $voucher = Voucher::create($data);
        return response()->json(['success' => true, 'data' => new VoucherResource($voucher)], 201);
    }

    public function show(Voucher $voucher)
    {
        return response()->json(['success' => true, 'data' => new VoucherResource($voucher)]);
    }

    public function update(VoucherUpdateRequest $request, Voucher $voucher)
    {
        $voucher->update($request->validated());
        return response()->json(['success' => true, 'data' => new VoucherResource($voucher)]);
    }

    public function destroy(Voucher $voucher)
    {
        // soft-disable
        $voucher->update(['is_active' => 0]);
        return response()->json(['success' => true], 204);
    }
}
