# Checklist demo tổng thể Frontend Ananas Fashion

## Điều kiện trước khi demo
- Backend chạy tại `http://127.0.0.1:8000` và frontend dùng `VITE_API_BASE_URL=http://127.0.0.1:8000/api`.
- Chạy frontend trong thư mục `ananas-fashion-frontend` bằng `npm run dev`.
- Có sẵn tài khoản:
  - Admin: `admin@example.com` / `Password1`
  - Customer: `customer.e2e@example.com` / `Password1`
- Có dữ liệu sản phẩm, biến thể, voucher, đơn hàng mẫu để kiểm thử luồng đầy đủ.

## A. Luồng khách hàng
- [ ] Xem danh sách sản phẩm (`/products`), kiểm tra tìm kiếm/lọc/sắp xếp.
- [ ] Mở chi tiết sản phẩm (`/products/:slug`), chọn biến thể, thêm vào giỏ.
- [ ] Test giỏ guest (`/cart`) với cập nhật số lượng/xóa/xóa toàn bộ.
- [ ] Đăng ký và đăng nhập tài khoản khách hàng.
- [ ] Test giỏ user sau đăng nhập.
- [ ] Kiểm tra voucher tại `/checkout` (mã hợp lệ/không hợp lệ).
- [ ] Thanh toán COD thành công cho guest/user, kiểm tra `/checkout/success`.
- [ ] Tra cứu đơn hàng tại `/orders/lookup` bằng `order_code + email` hoặc `order_code + phone`.
- [ ] Xem danh sách đơn của user (`/orders`) và chi tiết đơn (`/orders/:orderCode`).
- [ ] Hủy đơn khi trạng thái cho phép (pending/confirmed).
- [ ] Toggle danh sách yêu thích (`/wishlist`) và xóa khỏi yêu thích.
- [ ] Xem đánh giá công khai ở trang chi tiết sản phẩm.
- [ ] Tạo đánh giá hợp lệ (order item đã giao), thử xóa đánh giá của chính mình.

## B. Luồng quản trị
- [ ] Đăng nhập admin và vào `/admin/dashboard`.
- [ ] Kiểm tra các chỉ số dashboard, bảng đơn gần đây và sản phẩm bán chạy.
- [ ] CRUD danh mục tại `/admin/categories`.
- [ ] CRUD thương hiệu tại `/admin/brands`.
- [ ] CRUD sản phẩm tại `/admin/products`.
- [ ] Vào `/admin/products/:productId/manage` để quản lý biến thể.
- [ ] Upload/xóa ảnh sản phẩm và đặt ảnh đại diện.
- [ ] CRUD voucher tại `/admin/vouchers`.
- [ ] Quản lý đơn hàng tại `/admin/orders` và `/admin/orders/:orderCode`.
- [ ] Cập nhật trạng thái đơn theo flow backend; test hủy đơn ở trạng thái hợp lệ.

## C. Ca kiểm thử âm
- [ ] Guest bị chặn ở toàn bộ route admin.
- [ ] Customer bị chặn ở toàn bộ route admin.
- [ ] Voucher không hợp lệ trả lỗi đúng.
- [ ] Checkout thiếu thông tin bắt buộc trả lỗi validation.
- [ ] Tra cứu đơn với thông tin sai trả lỗi chung “Không tìm thấy đơn hàng”.
- [ ] Tạo đánh giá không hợp lệ (rating ngoài khoảng, order_item không hợp lệ) bị từ chối.

## D. Lệnh xác nhận nhanh
- Backend: `php artisan test`
- Frontend unit tests: `npm run test`
- Frontend build: `npm run build`
