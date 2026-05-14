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
- [x] 41 tests passed
- [x] 179 assertions passed


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

## 🔄 Current Focus

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
- [x] Cart response calculates price real-time
- [x] Feature tests cho Cart API pass

### Voucher
- [ ] Voucher apply
- [ ] Voucher validation
- [ ] Voucher usage tracking
- [ ] Voucher tests

### Orders
- [ ] Checkout
- [ ] Order status flow
- [ ] Order lookup
- [ ] Order tests

---

## 📋 Upcoming — Do not work yet

### Payments
- [ ] VNPay
- [ ] MoMo

### Extra Features
- [ ] Reviews
- [ ] Wishlist
- [ ] Dashboard stats
- [ ] Unit tests for Services