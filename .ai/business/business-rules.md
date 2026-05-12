# Business Rules — Ananas Fashion

---

## 1. Authentication & Users

- Đăng ký yêu cầu: name, email, password (min 8 ký tự), phone (optional)
- Email phải unique trong hệ thống
- Password được hash bằng bcrypt (BCRYPT_ROUNDS=12)
- Password phải chứa ít nhất: 1 chữ hoa, 1 chữ thường, 1 số
- Mỗi user chỉ có 1 role: `customer` hoặc `admin`
- User bị ban (`is_banned=1`) không thể đăng nhập
- Sanctum token có expiration (ví dụ: 30 ngày)
- User có thể logout current device hoặc logout all devices
- Khi user bị ban (`is_banned=1`) → revoke toàn bộ token đang hoạt động
- User có thể thay đổi: name, phone, avatar
- Thay đổi password cần nhập password cũ

---

## 2. Products & Variants

- Mỗi sản phẩm thuộc **1 category** và **1 brand**
- Mỗi sản phẩm có nhiều `product_variants` (size + màu) và nhiều `product_images` (tối đa 10)
- 1 ảnh đánh dấu `is_primary=1` là ảnh đại diện
- Giá hiển thị = `sale_price` nếu có, ngược lại dùng `base_price`
- Variant có `price_adjustment` (+ hoặc -) so với giá sản phẩm
- Sản phẩm `is_active=0` không hiển thị với customer
- Stock tracking ở cấp variant; khi stock = 0 → không thể thêm vào giỏ
- Slug tự động generate từ name (unique)
- Không được tồn tại 2 variant trùng (product_id + size + color) VD: Áo A / Size M / Đen không được tạo 2 lần.

---

## 3. Cart (Giỏ Hàng)

### Cart types

Hệ thống hỗ trợ 2 loại giỏ hàng:

1. **Guest Cart**
   - Dành cho user chưa đăng nhập
   - Định danh bằng `guest_token` (UUID), client lưu localStorage và gửi qua header `X-Guest-Token`
   - Có thể thêm/xóa/cập nhật sản phẩm
   - Có thể checkout trực tiếp không cần tạo tài khoản

2. **User Cart**
   - Dành cho user đã đăng nhập
   - Mỗi user có tối đa **1 cart active**
   - Định danh qua `user_id` (từ Sanctum token)

---

### Cart rules chung

- Cùng 1 variant trong giỏ → **cộng dồn quantity** (không tạo item mới)
- Quantity tối thiểu là `1`
- Quantity tối đa = `stock` của variant
- Khi cập nhật quantity = `0` → xóa item khỏi giỏ
- Giỏ hàng **không lưu giá** (tính real-time từ product + variant)
- Khi checkout, nếu variant hết hàng → báo lỗi từng item cụ thể

---

### Guest checkout rules

- Guest có thể checkout mà không cần đăng nhập
- Bắt buộc nhập: `full_name`, `email`, `phone`, `shipping_address`
- Sau khi order thành công:
  - cart guest bị clear
  - tạo order dưới dạng `guest order`
  - `user_id = null`

---

### Merge cart khi đăng nhập

Nếu guest đăng nhập khi đang có cart:

- merge guest cart vào user cart
- nếu cùng variant:
  - cộng dồn quantity
  - nhưng không vượt quá stock
- sau khi merge:
  - xóa guest cart

---

## 4. Vouchers

- 2 loại: `percent` (giảm %) và `fixed` (giảm tiền cố định)
- Khi `type=percent`: `max_discount` là mức giảm tối đa
- Chỉ áp dụng khi `subtotal >= min_order_amount`
- `usage_limit`: tổng lần dùng (null = unlimited); `usage_per_user`: per-user limit (default 1)
- Mỗi order chỉ áp dụng **1 voucher**
- Sau đặt hàng thành công → `used_count += 1`
- Nếu order bị cancel → hoàn lại lượt dùng voucher
- Voucher usage update phải chạy trong DB transaction 

---

## 5. Orders (Đặt Hàng)

### 5.1 Tạo đơn hàng
1. Validate giỏ hàng không rỗng + từng variant còn đủ stock
2. Tính subtotal = Σ (unit_price × quantity)
3. Áp dụng voucher → discount_amount
4. Shipping fee: đơn < 500.000đ → 30.000đ; đơn >= 500.000đ → miễn phí
5. total = subtotal - discount_amount + shipping_fee
6. Snapshot địa chỉ, tên sản phẩm, variant info, giá vào order/order_items 
OrderItem phải snapshot:
- product_name
- variant_name
- sku
- unit_price
- image_url
7. Trừ stock từng variant → xóa giỏ hàng 
- Trừ stock phải thực hiện trong DB transaction
- Lock row variant khi checkout (`SELECT FOR UPDATE`)
8. Order code format: `ANS-DDMMYYYY-RANDOM6`

