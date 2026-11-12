# Business Workflows — Ananas Fashion

> Updated: 2026-06-04  
> Source of truth: routes, controller, service, repository, model và Feature Tests

## 1. Quy ước trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| Implemented | Có code nghiệp vụ thực tế. |
| Partial | Đã có một phần nhưng thiếu UI hoặc mức độ hoàn thiện. |
| Planned / Not Implemented | Route chưa có logic hoặc trả controlled `501`. |
| Need Verification | Cần xác minh runtime, production hoặc xử lý conflict test. |

## 2. Browse Product

**Trạng thái:** Implemented

```text
Guest/Customer
  -> GET /api/products
  -> ProductIndexRequest validate search/filter/sort
  -> ProductRepository query product active
  -> ProductResource trả category/brand/variant/image/rating
```

Rules:

- Public chỉ thấy product active và chưa soft deleted.
- Search/filter/sort hỗ trợ category, brand, size, color, price và sort.
- Product detail dùng slug.
- Public Category/Brand API đã implement; `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ còn kỳ vọng `501`.

## 3. Register / Login và Merge Guest Cart

**Trạng thái:** Implemented

```text
Guest
  -> POST /api/auth/register hoặc /api/auth/login
  -> AuthService xác minh/tạo user
  -> phát Sanctum token
  -> frontend lưu token
  -> nếu có X-Guest-Token: POST /api/cart/merge
  -> merge quantity theo stock
  -> xóa guest cart sau merge
```

Rules:

- User bị ban không thể login.
- Merge bỏ qua item inactive/hết hàng và trả warnings.
- Logout current token và logout all đã implement.

## 4. Guest Cart / User Cart

**Trạng thái:** Implemented

```text
Request cart
  -> nếu Bearer token hợp lệ: resolve user cart
  -> nếu không: resolve/create guest cart bằng X-Guest-Token
  -> add/update/remove/clear
  -> tính unit price và total realtime
```

Rules:

- Cùng variant sẽ cộng quantity.
- Quantity không vượt stock.
- Update quantity `0` sẽ remove.
- Không thêm product inactive hoặc variant hết hàng.

## 5. Voucher Check

**Trạng thái:** Implemented

```text
Guest/User
  -> POST /api/vouchers/check với code
  -> resolve cart hiện tại
  -> tính subtotal realtime
  -> VoucherCalculator validate
  -> trả discount và total_after
```

Rules:

- Check không tạo `voucher_usages` và không tăng `used_count`.
- Kiểm tra active, thời gian, min order, usage limit và usage per user.
- Checkout sẽ validate voucher lại trong transaction.

## 6. Guest Checkout COD

**Trạng thái:** Implemented

```text
Guest cart + X-Guest-Token
  -> POST /api/checkout/guest
  -> validate shipping/contact + payment_method=cod
  -> DB transaction
  -> lock cart/items/variants/voucher
  -> validate lại stock và voucher
  -> tạo order + order item snapshots
  -> trừ stock
  -> ghi voucher usage nếu có
  -> clear cart
  -> trả order
```

Rules:

- Cart không được rỗng.
- Shipping fee: subtotal dưới `500000` là `30000`, ngược lại miễn phí.
- Order mới có `status=pending`, `payment_status=pending`.

## 7. Authenticated Checkout COD

**Trạng thái:** Implemented

Luồng tương tự Guest Checkout nhưng:

- Yêu cầu Bearer token.
- Order gắn với current user.
- Request dùng `shipping_name`, `shipping_phone`, `shipping_address`.
- Customer snapshot được lưu vào order.

## 8. Customer Order Management

**Trạng thái:** Implemented

```text
Customer
  -> GET /api/orders
  -> GET /api/orders/{order_code}
  -> POST /api/orders/{order_code}/cancel khi được phép
```

Rules:

- Customer chỉ xem order của chính mình.
- Customer chỉ cancel `pending` hoặc `confirmed`.
- Cancel chạy trong transaction, restore stock và revoke voucher usage.
- Chặn double cancel/double restore.

## 9. Admin Order Status

**Trạng thái:** Implemented

```text
pending -> confirmed -> processing -> shipping -> delivered
shipping -> returned
pending|confirmed|processing|shipping -> cancelled
```

Rules:

- Không cho transition ngoài flow.
- Không cancel order delivered.
- COD delivered sẽ chuyển `payment_status=paid`.
- Cancel sẽ chuyển `payment_status=cancelled`.
- Client không được gửi trực tiếp `payment_status`.

## 10. Public Order Lookup

**Trạng thái:** Implemented

```text
POST /api/orders/lookup
  -> order_code + email hoặc phone
  -> nếu gửi cả hai: cả hai phải khớp
  -> trả masked shipping address + status timeline
```

Rules:

- Không lookup chỉ bằng order code.
- Fail response dùng message chung, không leak PII.
- Endpoint áp dụng `throttle:10,1`.

## 11. Wishlist

**Trạng thái:** Implemented

```text
Authenticated Customer
  -> GET /api/wishlist
  -> POST /api/wishlist/toggle
  -> DELETE /api/wishlist/{product}
```

Rules:

- Chỉ user đăng nhập.
- Chỉ product active, chưa soft deleted.
- Toggle add/remove.
- Delete idempotent.

## 12. Review

**Trạng thái:** Implemented

```text
Customer
  -> chọn order_item đã delivered
  -> POST /api/products/{slug}/reviews
  -> validate ownership/product/rating/images
  -> tạo review
  -> public list chỉ trả approved reviews
```

Rules:

- Mỗi order item chỉ review một lần.
- Rating từ 1 đến 5.
- Tối đa 3 ảnh.
- Customer chỉ xóa review của chính mình.

## 13. Admin Catalog Management

**Trạng thái:** Implemented

Admin có thể:

- CRUD Category và Brand.
- CRUD Product; soft delete, restore, active status.
- CRUD Product Variant.
- Upload/delete/set-primary Product Image.
- Product image giới hạn tối đa 10 ảnh theo controller hiện tại.

Cloudinary wrapper và local fallback đã có; production credentials/media lifecycle là **Need Verification**.

## 14. Admin User Management

**Trạng thái:** Implemented

```text
Admin
  -> list/show/create/update user
  -> ban/unban user
  -> soft delete user nếu chưa có order
```

Rules:

- Admin không tự ban, tự xóa hoặc tự hạ role.
- User có order không được xóa; dùng ban thay thế.
- Ban user revoke toàn bộ Sanctum tokens.
- Ban/unban idempotent.

## 15. Admin Dashboard

**Trạng thái:** Implemented

- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/analytics`

Rules:

- Chỉ tính revenue từ order delivered và paid.
- Analytics chart trả đủ 12 tháng, không fake data.
- `GET /api/admin/dashboard/revenue` riêng vẫn là **Planned / Not Implemented**.

## 16. Planned / Not Implemented Workflows

Các route sau tồn tại nhưng trả controlled `501`:

- Forgot/reset password.
- Address management.
- Comment module.
- Online payment checkout/callback VNPay/MoMo.
- Standalone voucher apply.
- Admin dashboard revenue endpoint riêng.

## 17. Need Verification

- Xử lý mâu thuẫn giữa `PublicCategoryBrandTest` với `RouteHardeningTest` và `ApiResponseContractFoundationTest`.
- Xác minh Cloudinary production credentials và media lifecycle.
- Thống nhất `.env.example` đang khai báo MySQL với baseline SQLite local.
- Chuẩn hóa response contract hybrid trước khi production.
