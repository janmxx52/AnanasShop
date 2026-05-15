# API Documentation — Ananas Fashion Backend

> Last updated: 2026-05-14  
> Base URL: `/api`  
> Content type: `application/json` (trừ endpoint upload ảnh dùng `multipart/form-data`)

---

## 1) Base URL

- Tất cả endpoint được prefix bởi `/api`.

---

## 2) Authentication

- Dùng Laravel Sanctum (token-based).
- Header chuẩn:

```http
Authorization: Bearer {token}
Accept: application/json
```

- Guest cart dùng thêm header:

```http
X-Guest-Token: {uuid}
```

---

## 3) Response Contract

## 3.1 Success envelope (chuẩn mới)

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

## 3.2 Paginated envelope (chuẩn mới)

```json
{
  "success": true,
  "message": "OK",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 100,
    "last_page": 9
  }
}
```

## 3.3 Error envelope (chuẩn mới)

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": [
      "Validation message"
    ]
  }
}
```

## 3.4 501 not implemented envelope

```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```

## 3.5 Ghi chú tương thích

- Một số endpoint cũ/public vẫn trả format legacy (không bọc `message`/`success` đồng nhất), ví dụ `GET /api/products`, `GET /api/products/{slug}`, nhóm cart/auth cũ.
- Validation exception mặc định Laravel hiện vẫn có thể trả:

```json
{
  "message": "The given data was invalid.",
  "errors": {}
}
```

---

## 4) Auth APIs

### 4.1 POST `/api/auth/register`
- Auth: Public
- Headers: `Accept: application/json`
- Request body:
```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "Password1",
  "password_confirmation": "Password1",
  "phone": "0900000000",
  "device_name": "web"
}
```
- Success `201`:
```json
{
  "success": true,
  "data": {
    "token": "1|...",
    "expires_at": "2026-06-13 10:00:00",
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "a@example.com"
    }
  }
}
```
- Error example `422`: duplicate email/invalid password.
- Business notes: password min 8, có chữ hoa/thường/số.
- Related tests: `tests/Feature/AuthFlowTest.php`.

### 4.2 POST `/api/auth/login`
- Auth: Public
- Headers: `Accept: application/json`
- Request body:
```json
  {
    "email": "a@example.com",
    "password": "Password1",
    "device_name": "web"
  }
```
- Success `200`:
```json
{
  "success": true,
  "data": {
    "token": "2|...",
    "expires_at": "2026-06-13 10:00:00",
    "user": {
      "id": 1,
      "role": "customer"
    }
  }
}
```
- Error `401`:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```
- Business notes: user bị ban không đăng nhập được.
- Related tests: `tests/Feature/AuthFlowTest.php`.

### 4.3 POST `/api/auth/logout`
- Auth: Required (`auth:sanctum`)
- Headers: `Authorization`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "message": "Logged out"
}
```
- Error `401`: unauthenticated.
- Business notes: revoke token hiện tại.
- Related tests: `tests/Feature/AuthFlowTest.php`.

### 4.4 POST `/api/auth/logout-all`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```
- Error `401`: unauthenticated.
- Business notes: revoke toàn bộ token của user.
- Related tests: `tests/Feature/AuthFlowTest.php`.

### 4.5 GET `/api/auth/me`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "role": "customer"
  }
}
```
- Error `401`:
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```
- Business notes: dùng để verify token.
- Related tests: `tests/Feature/AuthFlowTest.php`.

### 4.6 PUT `/api/auth/me`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Content type: `multipart/form-data` nếu upload avatar.
- Request body example:
```json
{
  "name": "New Name",
  "phone": "0911111111"
}
```
- Success `200`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "New Name",
    "avatar": "https://..."
  }
}
```
- Error `422`: invalid field/file.
- Business notes: avatar upload qua CloudinaryService.
- Related tests: `tests/Feature/AuthFlowTest.php`.

### 4.7 PUT `/api/auth/me/password`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body:
```json
{
  "current_password": "Password1",
  "password": "NewPassword1",
  "password_confirmation": "NewPassword1"
}
```
- Success `200`:
```json
{
  "success": true,
  "message": "Password updated"
}
```
- Error `422`:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```
- Business notes: đổi mật khẩu sẽ revoke token khác phiên hiện tại.
- Related tests: `tests/Feature/AuthFlowTest.php`.

