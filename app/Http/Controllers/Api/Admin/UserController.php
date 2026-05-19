<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUserIndexRequest;
use App\Http\Requests\Admin\AdminUserStoreRequest;
use App\Http\Requests\Admin\AdminUserUpdateRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Services\Admin\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use ApiResponse;

    public function index(AdminUserIndexRequest $request, UserManagementService $userManagementService): JsonResponse
    {
        $perPage = (int) $request->validated('per_page', 15);
        $users = $userManagementService->paginate($request->validated(), $perPage);

        return $this->paginated(AdminUserResource::collection($users), 'Lấy danh sách người dùng thành công.');
    }

    public function show(int $user, UserManagementService $userManagementService): JsonResponse
    {
        $target = $userManagementService->findById($user);
        if (!$target) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        return $this->success((new AdminUserResource($target))->resolve(), 'Lấy thông tin người dùng thành công.');
    }

    public function store(AdminUserStoreRequest $request, UserManagementService $userManagementService): JsonResponse
    {
        $user = $userManagementService->create($request->validated());

        return $this->success((new AdminUserResource($user))->resolve(), 'Tạo người dùng thành công.', 201);
    }

    public function update(
        AdminUserUpdateRequest $request,
        int $user,
        UserManagementService $userManagementService
    ): JsonResponse {
        $target = $userManagementService->findById($user);
        if (!$target) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        try {
            $updated = $userManagementService->update(
                $request->user(),
                $target,
                $request->validated()
            );
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        return $this->success((new AdminUserResource($updated))->resolve(), 'Cập nhật người dùng thành công.');
    }

    public function destroy(Request $request, int $user, UserManagementService $userManagementService): JsonResponse
    {
        $target = $userManagementService->findById($user);
        if (!$target) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        try {
            $userManagementService->softDelete($request->user(), $target);
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        return $this->success(null, 'Xóa người dùng thành công.');
    }

    public function ban(Request $request, int $user, UserManagementService $userManagementService): JsonResponse
    {
        $target = $userManagementService->findById($user);
        if (!$target) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        try {
            $updated = $userManagementService->ban($request->user(), $target);
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        return $this->success((new AdminUserResource($updated))->resolve(), 'Khóa tài khoản thành công.');
    }

    public function unban(int $user, UserManagementService $userManagementService): JsonResponse
    {
        $target = $userManagementService->findById($user);
        if (!$target) {
            return $this->error('Không tìm thấy dữ liệu.', null, 404);
        }

        $updated = $userManagementService->unban($target);

        return $this->success((new AdminUserResource($updated))->resolve(), 'Mở khóa tài khoản thành công.');
    }

    private function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        $errors = $exception->errors();
        $firstMessage = collect($errors)->flatten()->first() ?? 'Dữ liệu không hợp lệ.';

        return $this->error((string) $firstMessage, $errors, 422);
    }
}
