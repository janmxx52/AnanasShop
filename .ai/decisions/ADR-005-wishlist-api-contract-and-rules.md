# ADR-005: Wishlist API Contract and Rules

> Date: 2026-05-14  
> Status: Accepted

---

## Context

Cần chốt API contract cho Wishlist trước khi generate code để tránh lệch giữa routes, validation, và test.

---

## Decision 1: Routes chuẩn cho Wishlist

- Chỉ dùng:
  - `GET /api/wishlist`
  - `POST /api/wishlist/toggle`
  - `DELETE /api/wishlist/{product}`
- Không giữ backward compatibility với endpoint cũ:
  - `POST /api/wishlist/{productId}`

## Decision 2: DELETE là idempotent

- `DELETE /api/wishlist/{product}` luôn trả success.
- Nếu item tồn tại: xóa item.
- Nếu item không tồn tại: vẫn success, không trả `404`.

## Decision 3: Pagination cho danh sách wishlist

- `GET /api/wishlist` dùng pagination.
- `per_page` mặc định là `12`.
- `per_page` tối đa là `50`.

## Decision 4: Auth & product eligibility

- Wishlist chỉ cho user đã đăng nhập (`auth:sanctum`).
- Guest không được dùng wishlist.
- Chỉ cho wishlist product:
  - `is_active = true`
  - chưa soft delete.

## Decision 5: Database integrity

- Bắt buộc unique constraint:
  - `unique(user_id, product_id)`.

---

## Consequences

- API contract rõ ràng và nhất quán với test cases.
- Tránh duplicate wishlist item ở cả app layer và DB layer.
- Hành vi xóa idempotent giúp client xử lý đơn giản, không cần phân nhánh theo `404`.
