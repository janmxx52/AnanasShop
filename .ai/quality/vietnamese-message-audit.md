# Vietnamese Message Audit

## Mục tiêu
- Chuẩn hóa thông báo hiển thị cho người dùng/admin sang tiếng Việt.
- Giữ nguyên business logic và API contract cốt lõi.

## Nhóm đã Việt hóa
- **Backend API response messages**
  - `app/Http/Controllers/Concerns/ApiResponse.php`
  - Các controller `Auth`, `Cart`, `Order`, `Product/Review`, `Voucher`, `User/Wishlist`, `Admin/*`
  - Các service phát sinh lỗi nghiệp vụ: `CartService`, `VoucherCalculator`, `OrderService`, `OrderManagementService`, `WishlistService`, `ReviewService`, `UserManagementService`
  - `app/Http/Middleware/EnsureUserRole.php`
  - `bootstrap/app.php` (chuẩn hóa 401/403/404 cho API)
- **Backend validation localization**
  - Thêm `lang/vi/validation.php`
  - Thêm `lang/vi/auth.php`
  - Thêm `lang/vi/passwords.php`
  - Cập nhật locale mặc định trong `config/app.php` sang `vi`
- **Frontend hiển thị lỗi/fallback**
  - `ananas-fashion-frontend/src/lib/api-helpers.ts`
  - `ananas-fashion-frontend/src/lib/display-labels.ts`
  - `ananas-fashion-frontend/src/components/ui/LoadingState.tsx`
  - `ananas-fashion-frontend/src/api/cart.api.ts` (khớp message xóa item mới)
  - `ananas-fashion-frontend/src/app/AuthContext.tsx`
  - `ananas-fashion-frontend/src/app/ToastContext.tsx`

## Test đã cập nhật theo message mới
- `tests/Feature/ApiResponseContractFoundationTest.php`
- `tests/Feature/RouteHardeningTest.php`
- `tests/Feature/CartTest.php`
- `tests/Feature/OrderLookupTest.php`

## Chủ đích giữ raw value tiếng Anh
- Enum backend/API dùng cho logic:
  - `pending`, `confirmed`, `processing`, `shipping`, `delivered`, `cancelled`, `returned`
  - `paid`, `failed`, `refunded`
  - `cod`
- Tên field API / DB / key kỹ thuật không dịch:
  - `voucher_code`, `payment_method`, `order_code`, `X-Guest-Token`, v.v.

## Cách kiểm tra lại
- Backend:
  - `php artisan test`
- Frontend:
  - `cd ananas-fashion-frontend`
  - `npm run test`
  - `npm run build`

## Kết quả kiểm tra gần nhất
- Ngày chạy: `2026-05-19`
- Backend: `php artisan test` ✅ `185 passed`
- Frontend: `npm run test` ✅ `11 files, 17 tests passed`
- Frontend build: `npm run build` ✅ thành công

## Message tiếng Anh còn giữ lại (có chủ đích)
- Chuỗi kỹ thuật để nhận diện lỗi Laravel mặc định trong frontend:
  - `The given data was invalid.`
- Lý do: chỉ dùng nội bộ để normalize về thông báo tiếng Việt cho người dùng.
