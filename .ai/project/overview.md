# Project Overview — Ananas Fashion Backend

> Updated: 2026-05-15

---

## 1) Project summary

Ananas Fashion backend là API cho hệ thống e-commerce thời trang, xây bằng Laravel 12, theo kiến trúc:

- MVC
- Service layer
- Repository pattern
- FormRequest validation
- API Resource transformation

---

## 2) Current backend capability (implemented)

### Customer/Public side
- Auth (register/login/logout/profile/password)
- Product public API (list/detail/filter/sort)
- Cart (guest + user + merge)
- Voucher check
- Checkout:
  - guest checkout
  - authenticated checkout
  - COD flow
- Order management cho customer (list/detail/cancel)
- Public order lookup (order code + contact verify)
- Wishlist (user-only)
- Reviews (delivered-order based review flow)

### Admin side
- Category CRUD
- Brand CRUD
- Product CRUD + restore + status toggle
- Product variant CRUD
- Product image CRUD + Cloudinary
- Voucher CRUD
- Order management + status transitions
- Dashboard stats

### Cross-cutting
- Payment Foundation (COD-only, payment status convention)
- Route hardening for out-of-scope endpoints (controlled 501)
- Pricing consistency across product/cart/voucher/checkout
- Voucher rule centralization for check + checkout
- Partial API response contract standardization (admin + stubs + selected modules)

---

## 3) Current maturity

Backend hiện đã có đủ **core e-commerce flow** cho:

- Browse product
- Cart
- Voucher validation
- Checkout
- Order lifecycle cơ bản
- User-generated review
- Admin catalog + order ops + high-level stats

Phần chưa trong scope hiện tại chủ yếu là payment gateway online, một số public modules và deployment hardening.

---

## 4) Next phase đề xuất

### A. Deployment preparation
- Production config checklist
- Queue/cache/session strategy
- Observability + error monitoring
- CI/CD + release checklist

### B. Public response contract migration
- Chuẩn hóa dần toàn bộ public endpoints sang envelope thống nhất
- Giữ backward compatibility theo từng phase

### C. VNPay integration
- Payment checkout request + callback verification
- Idempotent callback processing
- Payment/order state reconciliation

### D. MoMo integration
- Tương tự VNPay: create payment + callback + reconciliation
- Test strategy cho callback and failure flows