### 5.2 Hủy đơn
- Customer hủy khi status ∈ `[pending, confirmed]`
- Admin hủy ở mọi status trừ `delivered`
- Khi hủy: hoàn stock + hoàn voucher usage

### 5.3 Status Flow
```
pending → confirmed → processing → shipping → delivered
       ↘ cancelled                          ↘ returned
```

---

## 6. Payment

- 3 phương thức: `cod`, `vnpay`, `momo`
- COD: payment_status = `pending` cho đến khi giao
- VNPay/MoMo: callback thành công → `paid`; thất bại → order `cancelled`, hoàn stock
- Payment callback phải idempotent (cùng callback gọi nhiều lần không được xử lý lặp)

### 6.1 Cấu hình
- VNPAY: `VNP_AMOUNT`, `VNP_ORDER_ID`, `VNP_ORDER_DESC`, `VNP_CURRENCY`, `VNP_RETURN_URL`
- MoMo: `momo_order_id`, `amount`, `partner_name`, `partner_code`, `endpoint`, `redirect_url`, `ipn_url`

### 6.2 Tạo payment
- Supported payment_methods: `cod`, `vnpay`, `momo`
- Sau khi order thành công:
  - Nếu payment_method = `cod`:
    - payment_status = `pending`
  - Nếu payment_method = `vnpay`:
    - create VNPAY URL, return cho client
  - Nếu payment_method = `momo`:
    - tạo MoMo QR hoặc link, return cho client

### 6.3 Callback xử lý
- Tất cả callback phải:
  - xác thực chữ ký (hash)
  - kiểm tra order_id hợp lệ
  - chỉ xử lý 1 lần duy nhất

### 6.4 Update status
- order_status = `delivered` → payment_status = `paid`

---

## 7. Reviews

- Chỉ review sản phẩm đã mua (order status = `delivered`)
- Mỗi order_item review **1 lần** duy nhất
- Rating 1–5 sao; tối đa 3 ảnh kèm theo
- Rating avg tính real-time (không lưu trong DB)
- Không cho sửa rating sau khi submit
---

## 8. Wishlist

- Toggle: add nếu chưa có, remove nếu đã có
- Không giới hạn số lượng sản phẩm
- Không được duplicate (user_id + product_id)

---

## 9. Image Upload

- Tất cả ảnh upload lên **Cloudinary**
- Format: jpg, jpeg, png, webp | Max size: 5MB/ảnh
- Xóa ảnh trong DB → phải xóa trên Cloudinary (bằng public_id)
- Chỉ admin được upload/xóa product images

## 10. Order Lookup (Tra cứu đơn hàng)

### Mục đích

Cho phép khách hàng (đặc biệt guest) tra cứu trạng thái đơn hàng mà không cần đăng nhập.

---

### Lookup method

Khách hàng có thể tra cứu đơn hàng bằng:

- **order_code + email**
hoặc
- **order_code + phone**

Cả 2 thông tin phải khớp với dữ liệu lúc đặt hàng.

---

### Validation rules

- `order_code` là bắt buộc
- Phải nhập **ít nhất 1 trong 2**:
  - email
  - phone
- Nếu nhập cả email và phone:
- cả hai phải cùng khớp

---

### Security rules

- Không cho phép tra cứu chỉ bằng `order_code`
- Nếu thông tin không khớp:
  - trả về lỗi chung:
    `"Không tìm thấy đơn hàng"`
- Không tiết lộ:
  - email thật
  - số điện thoại thật
  - địa chỉ đầy đủ
  nếu xác thực thất bại

---

### Information returned

Sau khi tra cứu thành công, hiển thị:

- order_code
- order_status
- order_date
- danh sách sản phẩm
- quantity
- tổng tiền
- phương thức thanh toán
- địa chỉ giao hàng (có thể mask một phần)
- trạng thái vận chuyển
- tracking_number (nếu có)

---

### Status timeline

Khách hàng có thể xem tiến trình đơn hàng:

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled

---

### Rate limiting

Giới hạn số lần tra cứu:

- tối đa `10 requests / phút / IP`

Để tránh brute-force dò mã đơn hàng.

---

### Guest order support

Tra cứu hoạt động cho:

- guest orders
- user orders

Không yêu cầu đăng nhập.