---

## 5) Product Public APIs

### 5.1 GET `/api/products`
- Auth: Public
- Headers: `Accept`
- Query params:
  - `q`, `category`, `brand`, `min_price`, `max_price`, `size`, `color`
  - `sort=price_asc|price_desc|newest|featured`
  - `page`, `per_page` (max 100)
- Request body: none
- Success `200` (Laravel Resource pagination):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Product A",
      "slug": "product-a",
      "base_price": 500000,
      "sale_price": 450000,
      "rating_avg": 4.5,
      "review_count": 10,
      "variants": [
        {
          "id": 10,
          "price": 470000
        }
      ]
    }
  ],
  "links": {},
  "meta": {}
}
```
- Error example `422`: query param invalid.
- Business notes:
  - chỉ trả product `is_active=true`
  - giá hiển thị dùng `sale_price ?? base_price`
  - giá variant = product display price + `price_adjustment`
  - có `rating_avg`, `review_count` real-time (approved reviews).
- Related tests: `tests/Feature/ProductPublicApiTest.php`, `tests/Feature/ReviewTest.php`.

### 5.2 GET `/api/products/{slug}`
- Auth: Public
- Headers: `Accept`
- Request body: none
- Success `200`:
```json
{
  "id": 1,
  "name": "Product A",
  "slug": "product-a",
  "rating_avg": 4.5,
  "review_count": 10,
  "variants": [],
  "images": []
}
```
- Error `404`:
```json
{
  "message": "Product not found"
}
```
- Business notes: inactive/missing trả 404.
- Related tests: `tests/Feature/ProductPublicApiTest.php`.

### 5.3 GET `/api/products/{slug}/reviews`
- Auth: Public
- Headers: `Accept`
- Query params: `page`, `per_page` (max 50)
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Great",
      "images": []
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 12,
    "total": 1
  }
}
```
- Error `404`: product không tồn tại/không active.
- Business notes: chỉ hiển thị review approved.
- Related tests: `tests/Feature/ReviewTest.php`.

---

## 6) Cart APIs

### 6.1 GET `/api/cart`
- Auth: Public hoặc Authenticated
- Headers:
  - Guest: `X-Guest-Token` (optional lần đầu), `Accept`
  - User: `Authorization`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "id": 1,
  "owner": {
    "type": "guest",
    "guest_token": "uuid"
  },
  "items": [],
  "total": 0
}
```
- Error `500`/`404`: hiếm, thường không dùng.
- Business notes:
  - nếu guest chưa có token, backend tạo cart mới và trả header `X-Guest-Token`.
  - cart total tính real-time từ product/variant hiện tại.
- Related tests: `tests/Feature/CartTest.php`.

### 6.2 POST `/api/cart/items`
- Auth: Public hoặc Authenticated
- Headers: như `GET /cart`
- Request body:
```json
{
  "product_variant_id": 10,
  "quantity": 2
}
```
- Success `201`:
```json
{
  "id": 5,
  "product_id": 1,
  "variant_id": 10,
  "quantity": 2,
  "unit_price": 470000,
  "subtotal": 940000
}
```
- Error `422`: vượt stock, product inactive, variant out of stock.
- Business notes: add cùng variant sẽ cộng dồn quantity.
- Related tests: `tests/Feature/CartTest.php`.

### 6.3 PUT `/api/cart/items/{itemId}`
- Auth: Public hoặc Authenticated
- Headers: như `GET /cart`
- Request body:
```json
{
  "quantity": 3
}
```
- Success `200`:
```json
{
  "id": 5,
  "quantity": 3,
  "subtotal": 1410000
}
```
- Success khi `quantity=0`:
```json
{
  "message": "Removed"
}
```
- Error `422`: quantity invalid/vượt stock.
- Business notes: quantity=0 sẽ xóa item.
- Related tests: `tests/Feature/CartTest.php`.

### 6.4 DELETE `/api/cart/items/{itemId}`
- Auth: Public hoặc Authenticated
- Headers: như `GET /cart`
- Request body: none
- Success `200`:
```json
{
  "message": "Deleted"
}
```
- Error `404`: item không thuộc cart hiện tại.
- Business notes: chỉ xóa item thuộc đúng cart owner.
- Related tests: `tests/Feature/CartTest.php`.

### 6.5 DELETE `/api/cart`
- Auth: Public hoặc Authenticated
- Headers: như `GET /cart`
- Request body: none
- Success `200`:
```json
{
  "message": "Cleared"
}
```
- Business notes: clear toàn bộ item trong cart hiện tại.
- Related tests: `tests/Feature/CartTest.php`.

### 6.6 POST `/api/cart/merge`
- Auth: Required
- Headers: `Authorization`, `X-Guest-Token`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "warnings": [],
  "data": {
    "id": 10,
    "owner": {
      "type": "user",
      "user_id": 2
    },
    "items": []
  }
}
```
- Error `400`:
```json
{
  "message": "Missing guest token"
}
```
- Business notes: merge quantity nhưng không vượt stock, guest cart bị xóa sau merge.
- Related tests: `tests/Feature/CartTest.php`.

