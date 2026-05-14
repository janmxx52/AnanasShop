# ADR-007: Admin Dashboard Stats Metrics and Scope

> Date: 2026-05-14  
> Status: Accepted

---

## Context

Cần chốt rõ metric definitions và scope cho `GET /api/admin/dashboard/stats` trước khi generate code để tránh lệch dữ liệu giữa service, tests và API contract.

---

## Decision 1: `total_revenue` rule

- Tính `SUM(orders.total)` với điều kiện:
  - `orders.status = delivered`
  - `orders.payment_status = paid`
- Không tính các trạng thái: `cancelled`, `pending`, `processing`, `shipping`, `returned`.

## Decision 2: Order counts

- `total_orders`: tất cả orders.
- `pending_orders`: `status = pending`.
- `cancelled_orders`: `status = cancelled`.
- `delivered_orders`: `status = delivered`.

## Decision 3: Stock metrics

- `low_stock_variants`: `product_variants.stock > 0 AND stock <= 5`.
- `out_of_stock_variants`: `product_variants.stock = 0`.

## Decision 4: Reviews metrics

- `total_reviews`: chỉ tính reviews có `is_approved = true`.
- `average_rating`: `AVG(rating)` của reviews có `is_approved = true`.
- Nếu không có review, `average_rating = 0`.

## Decision 5: Users/Products scope

- `total_users`: không tính soft-deleted users (nếu User có SoftDeletes).
- `total_products`: không tính soft-deleted products.
- Product `is_active = false` vẫn tính vào `total_products`.

## Decision 6: `recent_orders` payload

- Limit = 5.
- Sort `created_at DESC`.
- Chỉ trả field:
  - `order_code`
  - `status`
  - `payment_status`
  - `total`
  - `created_at`
  - `customer_name` (nếu có snapshot)

## Decision 7: `top_selling_products` payload

- Limit = 5.
- Tính theo `SUM(order_items.quantity)`.
- Chỉ tính order_items thuộc orders:
  - `status = delivered`
  - `payment_status = paid`
- Bỏ qua `order_items.product_id = null`.
- Trả:
  - `product_id`
  - `product_name`
  - `total_sold`
  - `revenue`

## Decision 8: Route and phase scope

- Dùng route hiện có: `GET /api/admin/dashboard/stats`.
- Middleware: `auth:sanctum + role:admin`.
- Không implement `/api/admin/dashboard/revenue` trong phase này nếu ngoài scope.

---

## Consequences

- Định nghĩa metrics rõ ràng, giúp tránh sai lệch giữa query và kỳ vọng business.
- Giảm rủi ro rò rỉ PII ở `recent_orders` bằng payload tối thiểu.
- Dễ viết feature tests deterministic cho từng metric.
