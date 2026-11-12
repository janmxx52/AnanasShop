# API DOCUMENTATION — ANANAS FASHION E-COMMERCE

> Ngày cập nhật: 2026-06-04  
> Nguồn xác minh: `routes/api.php`, Controller, FormRequest, Resource, Service, Repository, Model, Feature Tests, `.ai/project/prd.md` và `.ai/business/user-stories.md`

# 1. TỔNG QUAN API

| Thuộc tính | Giá trị |
|---|---|
| Project | Ananas Fashion E-commerce |
| Base URL local | `http://127.0.0.1:8000/api` |
| Kiểu API | RESTful JSON API |
| Backend | Laravel 12 |
| Authentication | Laravel Sanctum Bearer Token |
| Database hiện tại | SQLite local |
| Payment đang hoạt động | COD |
| Guest cart | Header `X-Guest-Token` |
| Route source of truth | `routes/api.php` |

API hiện sử dụng response contract **hybrid**:

- Admin API mới và controlled `501` ưu tiên standard envelope.
- Nhiều public/protected API trả `data` hoặc Resource collection theo Laravel.
- Client phải dùng HTTP status code và hỗ trợ cả standard envelope lẫn legacy Resource response.

## 1.1. Phân loại quyền truy cập

| Nhãn | Ý nghĩa |
|---|---|
| **Public** | Không cần đăng nhập. |
| **Public / Optional Auth** | Có thể dùng Bearer token hoặc guest token tùy người gọi. |
| **Requires Auth** | Yêu cầu `Authorization: Bearer {token}`. |
| **Requires Admin** | Yêu cầu Bearer token của user có `role=admin`. |

## 1.2. Pagination

Response phân trang thường có dạng:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  }
}
```

Một số admin endpoint có thêm:

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  }
}
```

# 2. QUY ƯỚC CHUNG

## 2.1. Request Headers

### Public JSON request

```http
Accept: application/json
Content-Type: application/json
```

### Authenticated request

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer {token}
```

### Guest cart hoặc guest checkout

```http
Accept: application/json
Content-Type: application/json
X-Guest-Token: {guest_token}
```

Nếu client chưa gửi `X-Guest-Token` khi truy cập cart, backend có thể tạo guest token mới và trả lại qua response header:

```http
X-Guest-Token: {generated_guest_token}
```

### Multipart upload

```http
Accept: application/json
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

## 2.2. Success Response mẫu

```json
{
  "success": true,
  "message": "Thao tác thành công.",
  "data": {}
}
```

## 2.3. Error Response mẫu

Standard error envelope:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ.",
  "errors": {
    "field": [
      "Thông báo lỗi."
    ]
  }
}
```

Một số Laravel validation response legacy có thể không chứa `success`:

```json
{
  "message": "Dữ liệu không hợp lệ.",
  "errors": {
    "field": [
      "Thông báo lỗi."
    ]
  }
}
```

## 2.4. Controlled 501 Response

Các route chưa triển khai phải trả JSON có kiểm soát thay vì lỗi `500`:

```json
{
  "success": false,
  "message": "Chức năng này chưa được hỗ trợ.",
  "errors": null
}
```

Message hiện tại được xác minh từ `ApiResponse::notImplemented()`.

## 2.5. Status Codes

| Code | Ý nghĩa |
|---|---|
| `200` | Request thành công. |
| `201` | Resource được tạo thành công. |
| `400` | Request không hợp lệ theo nghiệp vụ chung. |
| `401` | Chưa đăng nhập hoặc token không hợp lệ. |
| `403` | Không có quyền truy cập. |
| `404` | Không tìm thấy resource hoặc không có quyền xem resource. |
| `422` | Validation hoặc business rule không hợp lệ. |
| `429` | Vượt rate limit. |
| `500` | Lỗi hệ thống ngoài dự kiến. |
| `501` | Route tồn tại nhưng chức năng chưa triển khai. |

---

# 3. AUTH APIS

## POST `/auth/register`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Đăng ký customer mới, phát Sanctum token và trả thông tin user.

### Request Headers

```http
Accept: application/json
Content-Type: application/json
```

### Query Params

Không có.

### Path Params

Không có.

### Request Body

```json
{
  "name": "Nguyễn Văn A",
  "email": "customer@example.com",
  "phone": "0900000000",
  "password": "Password1",
  "password_confirmation": "Password1",
  "device_name": "web"
}
```

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | string | Có | Tên user. |
| `email` | email | Có | Phải unique. |
| `phone` | string | Không | Số điện thoại. |
| `password` | string | Có | Theo password rule hiện tại. |
| `password_confirmation` | string | Có | Phải khớp password. |
| `device_name` | string | Không | Tên thiết bị/token. |

### Success Response

```json
{
  "success": true,
  "data": {
    "token": "sanctum-token",
    "expires_at": "2026-07-04 10:00:00",
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "customer@example.com",
      "phone": "0900000000",
      "role": "customer"
    }
  }
}
```

### Error Response

```json
{
  "message": "Dữ liệu không hợp lệ.",
  "errors": {
    "email": ["Email đã được sử dụng."]
  }
}
```

### Business Rules / Notes

- Email phải unique.
- User mới mặc định là customer.
- Frontend merge guest cart sau register nếu có guest token.
- Test liên quan: `AuthFlowTest`.

## POST `/auth/login`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Đăng nhập và phát Sanctum token.

### Request Body

```json
{
  "email": "customer@example.com",
  "password": "Password1",
  "device_name": "web"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "token": "sanctum-token",
    "expires_at": "2026-07-04 10:00:00",
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "customer@example.com",
      "role": "customer",
      "is_banned": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa."
}
```

### Business Rules / Notes

- User bị ban không thể đăng nhập.
- Frontend merge guest cart sau login nếu có guest token.
- Test liên quan: `AuthFlowTest`.

## POST `/auth/logout`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Revoke Sanctum token hiện tại.

### Request Headers

```http
Accept: application/json
Authorization: Bearer {token}
```

### Request Body

Không có.

### Success Response

```json
{
  "success": true,
  "message": "Đăng xuất thành công."
}
```

### Business Rules / Notes

- Chỉ revoke token hiện tại.
- Test liên quan: `AuthFlowTest`.

## POST `/auth/logout-all`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Revoke toàn bộ Sanctum tokens của user hiện tại.

### Request Body

Không có.

### Success Response

```json
{
  "success": true,
  "message": "Đăng xuất khỏi tất cả thiết bị thành công."
}
```

### Business Rules / Notes

- API đã implement; frontend có API method nhưng chưa có UI chuyên biệt.
- Test liên quan: `AuthFlowTest`.

## GET `/auth/me`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Lấy current user từ Sanctum token.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "phone": "0900000000",
    "avatar": null,
    "role": "customer",
    "is_banned": false
  }
}
```

