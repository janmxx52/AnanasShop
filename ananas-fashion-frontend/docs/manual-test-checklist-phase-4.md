# Frontend Manual Test Checklist — Phase 4 (Order Lookup + User Orders)

## Prerequisites
- Backend running: `php artisan serve`
- Frontend running: `npm run dev` in `ananas-fashion-frontend`
- `VITE_API_BASE_URL` points to backend `/api`
- Have sample orders for guest and authenticated user

## 1) Public lookup success by email
- Open `/orders/lookup`
- Fill `order_code` + correct `email` (leave phone empty)
- Submit
- Expected:
  - lookup success response shown
  - includes order code, status, date, items, total, payment, masked shipping address, timeline

## 2) Public lookup success by phone
- Fill `order_code` + correct `phone` (leave email empty)
- Submit
- Expected: same success fields as above

## 3) Public lookup fail generic
- Fill wrong email/phone for valid order code
- Submit
- Expected:
  - generic message shown: `Không tìm thấy đơn hàng`
  - no sensitive data leaked

## 4) Validate lookup client guard
- Fill only `order_code` without email/phone
- Submit
- Expected:
  - client-side block with error message
  - request is not sent

## 5) User order list
- Login as customer
- Open `/orders`
- Expected:
  - only own orders are listed
  - loading/error/empty states work

## 6) User order detail
- From `/orders`, open one order
- Expected:
  - shows status/payment badges
  - shows amount breakdown + shipping data
  - shows order items

## 7) Cancel pending/confirmed order
- Open an order in `pending` or `confirmed`
- Click cancel
- Expected:
  - cancel succeeds
  - detail refetches and status/payment status update accordingly

## 8) Cannot cancel shipping/delivered order
- Open an order in `shipping` or `delivered` if available
- Expected:
  - cancel button not shown
  - no cancel request triggered
