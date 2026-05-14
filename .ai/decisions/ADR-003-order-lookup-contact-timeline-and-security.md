# ADR-003: Order Lookup Contact Snapshot, Timeline, and Security

> Date: 2026-05-14  
> Status: Accepted

---

## Context

Order Lookup API (`POST /api/orders/lookup`) cần chạy public cho guest/customer chưa đăng nhập, nhưng vẫn phải tránh lộ thông tin nhạy cảm và giữ logic nhất quán cho cả guest orders và user orders.

---

## Decision 1: Contact source for lookup

- Đối chiếu email/phone theo dữ liệu snapshot trên bảng `orders`.
- Không dùng `users.email` hiện tại làm source chính.
- Nếu bảng `orders` chưa có đủ cột snapshot, thêm migration:
  - `customer_name` nullable
  - `customer_email` nullable
  - `customer_phone` nullable
- Trong flow checkout về sau (guest + user), phải lưu các field snapshot này khi tạo order.
- Giữ tương thích dữ liệu cũ: có thể fallback từ `guest_email` / `shipping_phone`, nhưng ưu tiên `customer_email` / `customer_phone`.

## Decision 2: Status timeline (phase hiện tại)

- Không tạo bảng `order_status_histories` trong phase này.
- Timeline trả về từ lookup là static timeline suy ra từ `orders.status` hiện tại.
- Mỗi timeline item gồm:
  - `status`
  - `state`: `reached` | `current` | `pending`
- Nếu order `cancelled` thì timeline dừng ở `cancelled`.
- Nếu order `returned` thì timeline dừng ở `returned`.

## Decision 3: Data masking and failure response

- Lookup success vẫn trả `shipping_address` ở dạng đã mask.
- Mask rule: chỉ hiển thị 20 ký tự đầu, phần còn lại thay bằng `****`.
- Lookup fail chỉ trả message chung: `"Không tìm thấy đơn hàng"`.
- Không trả email thật/phone thật/address thật khi lookup thất bại.

## Decision 4: Rate limiting

- Gắn middleware `throttle:10,1` cho `POST /api/orders/lookup`.

---

## Consequences

- API lookup giảm rủi ro brute-force + data leakage.
- Dữ liệu snapshot contact trên `orders` giúp lookup ổn định, không phụ thuộc user profile hiện tại.
- Timeline phase 1 đơn giản, không cần thêm bảng history.
