# PRODUCT REQUIREMENTS DOCUMENT

## Ananas Fashion E-commerce

| Thuộc tính | Giá trị |
|---|---|
| Tên sản phẩm | Ananas Fashion E-commerce |
| Loại sản phẩm | Website thương mại điện tử thời trang |
| Trạng thái tài liệu | Baseline theo code thực tế |
| Ngày xác minh | 2026-06-04 |
| Backend | Laravel 12 REST API |
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Authentication | Laravel Sanctum Bearer Token |
| Database hiện tại | SQLite local |
| Phương thức thanh toán đang hoạt động | COD |

> **Nguồn xác minh:** trạng thái chức năng trong PRD này được kết luận từ route, controller, FormRequest, resource, service, repository, model, migration, seeder, frontend API integration và test hiện có.
>
> Các tài liệu `.ai` cũ có thể chưa đồng bộ và không được xem là source of truth duy nhất. Khi có khác biệt, code và test mới hơn được ưu tiên.

### Quy ước trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| **Implemented** | Có code thực tế, route/controller/service/model hoặc frontend integration và có bằng chứng test phù hợp. |
| **Partial** | Đã có một phần chức năng nhưng thiếu một thành phần, UI, endpoint hoặc mức độ hoàn thiện cần thiết. |
| **Planned / Not Implemented** | Chưa có logic nghiệp vụ thực tế hoặc route hiện chỉ trả controlled `501`. |
| **Need Verification** | Chưa đủ bằng chứng để kết luận hoặc cần kiểm tra runtime/deployment thực tế. |

---

# 1. GIỚI THIỆU

## 1.1. Bối cảnh và mục đích

Ananas Fashion E-commerce là hệ thống thương mại điện tử thời trang lấy cảm hứng từ phong cách bán lẻ của Ananas. Hệ thống cung cấp luồng mua sắm cho khách vãng lai, khách hàng đã đăng nhập và các chức năng vận hành dành cho quản trị viên.

Sản phẩm hiện phục vụ mục tiêu demo, báo cáo, đồ án và portfolio. Hệ thống sử dụng Laravel API làm backend, React làm frontend và SQLite local làm database hiện tại. Dữ liệu catalog được tạo bằng migration/seeder; ảnh sản phẩm demo được lấy từ local assets.

## 1.2. Vấn đề cần giải quyết

- Cung cấp trải nghiệm xem, tìm kiếm, lọc và mua sản phẩm trực tuyến.
- Hỗ trợ khách vãng lai mua hàng mà không bắt buộc đăng ký.
- Hỗ trợ khách hàng quản lý giỏ hàng, đơn hàng, wishlist và review.
- Bảo đảm giá, tồn kho, voucher và trạng thái đơn hàng nhất quán.
- Cung cấp công cụ quản trị catalog, voucher, đơn hàng, người dùng và dashboard.
- Tách frontend khỏi backend thông qua REST API để dễ phát triển và kiểm thử.

## 1.3. Mục tiêu sản phẩm

### Mục tiêu nghiệp vụ

- Hoàn thiện luồng e-commerce cốt lõi từ xem sản phẩm đến tạo và quản lý đơn hàng COD.
- Cho phép admin vận hành catalog, voucher, đơn hàng và người dùng.
- Theo dõi số liệu vận hành cơ bản qua dashboard stats và analytics.

### Mục tiêu người dùng

- Guest có thể xem sản phẩm, sử dụng giỏ hàng, checkout và tra cứu đơn hàng.
- Customer có thể quản lý giỏ hàng, đơn hàng, wishlist và review.
- Admin có thể quản lý dữ liệu và trạng thái vận hành của hệ thống.

### Mục tiêu kỹ thuật

- Bảo vệ API bằng Laravel Sanctum và phân quyền admin.
- Bảo đảm checkout/cancel order có transaction và khóa dữ liệu phù hợp.
- Giữ tính nhất quán giá giữa product, cart, voucher và checkout.
- Có automated tests cho các luồng nghiệp vụ chính.

## 1.4. Trạng thái hiện tại

- Frontend React đã có các page client và admin chính, đồng thời gọi Laravel API thực tế.
- Backend đã hoàn thiện phần lớn core e-commerce flow.
- Database hiện tại là SQLite local.
- Catalog demo được seed từ `AnanasCatalogSeeder`.
- Ảnh sản phẩm demo chủ yếu sử dụng local assets.
- COD là phương thức thanh toán duy nhất đang hoạt động.
- Một số route được giữ để định hình API nhưng hiện trả controlled `501`.
- API response contract đang ở trạng thái hybrid, chưa đồng nhất hoàn toàn giữa các endpoint.

