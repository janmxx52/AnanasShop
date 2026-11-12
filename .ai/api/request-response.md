# Request & Response Contract — Ananas Fashion

> Updated: 2026-06-04  
> Source of truth: Controller, FormRequest, Resource, `ApiResponse` trait và Feature Tests

## 1. Trạng thái Contract

API hiện sử dụng contract **hybrid**:

- Admin endpoint mới và route controlled `501` chủ yếu dùng standard envelope.
- Product API dùng Laravel JSON Resource.
- Cart API trả direct resource payload, không bọc trong `data`.
- Auth, order, wishlist, review và một số public endpoint dùng các response shape khác nhau.

Client phải ưu tiên HTTP status code và dùng helper để hỗ trợ cả envelope mới lẫn legacy payload.

## 2. Request Headers

### Public JSON

```http
Accept: application/json
Content-Type: application/json
```

### Requires Auth

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer {token}
```

### Guest Cart / Guest Checkout

```http
Accept: application/json
Content-Type: application/json
X-Guest-Token: {guest_token}
```

Khi guest chưa gửi token, Cart API có thể tạo token và trả qua response header:

```http
X-Guest-Token: {generated_guest_token}
```

### Multipart Upload

```http
Accept: application/json
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

## 3. Standard Success Envelope

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

Được dùng phổ biến ở Admin Category/Brand/Product/Variant/Image/User/Voucher/Dashboard.

## 4. Standard Paginated Envelope

```json
{
  "success": true,
  "message": "Lấy danh sách thành công.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  }
}
```

`ApiResponse::paginated()` chuẩn hóa bốn field trong `meta`.

## 5. Standard Error Envelope

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

## 6. Laravel Validation Error

Một số endpoint dùng validation response mặc định:

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

Response này có thể không chứa `success`.

## 7. Controlled 501

```json
{
  "success": false,
  "message": "Chức năng này chưa được hỗ trợ.",
  "errors": null
}
```

Áp dụng cho các route tồn tại nhưng chưa implement như password reset, address, comment, online payment, standalone voucher apply và dashboard revenue.

## 8. Legacy / Module-specific Response

### 8.1. Auth

```json
{
  "success": true,
  "data": {
    "token": "sanctum-token",
    "expires_at": "2026-07-04 10:00:00",
    "user": {}
  }
}
```

### 8.2. Product Resource

Product list/detail dùng Laravel Resource:

```json
{
  "data": {
    "id": 1,
    "name": "Sản phẩm",
    "slug": "san-pham",
    "variants": [],
    "images": []
  }
}
```

Product collection có thêm pagination metadata theo Laravel Resource.

### 8.3. Cart Direct Payload

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

Cart response không bọc trong `data`.

### 8.4. Voucher Check

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

### 8.5. Checkout / Order

```json
{
  "success": true,
  "data": {
    "code": "ANS-04062026-ABC123",
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

### 8.6. Public Order Lookup

```json
{
  "success": true,
  "data": {
    "order_code": "ANS-04062026-ABC123",
    "order_status": "pending",
    "shipping_address": "20 ký tự đầu tiên****",
    "status_timeline": []
  }
}
```

## 9. Status Codes

| Code | Ý nghĩa |
|---|---|
| `200` | Request thành công. |
| `201` | Tạo resource thành công. |
| `400` | Request không hợp lệ theo nghiệp vụ chung. |
| `401` | Chưa đăng nhập hoặc token không hợp lệ. |
| `403` | Không có quyền truy cập. |
| `404` | Không tìm thấy resource. |
| `422` | Validation hoặc business rule không hợp lệ. |
| `429` | Vượt rate limit. |
| `500` | Lỗi hệ thống ngoài dự kiến. |
| `501` | Route tồn tại nhưng chưa implement. |

## 10. Field Notes

- `PUT /api/auth/me` chỉ nhận `name`, `phone`, `avatar`; không đổi email.
- Voucher check nhận `code`; checkout nhận `voucher_code`.
- Checkout hiện chỉ nhận `payment_method=cod`.
- Admin order status update cấm client gửi `payment_status`.
- Product image upload dùng multipart field `file`.
- Review upload dùng `images[]`, tối đa 3 ảnh.

## 11. Need Verification

- Cần chuẩn hóa toàn bộ public/legacy response sang một envelope thống nhất nếu triển khai production.
- Cần xác minh exact runtime response của các upload endpoint khi dùng Cloudinary production.
- `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ mâu thuẫn với Public Category/Brand API đã implement.
