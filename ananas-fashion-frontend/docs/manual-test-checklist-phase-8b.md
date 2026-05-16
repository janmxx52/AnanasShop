# Checklist kiểm thử thủ công Frontend — Giai đoạn 8B (Admin Product CRUD)

## Điều kiện trước khi test
- Backend API đang chạy.
- Frontend app đang chạy.
- Có dữ liệu category và brand để tạo sản phẩm.
- Có 3 trạng thái user:
  - Guest (chưa đăng nhập)
  - Customer
  - Admin

## 1) Kiểm tra chặn truy cập
- Guest truy cập `/admin/products`.
- Kỳ vọng: bị chuyển hướng về `/login`.

- Customer truy cập `/admin/products`.
- Kỳ vọng: không vào được khu vực admin (bị chuyển về trang chủ).

- Admin truy cập `/admin/products`.
- Kỳ vọng: truy cập thành công.

## 2) Danh sách sản phẩm
- Mở trang `/admin/products`.
- Kỳ vọng:
  - Hiển thị bảng sản phẩm.
  - Có loading/error/empty state đúng.
  - Hiển thị thông tin: tên, slug, danh mục, thương hiệu, giá, trạng thái.

## 3) Tạo sản phẩm
- Nhập form tạo sản phẩm với dữ liệu hợp lệ:
  - `name`, `category_id`, `brand_id`, `base_price`
  - optional: `slug`, `description`, `sale_price`, `is_active`
- Bấm `Tạo sản phẩm`.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Sản phẩm mới xuất hiện trong danh sách.

## 4) Cập nhật sản phẩm
- Bấm `Sửa` một sản phẩm chưa bị xóa.
- Cập nhật dữ liệu và bấm `Lưu thay đổi`.
- Kỳ vọng:
  - Hiển thị toast thành công.
  - Danh sách hiển thị dữ liệu đã cập nhật.

## 5) Xóa sản phẩm (soft delete)
- Bấm `Xóa` một sản phẩm.
- Kỳ vọng:
  - Hiện hộp confirm trước khi xóa.
  - Xác nhận => xóa thành công, có toast.
  - Hủy => không xóa.

## 6) Khôi phục sản phẩm (nếu có hiển thị đã xóa)
- Bật filter hiển thị sản phẩm đã xóa mềm.
- Với sản phẩm bị xóa, bấm `Khôi phục`.
- Kỳ vọng:
  - Có confirm trước khi khôi phục.
  - Khôi phục thành công, có toast.

## 7) Bật/tắt trạng thái active
- Với sản phẩm chưa bị xóa, bấm `Tắt hiển thị` hoặc `Bật hiển thị`.
- Kỳ vọng:
  - API cập nhật trạng thái thành công.
  - Trạng thái trong bảng thay đổi đúng.
  - Có toast thành công.

## 8) Validation error
- Thử tạo/cập nhật thiếu field bắt buộc hoặc nhập `sale_price > base_price`.
- Kỳ vọng:
  - Hiển thị lỗi validation tại đúng field.
  - Không gửi thành công.

## 9) Search / filter / pagination
- Tìm kiếm theo từ khóa tên/mô tả.
- Lọc theo danh mục, thương hiệu, trạng thái active/inactive.
- Bật/tắt filter `hiển thị đã xóa mềm`.
- Kỳ vọng:
  - Danh sách phản ánh đúng bộ lọc.
  - Pagination hoạt động đúng khi có nhiều dữ liệu.
