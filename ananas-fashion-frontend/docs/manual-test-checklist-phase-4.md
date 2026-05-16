# Checklist kiểm thử thủ công Frontend — Giai đoạn 4 (Tra cứu đơn hàng + Đơn hàng của tôi)

## Điều kiện trước khi test
- Backend đang chạy: `php artisan serve`
- Frontend đang chạy: `npm run dev` trong `ananas-fashion-frontend`
- `VITE_API_BASE_URL` trỏ đúng backend `/api`
- Có dữ liệu mẫu đơn hàng cho guest và user đã đăng nhập

## 1) Tra cứu công khai thành công bằng email
- Mở `/orders/lookup`
- Nhập `order_code` + `email` đúng (để trống phone)
- Bấm gửi
- Kỳ vọng:
  - Trả kết quả tra cứu thành công
  - Có mã đơn, trạng thái, ngày đặt, sản phẩm, tổng tiền, thanh toán, địa chỉ giao hàng đã mask, timeline

## 2) Tra cứu công khai thành công bằng phone
- Nhập `order_code` + `phone` đúng (để trống email)
- Bấm gửi
- Kỳ vọng: hiển thị đầy đủ thông tin như trường hợp tra cứu bằng email

## 3) Tra cứu công khai thất bại trả lỗi chung
- Nhập email/phone sai cho một `order_code` hợp lệ
- Bấm gửi
- Kỳ vọng:
  - Hiển thị lỗi chung: `Không tìm thấy đơn hàng`
  - Không lộ dữ liệu nhạy cảm

## 4) Kiểm tra chặn client khi thiếu contact
- Chỉ nhập `order_code` mà không nhập email/phone
- Bấm gửi
- Kỳ vọng:
  - Bị chặn phía client với thông báo lỗi
  - Không gửi request lên server

## 5) Danh sách đơn hàng user
- Đăng nhập bằng tài khoản khách hàng
- Mở `/orders`
- Kỳ vọng:
  - Chỉ hiển thị đơn của chính user hiện tại
  - Trạng thái đang tải/lỗi/rỗng hoạt động đúng

## 6) Chi tiết đơn hàng user
- Từ `/orders`, mở một đơn bất kỳ
- Kỳ vọng:
  - Hiển thị badge trạng thái đơn/thanh toán
  - Hiển thị breakdown số tiền + thông tin giao hàng
  - Hiển thị danh sách sản phẩm trong đơn

## 7) Hủy đơn ở trạng thái pending/confirmed
- Mở đơn ở trạng thái `pending` hoặc `confirmed`
- Bấm hủy đơn
- Kỳ vọng:
  - Hủy đơn thành công
  - Trang chi tiết tự tải lại và cập nhật trạng thái đơn/thanh toán

## 8) Không thể hủy đơn shipping/delivered
- Mở đơn ở trạng thái `shipping` hoặc `delivered` nếu có dữ liệu
- Kỳ vọng:
  - Không hiển thị nút hủy
  - Không phát sinh request hủy đơn