---

## 7) Voucher APIs

### 7.1 POST `/api/vouchers/check`
- Auth: Public hoặc Authenticated
- Headers:
  - Guest: `X-Guest-Token`, `Accept`
  - User: `Authorization`, `Accept`
- Request body:
```json
{
  "code": "SALE10"
}
```
- Success `200`:
```json
{
  "success": true,
  "data": {
    "code": "SALE10",
    "type": "percent",
    "value": 10,
    "subtotal": 500000,
    "discount": 50000,
    "total_after": 450000
  }
}
```
- Error `422`:
```json
{
  "success": false,
  "message": "Invalid voucher",
  "errors": {
    "code": [
      "Voucher expired"
    ]
  }
}
```
- Business notes:
  - check `min_order_amount`, `usage_limit`, `usage_per_user`, active, start/end time.
  - check endpoint không mutate `used_count`/`voucher_usages`.
- Related tests: `tests/Feature/VoucherTest.php`.

### 7.2 Admin voucher CRUD

Tất cả endpoint dưới đây:
- Auth: Required + `role:admin`
- Headers: `Authorization`, `Accept`
- Response: dùng success/paginated envelope.

#### GET `/api/admin/vouchers`
- Query: `per_page` (default 15)
- Success `200`: paginated vouchers.
- Related tests: `tests/Feature/VoucherTest.php`.

#### POST `/api/admin/vouchers`
- Request body:
```json
{
  "code": "NEW10",
  "type": "percent",
  "value": 10,
  "min_order_amount": 300000,
  "max_discount": 100000,
  "usage_limit": 100,
  "usage_per_user": 1,
  "starts_at": "2026-05-14 00:00:00",
  "expires_at": "2026-05-30 23:59:59",
  "is_active": true
}
```
- Success `201`: voucher created.
- Error `422`: validation.
- Related tests: `tests/Feature/VoucherTest.php`.

#### GET `/api/admin/vouchers/{voucher}`
- Success `200`: voucher detail.
- Error `404`: not found.

#### PUT `/api/admin/vouchers/{voucher}`
- Body: tương tự create.
- Success `200`: voucher updated.
- Error `422`/`404`.

#### DELETE `/api/admin/vouchers/{voucher}`
- Success `200`:
```json
{
  "success": true,
  "message": "Voucher deactivated",
  "data": null
}
```
- Business notes: soft-disable bằng `is_active=0`.

---

## 8) Order APIs

### 8.1 POST `/api/checkout/guest`
- Auth: Public
- Headers: `X-Guest-Token`, `Accept`
- Request body:
```json
{
  "full_name": "Guest A",
  "email": "guest@example.com",
  "phone": "0900000000",
  "shipping_address": "123 Nguyen Trai, Q1, HCM",
  "voucher_code": "SALE10",
  "payment_method": "cod",
  "note": "Giao giờ hành chính"
}
```
- Success `201`:
```json
{
  "success": true,
  "data": {
    "code": "ANS-14052026-ABC123",
    "status": "pending",
    "payment_method": "cod",
    "payment_status": "pending",
    "subtotal": 500000,
    "discount_amount": 50000,
    "shipping_fee": 0,
    "total": 450000,
    "items": []
  }
}
```
- Error `422`: cart empty, stock insufficient, voucher invalid, payment_method != cod.
- Business notes:
  - checkout flow chạy trong `DB::transaction`
  - lock cart/variant/voucher (`lockForUpdate`)
  - snapshot order_items, trừ stock, clear cart sau success
  - tạo voucher_usage + increment used_count chỉ sau success.