### Business Rules / Notes

- Không trả password, remember token hoặc access tokens.
- Frontend dùng endpoint này để bootstrap phiên đăng nhập.

## PUT `/auth/me`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Cập nhật profile current user.

### Request Headers

JSON hoặc `multipart/form-data` nếu upload avatar.

### Request Body

```json
{
  "name": "Tên mới",
  "phone": "0911111111"
}
```

Field ảnh tùy chọn: `avatar`.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tên mới",
    "email": "email-hien-tai@example.com",
    "phone": "0911111111",
    "avatar": "https://..."
  }
}
```

### Business Rules / Notes

- Endpoint hiện chỉ nhận `name`, `phone` và `avatar`; không hỗ trợ đổi email.
- Upload avatar dùng Cloudinary service hoặc fallback local.
- API implemented; frontend chưa có profile edit page chuyên biệt.
- Test liên quan: `AuthFlowTest`.

## PUT `/auth/me/password`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Đổi mật khẩu current user.

### Request Body

```json
{
  "current_password": "Password1",
  "password": "NewPassword1",
  "password_confirmation": "NewPassword1"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công."
}
```

### Business Rules / Notes

- Phải xác minh current password.
- Revoke các token khác theo implementation hiện tại.
- API implemented; frontend chưa có change-password page chuyên biệt.
- Test liên quan: `AuthFlowTest`.

## POST `/auth/forgot-password`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Public

### Mô tả

Route dành cho yêu cầu khôi phục mật khẩu.

### Request Body

Chưa có contract nghiệp vụ hoàn chỉnh.

### Response

Controlled `501`.

### Business Rules / Notes

- Controller hiện gọi `notImplemented()`.

## POST `/auth/reset-password`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Public

### Mô tả

Route dành cho đặt lại mật khẩu.

### Request Body

Chưa có contract nghiệp vụ hoàn chỉnh.

### Response

Controlled `501`.

### Business Rules / Notes

- Controller hiện gọi `notImplemented()`.

---

# 4. PRODUCT APIS

## GET `/products`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy danh sách product active, hỗ trợ search, filter, sort và pagination.

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `q` | string | Không | Tìm kiếm theo tên hoặc mô tả. |
| `category` | string/int | Không | Category slug hoặc ID. |
| `brand` | string/int | Không | Brand slug hoặc ID. |
| `size` | string | Không | Lọc theo variant size. |
| `color` | string | Không | Lọc theo variant color. |
| `min_price` | number | Không | Display price tối thiểu. |
| `max_price` | number | Không | Display price tối đa. |
| `sort` | string | Không | `price_asc`, `price_desc`, `newest`, `featured`. |
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số item mỗi trang. |

### Request Body

Không có.

### Success Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Giày Ananas",
      "slug": "giay-ananas",
      "base_price": 1000000,
      "sale_price": 900000,
      "display_price": 900000,
      "rating_avg": 4.5,
      "review_count": 10,
      "category": {},
      "brand": {},
      "images": [],
      "variants": []
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

### Business Rules / Notes

- Chỉ trả product active và chưa soft deleted.
- `display_price = sale_price ?? base_price`.
- Price filter và sort dùng display price.
- Eager-load variants, images, category và brand.
- Test liên quan: `ProductPublicApiTest`.

## GET `/products/{slug}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy chi tiết product bằng slug.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Có | Product slug. |

### Success Response

```json
{
  "data": {
    "id": 1,
    "name": "Giày Ananas",
    "slug": "giay-ananas",
    "description": "...",
    "display_price": 900000,
    "rating_avg": 4.5,
    "review_count": 10,
    "category": {},
    "brand": {},
    "images": [],
    "variants": []
  }
}
```

