# Database Schema — Ananas Fashion

> Database: MySQL | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci

---

## 1. users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| name | varchar(255) | NOT NULL | |
| email | varchar(255) | NOT NULL, UNIQUE | |
| email_verified_at | timestamp | NULLABLE | |
| password | varchar(255) | NOT NULL | bcrypt |
| phone | varchar(20) | NULLABLE | |
| avatar | varchar(500) | NULLABLE | Cloudinary URL |
| role | enum('customer','admin') | DEFAULT 'customer' | |
| is_banned | tinyint(1) | DEFAULT 0 | |
| remember_token | varchar(100) | NULLABLE | |
| created_at | timestamp | | |
| updated_at | timestamp | | |
| deleted_at | timestamp | NULLABLE | SoftDelete |

---

## 2. addresses

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| user_id | bigint UNSIGNED | FK → users.id | |
| full_name | varchar(255) | NOT NULL | |
| phone | varchar(20) | NOT NULL | |
| province | varchar(100) | NOT NULL | Tỉnh/TP |
| district | varchar(100) | NOT NULL | Quận/Huyện |
| ward | varchar(100) | NOT NULL | Phường/Xã |
| address_line | varchar(500) | NOT NULL | Số nhà, đường |
| is_default | tinyint(1) | DEFAULT 0 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 3. categories

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| parent_id | bigint UNSIGNED | NULLABLE, FK → categories.id | Danh mục con |
| name | varchar(255) | NOT NULL | |
| slug | varchar(255) | NOT NULL, UNIQUE | |
| image | varchar(500) | NULLABLE | Cloudinary URL |
| description | text | NULLABLE | |
| sort_order | int | DEFAULT 0 | |
| is_active | tinyint(1) | DEFAULT 1 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 4. brands

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| name | varchar(255) | NOT NULL | |
| slug | varchar(255) | NOT NULL, UNIQUE | |
| logo | varchar(500) | NULLABLE | Cloudinary URL |
| description | text | NULLABLE | |
| is_active | tinyint(1) | DEFAULT 1 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 5. products

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| category_id | bigint UNSIGNED | FK → categories.id | |
| brand_id | bigint UNSIGNED | FK → brands.id | |
| name | varchar(255) | NOT NULL | |
| slug | varchar(255) | NOT NULL, UNIQUE | |
| description | longtext | NULLABLE | HTML/Markdown |
| base_price | decimal(12,2) | NOT NULL | Giá gốc |
| sale_price | decimal(12,2) | NULLABLE | Giá khuyến mãi |
| is_featured | tinyint(1) | DEFAULT 0 | |
| is_active | tinyint(1) | DEFAULT 1 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |
| deleted_at | timestamp | NULLABLE | SoftDelete |

---

## 6. product_images

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| product_id | bigint UNSIGNED | FK → products.id | |
| url | varchar(500) | NOT NULL | Cloudinary URL |
| public_id | varchar(255) | NOT NULL | Cloudinary public_id |
| sort_order | int | DEFAULT 0 | |
| is_primary | tinyint(1) | DEFAULT 0 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 7. product_variants

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| product_id | bigint UNSIGNED | FK → products.id | |
| size | varchar(20) | NULLABLE | XS/S/M/L/XL/XXL hoặc số giày |
| color | varchar(50) | NULLABLE | Tên màu |
| color_hex | varchar(7) | NULLABLE | Hex code VD: #FF0000 |
| sku | varchar(100) | NULLABLE, UNIQUE | |
| stock | int | DEFAULT 0 | Tồn kho |
| price_adjustment | decimal(10,2) | DEFAULT 0 | +/- so với base_price |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 8. carts

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| user_id | bigint UNSIGNED | NULLABLE, FK → users.id, UNIQUE | NULL = guest cart |
| guest_token | varchar(100) | NULLABLE, UNIQUE | Token định danh guest |
| created_at | timestamp | | |
| updated_at | timestamp | | |

> **Constraint**: `user_id` và `guest_token` không được cùng NULL — 1 trong 2 bắt buộc phải có.
> **UNIQUE**: `user_id` (khi không null) — 1 user = 1 cart
> **UNIQUE**: `guest_token` (khi không null)

---

## 9. cart_items

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| cart_id | bigint UNSIGNED | FK → carts.id | |
| product_variant_id | bigint UNSIGNED | FK → product_variants.id | |
| quantity | int | NOT NULL, DEFAULT 1 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

> **UNIQUE**: (cart_id, product_variant_id)

---

