# ADR-002: Order Management Status & Voucher Rollback

> Date: 2026-05-14  
> Status: Accepted

---

## Context

Order Management API cần chốt rõ cách cancel order, rollback voucher usage, và chuẩn hóa admin status route trước khi generate code.

---

## Decision 1: Voucher rollback keeps audit rows

- Không xóa row trong `voucher_usages` khi order bị cancel.
- Thêm cột `voucher_usages.revoked_at` (nullable).
- Khi cancel order có voucher:
  - set `revoked_at = now()` cho usage row tương ứng
  - decrement `vouchers.used_count` trong cùng DB transaction
- Khi check `usage_limit` và `usage_per_user`:
  - chỉ count usage có `revoked_at IS NULL`

## Decision 2: Admin cancel via status endpoint

- Admin cancel đi qua `PATCH /api/admin/orders/{order_code}/status` với `status=cancelled`.
- Không tạo endpoint admin cancel riêng.

## Decision 3: Standardize admin status route method

- Chuẩn hóa method là `PATCH`.
- Không giữ `PUT` nếu chưa cần backward compatibility.

---

## Consequences

- Voucher usage có lịch sử đầy đủ (audit-friendly) thay vì hard delete.
- Logic usage-limit/per-user cần filter theo `revoked_at`.
- API contract admin status đơn giản, một endpoint cho mọi chuyển trạng thái hợp lệ.
