# Checklist kiểm thử thủ công — Admin Dashboard UI (TailAdmin-style)

## 1) Phân quyền truy cập
- [ ] Guest truy cập `/admin/dashboard` bị chuyển về `/login`.
- [ ] User customer truy cập `/admin/dashboard` bị chặn.
- [ ] User admin truy cập `/admin/dashboard` thành công.

## 2) Hiển thị tổng quan
- [ ] Header hiển thị đúng tiêu đề, mô tả và thời gian cập nhật.
- [ ] Nút `Tải lại dữ liệu` hoạt động và cập nhật lại dữ liệu.
- [ ] KPI hiển thị đủ:
  - [ ] Tổng khách hàng
  - [ ] Tổng đơn hàng
  - [ ] Tổng doanh thu
  - [ ] Tổng sản phẩm
  - [ ] Doanh thu hôm nay
  - [ ] Doanh thu tháng này
  - [ ] Sản phẩm sắp hết hàng
  - [ ] Sản phẩm hết hàng

## 3) Revenue chart / Order chart
- [ ] Biểu đồ doanh thu 12 tháng hiển thị đúng dữ liệu từ `/api/admin/dashboard/analytics`.
- [ ] Biểu đồ đơn hàng 12 tháng hiển thị đúng dữ liệu từ `/api/admin/dashboard/analytics`.
- [ ] Tooltip biểu đồ hiển thị tiếng Việt và format hợp lý.
- [ ] Không dùng dữ liệu fake.

## 4) Order status chart / Inventory summary
- [ ] Biểu đồ trạng thái đơn hàng hiển thị đủ các trạng thái.
- [ ] Nhãn trạng thái hiển thị tiếng Việt:
  - Chờ xác nhận, Đã xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy, Đã trả hàng.
- [ ] Inventory summary hiển thị đúng:
  - Còn hàng
  - Sắp hết hàng
  - Hết hàng

## 5) Recent orders / Top products
- [ ] Bảng `Đơn hàng gần đây` hiển thị:
  - Mã đơn, Khách hàng, Tổng tiền, Trạng thái đơn, Thanh toán, Ngày tạo, Link `Xem`.
- [ ] Link `Xem` điều hướng đúng tới `/admin/orders/:orderCode`.
- [ ] Bảng `Sản phẩm bán chạy` hiển thị:
  - Tên sản phẩm, Đã bán, Doanh thu.
- [ ] Nếu API trả `image_url`, ảnh hiển thị đúng; nếu không có thì dùng fallback.

## 6) Trạng thái tải/lỗi
- [ ] Khi stats đang tải: hiển thị loading state.
- [ ] Khi stats lỗi: hiển thị error state + nút thử lại.
- [ ] Khi analytics lỗi nhưng stats thành công:
  - [ ] KPI cơ bản vẫn hiển thị.
  - [ ] Khu vực chart hiển thị lỗi nhẹ.
  - [ ] Dashboard không trắng toàn bộ.

## 7) Responsive
- [ ] Desktop: layout dạng grid, card/bảng không vỡ.
- [ ] Tablet: KPI hiển thị 2 cột.
- [ ] Mobile: KPI 1 cột, chart full width, table cuộn ngang được.
- [ ] Sidebar/topbar admin vẫn dùng ổn.
