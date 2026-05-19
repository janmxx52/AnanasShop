# Checklist kiểm thử thủ công Admin UI

## Điều kiện trước khi test
- Chạy backend: `php artisan serve`
- Chạy frontend: `npm run dev` trong thư mục `ananas-fashion-frontend`
- Đăng nhập tài khoản admin hợp lệ.

## 1) Dashboard admin
- Vào `/admin/dashboard`.
- Kiểm tra:
  - Hiển thị đầy đủ card chỉ số.
  - Bảng đơn hàng gần đây và sản phẩm bán chạy hiển thị đúng.
  - Nút `Tải lại dữ liệu` hoạt động.

## 2) Category CRUD
- Vào `/admin/categories`.
- Tạo danh mục mới.
- Sửa danh mục vừa tạo.
- Xóa danh mục và xác nhận popup.
- Kiểm tra validate lỗi hiển thị dưới field.

## 3) Brand CRUD
- Vào `/admin/brands`.
- Tạo thương hiệu mới.
- Sửa thương hiệu vừa tạo.
- Xóa thương hiệu và xác nhận popup.
- Kiểm tra link logo mở đúng khi có URL.

## 4) Product CRUD
- Vào `/admin/products`.
- Tạo sản phẩm mới với category/brand hợp lệ.
- Sửa sản phẩm vừa tạo.
- Tắt/Bật hiển thị sản phẩm.
- Xóa mềm sản phẩm.
- Khôi phục sản phẩm đã xóa mềm.
- Kiểm tra ảnh thumbnail hiển thị trong bảng sản phẩm.

## 5) Product variant/image
- Vào `/admin/products/:productId/manage`.
- Tab `Quản lý biến thể`:
  - Tạo biến thể (size, color, stock, SKU).
  - Sửa biến thể.
  - Xóa biến thể.
- Tab `Quản lý ảnh`:
  - Upload ảnh mới.
  - Đặt ảnh đại diện.
  - Xóa ảnh.

## 6) Voucher CRUD
- Vào `/admin/vouchers`.
- Tạo voucher loại phần trăm.
- Tạo voucher loại cố định.
- Sửa voucher.
- Vô hiệu hóa voucher.
- Kiểm tra validate:
  - value > 0
  - percent không > 100
  - starts_at <= expires_at

## 7) Order list/detail/update/cancel
- Vào `/admin/orders`.
- Lọc theo mã đơn, trạng thái đơn, trạng thái thanh toán.
- Mở chi tiết đơn.
- Cập nhật trạng thái theo luồng hợp lệ.
- Hủy đơn nếu trạng thái cho phép.

## 8) Customer bị chặn admin
- Đăng nhập tài khoản customer.
- Truy cập `/admin/dashboard` hoặc route admin bất kỳ.
- Kỳ vọng: bị chặn bởi `AdminRoute`.

## 9) Mobile admin layout
- Kiểm tra trên mobile/tablet:
  - Menu admin có thể dùng được.
  - Bảng có `overflow-x-auto`, không vỡ layout.
  - Form không tràn, nút không bị vỡ chữ.
