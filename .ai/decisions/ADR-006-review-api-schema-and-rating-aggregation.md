# ADR-006: Review API Schema and Rating Aggregation

> Date: 2026-05-14  
> Status: Accepted

---

## Context

Cần chốt rules cho Review API trước khi generate code để tránh lệch giữa database schema, API contract, và test coverage.

---

## Decision 1: Review images dùng bảng riêng

- Không lưu ảnh review bằng JSON trong bảng `reviews`.
- Dùng bảng riêng `review_images` gồm:
  - `review_id`
  - `image_url`
  - `public_id`
  - `sort_order` (nullable)
- Mỗi review tối đa 3 ảnh.

## Decision 2: Unique rule theo order_item

- Mỗi `order_item` chỉ được review 1 lần.
- Dùng unique `order_item_id`.
- User mua cùng product nhiều lần ở các `order_item` khác nhau thì được review nhiều lần.

## Decision 3: Delete review ownership

- Giữ route `DELETE /api/reviews/{id}`.
- User chỉ được xóa review của chính mình.
- Chưa làm admin moderation trong phase này.

## Decision 4: Product rating fields

- Product public API trả:
  - `rating_avg`
  - `review_count`
- Áp dụng cho cả product list và product detail.
- Rating avg tính real-time, không lưu DB.
- Nếu có field `is_approved`, aggregate chỉ tính review `is_approved = true`.

## Decision 5: Review approval phase

- Trong phase hiện tại, `is_approved` default true.
- Chưa triển khai admin moderation.

## Decision 6: Review image upload lifecycle

- Upload ảnh review dùng `CloudinaryService`.
- Ưu tiên tách folder review images nếu service hỗ trợ folder.
- Tests cần mock `CloudinaryService`.
- Nếu upload ảnh thành công nhưng tạo review fail, cần cleanup ảnh đã upload nếu codebase hỗ trợ delete.

---

## Consequences

- Schema tách `review_images` giúp quản lý ảnh rõ ràng hơn và dễ mở rộng.
- Uniqueness theo `order_item_id` phản ánh đúng business rule đã mua nhiều lần có thể review nhiều lần.
- Aggregate rating nhất quán giữa list/detail và tránh denormalize sai lệch.