### Error Response

```json
{
  "message": "Không tìm thấy dữ liệu."
}
```

### Business Rules / Notes

- Product inactive, soft deleted hoặc không tồn tại trả `404`.
- Variant final price bằng display price cộng price adjustment.
- Test liên quan: `ProductPublicApiTest`.

## GET `/products/{slug}/reviews`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy approved reviews của product.

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số review mỗi trang. |

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Có | Product slug. |

### Success Response

```json
{
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Sản phẩm tốt.",
      "user": {},
      "images": []
    }
  ],
  "meta": {}
}
```

### Business Rules / Notes

- Chỉ hiển thị review `is_approved=true`.
- Test liên quan: `ReviewTest`.

## GET `/products/{slug}/comments`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Public

### Mô tả

Route public dành cho comment sản phẩm.

### Response

Controlled `501`.

### Business Rules / Notes

- `CommentController@index` hiện gọi `notImplemented()`.

---

# 5. CATEGORY APIS

## GET `/categories`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy danh sách active categories có phân trang.

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số category mỗi trang. |

### Success Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Giày",
      "slug": "giay",
      "is_active": true
    }
  ],
  "meta": {}
}
```

### Business Rules / Notes

- Chỉ trả active categories.
- Controller và `PublicCategoryBrandTest` chứng minh endpoint đã implement.
- `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ còn kỳ vọng Category API trả `501`; đây là mâu thuẫn test cần xử lý.

## GET `/categories/{slug}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy category active theo slug và các product active liên quan.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Có | Category slug. |

### Success Response

```json
{
  "data": {
    "id": 1,
    "name": "Giày",
    "slug": "giay",
    "products": []
  }
}
```

### Business Rules / Notes

- Category inactive hoặc không tồn tại trả `404`.
- Products liên quan phải active và chưa soft deleted.
- Có mâu thuẫn test cũ tương tự endpoint list.

---

# 6. BRAND APIS

## GET `/brands`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy danh sách active brands có phân trang.

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số brand mỗi trang. |

### Success Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ananas",
      "slug": "ananas",
      "is_active": true
    }
  ],
  "meta": {}
}
```

### Business Rules / Notes

- Controller và `PublicCategoryBrandTest` chứng minh endpoint đã implement.
- `RouteHardeningTest` cũ còn kỳ vọng Brand API trả `501`; đây là mâu thuẫn test cần xử lý.

## GET `/brands/{slug}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Lấy brand active theo slug và các product active liên quan.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Có | Brand slug. |

### Success Response

```json
{
  "data": {
    "id": 1,
    "name": "Ananas",
    "slug": "ananas",
    "products": []
  }
}
```

### Business Rules / Notes

- Brand inactive hoặc không tồn tại trả `404`.
- Products liên quan phải active và chưa soft deleted.
- Có mâu thuẫn test cũ tương tự endpoint list.

---

# 7. CART APIS

Các cart routes là **Public / Optional Auth**:

- Nếu có Bearer token hợp lệ, backend dùng user cart.
- Nếu không đăng nhập, client phải giữ và gửi `X-Guest-Token`.
- Giá cart được tính realtime từ Product và ProductVariant.

## GET `/cart`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public / Optional Auth

### Request Headers

```http
Accept: application/json
Authorization: Bearer {token}
X-Guest-Token: {guest_token}
```

Chỉ gửi header phù hợp với user hoặc guest.

### Success Response

```json
{
  "id": 1,
  "owner": {
    "type": "guest",
    "guest_token": "guest-token"
  },
  "items": [],
  "total": 0
}
```

### Business Rules / Notes

- Cart response hiện là direct resource payload, không bọc trong `data`.
- Backend có thể tạo guest cart/token mới nếu client chưa có token.
- Test liên quan: `CartTest`.

## POST `/cart/items`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public / Optional Auth

### Request Body

```json
{
  "product_variant_id": 1,
  "quantity": 1
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `product_variant_id` | integer | Có | Variant tồn tại. |
| `quantity` | integer | Không | Mặc định `1`, tối thiểu `1`. |

### Success Response

```json
{
  "data": {
    "id": 1,
    "product_variant_id": 1,
    "quantity": 1
  }
}
```

### Business Rules / Notes

- Cùng variant sẽ cộng quantity.
- Không cho vượt stock.
- Không cho thêm variant hết hàng hoặc thuộc product inactive.

## PUT `/cart/items/{itemId}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public / Optional Auth

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `itemId` | integer | Có | Cart item thuộc cart hiện tại. |

### Request Body

```json
{
  "quantity": 2
}
```

### Business Rules / Notes

- Quantity tối thiểu thông thường là `1`.
- Gửi `quantity=0` sẽ remove item.
- Không cho vượt stock.
- Không cho user/guest sửa item của cart khác.

## DELETE `/cart/items/{itemId}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public / Optional Auth

### Mô tả

Xóa cart item khỏi cart hiện tại.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `itemId` | integer | Có | Cart item thuộc cart hiện tại. |

### Request Body

Không có.

### Business Rules / Notes

- Enforce cart ownership.