## 1.5. Phạm vi tổng quan

### In Scope hiện tại

- Product catalog, search, filter và sort.
- Public Category và Brand API.
- Authentication bằng Sanctum.
- Guest cart, user cart và merge cart.
- Voucher check và voucher trong checkout.
- Guest/user checkout COD.
- Customer order management và public order lookup.
- Wishlist và review.
- Admin management cho category, brand, product, variant, image, voucher, order và user.
- Admin dashboard stats và analytics.
- SQLite local, migration, seeder và local catalog assets.

### Không thuộc phạm vi hoàn thành hiện tại

- Forgot/reset password.
- Address management.
- Comment module.
- VNPay, MoMo và online payment callback.
- Production database và production media infrastructure.

---

# 2. CHÂN DUNG NGƯỜI DÙNG

## 2.1. Guest

Khách truy cập chưa đăng nhập.

### Nhu cầu chính

- Xem, tìm kiếm, lọc và sắp xếp sản phẩm.
- Xem chi tiết sản phẩm, variant, review và rating.
- Thêm sản phẩm vào guest cart.
- Checkout COD không cần tài khoản.
- Tra cứu đơn hàng bằng mã đơn và email hoặc số điện thoại.

### Giới hạn

- Không được truy cập wishlist, tạo review hoặc xem danh sách đơn hàng customer.
- Không được truy cập admin API.

## 2.2. Customer

Người dùng đã đăng ký và đăng nhập bằng Sanctum token.

### Nhu cầu chính

- Sử dụng đầy đủ luồng mua hàng.
- Merge guest cart sau khi đăng nhập.
- Xem và hủy đơn hàng của chính mình theo business rule.
- Quản lý wishlist.
- Review sản phẩm đã mua trong đơn hàng delivered.

### Giới hạn

- Chỉ được xem và thao tác trên dữ liệu thuộc sở hữu của mình.
- Không được truy cập admin API.

## 2.3. Admin

Người dùng có `role=admin`.

### Nhu cầu chính

- Quản lý catalog và trạng thái sản phẩm.
- Quản lý variant, tồn kho và ảnh sản phẩm.
- Quản lý voucher.
- Quản lý đơn hàng và trạng thái đơn.
- Quản lý người dùng, ban/unban và soft delete theo rule.
- Theo dõi dashboard stats và analytics.

### Giới hạn

- Không được tự ban, tự xóa hoặc tự hạ role khỏi admin.
- Không được xóa user đã có order.
- Không được thực hiện chuyển trạng thái order ngoài flow cho phép.

---

# 3. YÊU CẦU CHỨC NĂNG

## 3.1. Tổng hợp chức năng Client / Customer

| Mã | Module | Chức năng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| FR-C01 | Product | Product listing và detail | Implemented | Chỉ hiển thị product active, chưa soft deleted. |
| FR-C02 | Product | Search, filter và sort | Implemented | Hỗ trợ category, brand, size, color, price và sort. |
| FR-C03 | Category/Brand | Public list và detail API | Implemented | Backend có controller và Feature Tests. |
| FR-C04 | Authentication | Register và login | Implemented | Sanctum Bearer Token. |
| FR-C05 | Authentication | Logout và current user | Implemented | Có logout current token và `/auth/me`. |
| FR-C06 | Authentication | Logout all | Partial | Backend/frontend API có, chưa thấy UI gọi trực tiếp. |
| FR-C07 | Authentication | Update profile và change password | Partial | Backend/API method có, chưa có frontend page riêng. |
| FR-C08 | Cart | Guest cart và user cart | Implemented | Guest dùng `X-Guest-Token`. |
| FR-C09 | Cart | Merge guest cart | Implemented | Thực hiện sau login/register nếu có guest token. |
| FR-C10 | Voucher | Voucher check | Implemented | Không mutate usage khi check. |
| FR-C11 | Voucher | Standalone voucher apply | Planned / Not Implemented | Route tồn tại nhưng trả controlled `501`. |
| FR-C12 | Checkout | Guest checkout COD | Implemented | Có transaction, stock validation và snapshot. |
| FR-C13 | Checkout | User checkout COD | Implemented | Có transaction, stock validation và snapshot. |
| FR-C14 | Order | User order list/detail/cancel | Implemented | Có ownership và cancel rule. |
| FR-C15 | Order | Public order lookup | Implemented | Có throttle, contact matching và mask address. |
| FR-C16 | Wishlist | List, toggle, remove | Implemented | Chỉ user đăng nhập. |
| FR-C17 | Review | Public list, create, delete | Implemented | Review dựa trên delivered order item. |
| FR-C18 | Comment | Product comments | Planned / Not Implemented | Các route comment trả controlled `501`. |
| FR-C19 | Authentication | Forgot/reset password | Planned / Not Implemented | Các route trả controlled `501`. |
| FR-C20 | Address | Address management | Planned / Not Implemented | Resource routes tồn tại nhưng controller trả `501`. |
| FR-C21 | Payment | COD payment foundation | Implemented | COD pending, paid khi delivered, cancelled khi hủy. |
| FR-C22 | Payment | Online checkout/callback | Planned / Not Implemented | Chưa tích hợp VNPay/MoMo. |