## 10. vouchers

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| code | varchar(50) | NOT NULL, UNIQUE | |
| type | enum('percent','fixed') | NOT NULL | |
| value | decimal(10,2) | NOT NULL | % hoặc số tiền cố định |
| min_order_amount | decimal(12,2) | DEFAULT 0 | Đơn tối thiểu |
| max_discount | decimal(12,2) | NULLABLE | Giảm tối đa (khi type=percent) |
| usage_limit | int | NULLABLE | Giới hạn lượt dùng tổng |
| usage_per_user | int | DEFAULT 1 | Giới hạn mỗi user |
| used_count | int | DEFAULT 0 | |
| starts_at | timestamp | NULLABLE | |
| expires_at | timestamp | NULLABLE | |
| is_active | tinyint(1) | DEFAULT 1 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 11. orders

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| user_id | bigint UNSIGNED | NULLABLE, FK → users.id | NULL = guest order |
| guest_name | varchar(255) | NULLABLE | Bắt buộc nếu guest |
| guest_email | varchar(255) | NULLABLE | Bắt buộc nếu guest |
| customer_name | varchar(255) | NULLABLE | Contact snapshot for order lookup |
| customer_email | varchar(255) | NULLABLE | Contact snapshot for order lookup |
| customer_phone | varchar(20) | NULLABLE | Contact snapshot for order lookup |
| voucher_id | bigint UNSIGNED | NULLABLE, FK → vouchers.id | |
| code | varchar(50) | NOT NULL, UNIQUE | VD: ANS-20250511-0001 |
| status | enum | NOT NULL | Xem bên dưới |
| subtotal | decimal(12,2) | NOT NULL | Trước giảm giá |
| discount_amount | decimal(12,2) | DEFAULT 0 | |
| shipping_fee | decimal(10,2) | DEFAULT 0 | |
| total | decimal(12,2) | NOT NULL | Tổng thanh toán |
| payment_method | enum('cod','vnpay','momo') | NOT NULL | |
| payment_status | enum('pending','paid','failed','refunded') | DEFAULT 'pending' | |
| shipping_name | varchar(255) | NOT NULL | Snapshot địa chỉ |
| shipping_phone | varchar(20) | NOT NULL | |
| shipping_address | text | NOT NULL | Full address string |
| note | text | NULLABLE | |
| paid_at | timestamp | NULLABLE | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

> **Guest order**: `user_id = null`, `guest_name` + `guest_email` bắt buộc (validate ở service layer)
> **Order lookup contact source**: Ưu tiên `customer_email` + `customer_phone`; giữ tương thích `guest_email` + `shipping_phone` cho dữ liệu cũ.

**Order Status enum:**
- `pending` — Chờ xác nhận
- `confirmed` — Đã xác nhận
- `processing` — Đang xử lý
- `shipping` — Đang giao hàng
- `delivered` — Đã giao
- `cancelled` — Đã hủy
- `returned` — Hoàn hàng

---

## 12. order_items

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| order_id | bigint UNSIGNED | FK → orders.id | |
| product_variant_id | bigint UNSIGNED | FK → product_variants.id | |
| product_name | varchar(255) | NOT NULL | Snapshot |
| variant_info | varchar(100) | NULLABLE | "Size M / Màu Đen" - Snapshot |
| unit_price | decimal(12,2) | NOT NULL | Giá tại thời điểm mua |
| quantity | int | NOT NULL | |
| subtotal | decimal(12,2) | NOT NULL | unit_price * quantity |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 13. reviews

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| user_id | bigint UNSIGNED | FK → users.id | |
| product_id | bigint UNSIGNED | FK → products.id | |
| order_item_id | bigint UNSIGNED | NULLABLE, FK → order_items.id | Chỉ review sau khi mua |
| rating | tinyint | NOT NULL | 1–5 |
| comment | text | NULLABLE | |
| images | json | NULLABLE | Mảng Cloudinary URLs |
| is_approved | tinyint(1) | DEFAULT 1 | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

> **UNIQUE**: (user_id, order_item_id)

---

## 14. wishlists

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| user_id | bigint UNSIGNED | FK → users.id | |
| product_id | bigint UNSIGNED | FK → products.id | |
| created_at | timestamp | | |

> **UNIQUE**: (user_id, product_id)

---

## 15. voucher_usages

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint UNSIGNED | PK, AI | |
| voucher_id | bigint UNSIGNED | FK → vouchers.id | |
| user_id | bigint UNSIGNED | NULLABLE, FK → users.id | Null when guest usage |
| guest_token | varchar(100) | NULLABLE | Null when user usage |
| order_id | bigint UNSIGNED | NULLABLE, FK → orders.id | Keep usage audit if order deleted |
| revoked_at | timestamp | NULLABLE | Soft-revoke usage when order is cancelled |
| created_at | timestamp | | |

> **Usage counting rule**: `usage_limit` và `usage_per_user` chỉ tính các row có `revoked_at IS NULL`.

---

## Relationships Summary

```
users          ─< addresses
users          ─< carts >─< cart_items >─ product_variants
users          ─< orders >─< order_items >─ product_variants
users          ─< wishlists >─ products
users          ─< reviews
products       ─< product_variants
products       ─< product_images
products       >─ categories
products       >─ brands
categories     ─< categories (self-referential, parent_id)
vouchers       ─< orders
vouchers       ─< voucher_usages
```