## DELETE `/cart`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public / Optional Auth

### Mô tả

Xóa toàn bộ items trong cart hiện tại.

### Request Body

Không có.

## POST `/cart/merge`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Merge guest cart vào user cart sau login/register.

### Request Headers

```http
Accept: application/json
Authorization: Bearer {token}
X-Guest-Token: {guest_token}
```

### Request Body

Không có.

### Success Response

```json
{
  "warnings": [],
  "data": {
    "id": 2,
    "items": []
  }
}
```

### Business Rules / Notes

- Quantity sau merge không vượt stock.
- Item inactive hoặc hết hàng bị bỏ qua và có warning.
- Guest cart được xóa sau merge.
- Test liên quan: `CartTest`.

---

# 8. CHECKOUT & ORDER APIS

## 8.1. Quy tắc chung

- Chỉ hỗ trợ `payment_method=cod`.
- Checkout chạy trong database transaction.
- Backend lock cart, cart items, product variants và voucher cần thiết.
- Backend kiểm tra lại stock sau lock.
- Shipping fee:
  - Subtotal `< 500000`: `30000`.
  - Subtotal `>= 500000`: `0`.
- Total: `subtotal - discount_amount + shipping_fee`.

## POST `/checkout/guest`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Request Headers

```http
Accept: application/json
Content-Type: application/json
X-Guest-Token: {guest_token}
```

### Request Body

```json
{
  "full_name": "Nguyễn Văn A",
  "email": "guest@example.com",
  "phone": "0900000000",
  "shipping_address": "Địa chỉ giao hàng",
  "voucher_code": "SALE10",
  "payment_method": "cod",
  "note": "Giao giờ hành chính"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `full_name` | string | Có | Tên khách nhận hàng. |
| `email` | email | Có | Contact snapshot. |
| `phone` | string | Có | Số điện thoại nhận hàng. |
| `shipping_address` | string | Có | Địa chỉ giao hàng. |
| `voucher_code` | string | Không | Voucher cần áp dụng. |
| `payment_method` | string | Không | Nếu gửi, chỉ chấp nhận `cod`. |
| `note` | string | Không | Ghi chú đơn hàng. |

### Success Response

```json
{
  "data": {
    "order_code": "ANS-04062026-ABC123",
    "status": "pending",
    "subtotal": 600000,
    "discount_amount": 60000,
    "shipping_fee": 0,
    "total": 540000,
    "payment_method": "cod",
    "payment_status": "pending",
    "items": []
  }
}
```

### Business Rules / Notes

- Cart không được rỗng.
- Khi thành công: tạo order/items, trừ stock, ghi voucher usage và clear cart.
- Test liên quan: `CheckoutTest`, `PaymentFoundationTest`.

## POST `/orders`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Checkout user cart và tạo order gắn với current user.

### Request Body

```json
{
  "shipping_name": "Nguyễn Văn A",
  "shipping_phone": "0900000000",
  "shipping_address": "Địa chỉ giao hàng",
  "voucher_code": "SALE10",
  "payment_method": "cod",
  "note": "Giao giờ hành chính"
}
```

### Success Response

Tương tự guest checkout nhưng order được gắn `user_id` và customer snapshot.

### Business Rules / Notes

- Không nhận `address_id` trong phase hiện tại.
- Không cho client gửi trực tiếp `payment_status`.
- Test liên quan: `CheckoutTest`, `PaymentFoundationTest`.

## GET `/orders`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Lấy danh sách order của current user.

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số order mỗi trang. |

### Success Response

```json
{
  "data": [
    {
      "order_code": "ANS-04062026-ABC123",
      "status": "pending",
      "payment_method": "cod",
      "payment_status": "pending",
      "total": 540000
    }
  ],
  "meta": {}
}
```

### Business Rules / Notes

- Chỉ trả order thuộc current user.
- Guest không dùng endpoint này.
- Test liên quan: `OrderManagementTest`.

## GET `/orders/{order_code}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Lấy chi tiết order thuộc current user.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `order_code` | string | Có | Mã đơn hàng. |

### Business Rules / Notes

- User không thể xem order của user khác.
- Order items trả dữ liệu snapshot.
- Test liên quan: `OrderManagementTest`.

## POST `/orders/{order_code}/cancel`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Customer hủy order của chính mình.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `order_code` | string | Có | Mã đơn hàng. |

### Request Body

Không có.

### Success Response

```json
{
  "data": {
    "order_code": "ANS-04062026-ABC123",
    "status": "cancelled",
    "payment_status": "cancelled"
  }
}
```

### Business Rules / Notes

- Customer chỉ được cancel `pending` hoặc `confirmed`.
- Cancel chạy trong transaction, restore stock và rollback voucher usage.
- Chặn cancel lặp.
- Test liên quan: `OrderManagementTest`, `PaymentFoundationTest`.

## POST `/orders/lookup`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public

### Mô tả

Tra cứu order bằng order code và email hoặc phone.

### Request Body

