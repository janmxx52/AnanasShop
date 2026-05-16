# Checklist kiểm thử thủ công Frontend — Giai đoạn 8A (Admin Danh mục + Thương hiệu)

## Điều kiện trước khi test
- Backend API đang chạy.
- Frontend đang chạy.
- Có 3 trạng thái người dùng:
  - Guest (chưa đăng nhập)
  - Customer
  - Admin

## 1) Kiểm tra chặn truy cập
- Guest truy cập `/admin/categories` và `/admin/brands`.
- Kỳ vọng: bị chuyển hướng về `/login`.

- Customer truy cập `/admin/categories` và `/admin/brands`.
- Kỳ vọng: không truy cập được khu vực admin (bị chuyển về trang chủ).

- Admin truy cập 2 trang trên.
- Kỳ vọng: truy cập thành công.

## 2) Danh mục — danh sách
- Đăng nhập admin, mở `/admin/categories`.
- Kỳ vọng:
  - Hiển thị danh sách danh mục.
  - Có loading/error/empty state đúng.
  - Phân trang hoạt động khi có nhiều dữ liệu.

## 3) Danh mục — tạo mới
- Nhập form tạo danh mục với dữ liệu hợp lệ.
- Bấm `Tạo danh mục`.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Danh sách được cập nhật.

## 4) Danh mục — cập nhật
- Bấm `Sửa` một danh mục.
- Cập nhật một số trường và lưu.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Dữ liệu mới hiển thị lại trong bảng.

## 5) Danh mục — xóa
- Bấm `Xóa` một danh mục.
- Kỳ vọng:
  - Có hộp xác nhận trước khi xóa.
  - Chọn xác nhận thì xóa thành công, có toast.
  - Chọn hủy thì không xóa.

## 6) Thương hiệu — danh sách
- Mở `/admin/brands`.
- Kỳ vọng:
  - Hiển thị danh sách thương hiệu.
  - Có loading/error/empty state đúng.
  - Phân trang hoạt động khi có nhiều dữ liệu.

## 7) Thương hiệu — tạo mới
- Nhập form tạo thương hiệu hợp lệ.
- Bấm `Tạo thương hiệu`.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Danh sách được cập nhật.

## 8) Thương hiệu — cập nhật
- Bấm `Sửa` một thương hiệu.
- Chỉnh sửa dữ liệu và lưu.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Dữ liệu đã cập nhật hiển thị trong bảng.

## 9) Thương hiệu — xóa
- Bấm `Xóa` một thương hiệu.
- Kỳ vọng:
  - Có hộp xác nhận trước khi xóa.
  - Xác nhận thì xóa thành công.
  - Hủy thì không thay đổi dữ liệu.

## 10) Validation error
- Tạo/cập nhật với dữ liệu thiếu `name` hoặc `slug` trùng.
- Kỳ vọng:
  - Hiển thị lỗi validation ở đúng trường.
  - Không gửi thành công.

## 11) Disable khi submit
- Khi đang tạo/cập nhật/xóa, kiểm tra nút tương ứng bị disable hoặc hiện loading.
- Kỳ vọng:
  - Không thể bấm lặp gây gửi nhiều request.
