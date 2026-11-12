# API Routes — Ananas Fashion

> Updated: 2026-06-04  
> Source of truth: `routes/api.php`  
> Base URL local: `http://127.0.0.1:8000/api`

## 1. Quy ước

| Nhãn | Ý nghĩa |
|---|---|
| Public | Không cần đăng nhập. |
| Public / Optional Auth | Dùng Bearer token nếu là user; nếu là guest dùng `X-Guest-Token`. |
| Requires Auth | Yêu cầu `auth:sanctum`. |
| Requires Admin | Yêu cầu `auth:sanctum + role:admin`. |
| Implemented | Có controller/logic thực tế. |
| Not Implemented | Route tồn tại nhưng controller trả controlled `501`. |

Response contract hiện ở trạng thái hybrid. Admin API mới và route `501` ưu tiên envelope chuẩn; một số public/legacy endpoint vẫn trả Resource hoặc payload trực tiếp.

## 2. Public Routes

| Method | Endpoint | Quyền | Trạng thái | Ghi chú |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | Implemented | Đăng ký và phát Sanctum token. |
| POST | `/api/auth/login` | Public | Implemented | Đăng nhập; user bị ban không thể login. |
| POST | `/api/auth/forgot-password` | Public | Not Implemented | Controlled `501`. |
| POST | `/api/auth/reset-password` | Public | Not Implemented | Controlled `501`. |
| GET | `/api/products` | Public | Implemented | List/search/filter/sort/pagination. |
| GET | `/api/products/{slug}` | Public | Implemented | Product detail. |
| GET | `/api/products/{slug}/reviews` | Public | Implemented | Approved reviews. |
| GET | `/api/products/{slug}/comments` | Public | Not Implemented | Controlled `501`. |
| GET | `/api/categories` | Public | Implemented | Active categories; có conflict test cũ. |
| GET | `/api/categories/{slug}` | Public | Implemented | Active category detail; có conflict test cũ. |
| GET | `/api/brands` | Public | Implemented | Active brands; có conflict test cũ. |
| GET | `/api/brands/{slug}` | Public | Implemented | Active brand detail; có conflict test cũ. |
| POST | `/api/vouchers/check` | Public / Optional Auth | Implemented | Check voucher, không mutate usage. |
| POST | `/api/orders/lookup` | Public | Implemented | `throttle:10,1`. |
| GET | `/api/cart` | Public / Optional Auth | Implemented | Guest/user cart. |
| POST | `/api/cart/items` | Public / Optional Auth | Implemented | Add cart item. |
| PUT | `/api/cart/items/{itemId}` | Public / Optional Auth | Implemented | Update quantity; `0` sẽ remove. |
| DELETE | `/api/cart/items/{itemId}` | Public / Optional Auth | Implemented | Remove cart item. |
| DELETE | `/api/cart` | Public / Optional Auth | Implemented | Clear cart. |
| POST | `/api/checkout/guest` | Public | Implemented | Guest checkout COD. |
| GET | `/api/payments/callback` | Public | Not Implemented | Controlled `501`. |
| POST | `/api/payments/callback` | Public | Not Implemented | Controlled `501`. |

## 3. Protected User Routes

Middleware: `auth:sanctum`.

| Method | Endpoint | Trạng thái | Ghi chú |
|---|---|---|---|
| POST | `/api/auth/logout` | Implemented | Revoke current token. |
| POST | `/api/auth/logout-all` | Implemented | Revoke toàn bộ tokens. |
| GET | `/api/auth/me` | Implemented | Current user. |
| PUT | `/api/auth/me` | Implemented | Update `name`, `phone`, `avatar`. |
| PUT | `/api/auth/me/password` | Implemented | Change password, revoke token khác. |
| GET | `/api/addresses` | Not Implemented | Controlled `501`. |
| POST | `/api/addresses` | Not Implemented | Controlled `501`. |
| GET | `/api/addresses/{address}` | Not Implemented | Controlled `501`. |
| PUT | `/api/addresses/{address}` | Not Implemented | Controlled `501`. |
| PATCH | `/api/addresses/{address}` | Not Implemented | Controlled `501`. |
| DELETE | `/api/addresses/{address}` | Not Implemented | Controlled `501`. |
| PUT | `/api/addresses/{id}/default` | Not Implemented | Controlled `501`. |
| POST | `/api/cart/merge` | Implemented | Merge guest cart vào user cart. |
| GET | `/api/orders` | Implemented | Customer order list. |
| POST | `/api/orders` | Implemented | Authenticated checkout COD. |
| GET | `/api/orders/{order_code}` | Implemented | Customer order detail. |
| POST | `/api/orders/{order_code}/cancel` | Implemented | Customer cancel theo status rule. |
| POST | `/api/payments/checkout` | Not Implemented | Controlled `501`. |
| POST | `/api/products/{slug}/reviews` | Implemented | Create review. |
| DELETE | `/api/reviews/{id}` | Implemented | Delete own review. |
| POST | `/api/products/{slug}/comments` | Not Implemented | Controlled `501`. |
| DELETE | `/api/comments/{id}` | Not Implemented | Controlled `501`. |
| GET | `/api/wishlist` | Implemented | Wishlist list. |
| POST | `/api/wishlist/toggle` | Implemented | Add/remove wishlist. |
| DELETE | `/api/wishlist/{product}` | Implemented | Idempotent remove. |
| POST | `/api/vouchers/apply` | Not Implemented | Controlled `501`; checkout dùng `voucher_code`. |

