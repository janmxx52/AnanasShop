# Database Schema — Ananas Fashion

> Updated: 2026-05-15  
> Source of truth: `database/migrations`

---

## 1) `users`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| name | varchar(255) | required |
| email | varchar(255) | unique, required |
| email_verified_at | timestamp | nullable |
| password | varchar(255) | required |
| phone | varchar(255) | nullable |
| avatar | varchar(255) | nullable |
| role | varchar(255) | default `customer` |
| is_banned | tinyint(1) / bool | default `false` |
| deleted_at | timestamp | nullable (soft deletes) |
| remember_token | varchar(100) | nullable |
| avatar_public_id | varchar(255) | nullable |
| last_login_at | timestamp | nullable |
| password_changed_at | timestamp | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Important notes**
- `users` dùng SoftDeletes (`deleted_at`).
- Role không dùng enum DB, hiện là string.

---

## 2) `personal_access_tokens`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| tokenable_type / tokenable_id | morphs | indexed |
| name | text | required |
| token | varchar(64) | unique |
| abilities | text | nullable |
| last_used_at | timestamp | nullable |
| expires_at | timestamp | nullable, indexed |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 3) `categories`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| parent_id | bigint unsigned | nullable, FK -> `categories.id`, `nullOnDelete` |
| name | varchar(255) | required |
| slug | varchar(255) | unique |
| image | varchar(500) | nullable |
| description | text | nullable |
| sort_order | int | default `0` |
| is_active | bool | default `true` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 4) `brands`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| name | varchar(255) | required |
| slug | varchar(255) | unique |
| logo | varchar(500) | nullable |
| description | text | nullable |
| is_active | bool | default `true` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 5) `products`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| category_id | bigint unsigned | FK -> `categories.id`, cascadeOnDelete |
| brand_id | bigint unsigned | FK -> `brands.id`, cascadeOnDelete |
| name | varchar(255) | required |
| slug | varchar(255) | unique |
| description | longText | nullable |
| base_price | decimal(12,2) | required |
| sale_price | decimal(12,2) | nullable |
| is_featured | bool | default `false` |
| is_active | bool | default `true` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp | soft deletes |

**Important notes**
- Product có SoftDeletes.
- Quy tắc giá hiển thị: `sale_price ?? base_price`.

---

## 6) `product_variants`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| product_id | bigint unsigned | FK -> `products.id`, cascadeOnDelete |
| size | varchar(20) | nullable |
| color | varchar(50) | nullable |
| color_hex | varchar(7) | nullable |
| sku | varchar(100) | nullable, unique |
| stock | int | default `0` |
| price_adjustment | decimal(10,2) | default `0` |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes / unique**
- Unique composite: `unique(product_id, size, color)` (`product_variant_unique`).

---

## 7) `product_images`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| product_id | bigint unsigned | FK -> `products.id`, cascadeOnDelete |
| url | varchar(500) | required |
| public_id | varchar(255) | required |
| sort_order | int | default `0` |
| is_primary | bool | default `false` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 8) `carts`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| user_id | bigint unsigned | nullable, unique, FK -> `users.id`, cascadeOnDelete |
| guest_token | varchar(255) | nullable, unique |
| created_at | timestamp | |
| updated_at | timestamp | |

**Important notes**
- Hỗ trợ cả guest cart và user cart.
- DB chưa có check constraint bắt buộc `user_id` hoặc `guest_token`; rule này đang enforce ở app layer.

---

## 9) `cart_items`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| cart_id | bigint unsigned | FK -> `carts.id`, cascadeOnDelete |
| product_variant_id | bigint unsigned | FK -> `product_variants.id`, cascadeOnDelete |
| quantity | int | default `1` |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes / unique**
- Unique composite: `unique(cart_id, product_variant_id)`.

---

## 10) `vouchers`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| code | varchar(50) | unique |
| type | enum | `percent` / `fixed` |
| value | decimal(10,2) | required |
| min_order_amount | decimal(12,2) | default `0` |
| max_discount | decimal(12,2) | nullable |
| usage_limit | int | nullable |
| usage_per_user | int | default `1` |
| used_count | int | default `0` |
| starts_at | timestamp | nullable |
| expires_at | timestamp | nullable |
| is_active | tinyint(1) | default `1` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 11) `orders`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| user_id | bigint unsigned | nullable, FK -> `users.id`, set null on delete |
| guest_name | varchar(255) | nullable |
| guest_email | varchar(255) | nullable |
| customer_name | varchar(255) | nullable |
| customer_email | varchar(255) | nullable |
| customer_phone | varchar(20) | nullable |
| voucher_id | bigint unsigned | nullable, FK -> `vouchers.id`, set null on delete |
| code | varchar(50) | unique |
| status | enum | `pending, confirmed, processing, shipping, delivered, cancelled, returned` |
| subtotal | decimal(12,2) | required |
| discount_amount | decimal(12,2) | default `0` |
| shipping_fee | decimal(12,2) | default `0` |
| total | decimal(12,2) | required |
| payment_method | enum | `cod, vnpay, momo` |
| payment_status | enum | `pending, paid, failed, cancelled, refunded` |
| shipping_name | varchar(255) | required |
| shipping_phone | varchar(20) | required |
| shipping_address | text | required |
| note | text | nullable |
| paid_at | timestamp | nullable |
| created_at | timestamp | indexed |
| updated_at | timestamp | |

