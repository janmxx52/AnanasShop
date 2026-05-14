# Current Tasks — Ananas Fashion

> Updated: 2026-05-14

---

## ✅ Done

### Project Foundation
- [x] Khởi tạo project Laravel 12
- [x] Thiết kế kiến trúc (`architecture.md`)
- [x] Viết `AGENT.md`
- [x] Tạo folder structure theo architecture
- [x] Viết `database/schema.md`
- [x] Viết `business/business-rules.md`
- [x] Viết `api/routes.md`
- [x] Viết `laravel/folder-rules.md`
- [x] Tạo `routes/api.php` skeleton

### Packages & Configuration
- [x] Cài `laravel/sanctum`
- [x] Cài `cloudinary-labs/cloudinary-laravel`
- [x] Config `.env.example` (MySQL, Sanctum, Cloudinary)

### Auth API
- [x] Register
- [x] Login
- [x] Logout current device
- [x] Logout all devices
- [x] Update profile
- [x] Change password
- [x] Sanctum token authentication
- [x] `UserResource`
- [x] Feature tests cho Auth flow pass

### Media
- [x] Cloudinary wrapper
- [x] Avatar upload
- [x] Fallback local storage

### Products & Variants Foundation
- [x] Migrations: `categories`, `brands`, `products`, `product_images`, `product_variants`
- [x] Models: `Category`, `Brand`, `Product`, `ProductVariant`, `ProductImage`
- [x] Relationships:
  - [x] Category parent / children / products
  - [x] Brand products
  - [x] Product category / brand / variants / images
  - [x] Product soft delete
  - [x] ProductVariant product
  - [x] ProductImage product
- [x] Seeders: `CategorySeeder`, `BrandSeeder`, `ProductFactory`, `ProductSeeder`

### Product Public API
- [x] Product listing
- [x] Product detail by slug
- [x] Search by product name
- [x] Filter by category
- [x] Filter by brand
- [x] Filter by size
- [x] Filter by color
- [x] Filter by price range
- [x] Sort by newest
- [x] Sort by price asc
- [x] Sort by price desc
- [x] `ProductRepository`
- [x] `ProductResource`
- [x] `ProductController` public
- [x] `ProductIndexRequest`
- [x] `ProductShowRequest`
- [x] Feature tests cho Product Public API pass

### Test Status
- [x] `php artisan test` pass
- [x] 109 tests passed
- [x] 425 assertions passed


### Admin Catalog — Initial (Category & Brand)
- [x] Admin `CategoryController` and `BrandController` (basic CRUD)
- [x] Admin FormRequests for Category/Brand (store/update)
- [x] `EnsureUserRole` middleware + `role` alias registered
- [x] Admin routes normalized to `routes/api.php` (removed duplicates from `routes/web.php`)
- [x] Created stub controllers for missing API endpoints (to satisfy `route:list`/tests)
- [x] Feature tests for Admin Category & Brand — pass

### Admin Product — Core
- [x] Admin `ProductController` (core CRUD: create/update/show/list/delete/restore/status)
- [x] Admin Product FormRequests (store/update/index/status)
- [x] `AdminProductResource`
- [x] Admin routes for products registered under `routes/api.php`
- [x] Feature tests for Admin Product — pass

### Admin Product Variant
- [x] Admin `ProductVariantController` (nested CRUD)
- [x] Admin ProductVariant FormRequests (store/update)
- [x] `AdminProductVariantResource`
- [x] Nested admin product variant routes registered
- [x] Feature tests for Admin Product Variant — pass

### Admin Catalog CRUD

#### Admin Category
- [x] Create category
- [x] Update category
- [x] Delete category
- [x] List categories
- [x] Show category detail

#### Admin Brand
- [x] Create brand
- [x] Update brand
- [x] Delete brand
- [x] List brands
- [x] Show brand detail

#### Admin Product
- [x] Create product
- [x] Update product
- [x] Soft delete product
- [x] Restore product
- [x] Active / inactive product
- [x] List products for admin
- [x] Show product detail for admin

#### Admin Product Variant
- [x] Create variant
- [x] Update variant
- [x] Delete variant
- [x] Validate unique `product_id + size + color`
- [x] Manage stock

