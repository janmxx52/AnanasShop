# ADR-001: Architecture Decisions

> Date: 2026-05-11
> Status: Accepted

---

## Decision 1: Backend API-only, Frontend tách rời

**Context**: Dự án cần phục vụ cả web (React) và có thể mobile sau này.

**Decision**: Laravel chỉ làm **API backend** (JSON). Frontend React.js chạy trên port riêng.

**Consequences**:
- Không dùng Laravel Blade templates
- Tất cả routes đặt trong `routes/api.php`
- CORS phải được config đúng
- Auth dùng Sanctum token-based (không dùng session/cookie)

---

## Decision 2: Repository Pattern với Interface

**Decision**: Mọi repository đều phải implement interface và bind trong `AppServiceProvider`.

**Consequences**:
- Dễ mock trong tests
- Bind: `app()->bind(ProductRepositoryInterface::class, ProductRepository::class)`

---

## Decision 3: Cloudinary cho toàn bộ media

**Decision**: Không lưu file local, tất cả ảnh upload lên Cloudinary.

**Consequences**:
- Cần `CLOUDINARY_*` env vars
- Khi xóa record → gọi Cloudinary API để xóa ảnh (dùng `public_id`)
- Dùng package `cloudinary-labs/cloudinary-laravel`

---

## Decision 4: Sanctum token-based auth (không stateful)

**Decision**: Dùng `createToken()` → trả Bearer token. Không dùng SPA cookie auth.

**Consequences**:
- Frontend lưu token trong `localStorage` hoặc `httpOnly cookie`
- Middleware: `auth:sanctum`
- Logout = revoke token (`$request->user()->currentAccessToken()->delete()`)

---

## Decision 5: Soft Delete cho Products và Users

**Decision**: Products và Users dùng SoftDelete (không xóa cứng).

**Consequences**:
- Thêm `deleted_at` column
- Dùng `SoftDeletes` trait
- Order items vẫn có thể tham chiếu product đã xóa

---

## Decision 6: Snapshot giá và thông tin khi đặt hàng

**Decision**: Khi tạo order, snapshot `unit_price`, `product_name`, `variant_info` vào `order_items`.

**Consequences**:
- Giá thay đổi sau này không ảnh hưởng order cũ
- `order_items.product_variant_id` vẫn giữ để có thể xem lịch sử

---

## Decision 7: Shipping fee flat rate

**Decision**: Phí ship = 30.000đ nếu đơn < 500.000đ, miễn phí nếu >= 500.000đ.

**Consequences**:
- Logic trong `OrderService::calculateShippingFee()`
- Có thể thay đổi thành configurable trong tương lai
