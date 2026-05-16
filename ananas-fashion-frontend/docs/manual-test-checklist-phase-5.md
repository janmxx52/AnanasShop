# Checklist kiểm thử thủ công Frontend — Giai đoạn 5 (Yêu thích + Đánh giá)

## Điều kiện trước khi test
- Chạy backend API và frontend dev server.
- Chuẩn bị tối thiểu:
  - 1 phiên guest
  - 1 tài khoản khách hàng
  - Sản phẩm có biến thể đang hoạt động
  - Dữ liệu order item đã giao để test tạo đánh giá

## 1) Danh sách yêu thích

### 1.1 Guest không thể thêm yêu thích
- Mở trang danh sách/chi tiết sản phẩm ở chế độ guest.
- Bấm `Thêm vào yêu thích`.
- Kỳ vọng:
  - Chuyển hướng đến `/login` (hoặc luồng yêu cầu đăng nhập).
  - Không có thay đổi wishlist khi chưa đăng nhập.

### 1.2 User toggle yêu thích
- Đăng nhập tài khoản khách hàng.
- Từ danh sách/chi tiết sản phẩm, bấm `Thêm vào yêu thích`.
- Kỳ vọng:
  - Hiển thị thông báo thành công.
  - Nút đổi thành `Xóa khỏi yêu thích`.
- Bấm lại lần nữa.
- Kỳ vọng:
  - Sản phẩm bị xóa khỏi wishlist.
  - Nút đổi về `Thêm vào yêu thích`.

### 1.3 Danh sách yêu thích và xóa
- Mở `/wishlist`.
- Kỳ vọng:
  - Chỉ hiển thị sản phẩm yêu thích của user hiện tại.
  - Phân trang hoạt động đúng khi có nhiều sản phẩm.
- Bấm `Xóa` trên một sản phẩm.
- Kỳ vọng:
  - Sản phẩm biến mất sau khi reload/refetch.

## 2) Đánh giá (public + thao tác user)

### 2.1 Danh sách đánh giá public
- Mở chi tiết sản phẩm ở chế độ guest.
- Kỳ vọng:
  - Danh sách đánh giá hiển thị công khai.
  - Trạng thái đang tải/lỗi/rỗng hiển thị đúng.

### 2.2 Tạo đánh giá với order item đã giao
- Đăng nhập tài khoản khách hàng.
- Mở chi tiết sản phẩm.
- Nhập form đánh giá:
  - `order_item_id` thuộc đơn đã giao của chính user
  - rating 1-5
  - comment tùy chọn
- Gửi form.
- Kỳ vọng:
  - Hiển thị thông báo thành công.
  - Danh sách đánh giá được tải lại và có đánh giá mới.

### 2.3 Rating không hợp lệ
- Gửi rating ngoài khoảng cho phép (hoặc ép payload không hợp lệ).
- Kỳ vọng:
  - Hiển thị lỗi validate cho trường `rating`.

### 2.4 Tối đa 3 ảnh
- Đính kèm 4+ ảnh trong form đánh giá.
- Kỳ vọng:
  - Frontend chỉ giữ tối đa 3 ảnh.
  - Nếu payload vẫn sai, backend trả lỗi và UI hiển thị lỗi đúng.

### 2.5 Xóa đánh giá của chính mình
- Trên đánh giá do mình tạo, bấm `Xóa`.
- Kỳ vọng:
  - API xóa thành công.
  - Danh sách đánh giá tải lại và không còn đánh giá vừa xóa.
- Kiểm tra không thể xóa đánh giá của user khác (ẩn nút hoặc API từ chối).
