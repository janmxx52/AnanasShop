# Current Tasks — Ananas Fashion

> Updated: 2026-05-15

---

## ✅ Done

### Foundation
- [x] Laravel 12 project bootstrap
- [x] Core architecture docs (`overview`, `architecture`, `tech-stack`, conventions, folder-rules)
- [x] Core database schema and API route docs initialized
- [x] Sanctum + Cloudinary integration

### Auth
- [x] Register
- [x] Login
- [x] Logout current device
- [x] Logout all devices
- [x] Me profile
- [x] Update profile + avatar upload
- [x] Change password

### Product Public API
- [x] Product list + pagination
- [x] Product detail by slug
- [x] Search/filter/sort
- [x] Active-only public visibility
- [x] Rating/review aggregates on list/detail

### Admin Catalog
- [x] Admin category CRUD
- [x] Admin brand CRUD
- [x] Admin product CRUD + restore + active toggle
- [x] Admin variant CRUD (nested by product)
- [x] Admin product image CRUD + primary image
- [x] Admin protection via `auth:sanctum + role:admin`

### Cart
- [x] Guest cart via `X-Guest-Token`
- [x] User cart via Sanctum
- [x] Add/update/remove/clear item
- [x] Merge guest cart into user cart
- [x] Stock-aware validation
- [x] Real-time pricing (no hard price snapshot in cart)

### Voucher
- [x] Public voucher check endpoint
- [x] Admin voucher CRUD
- [x] Rules: min order, usage limit, usage per user, max discount
- [x] Voucher check is read-only (no mutation of `used_count`/`voucher_usages`)

### Checkout
- [x] Guest checkout
- [x] Authenticated user checkout
- [x] Cart empty/stock validation
- [x] Voucher apply at checkout
- [x] Shipping fee rule
- [x] Order + order_items snapshot
- [x] Stock deduction
- [x] Clear cart after success
- [x] Transaction + row locking for checkout flow

### Order Management
- [x] User order list/detail/cancel
- [x] Admin order list/detail/update status
- [x] Admin cancel via `PATCH status=cancelled`
- [x] Status transition enforcement
- [x] Cancel rollback: restore stock + voucher usage rollback
- [x] `voucher_usages.revoked_at` rollback strategy

### Order Lookup
- [x] Public lookup endpoint `POST /api/orders/lookup`
- [x] Lookup by `order_code + email` or `order_code + phone`
- [x] If both email+phone provided, both must match
- [x] Generic fail message only
- [x] Masked shipping address
- [x] Static status timeline
- [x] Throttle `10 req/min`

### Payment Foundation (COD)
- [x] COD checkout => `payment_status=pending`
- [x] COD delivered => `payment_status=paid`
- [x] Cancelled order => `payment_status=cancelled`
- [x] Reject direct `payment_status` update in normal status payload
- [x] `failed` reserved for online payment failure in future phases

### Wishlist
- [x] User-only wishlist (`auth:sanctum`)
- [x] `GET /wishlist`, `POST /wishlist/toggle`, `DELETE /wishlist/{product}`
- [x] Delete idempotent
- [x] Pagination default 12, max 50
- [x] Active/non-deleted product only
- [x] Duplicate protection via unique `(user_id, product_id)`

### Reviews
- [x] Public review list by product slug
- [x] Authenticated review create/delete
- [x] Review only delivered order items
- [x] Owner-only order item review
- [x] One review per order item (unique `order_item_id`)
- [x] Review images via `review_images` table + Cloudinary
- [x] Max 3 review images
- [x] `is_approved` default true (no moderation phase yet)

### Dashboard Stats
- [x] Admin dashboard stats endpoint
- [x] Metrics for users/products/orders/revenue/stocks/reviews
- [x] `total_revenue` only from delivered + paid orders
- [x] `recent_orders` limit 5 with minimized PII
- [x] `top_selling_products` limit 5 (delivered + paid orders)

### Hardening & Contracts
- [x] Route hardening for out-of-scope endpoints
- [x] Stub endpoints return controlled 501 envelope
- [x] Removed API route duplication from `routes/web.php`
- [x] API response contract foundation (`ApiResponse` helper/trait)
- [x] Admin API response contract migration (selected admin modules)
- [x] Pricing consistency fix (display price + variant final price unified)
- [x] Voucher rule centralization (`VoucherCalculator` shared by voucher check + checkout)
- [x] API documentation generated (`.ai/api/api-documentation.md`, `.ai/api/postman-notes.md`)
- [x] Postman E2E smoke test completed (`.ai/api/postman-test-report.md`)

---

## 🧪 Test Status

- [x] `php artisan route:list` passes
- [x] `php artisan test` passes (latest verified run in project context)
- [x] 167 tests passed (latest recorded full-suite status)

---

## 🔄 Current Focus

### Project Stabilization / Deployment Preparation
- [ ] Production environment checklist (env, queue, cache, storage)
- [ ] Migration/seed strategy for deployment
- [ ] Health checks and runtime observability
- [ ] API contract stabilization for public endpoints (progressive migration)
- [ ] CI/CD and release process hardening

---

## 📋 Upcoming (Not in current coding scope)

### Payments
- [ ] VNPay integration
- [ ] MoMo integration

### Platform
- [ ] Deployment automation and rollout playbook
- [ ] Service-level/unit tests expansion for critical services