```json
{
  "order_code": "ANS-04062026-ABC123",
  "email": "guest@example.com",
  "phone": "0900000000"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `order_code` | string | Có | Mã đơn hàng. |
| `email` | email | Có điều kiện | Bắt buộc nếu không gửi phone. |
| `phone` | string | Có điều kiện | Bắt buộc nếu không gửi email. |

### Success Response

```json
{
  "data": {
    "order_code": "ANS-04062026-ABC123",
    "order_status": "pending",
    "order_date": "2026-06-04T10:00:00+00:00",
    "order_items": [],
    "quantity": 1,
    "total": 540000,
    "payment_method": "cod",
    "payment_status": "pending",
    "shipping_address": "20 ký tự đầu tiên****",
    "status_timeline": []
  }
}
```

### Error Response

```json
{
  "message": "Không tìm thấy đơn hàng"
}
```

### Business Rules / Notes

- Không cho lookup chỉ bằng order code.
- Nếu gửi cả email và phone thì cả hai phải cùng khớp.
- Fail response không leak PII.
- Shipping address được mask khi thành công.
- Rate limit: `throttle:10,1`.
- Test liên quan: `OrderLookupTest`.

---

# 9. VOUCHER APIS

## POST `/vouchers/check`

**Trạng thái:** Implemented  
**Quyền truy cập:** Public / Optional Auth

### Mô tả

Kiểm tra voucher dựa trên cart hiện tại mà không mutate usage.

### Request Headers

Gửi Bearer token cho user hoặc `X-Guest-Token` cho guest.

### Request Body

```json
{
  "code": "SALE10"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "code": "SALE10",
    "type": "percent",
    "value": 10,
    "subtotal": 600000,
    "discount": 60000,
    "total_after": 540000
  }
}
```

### Business Rules / Notes

- Kiểm tra active, starts/expiry, minimum order, usage limit và usage per user.
- Percent voucher tôn trọng `max_discount`.
- Check không tạo `voucher_usages` và không tăng `used_count`.
- Test liên quan: `VoucherTest`.

## POST `/vouchers/apply`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Standalone voucher apply route.

### Response

Controlled `501`.

### Business Rules / Notes

- Voucher vẫn được áp dụng thực tế bằng `voucher_code` trong checkout.
- `VoucherController::apply` hiện gọi `notImplemented()`.

## Admin Voucher CRUD

Các endpoint admin voucher được document tại mục **12.7**.

---

# 10. WISHLIST APIS

## GET `/wishlist`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Mặc định `12`, tối đa `50`. |

### Success Response

```json
{
  "data": [
    {
      "id": 1,
      "product": {}
    }
  ],
  "meta": {}
}
```

### Business Rules / Notes

- Chỉ trả wishlist của current user.
- Eager-load product data và primary image.
- Test liên quan: `WishlistTest`.

## POST `/wishlist/toggle`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Request Body

```json
{
  "product_id": 1
}
```

### Success Response

```json
{
  "action": "added",
  "message": "Đã cập nhật danh sách yêu thích.",
  "data": {
    "product_id": 1
  }
}
```

### Business Rules / Notes

- Nếu chưa có thì add; nếu đã có thì remove.
- Chỉ cho wishlist product active và chưa soft deleted.
- Unique `(user_id, product_id)`.

## DELETE `/wishlist/{product}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `product` | integer | Có | Product ID. |

### Success Response

```json
{
  "message": "Đã xóa sản phẩm khỏi danh sách yêu thích."
}
```

### Business Rules / Notes

- Delete idempotent: item tồn tại hoặc không tồn tại đều trả success.
- User không thể tác động wishlist của user khác.

---

# 11. REVIEW APIS

## GET `/products/{slug}/reviews`

Xem mục **4. Product APIs**.

## POST `/products/{slug}/reviews`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Tạo review cho product dựa trên delivered order item.

### Request Headers

```http
Accept: application/json
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Có | Product slug. |

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `order_item_id` | integer | Có | Order item thuộc current user. |
| `rating` | integer | Có | Từ `1` đến `5`. |
| `comment` | string | Không | Nội dung review. |
| `images[]` | image[] | Không | Tối đa 3 ảnh. |

### Success Response

```json
{
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "Sản phẩm tốt.",
    "images": []
  }
}
```

### Business Rules / Notes

- Order item phải thuộc current user.
- Order chứa item phải ở trạng thái delivered.
- `order_item.product_id` phải khớp product slug.
- Mỗi order item chỉ được review một lần.
- Test liên quan: `ReviewTest`.

## DELETE `/reviews/{id}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Auth

### Mô tả

Xóa review thuộc current user.

### Path Params

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Có | Review ID. |

### Business Rules / Notes

- User chỉ xóa review của chính mình.
- Review images liên quan được xử lý theo implementation hiện tại.
- Test liên quan: `ReviewTest`.

## POST `/products/{slug}/comments`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Requires Auth

### Response

Controlled `501`.

## DELETE `/comments/{id}`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Requires Auth

### Response

Controlled `501`.

---

# 12. ADMIN APIS

Tất cả endpoint trong mục này yêu cầu:

```http
Accept: application/json
Authorization: Bearer {admin_token}
```

Middleware bắt buộc: `auth:sanctum + role:admin`.

## 12.1. Admin Category

### GET `/admin/categories`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy danh sách category có phân trang.

Query params: `page`, `per_page`.