- Related tests: `tests/Feature/CheckoutTest.php`, `tests/Feature/PaymentFoundationTest.php`.

### 8.2 POST `/api/orders`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body:
```json
{
  "shipping_name": "Customer A",
  "shipping_phone": "0911111111",
  "shipping_address": "123 Nguyen Trai, Q1, HCM",
  "voucher_code": "SALE10",
  "payment_method": "cod",
  "note": "Call before delivery"
}
```
- Success `201`: format giống guest checkout.
- Error `401` unauthenticated; `422` validation/business rule.
- Business notes: COD only.
- Related tests: `tests/Feature/CheckoutTest.php`.

### 8.3 GET `/api/orders`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Query: `per_page` (1..100, default 15)
- Success `200`:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 0
  }
}
```
- Error `401`.
- Business notes: user chỉ thấy order của chính mình.
- Related tests: `tests/Feature/OrderManagementTest.php`.

### 8.4 GET `/api/orders/{order_code}`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body: none
- Success `200`: `success + data(OrderResource)`.
- Error `404`: order không thuộc user hoặc không tồn tại.
- Business notes: ownership enforce ở repository/service.
- Related tests: `tests/Feature/OrderManagementTest.php`.

### 8.5 POST `/api/orders/{order_code}/cancel`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "message": "Order cancelled",
  "data": {
    "code": "ANS-14052026-ABC123",
    "status": "cancelled",
    "payment_status": "cancelled"
  }
}
```
- Error `422`: status không cho phép cancel.
- Business notes:
  - customer chỉ cancel khi status `pending|confirmed`
  - restore stock, revoke voucher_usage (`revoked_at`), decrement `used_count`
  - transaction + lock order/variant/voucher.
- Related tests: `tests/Feature/OrderManagementTest.php`, `tests/Feature/PaymentFoundationTest.php`.

### 8.6 POST `/api/orders/lookup`
- Auth: Public
- Middleware: `throttle:10,1`
- Headers: `Accept`
- Request body:
```json
{
  "order_code": "ANS-14052026-ABC123",
  "email": "guest@example.com",
  "phone": "0900000000"
}
```
- Success `200`:
```json
{
  "success": true,
  "data": {
    "order_code": "ANS-14052026-ABC123",
    "order_status": "shipping",
    "order_date": "2026-05-14T10:00:00.000000Z",
    "order_items": [],
    "quantity": 2,
    "total": 450000,
    "payment_method": "cod",
    "payment_status": "pending",
    "shipping_address": "123 Nguyen Trai, Q1, ****",
    "status_timeline": [
      {"status": "pending", "state": "reached"},
      {"status": "confirmed", "state": "reached"},
      {"status": "processing", "state": "reached"},
      {"status": "shipping", "state": "current"},
      {"status": "delivered", "state": "pending"}
    ]
  }
}
```
- Error `404`:
```json
{
  "success": false,
  "message": "Không tìm thấy đơn hàng"
}
```
- Business notes:
  - bắt buộc `order_code + (email hoặc phone)`
  - nếu gửi cả email+phone, cả hai phải match
  - không leak PII khi fail
  - match ưu tiên `customer_email/customer_phone`, fallback `guest_email/guest_phone/shipping_phone`.
- Related tests: `tests/Feature/OrderLookupTest.php`.

---

## 9) Wishlist APIs

Tất cả endpoint wishlist:
- Auth: Required (`auth:sanctum`)
- Headers: `Authorization`, `Accept`

### 9.1 GET `/api/wishlist`
- Query: `page`, `per_page` (default 12, max 50)
- Success `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 2,
      "product": {
        "id": 2,
        "name": "Product A",
        "slug": "product-a",
        "primary_image": "https://..."
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 12,
    "total": 1
  }
}
```
- Error `401`.
- Business notes: chỉ trả product active.
- Related tests: `tests/Feature/WishlistTest.php`.

