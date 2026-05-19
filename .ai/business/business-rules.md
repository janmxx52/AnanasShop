# Business Rules â€” Ananas Fashion

> Updated: 2026-05-15  
> Scope: backend rules Ä‘ang implemented hoáº·c Ä‘Ã£ chá»‘t quyáº¿t Ä‘á»‹nh

---

## 1) Authentication & Authorization

- DÃ¹ng Sanctum token-based auth.
- Register yÃªu cáº§u: `name`, `email`, `password`, `password_confirmation`; `phone` optional.
- Password tá»‘i thiá»ƒu 8 kÃ½ tá»±, cÃ³ chá»¯ hoa + chá»¯ thÆ°á»ng + sá»‘.
- Email unique.
- User bá»‹ `is_banned=true` khÃ´ng Ä‘Æ°á»£c login.
- User cÃ³ thá»ƒ logout current token vÃ  logout all tokens.
- Admin routes yÃªu cáº§u: `auth:sanctum + role:admin`.

---

## 2) Product & Pricing

- Public chá»‰ hiá»ƒn thá»‹ product `is_active=true` vÃ  chÆ°a soft deleted.
- Product display price:
  - `product_display_price = sale_price` náº¿u cÃ³
  - ngÆ°á»£c láº¡i dÃ¹ng `base_price`.
- Variant final price:
  - `variant_final_price = product_display_price + price_adjustment`.
- Rule giÃ¡ trÃªn pháº£i Ä‘á»“ng nháº¥t giá»¯a:
  - Product API
  - Cart realtime total
  - Voucher subtotal check
  - Checkout unit_price snapshot.
- Variant uniqueness: khÃ´ng trÃ¹ng `(product_id, size, color)`.

---

## 3) Cart

- Há»— trá»£ guest cart (`X-Guest-Token`) vÃ  user cart (`auth:sanctum`).
- CÃ¹ng variant trong cÃ¹ng cart sáº½ cá»™ng quantity.
- Quantity tá»‘i thiá»ƒu 1; update vá» 0 thÃ¬ remove item.
- Quantity khÃ´ng vÆ°á»£t stock variant.
- KhÃ´ng cho add/update variant náº¿u product inactive hoáº·c variant háº¿t hÃ ng.
- Cart khÃ´ng lÆ°u giÃ¡ cá»©ng, luÃ´n tÃ­nh realtime.
- Sau login cÃ³ thá»ƒ merge guest cart vÃ o user cart, quantity váº«n pháº£i theo stock.

---

## 4) Voucher

- Voucher type: `percent` hoáº·c `fixed`.
- Validate:
  - `is_active`
  - `starts_at` / `expires_at`
  - `min_order_amount`
  - `usage_limit`
  - `usage_per_user`.
- Percent voucher pháº£i tÃ´n trá»ng `max_discount` (náº¿u cÃ³).
- `voucher_usages` lÃ  source of truth cho usage.
- `vouchers.used_count` lÃ  counter cache.
- Voucher check endpoint **khÃ´ng Ä‘Æ°á»£c mutate** usage.
- Chá»‰ mutate usage khi checkout success trong transaction:
  - táº¡o `voucher_usages`
  - increment `used_count`.
- Khi cancel order:
  - khÃ´ng xÃ³a usage row
  - set `voucher_usages.revoked_at = now()`
  - decrement `vouchers.used_count`.
- Usage limit/per-user chá»‰ count usage cÃ³ `revoked_at IS NULL`.

---

## 5) Checkout & Orders

- Checkout há»— trá»£:
  - guest: `POST /api/checkout/guest`
  - authenticated user: `POST /api/orders`.
- Validate cart khÃ´ng rá»—ng trÆ°á»›c checkout.
- Lock rows khi checkout:
  - lock cart/cart_items
  - lock product_variants
  - lock voucher (náº¿u cÃ³ code).
- Sau lock pháº£i validate láº¡i stock.
- Subtotal tÃ­nh tá»« realtime price.
- Shipping fee:
  - `subtotal < 500000 => 30000`
  - `subtotal >= 500000 => 0`.