## 4. Admin Routes

Middleware: `auth:sanctum + role:admin`.

### 4.1. Product

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/admin/products` | Implemented |
| POST | `/api/admin/products` | Implemented |
| GET | `/api/admin/products/{product}` | Implemented |
| PUT | `/api/admin/products/{product}` | Implemented |
| PATCH | `/api/admin/products/{product}` | Implemented |
| DELETE | `/api/admin/products/{product}` | Implemented — soft delete |
| POST | `/api/admin/products/{id}/restore` | Implemented |
| PATCH | `/api/admin/products/{id}/status` | Implemented |

### 4.2. Product Variant

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/admin/products/{product}/variants` | Implemented |
| POST | `/api/admin/products/{product}/variants` | Implemented |
| GET | `/api/admin/products/{product}/variants/{variant}` | Implemented |
| PUT | `/api/admin/products/{product}/variants/{variant}` | Implemented |
| PATCH | `/api/admin/products/{product}/variants/{variant}` | Implemented |
| DELETE | `/api/admin/products/{product}/variants/{variant}` | Implemented |

### 4.3. Product Image

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/admin/products/{product}/images` | Implemented |
| POST | `/api/admin/products/{product}/images` | Implemented |
| DELETE | `/api/admin/products/{product}/images/{image}` | Implemented |
| PATCH | `/api/admin/products/{product}/images/{image}/primary` | Implemented |

### 4.4. Category và Brand

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET/POST | `/api/admin/categories` | Implemented |
| GET/PUT/PATCH/DELETE | `/api/admin/categories/{category}` | Implemented |
| GET/POST | `/api/admin/brands` | Implemented |
| GET/PUT/PATCH/DELETE | `/api/admin/brands/{brand}` | Implemented |

### 4.5. Order

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/admin/orders` | Implemented |
| GET | `/api/admin/orders/{order_code}` | Implemented |
| PATCH | `/api/admin/orders/{order_code}/status` | Implemented |

### 4.6. User

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/admin/users` | Implemented |
| POST | `/api/admin/users` | Implemented |
| GET | `/api/admin/users/{user}` | Implemented |
| PUT | `/api/admin/users/{user}` | Implemented |
| DELETE | `/api/admin/users/{user}` | Implemented — soft delete theo rule |
| PATCH | `/api/admin/users/{user}/ban` | Implemented |
| PATCH | `/api/admin/users/{user}/unban` | Implemented |

### 4.7. Voucher

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET/POST | `/api/admin/vouchers` | Implemented |
| GET/PUT/PATCH | `/api/admin/vouchers/{voucher}` | Implemented |
| DELETE | `/api/admin/vouchers/{voucher}` | Implemented — soft-disable `is_active=0` |

### 4.8. Dashboard

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Implemented |
| GET | `/api/admin/dashboard/analytics` | Implemented |
| GET | `/api/admin/dashboard/revenue` | Not Implemented — controlled `501` |

## 5. Route Inventory

| Phân loại | Số route operations |
|---|---:|
| Public / Public Optional Auth | 22 |
| Requires Auth | 26 |
| Requires Admin | 49 |
| **Tổng cộng** | **97** |

| Trạng thái | Số route operations |
|---|---:|
| Implemented | 80 |
| Not Implemented / controlled `501` | 17 |

## 6. Controlled 501 Routes

- Forgot/reset password.
- Comment module.
- Address management.
- Online payment checkout/callback.
- Standalone voucher apply.
- Admin dashboard revenue endpoint.

Response hiện tại:

```json
{
  "success": false,
  "message": "Chức năng này chưa được hỗ trợ.",
  "errors": null
}
```

## 7. Need Verification và Conflict

- `PublicCategoryBrandTest` xác nhận Public Category/Brand API đã Implemented.
- `RouteHardeningTest` cũ vẫn kỳ vọng bốn route Public Category/Brand trả `501`; `ApiResponseContractFoundationTest` cũng còn kỳ vọng Category list trả `501`.
- `.env.example` hiện khai báo MySQL trong khi baseline tài liệu, PHPUnit và CI sử dụng SQLite; cần thống nhất cấu hình bàn giao.
- Cloudinary production credentials và media lifecycle chưa được xác minh.