### POST `/admin/categories`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "name": "Giày",
  "slug": "giay",
  "parent_id": null,
  "image": null,
  "description": "Danh mục giày",
  "sort_order": 1,
  "is_active": true
}
```

Business rules:

- `name` bắt buộc.
- `slug` unique; backend có thể tạo slug nếu không gửi theo implementation.
- Test liên quan: `AdminCategoryBrandTest`.

### GET `/admin/categories/{category}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy chi tiết category bằng ID.

### PUT `/admin/categories/{category}`  
### PATCH `/admin/categories/{category}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Cập nhật category. Request body dùng các field tương tự create; update hỗ trợ partial theo FormRequest/controller hiện tại.

### DELETE `/admin/categories/{category}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Xóa category theo implementation hiện tại.

## 12.2. Admin Brand

### GET `/admin/brands`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy danh sách brand có phân trang.

### POST `/admin/brands`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "name": "Ananas",
  "slug": "ananas",
  "logo": null,
  "description": "Thương hiệu Ananas",
  "is_active": true
}
```

Business rules:

- `name` bắt buộc.
- `slug` unique.
- Test liên quan: `AdminCategoryBrandTest`.

### GET `/admin/brands/{brand}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy chi tiết brand bằng ID.

### PUT `/admin/brands/{brand}`  
### PATCH `/admin/brands/{brand}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Cập nhật brand.

### DELETE `/admin/brands/{brand}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Xóa brand theo implementation hiện tại.

## 12.3. Admin Product

### GET `/admin/products`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `q` | string | Không | Search. |
| `category` | string/int | Không | Filter category. |
| `brand` | string/int | Không | Filter brand. |
| `is_active` | boolean | Không | Lọc trạng thái active/inactive. |
| `with_trashed` | boolean | Không | Bao gồm product đã soft delete. |
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số item mỗi trang. |

### Business Rules / Notes

- Admin list có thể bao gồm dữ liệu phục vụ quản trị, kể cả product inactive/soft deleted theo query implementation.
- Test liên quan: `AdminProductTest`.

### POST `/admin/products`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "name": "Giày Ananas",
  "slug": "giay-ananas",
  "category_id": 1,
  "brand_id": 1,
  "description": "Mô tả sản phẩm",
  "base_price": 1000000,
  "sale_price": 900000,
  "is_featured": false,
  "is_active": true
}
```

Business rules:

- `name`, `category_id`, `brand_id`, `base_price` bắt buộc.
- Slug phải unique.
- Giá không được âm.

### GET `/admin/products/{product}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy chi tiết admin product bằng ID.

### PUT `/admin/products/{product}`  
### PATCH `/admin/products/{product}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Cập nhật product bằng các field tương tự create.

### DELETE `/admin/products/{product}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Soft delete product.

### POST `/admin/products/{id}/restore`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Restore product đã soft deleted.

### PATCH `/admin/products/{id}/status`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "is_active": false
}
```

Toggle trạng thái active của product.

## 12.4. Admin Product Variant

### GET `/admin/products/{product}/variants`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy danh sách variants của product. Hỗ trợ `page`, `per_page`.

### POST `/admin/products/{product}/variants`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "size": "42",
  "color": "Black",
  "color_hex": "#111111",
  "sku": "ANS001-42-BLACK",
  "stock": 20,
  "price_adjustment": 0
}
```

Business rules:

- `size`, `color`, `stock` bắt buộc theo FormRequest.
- Stock tối thiểu `0`.
- Unique `(product_id, size, color)`.
- SKU unique nếu có.

### GET `/admin/products/{product}/variants/{variant}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy variant thuộc đúng product route.

### PUT `/admin/products/{product}/variants/{variant}`  
### PATCH `/admin/products/{product}/variants/{variant}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Cập nhật variant.

### DELETE `/admin/products/{product}/variants/{variant}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Xóa variant.

### Business Rules / Notes

- Variant route phải thuộc đúng product.
- Test liên quan: `AdminProductVariantTest`.

## 12.5. Admin Product Image

### GET `/admin/products/{product}/images`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy danh sách images của product.

### POST `/admin/products/{product}/images`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

### Request Headers

```http
Accept: application/json
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | image | Có | JPG/JPEG/PNG/WebP, giới hạn theo FormRequest. |
| `sort_order` | integer | Không | Thứ tự ảnh. |
| `is_primary` | boolean | Không | Đặt ảnh chính. |

### DELETE `/admin/products/{product}/images/{image}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Xóa product image.

### PATCH `/admin/products/{product}/images/{image}/primary`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Đặt product image làm primary.

### Business Rules / Notes

- Dùng Cloudinary service hoặc fallback local storage.
- Có giới hạn số ảnh theo implementation/test hiện tại.
- Test liên quan: `AdminProductImageTest`.

## 12.6. Admin Order

### GET `/admin/orders`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy danh sách tất cả orders. Query params thực tế được controller/service dùng: `page`, `per_page`.

### GET `/admin/orders/{order_code}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy chi tiết order bằng order code.