## 3.2. Chi tiết yêu cầu Client / Customer

### 3.2.1. Product Catalog

Hệ thống phải:

- Cho phép public xem danh sách và chi tiết sản phẩm.
- Chỉ trả product `is_active=true` và chưa soft deleted.
- Hỗ trợ tìm kiếm bằng từ khóa.
- Hỗ trợ filter theo category, brand, size, color, min price và max price.
- Hỗ trợ sort theo giá tăng, giá giảm, mới nhất và featured.
- Hiển thị giá dựa trên `sale_price` nếu có, ngược lại dùng `base_price`.
- Tính variant final price bằng display price cộng `price_adjustment`.
- Trả rating average và review count từ approved reviews.

### 3.2.2. Authentication

Hệ thống phải:

- Cho phép đăng ký bằng name, email, password, password confirmation và phone tùy chọn.
- Cho phép login và phát hành Sanctum token.
- Từ chối login khi user bị ban.
- Cho phép logout current token và logout all tokens.
- Cho phép backend lấy current user, cập nhật `name`, `phone`, `avatar` và đổi mật khẩu.

Trạng thái frontend:

- Login, register, logout và bootstrap current user đã được tích hợp.
- Update profile, change password và logout-all chưa có UI/page chuyên biệt.

### 3.2.3. Cart

Hệ thống phải:

- Hỗ trợ guest cart bằng `X-Guest-Token`.
- Hỗ trợ user cart bằng Bearer token.
- Cộng quantity khi cùng variant được thêm nhiều lần.
- Không cho quantity vượt stock.
- Không cho thêm variant thuộc product inactive hoặc hết hàng.
- Cho phép update, remove và clear cart.
- Cho phép merge guest cart vào user cart sau khi đăng nhập.
- Tính giá cart theo giá realtime, không lưu giá cứng trong cart.

### 3.2.4. Voucher

Hệ thống phải:

- Cho phép guest hoặc user kiểm tra voucher theo cart hiện tại.
- Kiểm tra trạng thái active, thời gian áp dụng, minimum order, usage limit và usage per user.
- Áp dụng `max_discount` cho percent voucher nếu có.
- Không mutate voucher usage trong bước check.
- Chỉ tạo voucher usage và tăng `used_count` sau checkout thành công.

Endpoint standalone `/api/vouchers/apply` chưa được triển khai và hiện trả controlled `501`.

### 3.2.5. Checkout

Hệ thống phải:

- Hỗ trợ guest checkout và authenticated checkout.
- Chỉ chấp nhận `payment_method=cod`.
- Từ chối checkout khi cart rỗng.
- Khóa cart, cart items, variants và voucher liên quan trong transaction.
- Kiểm tra lại stock sau khi lock.
- Tính subtotal từ giá realtime.
- Tính shipping fee theo business rule.
- Tạo order và snapshot order items.
- Trừ stock, ghi voucher usage và clear cart trong cùng transaction.

### 3.2.6. Order Management cho Customer

Hệ thống phải:

- Chỉ cho customer xem order của chính mình.
- Cho customer hủy order ở trạng thái `pending` hoặc `confirmed`.
- Khi hủy phải restore stock và rollback voucher usage nếu có.
- Chặn hủy lặp để tránh double restore.

### 3.2.7. Order Lookup

Hệ thống phải:

- Cho phép public tra cứu bằng `order_code + email` hoặc `order_code + phone`.
- Khi gửi cả email và phone, cả hai phải cùng khớp.
- Không cho tra cứu chỉ bằng order code.
- Trả lỗi chung khi lookup thất bại.
- Không leak email, phone hoặc address khi thất bại.
- Mask shipping address khi thành công.
- Trả status timeline tĩnh dựa trên trạng thái hiện tại.
- Áp dụng rate limit `throttle:10,1`.

