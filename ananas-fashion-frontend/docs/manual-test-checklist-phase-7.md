# Checklist kiểm thử thủ công Frontend — Giai đoạn 7 (Admin Dashboard)

## Điều kiện trước khi test
- Backend API đang chạy và có dữ liệu dashboard.
- Frontend app đang chạy.
- Có 2 tài khoản:
  - Admin
  - Customer thường

## 1) Kiểm tra truy cập route admin
- Chưa đăng nhập, truy cập `/admin/dashboard`.
- Kỳ vọng: bị chuyển hướng về `/login`.

- Đăng nhập bằng tài khoản customer, truy cập `/admin/dashboard`.
- Kỳ vọng: không vào được trang admin (bị chuyển hướng về trang chủ).

- Đăng nhập bằng tài khoản admin, truy cập `/admin/dashboard`.
- Kỳ vọng: vào được trang dashboard.

## 2) Kiểm tra trạng thái tải và lỗi
- Vào dashboard khi mạng bình thường.
- Kỳ vọng: hiển thị trạng thái `Đang tải thống kê dashboard...` trước khi có dữ liệu.

- Tắt backend tạm thời rồi tải lại trang.
- Kỳ vọng: hiển thị `ErrorState` với thông báo lỗi API.

## 3) Kiểm tra nhóm chỉ số thống kê
- Xác nhận hiển thị đủ:
  - Tổng người dùng
  - Tổng sản phẩm
  - Tổng đơn hàng
  - Tổng doanh thu
  - Đơn chờ xác nhận
  - Đơn đã hủy
  - Đơn đã giao
  - Biến thể sắp hết hàng
  - Biến thể hết hàng
  - Tổng đánh giá
  - Điểm đánh giá trung bình

## 4) Kiểm tra bảng đơn hàng gần đây
- Xác nhận bảng hiển thị các cột:
  - Mã đơn
  - Khách hàng
  - Trạng thái đơn
  - Trạng thái thanh toán
  - Tổng tiền
  - Ngày tạo
- Kỳ vọng:
  - Badge trạng thái đơn và thanh toán hiển thị đúng tiếng Việt.
  - Tổng tiền hiển thị định dạng VND.
  - Nếu không có dữ liệu thì hiện `EmptyState`.

## 5) Kiểm tra bảng sản phẩm bán chạy
- Xác nhận bảng hiển thị các cột:
  - ID sản phẩm
  - Tên sản phẩm
  - Đã bán
  - Doanh thu
- Kỳ vọng:
  - Số lượng và doanh thu hiển thị đúng định dạng.
  - Nếu không có dữ liệu thì hiện `EmptyState`.

## 6) Kiểm tra hành vi tải lại dữ liệu
- Bấm nút `Tải lại`.
- Kỳ vọng:
  - Gọi lại API dashboard stats.
  - Dữ liệu được cập nhật lại theo response mới nhất.

## 7) Kiểm tra responsive
- Mở dashboard trên mobile/tablet/desktop.
- Kỳ vọng:
  - Các card chỉ số tự xuống hàng hợp lý.
  - Bảng có thể cuộn ngang trên màn nhỏ, không vỡ layout.