**Indexes**
- `index(user_id)`
- `index(status)`
- `index(created_at)`

**Important notes**
- Có contact snapshot (`customer_name`, `customer_email`, `customer_phone`) cho Order Lookup.
- `payment_status=cancelled` đã được hỗ trợ trong schema hiện tại.

---

## 12) `order_items`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| order_id | bigint unsigned | FK -> `orders.id`, cascadeOnDelete |
| product_id | bigint unsigned | nullable, FK -> `products.id`, set null on delete |
| product_variant_id | bigint unsigned | nullable, FK -> `product_variants.id`, set null on delete |
| product_name | varchar(255) | required |
| variant_name | varchar(255) | required |
| sku | varchar(255) | nullable |
| image_url | varchar(500) | nullable |
| unit_price | decimal(12,2) | required |
| quantity | int | required |
| line_total | decimal(12,2) | required |
| variant_info | json | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes**
- `index(order_id)`
- `index(product_id)`
- `index(product_variant_id)`

**Important notes**
- Snapshot fields đã dùng cột riêng (không dùng schema cũ kiểu `subtotal`/`variant_info` string).

---

## 13) `voucher_usages`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| voucher_id | bigint unsigned | FK -> `vouchers.id`, cascadeOnDelete |
| user_id | bigint unsigned | nullable, FK -> `users.id`, cascadeOnDelete |
| guest_token | varchar(100) | nullable |
| order_id | bigint unsigned | nullable, FK -> `orders.id`, `nullOnDelete` |
| revoked_at | timestamp | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes**
- `index(voucher_id)`
- `index(voucher_id, user_id)`
- `index(voucher_id, guest_token)`
- `index(voucher_id, revoked_at)`

**Important notes**
- `voucher_usages` là source of truth cho usage.
- Rollback khi cancel order dùng `revoked_at` (không hard delete usage row).

---

## 14) `wishlists`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| user_id | bigint unsigned | FK -> `users.id`, cascadeOnDelete |
| product_id | bigint unsigned | FK -> `products.id`, cascadeOnDelete |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes / unique**
- Unique composite: `unique(user_id, product_id)`.
- `index(user_id)`, `index(product_id)`.

---

## 15) `reviews`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| user_id | bigint unsigned | FK -> `users.id`, cascadeOnDelete |
| product_id | bigint unsigned | FK -> `products.id`, cascadeOnDelete |
| order_item_id | bigint unsigned | FK -> `order_items.id`, cascadeOnDelete, unique |
| rating | tinyInteger | required |
| comment | text | nullable |
| is_approved | bool | default `true` |
| created_at | timestamp | indexed |
| updated_at | timestamp | |

**Indexes / unique**
- `unique(order_item_id)` (mỗi order item chỉ review 1 lần).
- `index(product_id, is_approved)`.

**Important notes**
- Không lưu review images dạng JSON trong `reviews`.

---

## 16) `review_images`

| Column | Type | Constraints / Default |
|---|---|---|
| id | bigint unsigned | PK, AI |
| review_id | bigint unsigned | FK -> `reviews.id`, cascadeOnDelete |
| image_url | varchar(500) | required |
| public_id | varchar(255) | nullable |
| sort_order | int | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes**
- `index(review_id)`
- `index(sort_order)`

---

## 17) Tables có trong skeleton nhưng không thuộc core business flow

- `password_reset_tokens`
- `sessions`
- `cache`, `cache_locks`
- `jobs`, `job_batches`, `failed_jobs`

---

## 18) Explicit sync notes

- `users`: có soft delete, có `role`, `is_banned`.
- `products`: có soft delete, `sale_price`, `is_active`.
- `product_variants`: có unique `(product_id, size, color)`.
- `carts`: có cả `user_id` và `guest_token` (đều unique, nullable).
- `voucher_usages`: có `order_id` nullable + `nullOnDelete`, có `revoked_at`.
- `orders`: có snapshot customer fields + `payment_status` convention mới.
- `order_items`: đã dùng snapshot fields chuẩn mới (`product_name`, `variant_name`, `sku`, `image_url`, `unit_price`, `quantity`, `line_total`, `variant_info` JSON).
- `wishlists`: unique `(user_id, product_id)`.
- `reviews`: unique `order_item_id`, có `is_approved`, ảnh nằm ở bảng `review_images` (không dùng JSON column).