### 9.2 POST `/api/wishlist/toggle`
- Request body:
```json
{
  "product_id": 2
}
```
- Success add `200`:
```json
{
  "success": true,
  "message": "Added to wishlist",
  "action": "added",
  "data": {
    "id": 1,
    "product_id": 2
  }
}
```
- Success remove `200`:
```json
{
  "success": true,
  "message": "Removed from wishlist",
  "action": "removed",
  "data": {
    "product_id": 2
  }
}
```
- Error `422`: product inactive/soft-deleted/unavailable.
- Business notes: unique `(user_id,product_id)` chống duplicate.
- Related tests: `tests/Feature/WishlistTest.php`.

### 9.3 DELETE `/api/wishlist/{product}`
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "message": "Wishlist item removed"
}
```
- Error `401`: unauthenticated.
- Business notes: idempotent, không trả 404 khi item không tồn tại.
- Related tests: `tests/Feature/WishlistTest.php`.

---

## 10) Review APIs

### 10.1 GET `/api/products/{slug}/reviews`
- Auth: Public
- Headers: `Accept`
- Query: `page`, `per_page` (max 50)
- Request body: none
- Success `200`: xem mục `5.3`.
- Error `404`: product không tồn tại/không active.
- Business notes: chỉ review approved.
- Related tests: `tests/Feature/ReviewTest.php`.

### 10.2 POST `/api/products/{slug}/reviews`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Content type: `multipart/form-data` nếu có ảnh.
- Request body:
```json
{
  "order_item_id": 10,
  "rating": 5,
  "comment": "Very good",
  "images": ["<file1>", "<file2>"]
}
```
- Success `201`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "product_id": 2,
    "order_item_id": 10,
    "rating": 5,
    "comment": "Very good",
    "is_approved": true,
    "images": []
  }
}
```
- Error `422`: chưa delivered, order_item không thuộc user, sai product slug, duplicate order_item review, rating out of range, ảnh > 3.
- Business notes:
  - mỗi `order_item` chỉ review 1 lần
  - user mua lại cùng product ở order_item khác vẫn review được
  - upload ảnh qua CloudinaryService + cleanup khi fail.
- Related tests: `tests/Feature/ReviewTest.php`.

### 10.3 DELETE `/api/reviews/{id}`
- Auth: Required
- Headers: `Authorization`, `Accept`
- Request body: none
- Success `200`:
```json
{
  "success": true,
  "message": "Review deleted"
}
```
- Error `404`: review không thuộc user hoặc không tồn tại.
- Business notes: chỉ owner được xóa.
- Related tests: `tests/Feature/ReviewTest.php`.

---

## 11) Admin APIs

Tất cả endpoint admin:
- Prefix: `/api/admin`
- Middleware: `auth:sanctum` + `role:admin`
- Headers: `Authorization`, `Accept`

## 11.1 Category CRUD

### GET `/api/admin/categories`
- Query: `per_page` (default 20)
- Success `200`: paginated envelope.
- Error: `401`/`403`.
- Related tests: `tests/Feature/AdminCategoryBrandTest.php`.

### POST `/api/admin/categories`
- Body:
```json
{
  "name": "Shoes",
  "slug": "shoes",
  "parent_id": null,
  "description": "Category",
  "sort_order": 0,
  "is_active": true
}
```
- Success `201`: success envelope.
- Error `422`: validation.

### GET `/api/admin/categories/{id}`
- Success `200`.
- Error `404` (`message: Not found`).

### PUT `/api/admin/categories/{id}`
- Body: field update tương tự create.
- Success `200`.
- Error `404`/`422`.

### DELETE `/api/admin/categories/{id}`
- Success `200`:
```json
{
  "success": true,
  "message": "Category deleted",
  "data": null
}
```
- Error `404`.

## 11.2 Brand CRUD

### GET `/api/admin/brands`
- Query: `per_page` (default 20)
- Success `200`: paginated envelope.
- Related tests: `tests/Feature/AdminCategoryBrandTest.php`.

### POST `/api/admin/brands`
- Body:
```json
{
  "name": "Ananas",
  "slug": "ananas",
  "logo": "https://...",
  "description": "Brand",
  "is_active": true
}
```
- Success `201`.
- Error `422`.

### GET `/api/admin/brands/{id}`
- Success `200`; Error `404`.

### PUT `/api/admin/brands/{id}`
- Success `200`; Error `404`/`422`.