#### Security
- [x] Protect admin routes with `auth:sanctum`
- [x] Allow only `admin` role

#### Testing
- [x] Feature tests cho Admin Category & Brand
- [x] Feature tests cho Admin Product
- [x] Feature tests cho Admin Product Variant

### Admin Product Image
- [x] Upload product image to Cloudinary
- [x] Delete product image from Cloudinary
- [x] Set primary image
- [x] Validate max 10 images per product
- [x] Ensure only 1 primary image per product
- [x] Feature tests cho Admin Product Image pass
---


### Cart API
- [x] Guest cart
- [x] User cart
- [x] Merge guest cart
- [x] Add item to cart
- [x] Update item quantity
- [x] Remove item from cart
- [x] Clear cart
- [x] Same variant sums quantity
- [x] Quantity cannot exceed variant stock
- [x] Cannot add inactive product variant
- [x] Merge skips inactive product and returns warning
- [x] Cart response calculates price real-time
- [x] Feature tests cho Cart API pass

### Voucher API
- [x] Admin Voucher CRUD
- [x] Guest can check valid voucher
- [x] User can check valid voucher
- [x] Invalid code returns error
- [x] Min order amount enforced
- [x] Percent max_discount enforced
- [x] Fixed discount calculated correctly
- [x] Usage limit enforced
- [x] Usage per user enforced
- [x] Checking voucher does not mutate used_count
- [x] Checking voucher does not create voucher_usages
- [x] Feature tests cho Voucher API pass

### Order & Checkout API
- [x] Create order from cart
- [x] Guest checkout
- [x] Authenticated user checkout
- [x] Validate cart is not empty
- [x] Validate variant stock before checkout
- [x] Snapshot product, variant, price, and customer info
- [x] Calculate subtotal
- [x] Apply voucher
- [x] Calculate shipping fee
- [x] Calculate total
- [x] Deduct stock
- [x] Clear cart after success
- [x] Increment voucher used_count after success
- [x] Create voucher_usages after success
- [x] Use DB transaction
- [x] Feature tests cho Checkout pass
---


## 🔄 Current Focus

### Order Management API

- [x] Apply decisions: voucher usage rollback via `revoked_at` (no hard delete)
- [x] Apply decisions: admin cancel via PATCH status=`cancelled` (no separate endpoint)
- [x] Apply decisions: admin order status route standardized to PATCH only
- [x] List user orders
- [x] Show user order detail by order_code
- [x] Cancel user order
- [x] Restore stock when order cancelled
- [x] Restore voucher usage with revoked_at
- [x] Decrement voucher used_count when cancelled
- [x] Prevent double cancel / double restore
- [x] Admin list orders
- [x] Admin show order detail
- [x] Admin update order status
- [x] Validate order status flow
- [x] Feature tests cho Order Management pass

### Order Lookup API
- [x] Public endpoint `POST /api/orders/lookup`
- [x] Lookup by `order_code + email`
- [x] Lookup by `order_code + phone`
- [x] Supports guest orders
- [x] Supports user orders
- [x] Rejects lookup with only `order_code`
- [x] Requires both email and phone to match if both provided
- [x] Failed lookup returns generic message only
- [x] Failed lookup does not leak email/phone/address
- [x] Success response masks shipping address
- [x] Response contains status timeline
- [x] Throttle applies to lookup endpoint
- [x] Feature tests cho Order Lookup pass

### Payment Foundation
- [x] COD checkout creates order with `payment_status = pending`
- [x] Admin marks COD order delivered -> `payment_status = paid`
- [x] Customer cancelling COD order -> `payment_status = cancelled`
- [x] Admin cancelling COD order -> `payment_status = cancelled`
- [x] Non-delivered COD order remains `pending`
- [x] `payment_status` cannot be changed directly by normal order status payload
- [x] `failed` is not used for COD cancel
- [x] Feature tests cho Payment Foundation pass

## 📋 Upcoming — Do not work yet

### Payments
- [ ] VNPay
- [ ] MoMo

### Extra Features
- [ ] Reviews
- [ ] Wishlist
- [ ] Dashboard stats
- [ ] Unit tests for Services