- Total:
  - `total = subtotal - discount_amount + shipping_fee`.
- Snapshot order/item:
  - order: customer + shipping info
  - order_items: `product_id`, `product_variant_id`, `product_name`, `variant_name`, `sku`, `image_url`, `unit_price`, `quantity`, `line_total`, `variant_info`.
- Trá»« stock, clear cart, ghi voucher usage pháº£i náº±m trong cÃ¹ng `DB::transaction`.
- Order code format: `ANS-DDMMYYYY-RANDOM6`.

---

## 6) Order Management

- Customer:
  - chá»‰ xem order cá»§a chÃ­nh mÃ¬nh
  - chá»‰ cancel khi status thuá»™c `[pending, confirmed]`.
- Admin:
  - list/show má»i order
  - update status theo flow.
- Status flow:
  - `pending -> confirmed -> processing -> shipping -> delivered`
  - `shipping -> returned`
  - cancel:
    - customer: tá»« `pending|confirmed`
    - admin: tá»« `pending|confirmed|processing|shipping`
    - delivered khÃ´ng Ä‘Æ°á»£c cancel.
- Cancel order pháº£i:
  - lock order (`lockForUpdate`)
  - cháº¡y transaction
  - restore stock cho cÃ¡c item cÃ³ `product_variant_id`
  - rollback voucher usage (`revoked_at`)
  - decrement `used_count`
  - cháº·n double cancel/double restore.

---

## 7) Payment Foundation (COD-only phase)

- ChÆ°a tÃ­ch há»£p VNPay/MoMo trong phase nÃ y.
- Checkout chá»‰ cháº¥p nháº­n `payment_method=cod`.
- Payment status convention:
  - `pending`: COD chÆ°a thu tiá»n (hoáº·c online chÆ°a callback cho phase sau)
  - `paid`: thanh toÃ¡n thÃ nh cÃ´ng
  - `failed`: chá»‰ dÃ nh cho online payment fail á»Ÿ phase sau
  - `cancelled`: order bá»‹ há»§y
  - `refunded`: Ä‘Ã£ hoÃ n tiá»n.
- COD flow:
  - checkout => `payment_status=pending`
  - admin set order `delivered` => `payment_status=paid`
  - customer/admin cancel => `payment_status=cancelled`.
- KhÃ´ng cho client set `payment_status` trá»±c tiáº¿p qua payload update status bÃ¬nh thÆ°á»ng.

---

## 8) Order Lookup (Public)

- Endpoint: `POST /api/orders/lookup` + `throttle:10,1`.
- Lookup báº±ng:
  - `order_code + email`, hoáº·c
  - `order_code + phone`.
- KhÃ´ng cho lookup chá»‰ báº±ng `order_code`.
- Náº¿u gá»­i cáº£ email vÃ  phone thÃ¬ cáº£ hai pháº£i cÃ¹ng match.
- Contact source Æ°u tiÃªn snapshot trÃªn orders:
  - `customer_email`, `customer_phone`
  - fallback tÆ°Æ¡ng thÃ­ch dá»¯ liá»‡u cÅ©: `guest_email`, `shipping_phone` (vÃ  `guest_phone` náº¿u cÃ³).
- Fail response luÃ´n chung:
  - `"KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng"`.
- KhÃ´ng leak PII khi fail.
- Success response:
  - mask `shipping_address` (20 kÃ½ tá»± Ä‘áº§u + `****`)
  - status timeline static theo `orders.status`.

---

## 9) Wishlist

- Wishlist chá»‰ cho user Ä‘Ã£ Ä‘Äƒng nháº­p.
- Routes chuáº©n:
  - `GET /api/wishlist`
  - `POST /api/wishlist/toggle`
  - `DELETE /api/wishlist/{product}`.
- Toggle:
  - chÆ°a cÃ³ thÃ¬ add
  - Ä‘Ã£ cÃ³ thÃ¬ remove.
