# Checklist kiểm thử thủ công Frontend — Giai đoạn 8D (Admin Voucher + Order Management)

## Điều kiện trước khi test
- Backend API đang chạy.
- Frontend app đang chạy.
- Có 3 trạng thái người dùng:
  - Guest (chưa đăng nhập)
  - Customer
  - Admin

## 1) Chặn truy cập admin routes
- Guest truy cập:
  - `/admin/vouchers`
  - `/admin/orders`
  - `/admin/orders/{orderCode}`
  - Kỳ vọng: bị chuyển hướng về `/login`.

- Customer truy cập các route trên.
  - Kỳ vọng: không vào được khu vực admin (bị chặn bởi `AdminRoute`).

- Admin truy cập các route trên.
  - Kỳ vọng: truy cập thành công.

## 2) Voucher — danh sách
- Đăng nhập admin, mở `/admin/vouchers`.
- Kỳ vọng:
  - Hiển thị bảng voucher.
  - Có loading/error/empty state đúng.
  - Phân trang hoạt động khi có nhiều voucher.

## 3) Voucher — tạo mới
- Tạo voucher hợp lệ với các trường:
  - `code`, `type`, `value`,
  - optional: `max_discount`, `min_order_amount`, `usage_limit`, `usage_per_user`, `starts_at`, `expires_at`, `is_active`.
- Kỳ vọng:
  - Toast thành công.
  - Voucher mới xuất hiện trong bảng.

## 4) Voucher — cập nhật
- Bấm **Sửa** một voucher.
- Đổi giá trị và lưu.
- Kỳ vọng:
  - Toast thành công.
  - Dữ liệu cập nhật đúng trong bảng.

## 5) Voucher — vô hiệu hóa
- Bấm **Vô hiệu hóa** một voucher.
- Kỳ vọng:
  - Có hộp xác nhận.
  - Xác nhận thì voucher đổi trạng thái `is_active = false`.
  - Có toast thành công.

## 6) Voucher validation error
- Thử các trường hợp:
  - `code` rỗng
  - `value <= 0`
  - `type = percent` nhưng `value > 100`
  - `min_order_amount < 0`
- Kỳ vọng:
  - UI chặn submit hoặc backend trả `422`.
  - Có thông báo lỗi phù hợp.

## 7) Orders — danh sách
- Mở `/admin/orders`.
- Kỳ vọng:
  - Hiển thị bảng đơn hàng với các cột chính:
    - order_code, customer_name, total, status, payment_status, payment_method, created_at
  - Có loading/error/empty state.
  - Có phân trang.

## 8) Orders — chi tiết
- Từ danh sách, bấm **Xem chi tiết**.
- Kỳ vọng:
  - Mở `/admin/orders/{orderCode}`.
  - Hiển thị thông tin đơn, bảng order items, timeline trạng thái.

## 9) Orders — cập nhật trạng thái
- Trên trang chi tiết, chọn trạng thái hợp lệ theo flow backend và bấm cập nhật.
- Kỳ vọng:
  - Cập nhật thành công.
  - Trang tự refetch và hiển thị trạng thái mới.
  - Toast thành công.

## 10) Orders — hủy đơn
- Với đơn ở trạng thái cho phép hủy, bấm **Hủy đơn hàng**.
- Kỳ vọng:
  - Có hộp xác nhận.
  - Hủy thành công thì trạng thái đơn thành `cancelled`.
  - Trang refetch và hiển thị dữ liệu mới.

## 11) Payment status COD khi delivered
- Lấy đơn COD ở trạng thái `shipping`.
- Cập nhật trạng thái sang `delivered`.
- Kỳ vọng:
  - Backend trả `payment_status = paid`.
  - UI hiển thị badge thanh toán đã cập nhật đúng.
