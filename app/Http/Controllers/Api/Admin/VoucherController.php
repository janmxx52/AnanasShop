<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VoucherStoreRequest;
use App\Http\Requests\Admin\VoucherUpdateRequest;
use App\Http\Resources\Admin\VoucherResource;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $q = Voucher::query();
        $perPage = (int) $request->input('per_page', 15);

        return $this->paginated(VoucherResource::collection($q->paginate($perPage)), 'Vouchers fetched');
    }

    public function store(VoucherStoreRequest $request)
    {
        $data = $request->validated();
        $voucher = Voucher::create($data);

        return $this->success((new VoucherResource($voucher))->resolve(), 'Voucher created', 201);
    }

    public function show(Voucher $voucher)
    {
        return $this->success((new VoucherResource($voucher))->resolve(), 'Voucher fetched');
    }

    public function update(VoucherUpdateRequest $request, Voucher $voucher)
    {
        $voucher->update($request->validated());

        return $this->success((new VoucherResource($voucher))->resolve(), 'Voucher updated');
    }

    public function destroy(Voucher $voucher)
    {
        // soft-disable
        $voucher->update(['is_active' => 0]);

        return $this->success(null, 'Voucher deactivated');
    }
}
