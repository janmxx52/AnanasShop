# API Routes — Ananas Fashion

> Base URL: `/api`
> Auth: Bearer Token (Laravel Sanctum)
> Response format: JSON

---

## 🔓 Public Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/forgot-password` | Gửi link reset password |
| POST | `/api/auth/reset-password` | Đặt lại password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Danh sách sản phẩm (filter, sort, paginate, có `rating_avg` + `review_count`) |
| GET | `/api/products/{slug}` | Chi tiết sản phẩm (có `rating_avg` + `review_count`) |
| GET | `/api/products/{slug}/reviews` | Danh sách đánh giá |

### Categories & Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/categories/{slug}` | Chi tiết danh mục + sản phẩm |
| GET | `/api/brands` | Danh sách thương hiệu |
| GET | `/api/brands/{slug}` | Chi tiết thương hiệu + sản phẩm |

### Vouchers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vouchers/check` | Kiểm tra voucher hợp lệ |

### Order Lookup
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/lookup` | Tra cứu đơn hàng không cần đăng nhập (`throttle:10,1`) |

---

## 🔐 Protected Routes (auth:sanctum required)

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Thông tin user hiện tại |
| PUT | `/api/auth/me` | Cập nhật thông tin |
| PUT | `/api/auth/me/password` | Đổi mật khẩu |

### Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | Danh sách địa chỉ |
| POST | `/api/addresses` | Thêm địa chỉ |
| PUT | `/api/addresses/{id}` | Cập nhật địa chỉ |
| DELETE | `/api/addresses/{id}` | Xóa địa chỉ |
| PUT | `/api/addresses/{id}/default` | Đặt làm địa chỉ mặc định |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart/items` | Thêm sản phẩm vào giỏ |
| PUT | `/api/cart/items/{itemId}` | Cập nhật số lượng |
| DELETE | `/api/cart/items/{itemId}` | Xóa 1 item |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ hàng |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Lịch sử đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng mới |
| GET | `/api/orders/{order_code}` | Chi tiết đơn hàng |
| POST | `/api/orders/{order_code}/cancel` | Hủy đơn hàng |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout` | Khởi tạo thanh toán |
| GET | `/api/payments/callback` | Callback từ payment gateway |

### Reviews & Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products/{slug}/reviews` | Đăng đánh giá (chỉ user đã mua, order delivered) |
| DELETE | `/api/reviews/{id}` | Xóa đánh giá (user chỉ xóa review của chính mình) |
| GET | `/api/wishlist` | Danh sách yêu thích (paginate, default `per_page=12`, max `50`) |
| POST | `/api/wishlist/toggle` | Toggle yêu thích theo `product_id` |
| DELETE | `/api/wishlist/{product}` | Xóa wishlist item (idempotent: item không tồn tại vẫn success) |

---

## 👑 Admin Routes (`role:admin`)

> Prefix: `/api/admin`

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | Danh sách (có filter) |
| POST | `/api/admin/products` | Tạo sản phẩm mới |
| GET | `/api/admin/products/{id}` | Chi tiết |
| PUT | `/api/admin/products/{id}` | Cập nhật |
| DELETE | `/api/admin/products/{id}` | Xóa (soft delete) |
| POST | `/api/admin/products/{id}/images` | Upload ảnh |

### Categories & Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/categories` | List / Create |
| PUT/DELETE | `/api/admin/categories/{id}` | Update / Delete |
| GET/POST | `/api/admin/brands` | List / Create |
| PUT/DELETE | `/api/admin/brands/{id}` | Update / Delete |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | Tất cả đơn hàng |
| GET | `/api/admin/orders/{order_code}` | Chi tiết |
| PATCH | `/api/admin/orders/{order_code}/status` | Cập nhật trạng thái (bao gồm cancel với `status=cancelled`) |

### Users & Vouchers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Danh sách users |
| PUT | `/api/admin/users/{id}/ban` | Ban/Unban user |
| GET/POST | `/api/admin/vouchers` | List / Create |
| PUT/DELETE | `/api/admin/vouchers/{id}` | Update / Delete |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Thống kê tổng quan |
| GET | `/api/admin/dashboard/revenue` | Doanh thu theo thời gian |

---

## Query Parameters Chuẩn

### GET /api/products
```
?page=1
?per_page=12
?category={slug}
?brand={slug}
?min_price={number}
?max_price={number}
?sort=price_asc|price_desc|newest|popular
?search={keyword}
?is_featured=1
```

### GET /api/wishlist
```
?page=1
?per_page=12      // default
?per_page<=50     // max
```

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Paginated
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```

### Error
```json
{
  "success": false,
  "message": "...",
  "errors": { ... }
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete) |
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |
