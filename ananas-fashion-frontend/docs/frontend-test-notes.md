# Frontend Test Notes (Phase 9)

## Cách chạy test
- Chạy toàn bộ test một lần:
  - `npm run test`
- Chạy test ở chế độ watch:
  - `npm run test:watch`

## Stack test đang dùng
- `Vitest`
- `React Testing Library`
- `@testing-library/jest-dom`
- `jsdom`

## Test hiện có
- `Button`: render và click.
- `Input`: render label + placeholder.
- `LoadingState/ErrorState/EmptyState`: render text tiếng Việt đúng.
- `PriceText`: format tiền VND theo `vi-VN`.
- `OrderStatusBadge` + `PaymentStatusBadge`: map label tiếng Việt đúng.
- `ProductCard`: render tên, giá và nút wishlist.
- `VoucherBox`: validate mã rỗng và callback khi check thành công (mock API).
- `LoginPage`: render form email/mật khẩu.
- `RouteGuards`:
  - guest vào route protected bị redirect về login.
  - customer vào admin route bị chặn.

## Test chưa làm trong phase này
- Chưa test integration sâu giữa page và API thật.
- Chưa test toàn bộ flow checkout/order/review/wishlist theo tương tác đầy đủ.
- Chưa test snapshot/UI regression.
- Chưa có E2E browser test (Playwright/Cypress).

## Hướng mở rộng đề xuất
- Bổ sung test cho `AuthContext` (bootstrap token, login/logout flow).
- Bổ sung test cho các page chính:
  - `CheckoutPage`, `OrderLookupPage`, `UserOrderDetailPage`, `WishlistPage`.
- Bổ sung test admin pages:
  - `AdminProductsPage`, `AdminProductManagePage`, `AdminOrdersPage`, `AdminVouchersPage`.
- Tách mock server với `msw` để mô phỏng API theo contract tốt hơn.