- DELETE idempotent:
  - item cÃ³/khÃ´ng cÃ³ Ä‘á»u tráº£ success.
- Pagination:
  - default `per_page=12`
  - max `per_page=50`.
- Chá»‰ cho wishlist product active vÃ  chÆ°a soft deleted.
- Chá»‘ng duplicate báº±ng unique `(user_id, product_id)`.

---

## 10) Reviews

- Guest khÃ´ng Ä‘Æ°á»£c create/delete review.
- Chá»‰ user Ä‘Äƒng nháº­p Ä‘Æ°á»£c review.
- Chá»‰ review order_item thuá»™c chÃ­nh user.
- Order chá»©a order_item pháº£i `delivered`.
- `order_item.product_id` pháº£i khá»›p product slug route.
- Má»—i `order_item` chá»‰ review 1 láº§n (unique `order_item_id`).
- User mua láº¡i cÃ¹ng product á»Ÿ order_item khÃ¡c váº«n review Ä‘Æ°á»£c.
- Rating integer tá»« 1..5.
- Comment optional.
- Tá»‘i Ä‘a 3 áº£nh/review.
- Review images lÆ°u á»Ÿ báº£ng riÃªng `review_images` (khÃ´ng dÃ¹ng JSON trong `reviews`).
- Upload review image qua `CloudinaryService`.
- `is_approved` default true trong phase hiá»‡n táº¡i; chÆ°a cÃ³ admin moderation.
- Public review list chá»‰ hiá»ƒn thá»‹ review approved.
- Product list/detail tráº£ `rating_avg`, `review_count` tÃ­nh realtime.

---

## 11) Admin Dashboard Stats

- Chá»‰ admin truy cáº­p Ä‘Æ°á»£c endpoint stats.
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
  - `SUM(orders.total)` chá»‰ vá»›i orders `status=delivered` vÃ  `payment_status=paid`.
- Review rule:
  - chá»‰ tÃ­nh review `is_approved=true`.
- `average_rating = 0` náº¿u chÆ°a cÃ³ review.
- `recent_orders` khÃ´ng tráº£ full PII.

---

## 12) API Response Contract

- Há»‡ thá»‘ng Ä‘ang migrate dáº§n sang envelope chuáº©n:
  - success
  - paginated
  - error.
- Stub/out-of-scope endpoint pháº£i tráº£ 501 theo envelope:
```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```
- Admin endpoints má»›i Æ°u tiÃªn dÃ¹ng `ApiResponse` helper/trait.
- Public legacy endpoints chÆ°a migrate toÃ n bá»™ trong phase hiá»‡n táº¡i.

---

## 13) Out-of-scope endpoints (giá»¯ route, tráº£ 501)

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

- `X-Guest-Token` dÃ¹ng Ä‘á»ƒ Ä‘á»‹nh danh guest cart. Client pháº£i lÆ°u vÃ  gá»­i láº¡i token nÃ y trong cÃ¡c request cart/checkout guest. Token nÃªn lÃ  UUID hoáº·c chuá»—i Ä‘á»§ khÃ³ Ä‘oÃ¡n.
- `order_code` pháº£i unique. Náº¿u random code bá»‹ trÃ¹ng thÃ¬ há»‡ thá»‘ng pháº£i generate láº¡i.
- `refunded` trong `payment_status` Ä‘Æ°á»£c reserve cho phase refund/payment gateway sau, hiá»‡n chÆ°a dÃ¹ng trong COD-only flow.
- `total_products` trong dashboard khÃ´ng tÃ­nh soft-deleted products, nhÆ°ng váº«n tÃ­nh product `is_active=false`.
- Khi táº¡o endpoint má»›i, Æ°u tiÃªn dÃ¹ng `ApiResponse` envelope chuáº©n.
- Khi refactor endpoint public legacy sang envelope má»›i, pháº£i cáº­p nháº­t feature tests tÆ°Æ¡ng á»©ng.
- Khi xÃ³a review, cáº§n xá»­ lÃ½ review images liÃªn quan theo implementation hiá»‡n táº¡i.
