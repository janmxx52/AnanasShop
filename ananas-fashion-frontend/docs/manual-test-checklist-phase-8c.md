# Checklist kiểm thử thủ công Frontend — Giai đoạn 8C (Admin Biến thể + Ảnh sản phẩm)

## Điều kiện trước khi test
- Backend API đang chạy.
- Frontend app đang chạy.
- Có tài khoản admin hợp lệ.
- Đã có ít nhất một sản phẩm để vào trang quản lý.

## 1) Chặn truy cập theo quyền
- Guest truy cập `/admin/products/{productId}/manage`.
  - Kỳ vọng: bị chuyển hướng về `/login`.
- Customer truy cập route trên.
  - Kỳ vọng: không vào được khu vực admin (bị chặn theo `AdminRoute`).
- Admin truy cập route trên.
  - Kỳ vọng: vào trang thành công.

## 2) Mở trang quản lý từ danh sách sản phẩm
- Vào `/admin/products`.
- Bấm nút **Quản lý biến thể/ảnh** ở một sản phẩm.
- Kỳ vọng:
  - Điều hướng tới `/admin/products/{productId}/manage`.
  - Hiển thị đúng thông tin tóm tắt sản phẩm (tên, slug, trạng thái, danh mục, thương hiệu).

## 3) Quản lý biến thể — tạo mới
- Nhập hợp lệ các trường:
  - `size`, `color`, `stock >= 0`
  - `sku`, `color_hex`, `price_adjustment` (tùy chọn)
- Bấm **Tạo biến thể**.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Dòng biến thể mới xuất hiện trong bảng.

## 4) Quản lý biến thể — cập nhật
- Bấm **Sửa** một biến thể.
- Thay đổi `stock` hoặc `price_adjustment`, bấm **Lưu biến thể**.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Dữ liệu bảng được cập nhật đúng.

## 5) Quản lý biến thể — xóa
- Bấm **Xóa** tại một biến thể.
- Kỳ vọng:
  - Có hộp xác nhận trước khi xóa.
  - Xác nhận thì xóa thành công, có toast.
  - Hủy thì không xóa.

## 6) Lỗi trùng biến thể size/color
- Tạo thêm biến thể có cùng `size + color` với biến thể đã có của cùng sản phẩm.
- Kỳ vọng:
  - Backend trả lỗi `422`.
  - UI hiển thị thông báo lỗi phù hợp.

## 7) Validation tồn kho
- Nhập `stock < 0` rồi submit.
- Kỳ vọng:
  - UI/backend chặn tạo hoặc cập nhật.
  - Hiển thị lỗi validation.

## 8) Quản lý ảnh — tải ảnh
- Chọn file ảnh hợp lệ (`jpg`, `jpeg`, `png`, `webp`) và bấm **Tải ảnh lên**.
- Kỳ vọng:
  - Upload thành công.
  - Ảnh xuất hiện trong danh sách với preview.

## 9) Quản lý ảnh — đặt ảnh đại diện
- Với một ảnh chưa là primary, bấm **Đặt làm đại diện**.
- Kỳ vọng:
  - Toast thành công.
  - Ảnh đó hiển thị badge **Ảnh đại diện**.
  - Ảnh primary trước đó (nếu có) không còn là primary.

## 10) Quản lý ảnh — xóa ảnh
- Bấm **Xóa** tại một ảnh.
- Kỳ vọng:
  - Có hộp xác nhận.
  - Xác nhận thì ảnh bị xóa khỏi danh sách.

## 11) Giới hạn tối đa 10 ảnh
- Upload ảnh thứ 11 cho cùng sản phẩm.
- Kỳ vọng:
  - Backend trả lỗi `422` (max images).
  - UI hiển thị lỗi rõ ràng, không crash.

## 12) Trạng thái loading/disable
- Khi submit form biến thể hoặc upload ảnh, kiểm tra nút tương ứng.
- Kỳ vọng:
  - Nút hiển thị loading/disabled để tránh bấm lặp.
