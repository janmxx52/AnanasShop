# API Routes — Ananas Fashion

> Updated: 2026-05-15  
> Source of truth: `routes/api.php`  
> Base URL: `/api`

---

## 1) Auth & middleware overview

- **Public**: không cần token.
- **Protected user**: `auth:sanctum`.
- **Admin**: `auth:sanctum + role:admin`.
- **Guest cart**: dùng header `X-Guest-Token` khi không đăng nhập.

---

## 2) Response contract hiện tại

Hệ thống đang ở trạng thái **hybrid**:

- **Standard envelope** (đã dùng ở nhiều endpoint mới/admin/stub):
```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```
- **Paginated envelope** (chuẩn mới):
```json
{
  "success": true,
  "message": "OK",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```
- **Error envelope**:
```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```
- **Not implemented (501)**:
```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```

Ghi chú: một số endpoint public cũ (ví dụ product list/detail, cart, auth legacy) vẫn trả format legacy.

---

## 3) Public routes

| Method | Endpoint | Auth | Status | Notes |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | ✅ Implemented | Đăng ký |
| POST | `/api/auth/login` | Public | ✅ Implemented | Đăng nhập |
| POST | `/api/auth/forgot-password` | Public | 🧱 501 | Out-of-scope |
| POST | `/api/auth/reset-password` | Public | 🧱 501 | Out-of-scope |
| GET | `/api/products` | Public | ✅ Implemented | List/filter/sort |
| GET | `/api/products/{slug}` | Public | ✅ Implemented | Product detail |
| GET | `/api/products/{slug}/reviews` | Public | ✅ Implemented | Public reviews |
| GET | `/api/products/{slug}/comments` | Public | 🧱 501 | Comment module chưa làm |
| GET | `/api/categories` | Public | 🧱 501 | Public category API chưa làm |
| GET | `/api/categories/{slug}` | Public | 🧱 501 | Public category API chưa làm |
| GET | `/api/brands` | Public | 🧱 501 | Public brand API chưa làm |
| GET | `/api/brands/{slug}` | Public | 🧱 501 | Public brand API chưa làm |
| POST | `/api/vouchers/check` | Public | ✅ Implemented | Voucher check |
| POST | `/api/orders/lookup` | Public | ✅ Implemented | `throttle:10,1` |
| GET | `/api/cart` | Public/Token optional | ✅ Implemented | Guest/User cart |
| POST | `/api/cart/items` | Public/Token optional | ✅ Implemented | Add item |
| PUT | `/api/cart/items/{itemId}` | Public/Token optional | ✅ Implemented | Update quantity |
| DELETE | `/api/cart/items/{itemId}` | Public/Token optional | ✅ Implemented | Remove item |
| DELETE | `/api/cart` | Public/Token optional | ✅ Implemented | Clear cart |
| POST | `/api/checkout/guest` | Public | ✅ Implemented | Guest checkout (COD) |
| GET | `/api/payments/callback` | Public | 🧱 501 | Payment gateway chưa làm |
| POST | `/api/payments/callback` | Public | 🧱 501 | Payment gateway chưa làm |

---

## 4) Protected user routes (`auth:sanctum`)

| Method | Endpoint | Auth | Status | Notes |
|---|---|---|---|---|
| POST | `/api/auth/logout` | User | ✅ Implemented | Logout current token |
| POST | `/api/auth/logout-all` | User | ✅ Implemented | Logout all tokens |
| GET | `/api/auth/me` | User | ✅ Implemented | Me profile |
| PUT | `/api/auth/me` | User | ✅ Implemented | Update profile |
| PUT | `/api/auth/me/password` | User | ✅ Implemented | Change password |
| GET | `/api/addresses` | User | 🧱 501 | Address module chưa làm |
| POST | `/api/addresses` | User | 🧱 501 | Address module chưa làm |
| GET | `/api/addresses/{address}` | User | 🧱 501 | Address module chưa làm |
| PUT | `/api/addresses/{address}` | User | 🧱 501 | Address module chưa làm |
| PATCH | `/api/addresses/{address}` | User | 🧱 501 | Address module chưa làm |
| DELETE | `/api/addresses/{address}` | User | 🧱 501 | Address module chưa làm |
| PUT | `/api/addresses/{id}/default` | User | 🧱 501 | Address module chưa làm |
| POST | `/api/cart/merge` | User | ✅ Implemented | Merge guest cart |
| GET | `/api/orders` | User | ✅ Implemented | Order list |
| POST | `/api/orders` | User | ✅ Implemented | Auth checkout (COD) |
| GET | `/api/orders/{order_code}` | User | ✅ Implemented | Order detail |
| POST | `/api/orders/{order_code}/cancel` | User | ✅ Implemented | Customer cancel |
| POST | `/api/payments/checkout` | User | 🧱 501 | Online payment chưa làm |
| POST | `/api/products/{slug}/reviews` | User | ✅ Implemented | Create review |
| POST | `/api/products/{slug}/comments` | User | 🧱 501 | Comment module chưa làm |
| DELETE | `/api/reviews/{id}` | User | ✅ Implemented | Delete own review |
| DELETE | `/api/comments/{id}` | User | 🧱 501 | Comment module chưa làm |
| GET | `/api/wishlist` | User | ✅ Implemented | Wishlist list |
| POST | `/api/wishlist/toggle` | User | ✅ Implemented | Wishlist toggle |
| DELETE | `/api/wishlist/{product}` | User | ✅ Implemented | Idempotent delete |
| POST | `/api/vouchers/apply` | User | 🧱 501 | Out-of-scope |

