# Postman E2E Test Report — Ananas Fashion

## Metadata
- Ngày test: **2026-05-15**
- Tool: **Postman Collection Runner**
- Collection: **Ananas Fashion API - E2E Skeleton**
- Base URL: **http://127.0.0.1:8000/api**

## Kết quả
- Errors: **0**

### Các nhóm đã test
- Route Hardening
- Auth
- Product Public
- Guest/User Cart (nếu đã chạy)
- Voucher (nếu đã chạy)
- Checkout (nếu đã chạy)
- Order (nếu đã chạy)
- Wishlist/Review/Admin (nếu đã chạy)

## Ghi chú
- Một số request có status `422` là expected khi test register trùng email hoặc validation case.
- Endpoint `501` là expected cho out-of-scope routes.

## Kết luận
- API chạy ổn ở tầng HTTP local.
- Laravel test suite vẫn là source xác nhận automated test chính.