### 3.2.8. Wishlist

Hệ thống phải:

- Chỉ cho user đăng nhập sử dụng wishlist.
- Cho phép list, toggle và remove.
- Chỉ cho wishlist product active, chưa soft deleted.
- Bảo đảm unique theo `(user_id, product_id)`.
- Cho phép delete idempotent.

### 3.2.9. Review

Hệ thống phải:

- Chỉ cho user đăng nhập tạo hoặc xóa review.
- Chỉ cho review order item thuộc chính user.
- Chỉ cho review khi order đã delivered.
- Chỉ cho mỗi order item được review một lần.
- Cho phép rating từ 1 đến 5 và comment tùy chọn.
- Cho phép tối đa 3 review images.
- Chỉ hiển thị approved reviews ở public API.
- Cho phép user xóa review của chính mình.

## 3.3. Tổng hợp chức năng Admin

| Mã | Module | Chức năng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| FR-A01 | Security | Admin authentication và permission | Implemented | Backend middleware và frontend AdminRoute. |
| FR-A02 | Category | Category CRUD | Implemented | Có frontend admin integration. |
| FR-A03 | Brand | Brand CRUD | Implemented | Có frontend admin integration. |
| FR-A04 | Product | Product CRUD, soft delete, restore, status | Implemented | Có frontend admin integration. |
| FR-A05 | Variant | Product variant CRUD | Implemented | Có unique variant rule. |
| FR-A06 | Image | Product image upload/delete/set primary | Implemented | Có Cloudinary wrapper hoặc fallback local. |
| FR-A07 | Order | List, detail, update status và cancel | Implemented | Admin cancel qua status `cancelled`. |
| FR-A08 | User | List, detail, create, update và soft delete | Implemented | Có self-action protection. |
| FR-A09 | User | Ban/unban user | Implemented | Ban sẽ revoke Sanctum tokens. |
| FR-A10 | Voucher | Voucher CRUD | Implemented | Delete action hiện soft-disable bằng `is_active=0`. |
| FR-A11 | Dashboard | Stats | Implemented | Metrics, recent orders và top products. |
| FR-A12 | Dashboard | Analytics | Implemented | Có dữ liệu chart 12 tháng thực tế. |
| FR-A13 | Dashboard | Revenue endpoint riêng | Planned / Not Implemented | `/admin/dashboard/revenue` trả `501`. |

## 3.4. Chi tiết yêu cầu Admin

### 3.4.1. Admin Permission

- Tất cả admin routes phải dùng `auth:sanctum + role:admin`.
- Guest phải nhận lỗi authentication.
- Customer không có role admin phải bị từ chối truy cập.

### 3.4.2. Catalog Management

Admin có thể:

- CRUD category và brand.
- CRUD product.
- Soft delete, restore và cập nhật trạng thái active của product.
- CRUD product variants.
- Upload, xóa và đặt ảnh primary cho product.

### 3.4.3. Order Management

Admin có thể:

- Xem danh sách và chi tiết order.
- Chuyển trạng thái order theo flow hợp lệ.
- Hủy order chưa delivered thông qua status `cancelled`.
- Không được hủy order delivered.

### 3.4.4. User Management

Admin có thể:

- List, xem chi tiết, tạo và cập nhật user.
- Ban hoặc unban user.
- Soft delete user chưa có order.

Hệ thống phải:

- Không cho admin tự ban.
- Không cho admin tự xóa.
- Không cho admin tự hạ role từ admin xuống customer.
- Không cho xóa user đã có order.
- Revoke toàn bộ Sanctum tokens khi ban user.
- Không trả password, token hoặc remember token trong API resource.

### 3.4.5. Dashboard

Dashboard stats và analytics phải:

- Chỉ cho admin truy cập.
- Tính revenue từ order `delivered` và `payment_status=paid`.
- Trả order counts, inventory counts, review metrics, recent orders và top-selling products.
- Trả analytics metrics và chart 12 tháng bằng dữ liệu thật.
- Không fake chart data.

Endpoint `/api/admin/dashboard/revenue` riêng chưa được triển khai.

---

# 4. BUSINESS RULES

## 4.1. Authentication và Authorization

