# Current Tasks — Ananas Fashion

> Updated: 2026-05-12

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

### Media
- [x] Cloudinary wrapper
- [x] Avatar upload
- [x] Fallback local storage

### Testing
- [x] Feature tests cho Auth flow (pass)

---

## 🔄 Current Focus (Milestone 2)

### Products & Variants Foundation

#### Database
- [x] Migration: `categories`
- [x] Migration: `brands`
- [x] Migration: `products`
- [x] Migration: `product_images`
- [x] Migration: `product_variants`

#### Models & Relationships
- [x] `Category`
  - [x] parent / children
  - [x] products
- [x] `Brand`
  - [x] products
- [x] `Product`
  - [x] category
  - [x] brand
  - [x] variants
  - [x] images
  - [ ] reviews
  - [x] soft delete
- [x] `ProductVariant`
  - [x] product
- [x] `ProductImage`
  - [x] product

#### Seeders
- [x] `CategorySeeder`
- [x] `BrandSeeder`
- [x] `ProductFactory`
- [x] `ProductSeeder`

---

## 📋 Next Queue (Milestone 3)

### Product Public API
- [x] Product listing
- [x] Product detail by slug
- [x] Filter:
  - [x] category
  - [x] brand
  - [x] size
  - [x] color
  - [x] price range
- [x] Sort:
  - [x] newest
  - [x] price asc
  - [x] price desc
- [x] Search by product name
- [x] `ProductResource`
- [x] `ProductRepository`
 - [x] `ProductController` (public)
 - [x] `FormRequests` (index, show)

### Testing
- [x] Feature tests cho Product Public API (pass)

---

## 📋 Upcoming (Do not work yet)

### Cart
- [ ] Guest cart
- [ ] User cart
- [ ] Merge guest cart
- [ ] Cart API

### Orders
- [ ] Voucher apply
- [ ] Checkout
- [ ] Order status flow
- [ ] Order lookup

### Payments
- [ ] VNPay
- [ ] MoMo

### Extra Features
- [ ] Reviews
- [ ] Wishlist
- [ ] Dashboard stats
- [ ] Unit tests for Services