### DELETE `/api/admin/brands/{id}`
- Success `200`; Error `404`.

## 11.3 Product CRUD

### GET `/api/admin/products`
- Query: `q`, `category`, `brand`, `is_active`, `with_trashed`, `per_page`
- Success `200`: paginated envelope với `AdminProductResource`.
- Related tests: `tests/Feature/AdminProductTest.php`.

### POST `/api/admin/products`
- Body:
```json
{
  "name": "Ananas Vintas",
  "category_id": 1,
  "brand_id": 1,
  "base_price": 500000,
  "sale_price": 450000,
  "description": "Desc",
  "is_featured": true,
  "is_active": true
}
```
- Success `201`.
- Error `422`.

### GET `/api/admin/products/{id}`
- Success `200`.
- Error `404`.

### PUT `/api/admin/products/{id}`
- Body: partial update fields.
- Success `200`.
- Error `404`/`422`.

### DELETE `/api/admin/products/{id}`
- Success `200` (soft delete).
- Error `404`.

### POST `/api/admin/products/{id}/restore`
- Success `200`.
- Error `404`/`400` (not trashed).

### PATCH `/api/admin/products/{id}/status`
- Body:
```json
{
  "is_active": false
}
```
- Success `200`.
- Error `404`/`422`.

## 11.4 Product Variant CRUD

### GET `/api/admin/products/{product}/variants`
- Query: `per_page` (default 20)
- Success `200`: paginated envelope.
- Related tests: `tests/Feature/AdminProductVariantTest.php`.

### POST `/api/admin/products/{product}/variants`
- Body:
```json
{
  "size": "42",
  "color": "Black",
  "color_hex": "#000000",
  "sku": "SKU-001",
  "stock": 20,
  "price_adjustment": 20000
}
```
- Success `201`.
- Error `422`: duplicate variant (size+color)/validation.

### GET `/api/admin/products/{product}/variants/{variant}`
- Success `200`.
- Error `404` (variant không thuộc product).

### PUT/PATCH `/api/admin/products/{product}/variants/{variant}`
- Success `200`.
- Error `404`/`422`.

### DELETE `/api/admin/products/{product}/variants/{variant}`
- Success `200`.
- Error `400`: variant đã được tham chiếu ở order_items.

## 11.5 Product Image CRUD

### GET `/api/admin/products/{product}/images`
- Success `200`:
```json
{
  "success": true,
  "message": "Images fetched",
  "data": []
}
```
- Related tests: `tests/Feature/AdminProductImageTest.php`.

### POST `/api/admin/products/{product}/images`
- Content type: `multipart/form-data`
- Body:
```json
{
  "file": "<image>",
  "is_primary": true,
  "sort_order": 1
}
```
- Success `201`.
- Error `422`: max 10 images.
- Error `500`: upload/save failure.

### DELETE `/api/admin/products/{product}/images/{image}`
- Success `200`.
- Error `404`: image không thuộc product.

### PATCH `/api/admin/products/{product}/images/{image}/primary`
- Success `200`: image được set primary.
- Error `404`: image không thuộc product.

## 11.6 Admin Voucher CRUD

- Endpoint: `GET|POST /api/admin/vouchers`, `GET|PUT|DELETE /api/admin/vouchers/{voucher}`
- Contract/details: xem mục `7.2`.
- Related tests: `tests/Feature/VoucherTest.php`.

## 11.7 Admin Order Management