### PATCH `/admin/orders/{order_code}/status`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "status": "confirmed"
}
```

Status hợp lệ theo flow:

```text
pending -> confirmed -> processing -> shipping -> delivered
shipping -> returned
pending|confirmed|processing|shipping -> cancelled
```

Business rules:

- Không cho transition ngoài flow.
- Không cho cancel delivered order.
- Khi COD order chuyển delivered, `payment_status=paid`.
- Khi cancel, `payment_status=cancelled`, restore stock và voucher usage.
- Test liên quan: `OrderManagementTest`, `PaymentFoundationTest`.

## 12.7. Admin Voucher

### GET `/admin/vouchers`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy danh sách vouchers có phân trang.

### POST `/admin/vouchers`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "code": "SALE10",
  "type": "percent",
  "value": 10,
  "max_discount": 100000,
  "min_order_amount": 500000,
  "usage_limit": 100,
  "usage_per_user": 1,
  "starts_at": "2026-06-01 00:00:00",
  "expires_at": "2026-06-30 23:59:59",
  "is_active": true
}
```

### GET `/admin/vouchers/{voucher}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy chi tiết voucher bằng ID.

### PUT `/admin/vouchers/{voucher}`  
### PATCH `/admin/vouchers/{voucher}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Cập nhật voucher bằng các field tương tự create.

### DELETE `/admin/vouchers/{voucher}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Vô hiệu hóa voucher bằng cách cập nhật `is_active=0`; không hard delete record.

### Business Rules / Notes

- Code unique.
- Type chỉ gồm `percent` hoặc `fixed`.
- `value > 0`.
- `expires_at` không trước `starts_at`.
- Test liên quan: `VoucherTest`.

## 12.8. Admin User

### GET `/admin/users`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

### Query Params

| Name | Type | Required | Description |
|---|---|---|---|
| `q` | string | Không | Search name/email/phone. |
| `role` | string | Không | `customer` hoặc `admin`. |
| `is_banned` | boolean | Không | Filter trạng thái ban. |
| `with_trashed` | boolean | Không | Bao gồm soft-deleted users. |
| `page` | integer | Không | Trang hiện tại. |
| `per_page` | integer | Không | Số user mỗi trang. |

### GET `/admin/users/{user}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Lấy chi tiết user, có thể dùng để xem soft-deleted user theo service hiện tại.

### POST `/admin/users`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "name": "Nguyễn Văn B",
  "email": "user@example.com",
  "password": "Password1",
  "phone": "0900000000",
  "role": "customer",
  "is_banned": false
}
```

### PUT `/admin/users/{user}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

```json
{
  "name": "Tên mới",
  "email": "new@example.com",
  "phone": "0911111111",
  "role": "customer",
  "is_banned": false
}
```

Không hỗ trợ update password trong update thường.

### DELETE `/admin/users/{user}`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Soft delete user chưa có order.

### PATCH `/admin/users/{user}/ban`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Ban user và revoke toàn bộ Sanctum tokens.

### PATCH `/admin/users/{user}/unban`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

Unban user; không tạo token mới.

### Business Rules / Notes

- Admin không thể tự ban, tự xóa hoặc tự hạ role.
- User có order không được xóa; nên ban thay thế.
- Ban/unban idempotent.
- API resource không trả password, remember token hoặc tokens.
- Test liên quan: `AdminUserManagementTest`.

## 12.9. Admin Dashboard

### GET `/admin/dashboard/stats`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

### Mô tả

Lấy dashboard metrics, recent orders và top-selling products.

### Success Response

```json
{
  "success": true,
  "data": {
    "total_users": 0,
    "total_products": 0,
    "total_orders": 0,
    "total_revenue": 0,
    "pending_orders": 0,
    "cancelled_orders": 0,
    "delivered_orders": 0,
    "low_stock_variants": 0,
    "out_of_stock_variants": 0,
    "total_reviews": 0,
    "average_rating": 0,
    "recent_orders": [],
    "top_selling_products": []
  }
}
```

### Business Rules / Notes

- Revenue chỉ tính order `delivered` và `payment_status=paid`.
- Recent orders và top products giới hạn 5.
- Test liên quan: `DashboardStatsTest`.

### GET `/admin/dashboard/analytics`

**Trạng thái:** Implemented  
**Quyền truy cập:** Requires Admin

### Mô tả

Lấy dashboard analytics và chart data thật.

### Success Response

```json
{
  "success": true,
  "data": {
    "metrics": {
      "today_revenue": 0,
      "this_month_revenue": 0,
      "last_month_revenue": 0,
      "revenue_growth_percent": 0,
      "order_growth_percent": 0,
      "customer_growth_percent": 0
    },
    "revenue_chart": {
      "range": "12m",
      "labels": [],
      "series": []
    },
    "order_chart": {
      "range": "12m",
      "labels": [],
      "series": []
    },
    "order_status": {},
    "inventory": {},
    "recent_orders": [],
    "top_selling_products": []
  }
}
```

### Business Rules / Notes

- Chart luôn trả đủ 12 tháng.
- Không fake chart data.
- Revenue dùng cùng rule delivered + paid.
- Test liên quan: `DashboardAnalyticsTest`.

### GET `/admin/dashboard/revenue`

**Trạng thái:** Not Implemented  
**Quyền truy cập:** Requires Admin

Route tồn tại nhưng `DashboardController::revenue` trả controlled `501`.

---

