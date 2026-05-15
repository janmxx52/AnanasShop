# Frontend Manual Test Checklist — Phase 3 (Checkout + Voucher)

## Prerequisites
- Run backend: `php artisan serve` (default `http://127.0.0.1:8000`)
- Run frontend: `npm run dev` in `ananas-fashion-frontend`
- Use frontend env: `VITE_API_BASE_URL=http://127.0.0.1:8000/api`
- Seed test accounts if needed:
  - customer: `customer.e2e@example.com` / `Password1`
  - admin: `admin@example.com` / `Password1`

## 1) Guest checkout
- Add product variant to cart from `ProductDetailPage`.
- Open `/checkout` when logged out.
- Fill `full_name`, `email`, `phone`, `shipping_address`.
- Keep `payment_method=cod` and submit.
- Expected:
  - Success redirect to `/checkout/success`
  - `order_code` shown
  - `payment_method=cod`, `payment_status=pending`
  - Cart is empty after success.

## 2) Authenticated user checkout
- Login by `/login`.
- Add product variant to cart.
- Open `/checkout`.
- Verify shipping form is prefilled from auth profile where available.
- Submit checkout.
- Expected:
  - Success redirect to `/checkout/success`
  - `order_code` shown
  - Cart refetched as empty.

## 3) Voucher valid/invalid
- In checkout page, enter a valid voucher in `VoucherBox` and click `Check`.
- Expected valid:
  - Shows `subtotal`, `discount`, `total_after`.
- Enter invalid voucher and click `Check`.
- Expected invalid:
  - Show error message
  - No discount preview applied.

## 4) Empty cart guard
- Open `/checkout` with empty cart.
- Expected:
  - `EmptyState` shown
  - Has link back to `/products`.

## 5) Error handling checks
- Submit with missing required fields.
- Expected:
  - Validation errors displayed under fields.
- Try cart with stock-insufficient variant.
- Expected:
  - Error message from API is displayed in checkout page.