### GET `/api/admin/orders`
- Query: `per_page` (1..100, default 15)
- Success `200`:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 0
  }
}
```
- Related tests: `tests/Feature/OrderManagementTest.php`.

### GET `/api/admin/orders/{order_code}`
- Success `200`: `success + data(OrderResource)`.
- Error `404`: not found.

### PATCH `/api/admin/orders/{order_code}/status`
- Body:
```json
{
  "status": "processing"
}
```
- Success `200`: updated order.
- Error `422`:
  - transition không hợp lệ
  - cấm set `payment_status` trực tiếp (`payment_status` bị `prohibited`).
- Business notes:
  - flow hợp lệ: `pending->confirmed->processing->shipping->delivered`
  - từ `shipping` có thể `returned`
  - admin cancel bằng `status=cancelled` (không endpoint riêng)
  - cancel sẽ restore stock + voucher usage rollback.
- Related tests: `tests/Feature/OrderManagementTest.php`, `tests/Feature/PaymentFoundationTest.php`.

## 11.8 Admin Dashboard Stats

### GET `/api/admin/dashboard/stats`
- Success `200`:
```json
{
  "success": true,
  "message": "Dashboard stats fetched",
  "data": {
    "total_users": 100,
    "total_products": 500,
    "total_orders": 1000,
    "total_revenue": 123456789,
    "pending_orders": 10,
    "cancelled_orders": 5,
    "delivered_orders": 800,
    "low_stock_variants": 20,
    "out_of_stock_variants": 7,
    "total_reviews": 200,
    "average_rating": 4.3,
    "recent_orders": [],
    "top_selling_products": []
  }
}
```
- Error `401`/`403`.
- Business notes:
  - `total_revenue`: chỉ order `status=delivered` và `payment_status=paid`
  - `recent_orders`: limit 5, không trả full PII
  - `top_selling_products`: limit 5, chỉ delivered+paid, bỏ item `product_id=null`.
- Related tests: `tests/Feature/DashboardStatsTest.php`.

---

## 12) Payment Foundation (COD only)

- Phase hiện tại: chỉ COD trong checkout/order management.
- Quy ước:
  - `payment_method`: `cod` (request khác `cod` sẽ lỗi 422).
  - `payment_status`:
    - `pending`: mới checkout COD
    - `paid`: admin chuyển order sang `delivered` với COD
    - `cancelled`: order bị hủy (customer/admin)
    - `failed`: dành cho online payment fail ở phase VNPay/MoMo tương lai
    - `refunded`: reserved cho flow hoàn tiền tương lai.
- Không tích hợp VNPay/MoMo trong scope hiện tại.
- Related tests: `tests/Feature/PaymentFoundationTest.php`, `tests/Feature/CheckoutTest.php`.

---

## 13) Out-of-scope endpoints đang giữ route (trả 501)

Các endpoint dưới đây trả:
```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```

### 13.1 Public
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/categories`
- `GET /api/categories/{slug}`
- `GET /api/brands`
- `GET /api/brands/{slug}`
- `GET /api/products/{slug}/comments`
- `GET /api/payments/callback`
- `POST /api/payments/callback`

### 13.2 Protected user
- `POST /api/payments/checkout`
- `GET /api/addresses`
- `POST /api/addresses`
- `GET /api/addresses/{id}`
- `PUT /api/addresses/{id}`
- `DELETE /api/addresses/{id}`
- `PUT /api/addresses/{id}/default`
- `POST /api/products/{slug}/comments`
- `DELETE /api/comments/{id}`
- `POST /api/vouchers/apply`

### 13.3 Admin
- `GET /api/admin/users`
- `GET /api/admin/users/{id}`
- `PUT /api/admin/users/{id}/ban`
- `GET /api/admin/dashboard/revenue`

- Related tests: `tests/Feature/RouteHardeningTest.php`, `tests/Feature/ApiResponseContractFoundationTest.php`.

---

## 14) Test map nhanh theo module

- Auth: `tests/Feature/AuthFlowTest.php`
- Product public: `tests/Feature/ProductPublicApiTest.php`
- Cart: `tests/Feature/CartTest.php`
- Voucher: `tests/Feature/VoucherTest.php`
- Checkout: `tests/Feature/CheckoutTest.php`
- Order management: `tests/Feature/OrderManagementTest.php`
- Order lookup: `tests/Feature/OrderLookupTest.php`
- Payment foundation: `tests/Feature/PaymentFoundationTest.php`
- Wishlist: `tests/Feature/WishlistTest.php`
- Review: `tests/Feature/ReviewTest.php`
- Admin catalog: `tests/Feature/AdminCategoryBrandTest.php`, `tests/Feature/AdminProductTest.php`, `tests/Feature/AdminProductVariantTest.php`, `tests/Feature/AdminProductImageTest.php`
- Dashboard: `tests/Feature/DashboardStatsTest.php`
- Route/stub hardening: `tests/Feature/RouteHardeningTest.php`
- API response contract foundation: `tests/Feature/ApiResponseContractFoundationTest.php`