- Authentication sử dụng Laravel Sanctum token-based auth.
- Email user phải unique.
- User bị ban không thể login.
- Admin routes yêu cầu `auth:sanctum + role:admin`.
- User chỉ được thao tác trên dữ liệu thuộc sở hữu của mình.

## 4.2. Product và Pricing

- Public chỉ hiển thị product active và chưa soft deleted.
- `product_display_price = sale_price` nếu có, ngược lại dùng `base_price`.
- `variant_final_price = product_display_price + price_adjustment`.
- Giá phải nhất quán giữa Product API, Cart, Voucher Check và Checkout.
- Variant không được trùng `(product_id, size, color)`.

## 4.3. Cart

- Guest cart được xác định bằng `X-Guest-Token`.
- User cart được xác định bằng Bearer token.
- Cùng variant trong cùng cart sẽ cộng quantity.
- Quantity không được vượt stock.
- Update quantity bằng `0` sẽ remove item.
- Cart luôn tính giá realtime.

## 4.4. Voucher

- Voucher type gồm `percent` hoặc `fixed`.
- Voucher phải được kiểm tra active, thời gian, minimum order, usage limit và usage per user.
- Percent voucher phải tôn trọng `max_discount`.
- `voucher_usages` là source of truth cho usage.
- `vouchers.used_count` là counter cache.
- Voucher check không được mutate usage.
- Khi cancel order, voucher usage được đánh dấu bằng `revoked_at`, không hard delete.

## 4.5. Checkout và Shipping

- Chỉ hỗ trợ COD trong trạng thái hiện tại.
- Cart phải không rỗng.
- Stock phải được kiểm tra lại sau khi lock.
- Shipping fee:
  - `subtotal < 500000` thì phí vận chuyển là `30000`.
  - `subtotal >= 500000` thì miễn phí vận chuyển.
- `total = subtotal - discount_amount + shipping_fee`.
- Checkout phải chạy trong database transaction.

## 4.6. Order và Payment Status

### Order status flow

- `pending -> confirmed -> processing -> shipping -> delivered`
- `shipping -> returned`
- Customer cancel từ `pending` hoặc `confirmed`.
- Admin cancel từ `pending`, `confirmed`, `processing` hoặc `shipping`.
- Không cho cancel order delivered.

### COD payment status

- Checkout COD tạo `payment_status=pending`.
- Admin chuyển COD order sang delivered thì `payment_status=paid`.
- Customer hoặc admin hủy order thì `payment_status=cancelled`.
- `failed` được giữ cho online payment thất bại trong roadmap sau.

## 4.7. Review

- User chỉ được review sản phẩm đã mua trong delivered order.
- Mỗi order item chỉ được review một lần.
- Public review list chỉ hiển thị review approved.
- Rating average được tính realtime, không lưu trực tiếp vào product.

## 4.8. Admin User Management

- Admin không thể tự ban, tự xóa hoặc tự hạ role.
- User đã có order không được xóa; admin có thể ban thay thế.
- Ban user phải revoke toàn bộ Sanctum tokens.
- User delete sử dụng soft delete.

---

# 5. YÊU CẦU PHI CHỨC NĂNG

## 5.1. Security

- Sử dụng Sanctum Bearer Token.
- Admin API phải được bảo vệ bằng middleware role.
- Enforce ownership đối với order, wishlist và review.
- Không trả password/hash/token ra API.
- Public order lookup không được leak PII khi thất bại.
- Order lookup có rate limiting.

## 5.2. Data Consistency

- Checkout và cancel order phải sử dụng transaction.
- Checkout phải lock cart, cart items, variants và voucher cần thiết.
- Cancel order phải tránh double restore stock/voucher.
- Voucher usage chỉ mutate khi order thành công.
- Các unique constraint phải chống duplicate ở database layer.

## 5.3. Performance

- Product API phải eager-load các quan hệ cần thiết.
- Product rating/count được tính bằng aggregate query.
- Dashboard recent orders và top-selling products phải có giới hạn.
- API list chính sử dụng pagination.

## 5.4. Maintainability

- Backend sử dụng Controller, FormRequest, Resource, Service, Model và Feature Test.
- Repository pattern được áp dụng có chọn lọc cho các module phù hợp.
- Business rule phức tạp được đặt trong service thay vì controller.
- Voucher calculation được dùng chung giữa voucher check và checkout.

## 5.5. Usability

- UI sử dụng tiếng Việt cho người dùng và admin.
- Frontend cung cấp loading, error và empty states.
- Layout client và admin hỗ trợ responsive.
- Các hành động quan trọng như delete, ban và cancel cần xác nhận phù hợp.

