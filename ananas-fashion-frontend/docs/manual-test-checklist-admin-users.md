# Checklist kiểm thử thủ công Frontend — Admin Users

## Điều kiện trước khi test
- Backend API đang chạy và có dữ liệu mẫu.
- Frontend app đang chạy.
- Có tối thiểu 3 tài khoản:
  - Guest (chưa đăng nhập)
  - Customer
  - Admin
- Có ít nhất 1 user đã có order để kiểm tra rule không cho xóa.

## 1) Chặn truy cập trái quyền
- Guest vào `/admin/users` → kỳ vọng bị chuyển về `/login`.
- Customer vào `/admin/users` → kỳ vọng bị chặn bởi `AdminRoute`.
- Admin vào `/admin/users` → kỳ vọng truy cập thành công.

## 2) Danh sách người dùng
- Mở `/admin/users`.
- Kỳ vọng:
  - Hiển thị danh sách users.
  - Có loading/error/empty state đúng.
  - Bảng responsive, mobile có cuộn ngang.

## 3) Tạo user mới
- Tạo user với đầy đủ field hợp lệ: `name`, `email`, `password`, `phone`, `role`, `is_banned`.
- Kỳ vọng:
  - Toast thành công.
  - User mới xuất hiện trong danh sách.

## 4) Validation khi tạo user
- Để trống `name`, `email`, `password` hoặc nhập email trùng.
- Kỳ vọng:
  - Hiển thị lỗi validation phù hợp.
  - Không tạo user mới.

## 5) Cập nhật user
- Chọn một user bất kỳ, bấm **Sửa**.
- Đổi `name/phone/role/is_banned` và lưu.
- Kỳ vọng:
  - Toast thành công.
  - Dữ liệu cập nhật đúng trong bảng.

## 6) Khóa user khác
- Chọn user khác admin hiện tại, bấm **Khóa** và xác nhận.
- Kỳ vọng:
  - User chuyển trạng thái **Đã khóa**.
  - Có toast thành công.

## 7) Mở khóa user
- Chọn user đang bị khóa, bấm **Mở khóa** và xác nhận.
- Kỳ vọng:
  - User chuyển trạng thái **Hoạt động**.
  - Có toast thành công.

## 8) Admin không thể tự ban
- Với chính tài khoản admin đang đăng nhập:
  - Nút **Khóa** bị disable hoặc bị ẩn.
  - Trong form edit, không thể bật `Khóa tài khoản`.
- Kỳ vọng:
  - Không thực hiện được self-ban trên UI.
  - Nếu backend trả lỗi thì UI hiển thị đúng thông báo.

## 9) Admin không thể tự xóa
- Với chính tài khoản admin đang đăng nhập:
  - Nút **Xóa** bị disable hoặc bị ẩn.
- Kỳ vọng:
  - Không thực hiện được self-delete trên UI.

## 10) Admin không thể tự hạ role
- Vào sửa chính tài khoản admin.
- Kỳ vọng:
  - Không thể đổi role từ `admin` sang `customer`.
  - Nếu cố submit, UI báo lỗi phù hợp.

## 11) Xóa user có order
- Chọn user đã có order, bấm **Xóa**.
- Kỳ vọng:
  - Hiển thị lỗi: “Không thể xóa người dùng đã có đơn hàng. Bạn có thể khóa tài khoản này.”
  - User vẫn còn trong danh sách.

## 12) Regression: user bị khóa không đăng nhập được
- Khóa một user customer.
- Đăng xuất admin, đăng nhập bằng user vừa khóa.
- Kỳ vọng:
  - Login thất bại theo business rule `is_banned=1`.
