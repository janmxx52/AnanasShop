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

        return $this->paginated(VoucherResource::collection($q->paginate($perPage)), 'Lấy danh sách mã giảm giá thành công.');
    }

    public function store(VoucherStoreRequest $request)
    {
        $data = $request->validated();
        $voucher = Voucher::create($data);

        return $this->success((new VoucherResource($voucher))->resolve(), 'Tạo mã giảm giá thành công.', 201);
    }

    public function show(Voucher $voucher)
    {
        return $this->success((new VoucherResource($voucher))->resolve(), 'Lấy thông tin mã giảm giá thành công.');
    }

    public function update(VoucherUpdateRequest $request, Voucher $voucher)
    {
        $voucher->update($request->validated());

        return $this->success((new VoucherResource($voucher))->resolve(), 'Cập nhật mã giảm giá thành công.');
    }

    public function destroy(Voucher $voucher)
    {
        // soft-disable
        $voucher->update(['is_active' => 0]);

        return $this->success(null, 'Ngừng kích hoạt mã giảm giá thành công.');
    }
}
