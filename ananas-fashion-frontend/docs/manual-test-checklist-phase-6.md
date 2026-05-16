# Checklist kiểm thử thủ công Frontend — Giai đoạn 6 (Ổn định UX)

## Điều kiện trước khi test
- Backend API đang chạy.
- Frontend app đang chạy.
- Có ít nhất một tài khoản khách hàng và một phiên guest.
- Có dữ liệu sản phẩm/biến thể với tồn kho hợp lệ.

## 1) Hệ thống thông báo nhanh (toast)
- Đăng nhập thành công hiển thị thông báo thành công.
- Đăng nhập thất bại hiển thị thông báo lỗi.
- Đăng ký thành công/thất bại hiển thị thông báo.
- Thêm vào giỏ thành công/thất bại hiển thị thông báo.
- Cập nhật/xóa/xóa hết giỏ hàng hiển thị thông báo.
- Kiểm tra voucher thành công/thất bại hiển thị thông báo.
- Thanh toán thành công/thất bại hiển thị thông báo.
- Hủy đơn thành công/thất bại hiển thị thông báo.
- Thêm/xóa yêu thích hiển thị thông báo.
- Tạo/xóa đánh giá hiển thị thông báo.

## 2) Chuẩn hóa lỗi API
- Gây lỗi 401 ở API cần đăng nhập, kiểm tra thông báo đã chuẩn hóa.
- Gây lỗi 403 (nếu có), kiểm tra thông báo đã chuẩn hóa.
- Gây lỗi 404 (slug/mã đơn sai), kiểm tra thông báo đã chuẩn hóa.
- Gây lỗi 422 (checkout/review invalid), kiểm tra thông báo + field errors.
- Mô phỏng lỗi 500 (nếu có thể), kiểm tra fallback message.

## 3) Đồng nhất trạng thái đang tải / lỗi / rỗng
- Danh sách sản phẩm: đang tải, rỗng sau lọc, lỗi.
- Chi tiết sản phẩm: đang tải + lỗi không tìm thấy.
- Giỏ hàng: trạng thái giỏ trống và lỗi API.
- Thanh toán: giỏ trống, lỗi validate từng trường, đang tải khi gửi.
- Tra cứu đơn: lỗi lookup và kết quả thành công.
- Đơn hàng của tôi: trạng thái rỗng và có phân trang.
- Chi tiết đơn hàng: đang tải/lỗi/chi tiết.
- Danh sách yêu thích: đang tải, rỗng, xóa sản phẩm.

## 4) Điều hướng và UX
- Sau khi đăng nhập từ route bảo vệ, chuyển về đúng trang `from`.
- Khách chưa đăng nhập bấm yêu thích sẽ bị chuyển sang trang đăng nhập và giữ `from`.
- Sau khi thêm vào giỏ ở trang chi tiết:
  - `Tiếp tục mua hàng` hoạt động.
  - `Đi tới giỏ hàng` mở đúng `/cart`.
- Trang checkout success có link đúng:
  - Tra cứu đơn hàng
  - Đơn hàng của tôi (khi đã đăng nhập)
  - Tiếp tục mua hàng

## 5) Kiểm tra responsive cơ bản
- Lưới danh sách sản phẩm hiển thị tốt trên mobile/tablet/desktop.
- Hành động ở trang giỏ hàng dùng được trên mobile.
- Layout checkout dễ đọc trên mobile, sticky summary hoạt động ở màn lớn.
- Bảng sản phẩm trong đơn có thể cuộn ngang trên màn nhỏ.

## 6) Regression nhanh (Giai đoạn 3–5)
- Thanh toán guest vẫn hoạt động.
- Thanh toán user vẫn hoạt động.
- Tra cứu đơn bằng email/số điện thoại vẫn hoạt động.
- Yêu thích thêm/xóa/xem danh sách vẫn hoạt động.
- Đánh giá xem danh sách/tạo/xóa vẫn hoạt động.