## 5.6. Error Handling

- Các route chưa triển khai phải trả controlled `501`, không gây lỗi `500`.
- API response contract mới sử dụng success/error envelope.
- Public legacy API hiện vẫn có thể dùng response format cũ.

## 5.7. Testability

- Backend có Laravel Feature Tests cho phần lớn module cốt lõi.
- Frontend có Vitest và React Testing Library cho các component/guard cơ bản.
- CI workflow chạy backend tests, frontend tests và frontend build.

---

# 6. CẤU TRÚC VÀ YÊU CẦU DỮ LIỆU

## 6.1. Database hiện tại

- Database hiện tại là **SQLite local**.
- PHPUnit và CI backend cũng cấu hình SQLite.
- MySQL/PostgreSQL không phải database chính hiện tại.
- Việc chuyển sang database production thuộc roadmap.

## 6.2. Các nhóm bảng chính

| Nhóm | Bảng |
|---|---|
| User/Auth | `users`, `personal_access_tokens` |
| Catalog | `categories`, `brands`, `products`, `product_variants`, `product_images` |
| Cart | `carts`, `cart_items` |
| Voucher | `vouchers`, `voucher_usages` |
| Order | `orders`, `order_items` |
| Engagement | `wishlists`, `reviews`, `review_images` |
| Framework support | `password_reset_tokens`, `sessions`, `cache`, `jobs` |

## 6.3. Data Integrity

- `users.email` unique.
- `products.slug` unique và product dùng soft delete.
- Variant unique theo `(product_id, size, color)`.
- Cart item unique theo `(cart_id, product_variant_id)`.
- Wishlist unique theo `(user_id, product_id)`.
- Review unique theo `order_item_id`.
- Order code unique.
- Order items lưu snapshot dữ liệu sản phẩm, variant, giá và số lượng.
- User và product sử dụng soft delete.

## 6.4. Seed Data và Images

- `DatabaseSeeder` tạo tài khoản demo customer và admin.
- `AnanasCatalogSeeder` tạo category, brand, product, variants và product images từ local assets.
- Catalog seeder không được chạy trong production.
- Product image demo sử dụng đường dẫn dạng `/ananas-assets/products/...`.
- Cloudinary service tồn tại cho upload và có fallback local storage.
- Cloudinary production credentials và production media lifecycle cần được xác minh riêng.

---

# 7. API OVERVIEW

## 7.1. Base URL

```text
/api
```

## 7.2. Nhóm API chính

| Nhóm | Quyền truy cập | Trạng thái |
|---|---|---|
| Auth register/login | Public | Implemented |
| Product, category, brand, public reviews | Public | Implemented |
| Cart | Public hoặc authenticated | Implemented |
| Guest checkout | Public | Implemented |
| Order lookup | Public, có throttle | Implemented |
| User orders, wishlist, review write | `auth:sanctum` | Implemented |
| Admin management | `auth:sanctum + role:admin` | Implemented |
| Dashboard stats/analytics | `auth:sanctum + role:admin` | Implemented |

## 7.3. Controlled 501 Routes

Các route sau tồn tại nhưng hiện trả controlled `501`:

- Forgot password.
- Reset password.
- Product comments.
- Address management.
- Online payment checkout.
- Payment callback.
- Standalone voucher apply.
- Admin dashboard revenue endpoint.

Các route này phải được ghi là **Planned / Not Implemented**, không được xem là chức năng hoàn thành.

## 7.4. Response Contract

Hệ thống hiện sử dụng response contract hybrid:

- Admin endpoint mới và route stub ưu tiên standard envelope.
- Một số public/legacy endpoint chưa được migrate hoàn toàn.
- Việc chuẩn hóa toàn bộ public response contract thuộc roadmap.

---

# 8. CÔNG NGHỆ VÀ KIẾN TRÚC

## 8.1. Backend

- PHP `^8.2`.
- Laravel 12.
- Laravel Sanctum.
- Eloquent ORM.
- SQLite local database.
- Cloudinary Laravel package và local fallback.
- PHPUnit/Laravel Feature Tests.

## 8.2. Frontend

- React.
- Vite.
- TypeScript.
- Tailwind CSS.
- Axios.
- React Router DOM.
- Recharts cho dashboard analytics.
- Vitest và React Testing Library.

## 8.3. Kiến trúc backend

Luồng kiến trúc phổ biến:

```text
Route
  -> Controller
  -> FormRequest
  -> Service / Repository
  -> Model
  -> Resource / JSON Response
```

