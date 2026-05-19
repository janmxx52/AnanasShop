# Checklist kiểm thử thủ công Checkout UI

## Điều kiện trước khi test
- Chạy backend: `php artisan serve`
- Chạy frontend: `npm run dev` trong thư mục `ananas-fashion-frontend`
- Biến môi trường frontend: `VITE_API_BASE_URL=http://127.0.0.1:8000/api`

## 1) Guest checkout không dùng voucher
- Thêm sản phẩm vào giỏ bằng guest token.
- Vào `/checkout`, nhập đầy đủ họ tên, email, số điện thoại, địa chỉ.
- Bấm `Đặt hàng`.
- Kỳ vọng:
  - Chuyển sang `/checkout/success`.
  - Hiển thị mã đơn hàng và tổng thanh toán.

## 2) Guest checkout có voucher
- Ở `/checkout`, nhập mã giảm giá hợp lệ và bấm `Kiểm tra`.
- Kỳ vọng:
  - Hiển thị tạm tính, giảm giá, sau giảm giá ở `VoucherBox`.
  - Tóm tắt đơn hàng cập nhật phần giảm giá.
- Bấm `Đặt hàng` và đảm bảo checkout thành công.

## 3) User checkout
- Đăng nhập tài khoản customer.
- Vào `/checkout`.
- Kỳ vọng:
  - Form nhận hàng được điền sẵn dữ liệu cơ bản nếu có.
  - Có ghi chú “Bạn đang thanh toán bằng tài khoản ...”.
- Bấm `Đặt hàng` thành công.

## 4) Form thiếu dữ liệu bắt buộc
- Để trống một số trường bắt buộc rồi bấm `Đặt hàng`.
- Kỳ vọng:
  - Hiển thị lỗi validate dưới từng trường.
  - Không tạo đơn hàng.

## 5) Giỏ hàng rỗng vào checkout
- Xóa toàn bộ giỏ hàng.
- Truy cập `/checkout`.
- Kỳ vọng:
  - Hiển thị trạng thái giỏ hàng trống.
  - Có nút quay lại danh sách sản phẩm.

## 6) Quay lại giỏ hàng từ checkout
- Từ trang checkout, bấm `Quay lại giỏ hàng`.
- Kỳ vọng:
  - Điều hướng về `/cart`.

## 7) Order success links
- Sau khi đặt hàng thành công, kiểm tra các liên kết:
  - `Tra cứu đơn hàng`
  - `Xem đơn hàng của tôi` (khi đã đăng nhập)
  - `Tiếp tục mua sắm`

## 8) Mobile layout
- Kiểm tra ở chiều rộng mobile/tablet:
  - Form dễ nhập.
  - Card tóm tắt không vỡ layout.
  - Nút `Đặt hàng` và `Quay lại giỏ hàng` bấm được.
