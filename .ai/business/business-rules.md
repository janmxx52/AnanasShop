# Business Rules — Ananas Fashion

> Updated: 2026-05-15  
> Scope: backend rules đang implemented hoặc đã chốt quyết định

---

## 1) Authentication & Authorization

- Dùng Sanctum token-based auth.
- Register yêu cầu: `name`, `email`, `password`, `password_confirmation`; `phone` optional.
- Password tối thiểu 8 ký tự, có chữ hoa + chữ thường + số.
- Email unique.
- User bị `is_banned=true` không được login.
- User có thể logout current token và logout all tokens.
- Admin routes yêu cầu: `auth:sanctum + role:admin`.

---

## 2) Product & Pricing

- Public chỉ hiển thị product `is_active=true` và chưa soft deleted.
- Product display price:
  - `product_display_price = sale_price` nếu có
  - ngược lại dùng `base_price`.
- Variant final price:
  - `variant_final_price = product_display_price + price_adjustment`.
- Rule giá trên phải đồng nhất giữa:
  - Product API
  - Cart realtime total
  - Voucher subtotal check
  - Checkout unit_price snapshot.
- Variant uniqueness: không trùng `(product_id, size, color)`.

---

## 3) Cart

- Hỗ trợ guest cart (`X-Guest-Token`) và user cart (`auth:sanctum`).
- Cùng variant trong cùng cart sẽ cộng quantity.
- Quantity tối thiểu 1; update về 0 thì remove item.
- Quantity không vượt stock variant.
- Không cho add/update variant nếu product inactive hoặc variant hết hàng.
- Cart không lưu giá cứng, luôn tính realtime.
- Sau login có thể merge guest cart vào user cart, quantity vẫn phải theo stock.

---

## 4) Voucher

- Voucher type: `percent` hoặc `fixed`.
- Validate:
  - `is_active`
  - `starts_at` / `expires_at`
  - `min_order_amount`
  - `usage_limit`
  - `usage_per_user`.
- Percent voucher phải tôn trọng `max_discount` (nếu có).
- `voucher_usages` là source of truth cho usage.
- `vouchers.used_count` là counter cache.
- Voucher check endpoint **không được mutate** usage.
- Chỉ mutate usage khi checkout success trong transaction:
  - tạo `voucher_usages`
  - increment `used_count`.
- Khi cancel order:
  - không xóa usage row
  - set `voucher_usages.revoked_at = now()`
  - decrement `vouchers.used_count`.
- Usage limit/per-user chỉ count usage có `revoked_at IS NULL`.

---

## 5) Checkout & Orders

- Checkout hỗ trợ:
  - guest: `POST /api/checkout/guest`
  - authenticated user: `POST /api/orders`.
- Validate cart không rỗng trước checkout.
- Lock rows khi checkout:
  - lock cart/cart_items
  - lock product_variants
  - lock voucher (nếu có code).
- Sau lock phải validate lại stock.
- Subtotal tính từ realtime price.
- Shipping fee:
  - `subtotal < 500000 => 30000`
  - `subtotal >= 500000 => 0`.
- Total:
  - `total = subtotal - discount_amount + shipping_fee`.
- Snapshot order/item:
  - order: customer + shipping info
  - order_items: `product_id`, `product_variant_id`, `product_name`, `variant_name`, `sku`, `image_url`, `unit_price`, `quantity`, `line_total`, `variant_info`.
- Trừ stock, clear cart, ghi voucher usage phải nằm trong cùng `DB::transaction`.
- Order code format: `ANS-DDMMYYYY-RANDOM6`.

---

## 6) Order Management

- Customer:
  - chỉ xem order của chính mình
  - chỉ cancel khi status thuộc `[pending, confirmed]`.
- Admin:
  - list/show mọi order
  - update status theo flow.
- Status flow:
  - `pending -> confirmed -> processing -> shipping -> delivered`
  - `shipping -> returned`
  - cancel:
    - customer: từ `pending|confirmed`
    - admin: từ `pending|confirmed|processing|shipping`
    - delivered không được cancel.
- Cancel order phải:
  - lock order (`lockForUpdate`)
  - chạy transaction
  - restore stock cho các item có `product_variant_id`
  - rollback voucher usage (`revoked_at`)
  - decrement `used_count`
  - chặn double cancel/double restore.

---

## 7) Payment Foundation (COD-only phase)

- Chưa tích hợp VNPay/MoMo trong phase này.
- Checkout chỉ chấp nhận `payment_method=cod`.
- Payment status convention:
  - `pending`: COD chưa thu tiền (hoặc online chưa callback cho phase sau)
  - `paid`: thanh toán thành công
  - `failed`: chỉ dành cho online payment fail ở phase sau
  - `cancelled`: order bị hủy
  - `refunded`: đã hoàn tiền.
- COD flow:
  - checkout => `payment_status=pending`
  - admin set order `delivered` => `payment_status=paid`
  - customer/admin cancel => `payment_status=cancelled`.
- Không cho client set `payment_status` trực tiếp qua payload update status bình thường.

---

## 8) Order Lookup (Public)

- Endpoint: `POST /api/orders/lookup` + `throttle:10,1`.
- Lookup bằng:
  - `order_code + email`, hoặc
  - `order_code + phone`.
- Không cho lookup chỉ bằng `order_code`.
- Nếu gửi cả email và phone thì cả hai phải cùng match.
- Contact source ưu tiên snapshot trên orders:
  - `customer_email`, `customer_phone`
  - fallback tương thích dữ liệu cũ: `guest_email`, `shipping_phone` (và `guest_phone` nếu có).
- Fail response luôn chung:
  - `"Không tìm thấy đơn hàng"`.