# 13. NOT IMPLEMENTED / PLANNED APIS

## 13.1. Danh sách route operations trả controlled 501

| Method | Endpoint | Quyền truy cập | Trạng thái |
|---|---|---|---|
| POST | `/auth/forgot-password` | Public | Not Implemented |
| POST | `/auth/reset-password` | Public | Not Implemented |
| GET | `/products/{slug}/comments` | Public | Not Implemented |
| GET | `/payments/callback` | Public | Not Implemented |
| POST | `/payments/callback` | Public | Not Implemented |
| GET | `/addresses` | Requires Auth | Not Implemented |
| POST | `/addresses` | Requires Auth | Not Implemented |
| GET | `/addresses/{address}` | Requires Auth | Not Implemented |
| PUT | `/addresses/{address}` | Requires Auth | Not Implemented |
| PATCH | `/addresses/{address}` | Requires Auth | Not Implemented |
| DELETE | `/addresses/{address}` | Requires Auth | Not Implemented |
| PUT | `/addresses/{id}/default` | Requires Auth | Not Implemented |
| POST | `/payments/checkout` | Requires Auth | Not Implemented |
| POST | `/products/{slug}/comments` | Requires Auth | Not Implemented |
| DELETE | `/comments/{id}` | Requires Auth | Not Implemented |
| POST | `/vouchers/apply` | Requires Auth | Not Implemented |
| GET | `/admin/dashboard/revenue` | Requires Admin | Not Implemented |

## 13.2. Address Management Routes

Các address routes được tạo bằng `Route::apiResource` và route `default`, nhưng tất cả methods trong `AddressController` hiện gọi `notImplemented()`.

Chưa có request body/response contract nghiệp vụ hoàn chỉnh cho module này.

## 13.3. Online Payment Routes

- `POST /payments/checkout`
- `GET /payments/callback`
- `POST /payments/callback`

Hiện hệ thống chỉ hỗ trợ COD. VNPay/MoMo và callback processing thuộc roadmap.

---

# 14. ENDPOINT INVENTORY VÀ TRACEABILITY

## 14.1. Tổng số route operations từ `routes/api.php`

| Phân loại quyền | Số route operations |
|---|---:|
| Public / Public Optional Auth | 22 |
| Requires Auth | 26 |
| Requires Admin | 49 |
| **Tổng cộng** | **97** |

Trong 97 route operations:

| Trạng thái | Số route operations |
|---|---:|
| Implemented | 80 |
| Not Implemented / controlled `501` | 17 |
| Partial ở cấp API route | 0 |

> Một số chức năng được đánh dấu Partial trong PRD vì thiếu frontend UI, nhưng API endpoint tương ứng vẫn là Implemented.

## 14.2. Test liên quan theo nhóm

| Nhóm API | Feature Tests tiêu biểu |
|---|---|
| Auth | `AuthFlowTest` |
| Product | `ProductPublicApiTest` |
| Public Category/Brand | `PublicCategoryBrandTest` |
| Cart | `CartTest` |
| Voucher | `VoucherTest` |
| Checkout | `CheckoutTest`, `PaymentFoundationTest` |
| Order Management | `OrderManagementTest` |
| Order Lookup | `OrderLookupTest` |
| Wishlist | `WishlistTest` |
| Review | `ReviewTest` |
| Admin Catalog | `AdminCategoryBrandTest`, `AdminProductTest`, `AdminProductVariantTest`, `AdminProductImageTest` |
| Admin User | `AdminUserManagementTest` |
| Dashboard | `DashboardStatsTest`, `DashboardAnalyticsTest` |
| Response/501 | `ApiResponseContractFoundationTest`, `RouteHardeningTest` |

# 15. ENDPOINT CẦN XÁC MINH THÊM

| Endpoint/Module | Nội dung cần xác minh |
|---|---|
| Public Category/Brand test suite | Controller và `PublicCategoryBrandTest` xác nhận Implemented, nhưng `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ vẫn có kỳ vọng `501`. |
| Public/legacy responses | Cần xác minh exact JSON envelope bằng runtime vì response contract đang hybrid. |
| Upload avatar/product/review images | Cần xác minh Cloudinary production credentials và fallback behavior ngoài test. |
| Admin list filter params | Một số frontend filter được xử lý phía client; cần kiểm tra controller trước khi coi là server-side filter. |
| Environment template | `.env.example` hiện khai báo MySQL trong khi baseline tài liệu và test/CI sử dụng SQLite; cần thống nhất trước khi bàn giao. |

# 16. CẢNH BÁO TÀI LIỆU

- Nếu `.ai/api/routes.md` khác `routes/api.php`, ưu tiên `routes/api.php`.
- `.ai/api/routes.md` đã được đồng bộ theo `routes/api.php`; `RouteHardeningTest` và `ApiResponseContractFoundationTest` vẫn cần cập nhật kỳ vọng Public Category/Brand.
- API response contract chưa đồng nhất hoàn toàn; frontend integration hiện có helper để xử lý nhiều response shape.
- Database hiện tại là SQLite local; không ghi MySQL là database hiện hành.
- COD là phương thức thanh toán duy nhất hoạt động; VNPay/MoMo chưa được triển khai.
