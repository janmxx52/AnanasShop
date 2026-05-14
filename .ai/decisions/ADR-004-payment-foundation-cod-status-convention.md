# ADR-004: Payment Foundation COD Status Convention

> Date: 2026-05-14  
> Status: Accepted

---

## Context

Trước khi triển khai payment gateway (VNPay/MoMo), hệ thống cần chốt rõ convention cho `payment_status` để tránh lệch logic giữa checkout, order status update, và cancel order.

---

## Decision 1: Payment status convention

- `pending`: COD chưa thu tiền hoặc online payment chưa callback.
- `paid`: đã thanh toán thành công.
- `failed`: chỉ dùng cho online payment thất bại (callback fail).
- `cancelled`: order bị hủy trước khi thanh toán hoàn tất.
- `refunded`: đã hoàn tiền.

## Decision 2: COD cancel uses `cancelled`

- Khi order bị cancel, `payment_status = cancelled`.
- Không dùng `failed` cho COD cancel.

## Decision 3: COD flow in current phase

- Checkout COD:
  - `payment_method = cod`
  - `payment_status = pending`
- Admin cập nhật order `delivered`:
  - nếu `payment_method = cod` thì `payment_status = paid`
- Customer/Admin cancel order:
  - `payment_status = cancelled`

## Decision 4: Database compatibility

- Nếu `orders.payment_status` hiện chưa có `cancelled`, phải thêm migration để mở rộng enum/constraint tương ứng.

---

## Consequences

- Order lifecycle và payment lifecycle rõ ràng, không trộn nghĩa giữa cancel và payment fail.
- Chuẩn bị nền tảng ổn định cho phase online payment sau này.