---

## 5) Admin routes (`auth:sanctum + role:admin`)

| Method | Endpoint | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/api/admin/products` | Admin | ✅ Implemented | Product list |
| POST | `/api/admin/products` | Admin | ✅ Implemented | Product create |
| GET | `/api/admin/products/{product}` | Admin | ✅ Implemented | Product detail |
| PUT | `/api/admin/products/{product}` | Admin | ✅ Implemented | Product update |
| PATCH | `/api/admin/products/{product}` | Admin | ✅ Implemented | Product update |
| DELETE | `/api/admin/products/{product}` | Admin | ✅ Implemented | Soft delete |
| POST | `/api/admin/products/{id}/restore` | Admin | ✅ Implemented | Restore product |
| PATCH | `/api/admin/products/{id}/status` | Admin | ✅ Implemented | Toggle active |
| GET | `/api/admin/products/{product}/images` | Admin | ✅ Implemented | Image list |
| POST | `/api/admin/products/{product}/images` | Admin | ✅ Implemented | Image upload |
| DELETE | `/api/admin/products/{product}/images/{image}` | Admin | ✅ Implemented | Image delete |
| PATCH | `/api/admin/products/{product}/images/{image}/primary` | Admin | ✅ Implemented | Set primary |
| GET | `/api/admin/products/{product}/variants` | Admin | ✅ Implemented | Variant list |
| POST | `/api/admin/products/{product}/variants` | Admin | ✅ Implemented | Variant create |
| GET | `/api/admin/products/{product}/variants/{variant}` | Admin | ✅ Implemented | Variant detail |
| PUT | `/api/admin/products/{product}/variants/{variant}` | Admin | ✅ Implemented | Variant update |
| PATCH | `/api/admin/products/{product}/variants/{variant}` | Admin | ✅ Implemented | Variant update |
| DELETE | `/api/admin/products/{product}/variants/{variant}` | Admin | ✅ Implemented | Variant delete |
| GET | `/api/admin/categories` | Admin | ✅ Implemented | Category list |
| POST | `/api/admin/categories` | Admin | ✅ Implemented | Category create |
| GET | `/api/admin/categories/{category}` | Admin | ✅ Implemented | Category detail |
| PUT | `/api/admin/categories/{category}` | Admin | ✅ Implemented | Category update |
| PATCH | `/api/admin/categories/{category}` | Admin | ✅ Implemented | Category update |
| DELETE | `/api/admin/categories/{category}` | Admin | ✅ Implemented | Category delete |
| GET | `/api/admin/brands` | Admin | ✅ Implemented | Brand list |
| POST | `/api/admin/brands` | Admin | ✅ Implemented | Brand create |
| GET | `/api/admin/brands/{brand}` | Admin | ✅ Implemented | Brand detail |
| PUT | `/api/admin/brands/{brand}` | Admin | ✅ Implemented | Brand update |
| PATCH | `/api/admin/brands/{brand}` | Admin | ✅ Implemented | Brand update |
| DELETE | `/api/admin/brands/{brand}` | Admin | ✅ Implemented | Brand delete |
| GET | `/api/admin/orders` | Admin | ✅ Implemented | Order list |
| GET | `/api/admin/orders/{order_code}` | Admin | ✅ Implemented | Order detail |
| PATCH | `/api/admin/orders/{order_code}/status` | Admin | ✅ Implemented | Status flow + cancel |
| GET | `/api/admin/users` | Admin | 🧱 501 | Admin user module chưa làm |
| GET | `/api/admin/users/{id}` | Admin | 🧱 501 | Admin user module chưa làm |
| PUT | `/api/admin/users/{id}/ban` | Admin | 🧱 501 | Admin user module chưa làm |
| GET | `/api/admin/vouchers` | Admin | ✅ Implemented | Voucher list |
| POST | `/api/admin/vouchers` | Admin | ✅ Implemented | Voucher create |
| GET | `/api/admin/vouchers/{voucher}` | Admin | ✅ Implemented | Voucher detail |
| PUT | `/api/admin/vouchers/{voucher}` | Admin | ✅ Implemented | Voucher update |
| PATCH | `/api/admin/vouchers/{voucher}` | Admin | ✅ Implemented | Voucher update |
| DELETE | `/api/admin/vouchers/{voucher}` | Admin | ✅ Implemented | Voucher deactivate |
| GET | `/api/admin/dashboard/stats` | Admin | ✅ Implemented | Dashboard metrics |
| GET | `/api/admin/dashboard/revenue` | Admin | 🧱 501 | Out-of-scope |

---

## 6) Out-of-scope summary (501)

Các module hiện intentionally giữ route nhưng chưa implement:

- Forgot/reset password
- Public categories/brands API
- Comment API
- Address API
- Payment checkout/callback (VNPay/MoMo phase sau)
- Voucher apply endpoint
- Admin user management
- Admin dashboard revenue endpoint

Tất cả các route này trả JSON 501 theo envelope chuẩn.