- Không leak PII khi fail.
- Success response:
  - mask `shipping_address` (20 ký tự đầu + `****`)
  - status timeline static theo `orders.status`.

---

## 9) Wishlist

- Wishlist chỉ cho user đã đăng nhập.
- Routes chuẩn:
  - `GET /api/wishlist`
  - `POST /api/wishlist/toggle`
  - `DELETE /api/wishlist/{product}`.
- Toggle:
  - chưa có thì add
  - đã có thì remove.
- DELETE idempotent:
  - item có/không có đều trả success.
- Pagination:
  - default `per_page=12`
  - max `per_page=50`.
- Chỉ cho wishlist product active và chưa soft deleted.
- Chống duplicate bằng unique `(user_id, product_id)`.

---

## 10) Reviews

- Guest không được create/delete review.
- Chỉ user đăng nhập được review.
- Chỉ review order_item thuộc chính user.
- Order chứa order_item phải `delivered`.
- `order_item.product_id` phải khớp product slug route.
- Mỗi `order_item` chỉ review 1 lần (unique `order_item_id`).
- User mua lại cùng product ở order_item khác vẫn review được.
- Rating integer từ 1..5.
- Comment optional.
- Tối đa 3 ảnh/review.
- Review images lưu ở bảng riêng `review_images` (không dùng JSON trong `reviews`).
- Upload review image qua `CloudinaryService`.
- `is_approved` default true trong phase hiện tại; chưa có admin moderation.
- Public review list chỉ hiển thị review approved.
- Product list/detail trả `rating_avg`, `review_count` tính realtime.

---

## 11) Admin Dashboard Stats

- Chỉ admin truy cập được endpoint stats.
- Metrics:
  - `total_users`
  - `total_products`
  - `total_orders`
  - `total_revenue`
  - `pending_orders`
  - `cancelled_orders`
  - `delivered_orders`
  - `low_stock_variants`
  - `out_of_stock_variants`
  - `total_reviews`
  - `average_rating`
  - `recent_orders` (limit 5)
  - `top_selling_products` (limit 5).
- Revenue rule:
  - `SUM(orders.total)` chỉ với orders `status=delivered` và `payment_status=paid`.
- Review rule:
  - chỉ tính review `is_approved=true`.
- `average_rating = 0` nếu chưa có review.
- `recent_orders` không trả full PII.

---

## 11.1) Admin Dashboard Analytics

- Chỉ admin truy cập được endpoint analytics.
- Endpoint: `GET /api/admin/dashboard/analytics`.
- Dữ liệu analytics gồm:
  - `metrics`
  - `revenue_chart` (12 tháng)
  - `order_chart` (12 tháng)
  - `order_status`
  - `inventory`
  - `recent_orders`
  - `top_selling_products`.
- Revenue cho analytics phải nhất quán với stats:
  - chỉ tính order `status=delivered` và `payment_status=paid`.
  - không tính order cancelled vào revenue.
- Growth percent convention:
  - previous month = 0, current > 0 => `100`
  - previous month = 0, current = 0 => `0`.
- Inventory breakdown:
  - `in_stock`: stock > 5
  - `low_stock`: 0 < stock <= 5
  - `out_of_stock`: stock <= 0.
- 12-month charts luôn trả đủ 12 điểm, tháng không có dữ liệu trả `0`.

---

## 12) API Response Contract

- Hệ thống đang migrate dần sang envelope chuẩn:
  - success
  - paginated
  - error.
- Stub/out-of-scope endpoint phải trả 501 theo envelope:
```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```
- Admin endpoints mới ưu tiên dùng `ApiResponse` helper/trait.
- Public legacy endpoints chưa migrate toàn bộ trong phase hiện tại.

---

## 13) Out-of-scope endpoints (giữ route, trả 501)

- Forgot/reset password APIs
- Public categories/brands APIs
- Comment APIs
- Address APIs
- Payment checkout/callback APIs
- Voucher apply API
- Admin dashboard revenue API


## Admin User Management

- Chỉ admin được truy cập quản lý user.
- Admin có thể xem danh sách user.
- Admin có thể xem chi tiết user.
- Admin có thể tạo user nếu cần.
- Admin có thể cập nhật `name`, `email`, `phone`, `role`, `is_banned`.
- Email user phải unique.
- Admin không thể tự xóa chính mình.
- Admin không thể tự ban chính mình.
- Admin không thể tự hạ role chính mình từ `admin` xuống `customer`.
- Admin không thể xóa user nếu user đã có order; ưu tiên ban user thay thế.
- Khi user bị ban (`is_banned=1`) thì không thể đăng nhập.
- Khi ban user, phải revoke toàn bộ Sanctum tokens của user đó.
- Ban/unban nên idempotent (gọi lại vẫn trả success).
- Không trả password/hash/token ra API.
- User delete dùng soft delete (`deleted_at`), không hard delete trong phase này.

## Notes / Clarifications

- `X-Guest-Token` dùng để định danh guest cart. Client phải lưu và gửi lại token này trong các request cart/checkout guest. Token nên là UUID hoặc chuỗi đủ khó đoán.
- `order_code` phải unique. Nếu random code bị trùng thì hệ thống phải generate lại.
- `refunded` trong `payment_status` được reserve cho phase refund/payment gateway sau, hiện chưa dùng trong COD-only flow.
- `total_products` trong dashboard không tính soft-deleted products, nhưng vẫn tính product `is_active=false`.
- Khi tạo endpoint mới, ưu tiên dùng `ApiResponse` envelope chuẩn.
- Khi refactor endpoint public legacy sang envelope mới, phải cập nhật feature tests tương ứng.
- Khi xóa review, cần xử lý review images liên quan theo implementation hiện tại.
