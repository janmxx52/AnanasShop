# Checklist kiểm thử thủ công Frontend — Giai đoạn 3 (Thanh toán + Voucher)

## Điều kiện trước khi test
- Chạy backend: `php artisan serve` (mặc định `http://127.0.0.1:8000`)
- Chạy frontend: `npm run dev` trong thư mục `ananas-fashion-frontend`
- Dùng biến môi trường frontend: `VITE_API_BASE_URL=http://127.0.0.1:8000/api`
- Seed sẵn tài khoản test nếu cần:
  - khách hàng: `customer.e2e@example.com` / `Password1`
  - admin: `admin@example.com` / `Password1`

## 1) Thanh toán guest
- Thêm một biến thể sản phẩm vào giỏ từ `ProductDetailPage`.
- Mở `/checkout` khi chưa đăng nhập.
- Nhập `full_name`, `email`, `phone`, `shipping_address`.
- Giữ `payment_method=cod` và gửi đơn.
- Kỳ vọng:
  - Chuyển sang `/checkout/success`
  - Hiển thị `order_code`
  - `payment_method=cod`, `payment_status=pending`
  - Giỏ hàng trống sau khi đặt thành công.

## 2) Thanh toán user đã đăng nhập
- Đăng nhập tại `/login`.
- Thêm biến thể sản phẩm vào giỏ hàng.
- Mở `/checkout`.
- Kiểm tra form giao hàng được điền sẵn từ hồ sơ người dùng nếu có dữ liệu.
- Gửi đơn hàng.
- Kỳ vọng:
  - Chuyển sang `/checkout/success`
  - Hiển thị `order_code`
  - Giỏ hàng được tải lại và trống.

## 3) Voucher hợp lệ/không hợp lệ
- Trong trang checkout, nhập voucher hợp lệ tại `VoucherBox` và bấm `Kiểm tra`.
- Kỳ vọng voucher hợp lệ:
  - Hiển thị `subtotal`, `discount`, `total_after`.
- Nhập voucher không hợp lệ và bấm `Kiểm tra`.
- Kỳ vọng voucher không hợp lệ:
  - Hiển thị thông báo lỗi
  - Không áp dụng xem trước giảm giá.

## 4) Chặn checkout khi giỏ trống
- Mở `/checkout` khi giỏ hàng trống.
- Kỳ vọng:
  - Hiển thị `EmptyState`
  - Có link quay lại `/products`.

## 5) Kiểm tra xử lý lỗi
- Gửi form với các trường bắt buộc còn thiếu.
- Kỳ vọng:
  - Hiển thị lỗi validate dưới từng trường.
- Thử checkout với biến thể hết tồn kho.
- Kỳ vọng:
  - Hiển thị thông báo lỗi trả về từ API trong trang checkout.