Repository pattern được áp dụng có chọn lọc, không phải mọi module đều bắt buộc đi qua repository.

## 8.4. Kiến trúc frontend

Frontend được tổ chức theo:

- `api`: các module gọi Laravel API.
- `app`: router, auth context và toast context.
- `pages`: client/admin pages.
- `components`: UI, order, review, wishlist, admin và layout components.
- `types`: TypeScript types cho API data.
- `lib`: HTTP client, storage, error parser và display helpers.

---

# 9. CONSTRAINTS & ASSUMPTIONS

- Project hiện được xác minh trong môi trường local/demo.
- Database hiện tại là SQLite local.
- `.env.example` hiện vẫn khai báo MySQL và cần được đồng bộ với baseline SQLite trước khi bàn giao hướng dẫn cài đặt.
- Catalog data được tạo từ migration và seeder.
- Product images demo sử dụng local frontend assets.
- COD là phương thức thanh toán duy nhất đang hoạt động.
- VNPay/MoMo chưa được triển khai.
- Một số route được giữ nhưng chỉ trả controlled `501`.
- API response contract chưa đồng nhất hoàn toàn.
- Tài liệu `.ai` cũ có thể không còn đồng bộ với code.
- Code và test mới hơn là nguồn xác minh chính.
- Chưa thể khẳng định production readiness nếu chưa xác minh environment, backup, monitoring, queue/cache/session và media credentials.
- Chưa thể khẳng định toàn bộ test suite hiện tại pass cho đến khi xử lý hoặc xác minh mâu thuẫn test Category/Brand.

---

# 10. TIÊU CHÍ NGHIỆM THU / SUCCESS CRITERIA

## 10.1. Client / Customer

- Guest xem được danh sách và chi tiết sản phẩm active.
- Guest tìm kiếm, lọc và sắp xếp sản phẩm.
- User đăng ký và đăng nhập được.
- Guest và user thêm, cập nhật, xóa sản phẩm trong cart.
- Guest cart được merge vào user cart sau đăng nhập.
- Guest và user checkout COD tạo order thành công khi dữ liệu hợp lệ.
- Checkout không thành công khi cart rỗng hoặc stock không đủ.
- Voucher hợp lệ được áp dụng đúng trong checkout.
- User xem và hủy order theo đúng trạng thái cho phép.
- Public lookup chỉ thành công khi contact khớp.
- User sử dụng wishlist và review theo đúng ownership/business rule.

## 10.2. Admin

- Guest/customer không truy cập được admin API.
- Admin CRUD được category, brand, product, variant, image và voucher.
- Admin quản lý order và cập nhật status theo đúng flow.
- Admin quản lý user và ban/unban theo self-protection rules.
- Dashboard stats và analytics trả dữ liệu thật theo business rule.

## 10.3. Kỹ thuật

- Checkout và cancel order bảo đảm transaction/data consistency.
- Giá product/cart/voucher/checkout nhất quán.
- Các route chưa triển khai trả controlled `501`.
- Backend Feature Tests chính và frontend tests/build phải pass trước khi phát hành demo.
- Không ghi nhận chức năng Planned / Not Implemented là đã hoàn thành.

---

# 11. OUT OF SCOPE

Các chức năng ngoài phạm vi hoàn thành hiện tại:

- Forgot password và reset password.
- Address management.
- Product comment module.
- VNPay.
- MoMo.
- Online payment checkout và payment callback.
- Standalone voucher apply endpoint.
- Dashboard revenue endpoint riêng.
- Production database migration.
- Production object storage/media lifecycle.
- Deployment, monitoring, backup và production operations hoàn chỉnh.

---

# 12. ROADMAP / FUTURE

## 12.1. Ưu tiên gần

1. Xác minh và làm sạch full backend/frontend test suite.
2. Xử lý mâu thuẫn giữa `PublicCategoryBrandTest` với kỳ vọng cũ trong `RouteHardeningTest` và `ApiResponseContractFoundationTest`.
3. Đồng bộ tài liệu `.ai` với code thực tế.
4. Hoàn thiện profile/change-password/logout-all UI.
5. Chuẩn hóa public API response contract.
6. Hoàn thiện E2E/browser testing.

## 12.2. Production Preparation

1. Chọn MySQL hoặc PostgreSQL nếu triển khai production.
2. Xây dựng migration/backup/restore strategy.
3. Chuyển product media lên Cloudinary hoặc object storage phù hợp.
4. Xác minh production environment, queue, cache và session.
5. Thiết lập monitoring, logging và health check.
6. Hoàn thiện deployment automation.

## 12.3. Product Expansion

1. Forgot/reset password.
2. Address management.
3. Comment module nếu vẫn cần ngoài Review.
4. VNPay integration.
5. MoMo integration.
6. Payment callback idempotency và reconciliation.

---

# 13. TRACEABILITY

## 13.1. Bằng chứng chức năng chính

| Module | Route/Code tiêu biểu | Test tiêu biểu | Frontend integration |
|---|---|---|---|
| Product | `routes/api.php`, `app/Repositories/ProductRepository.php` | `tests/Feature/ProductPublicApiTest.php` | `src/api/product.api.ts`, `ProductListPage`, `ProductDetailPage` |
| Category/Brand Public | Public controllers Category/Brand | `tests/Feature/PublicCategoryBrandTest.php` | Chưa có page/API module riêng |
| Auth | Auth controllers, requests và services | `tests/Feature/AuthFlowTest.php` | `src/api/auth.api.ts`, `AuthContext`, Login/Register |
| Cart | `app/Services/Cart/CartService.php` | `tests/Feature/CartTest.php` | `src/api/cart.api.ts`, `CartPage` |
| Voucher | `VoucherService`, `VoucherCalculator` | `tests/Feature/VoucherTest.php` | `src/api/voucher.api.ts`, `VoucherBox` |
| Checkout | `app/Services/Order/OrderService.php` | `tests/Feature/CheckoutTest.php` | `CheckoutPage`, `OrderSuccessPage` |
| Orders | `OrderManagementService`, `OrderLookupService` | `OrderManagementTest`, `OrderLookupTest` | User orders và lookup pages |
| Payment COD | `OrderManagementService` | `tests/Feature/PaymentFoundationTest.php` | Status/payment display |
| Wishlist | `WishlistController`, `WishlistService` | `tests/Feature/WishlistTest.php` | `WishlistPage`, `WishlistButton` |
| Review | `ReviewController`, `ReviewService` | `tests/Feature/ReviewTest.php` | Review components trong Product Detail |
| Admin Catalog | Admin controllers/services | Admin catalog Feature Tests | Admin category/brand/product/manage pages |
| Admin User | `UserManagementService` | `tests/Feature/AdminUserManagementTest.php` | `AdminUsersPage` |
| Dashboard | Dashboard stats/analytics services | Dashboard Feature Tests | `AdminDashboardPage` |

## 13.2. Partial và Planned Traceability

| Chức năng | Trạng thái | Bằng chứng |
|---|---|---|
| Profile/change-password UI | Partial | Backend và frontend API methods tồn tại nhưng không có page/route riêng |
| Logout-all UI | Partial | API method tồn tại nhưng chưa thấy UI gọi |
| Public Category/Brand frontend page | Partial | Backend implemented, frontend chưa có module/page chuyên biệt |
| Standalone voucher apply | Planned / Not Implemented | Controller trả controlled `501` |
| Forgot/reset password | Planned / Not Implemented | Controllers trả controlled `501` |
| Address management | Planned / Not Implemented | Controller methods trả controlled `501` |
| Comments | Planned / Not Implemented | Controller methods trả controlled `501` |
| Online payment/callback | Planned / Not Implemented | Payment controller trả controlled `501` |
| Dashboard revenue endpoint | Planned / Not Implemented | Dashboard controller trả controlled `501` |

## 13.3. Need Verification

| Hạng mục | Nội dung cần xác minh |
|---|---|
| Full test suite | Chạy lại toàn bộ backend/frontend tests và xử lý conflict Category/Brand route-hardening. |
| Public Category/Brand test conflict | Controller và `PublicCategoryBrandTest` xác nhận Implemented, nhưng `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ vẫn có kỳ vọng `501`. |
| Cloudinary production | Xác minh credentials, upload/delete và media lifecycle thật. |
| Production readiness | Xác minh environment, database strategy, queue/cache/session, monitoring và backup. |
| Locale/encoding | Xác minh message và tài liệu tiếng Việt hiển thị đúng trong toàn hệ thống. |
| Environment template | Thống nhất `.env.example` đang khai báo MySQL với baseline SQLite local của project. |
| Documentation accuracy | `.ai/api/routes.md` đã đồng bộ; tiếp tục rà soát `.ai/project/tech-stack.md`, `.ai/project/overview.md`, `.ai/project/architecture.md` và `.ai/api/auth-flow.md`. |
