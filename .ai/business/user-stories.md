# USER STORIES — ANANAS FASHION E-COMMERCE

> Ngày cập nhật: 2026-06-04  
> Nguồn chính: `.ai/project/prd.md`, code thực tế và Feature Tests  
> Database hiện tại: SQLite local  
> Payment đang hoạt động: COD

# 1. MỤC ĐÍCH TÀI LIỆU

Tài liệu này mô tả nhu cầu và tiêu chí chấp nhận của Guest, Customer và Admin trong dự án Ananas Fashion E-commerce. User stories được viết theo trạng thái chức năng đã xác minh từ route, controller, service, repository, model, frontend API integration và test thực tế.

Tài liệu `.ai` cũ không được xem là source of truth duy nhất. Khi có khác biệt, code và test mới hơn được ưu tiên.

# 2. PHẠM VI

## Trong phạm vi

- Product catalog, search, filter và sort.
- Authentication bằng Laravel Sanctum.
- Guest cart, user cart và merge cart.
- Voucher check và voucher trong checkout.
- Guest/user checkout COD.
- Customer order management và public order lookup.
- Wishlist và review.
- Admin quản lý catalog, voucher, order, user và dashboard.

## Ngoài phạm vi hoàn thành hiện tại

- Forgot/reset password.
- Address management.
- Comment module.
- Online payment VNPay/MoMo.
- Production database và production media infrastructure.

# 3. QUY ƯỚC TRẠNG THÁI

| Trạng thái | Ý nghĩa |
|---|---|
| **Implemented** | Có code thực tế và bằng chứng phù hợp cho chức năng. |
| **Partial** | Đã có một phần chức năng nhưng thiếu UI, endpoint hoặc mức độ hoàn thiện cần thiết. |
| **Planned / Not Implemented** | Chưa có logic thực tế hoặc route chỉ trả controlled `501`. |
| **Need Verification** | Chưa đủ bằng chứng hoặc cần xác minh runtime/production. |

---

# 4. USER STORIES CHO GUEST

## US-G01: Xem trang chủ

**Vai trò:** Guest  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want xem trang chủ và các sản phẩm nổi bật,  
So that tôi có thể bắt đầu khám phá catalog.

### Mô tả

Trang chủ cung cấp điểm vào cho client site và sử dụng Product API để hiển thị nội dung sản phẩm.

### Acceptance Criteria

#### Happy Path

Given guest truy cập website,  
When trang chủ tải thành công,  
Then guest nhìn thấy nội dung giới thiệu, điều hướng và các sản phẩm được tải từ API.

#### Unhappy Path

Given Product API không phản hồi,  
When trang chủ tải dữ liệu,  
Then giao diện hiển thị trạng thái lỗi phù hợp và không làm hỏng điều hướng chính.

### Business Rules

- Guest không cần đăng nhập để xem trang chủ.
- Chỉ sản phẩm active và chưa soft deleted được hiển thị từ public Product API.

### Ghi chú kỹ thuật

- Frontend: `HomePage`.
- API liên quan: `GET /api/products`.
- Backend test liên quan: `ProductPublicApiTest`.

## US-G02: Xem danh sách sản phẩm

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want xem danh sách sản phẩm có phân trang,  
So that tôi có thể duyệt catalog hiện có.

### Mô tả

Guest có thể xem product listing từ public API và chuyển trang khi có nhiều sản phẩm.

### Acceptance Criteria

#### Happy Path

Given catalog có sản phẩm active,  
When guest mở trang danh sách sản phẩm,  
Then hệ thống trả danh sách có phân trang và thông tin sản phẩm cần thiết.

#### Unhappy Path

Given catalog không có sản phẩm phù hợp,  
When guest mở danh sách,  
Then giao diện hiển thị empty state thay vì lỗi.

### Business Rules

- Không hiển thị product inactive hoặc soft deleted.
- Product list phải sử dụng pagination.

### Ghi chú kỹ thuật

- API: `GET /api/products`.
- Backend: `ProductController`, `ProductRepository`.
- Frontend: `ProductListPage`, `product.api.ts`.
- Test: `ProductPublicApiTest`.

## US-G03: Tìm kiếm sản phẩm

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want tìm kiếm sản phẩm bằng từ khóa,  
So that tôi có thể nhanh chóng tìm sản phẩm quan tâm.

### Mô tả

Guest nhập từ khóa để tìm product theo tên hoặc mô tả.

### Acceptance Criteria

#### Happy Path

Given có sản phẩm khớp từ khóa,  
When guest gửi từ khóa tìm kiếm,  
Then hệ thống chỉ trả các sản phẩm active phù hợp.

#### Unhappy Path

Given không có sản phẩm khớp,  
When guest tìm kiếm,  
Then hệ thống trả danh sách rỗng hợp lệ.

### Business Rules

- Query tìm kiếm dùng tham số `q`.
- Kết quả vẫn phải loại product inactive và soft deleted.

### Ghi chú kỹ thuật

- API: `GET /api/products?q={keyword}`.
- Backend: `ProductIndexRequest`, `ProductRepository`.
- Test: `ProductPublicApiTest::test_search_by_name_returns_matching_product`.

## US-G04: Lọc sản phẩm theo danh mục

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want lọc sản phẩm theo category,  
So that tôi chỉ xem nhóm sản phẩm phù hợp nhu cầu.

### Mô tả

Product list hỗ trợ lọc bằng category ID hoặc slug.

### Acceptance Criteria

#### Happy Path

Given category tồn tại và có sản phẩm active,  
When guest chọn category,  
Then hệ thống trả sản phẩm thuộc category đó.

#### Unhappy Path

Given category không có sản phẩm phù hợp,  
When guest áp dụng bộ lọc,  
Then hệ thống trả danh sách rỗng mà không gây lỗi.

### Business Rules

- Chỉ sản phẩm active và chưa soft deleted được trả về.
- Public Category API list/detail đã có backend implementation.

### Ghi chú kỹ thuật

- API: `GET /api/products?category={id-or-slug}`.
- API category: `GET /api/categories`, `GET /api/categories/{slug}`.
- Test: `ProductPublicApiTest`, `PublicCategoryBrandTest`.
- Cần lưu ý `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ còn mâu thuẫn với Public Category API.

## US-G05: Lọc sản phẩm theo thương hiệu

**Vai trò:** Guest  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want lọc sản phẩm theo brand,  
So that tôi có thể xem sản phẩm của thương hiệu mong muốn.

### Mô tả

Product list hỗ trợ lọc bằng brand ID hoặc slug.

### Acceptance Criteria

#### Happy Path

Given brand tồn tại và có sản phẩm active,  
When guest chọn brand,  
Then hệ thống trả sản phẩm thuộc brand đó.

#### Unhappy Path

Given brand không có sản phẩm phù hợp,  
When guest lọc theo brand,  
Then hệ thống trả danh sách rỗng hợp lệ.

### Business Rules

- Kết quả không chứa product inactive hoặc soft deleted.
- Public Brand API list/detail đã có backend implementation.

### Ghi chú kỹ thuật

- API: `GET /api/products?brand={id-or-slug}`.
- API brand: `GET /api/brands`, `GET /api/brands/{slug}`.
- Test: `ProductPublicApiTest`, `PublicCategoryBrandTest`.
- Cần lưu ý `RouteHardeningTest` cũ còn mâu thuẫn với Public Brand API.

## US-G06: Lọc sản phẩm theo size, màu và khoảng giá

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want lọc sản phẩm theo size, màu và khoảng giá,  
So that kết quả phù hợp hơn với nhu cầu mua sắm.

### Mô tả

Guest có thể kết hợp các filter variant và display price trong Product API.

### Acceptance Criteria

#### Happy Path

Given có sản phẩm đáp ứng bộ lọc,  
When guest áp dụng size, color hoặc min/max price,  
Then hệ thống trả đúng các sản phẩm phù hợp.

#### Unhappy Path

Given khoảng giá hoặc variant không có kết quả,  
When guest áp dụng bộ lọc,  
Then hệ thống trả danh sách rỗng hợp lệ.

### Business Rules

- Price filter sử dụng product display price.
- Variant filter dựa trên dữ liệu variant thực tế.

### Ghi chú kỹ thuật

- API params: `size`, `color`, `min_price`, `max_price`.
- Backend: `ProductRepository`.
- Test: các test filter size/color/min-max price trong `ProductPublicApiTest`.

## US-G07: Sắp xếp sản phẩm

**Vai trò:** Guest  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want sắp xếp danh sách sản phẩm,  
So that tôi có thể xem sản phẩm theo thứ tự mong muốn.

### Mô tả

Product API hỗ trợ sắp xếp theo giá, mới nhất và featured.

### Acceptance Criteria

#### Happy Path

Given danh sách có nhiều sản phẩm,  
When guest chọn một kiểu sort hợp lệ,  
Then hệ thống trả sản phẩm đúng thứ tự.

#### Unhappy Path

Given client gửi kiểu sort không hợp lệ,  
When request được validate,  
Then hệ thống trả validation error.

### Business Rules

- Các sort hợp lệ gồm `price_asc`, `price_desc`, `newest`, `featured`.
- Sort giá sử dụng display price.

### Ghi chú kỹ thuật

- API: `GET /api/products?sort={value}`.
- Backend: `ProductIndexRequest`, `ProductRepository`.
- Test: `ProductPublicApiTest::test_sort_newest_and_price_orders`.

## US-G08: Xem chi tiết sản phẩm

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want xem chi tiết sản phẩm và variant,  
So that tôi có đủ thông tin trước khi thêm vào giỏ hàng.

### Mô tả

Trang chi tiết hiển thị thông tin product, ảnh, giá, variants, rating và review.

### Acceptance Criteria

#### Happy Path

Given product active và tồn tại,  
When guest mở product bằng slug,  
Then hệ thống trả chi tiết product và các quan hệ cần thiết.

#### Unhappy Path

Given product không tồn tại, inactive hoặc soft deleted,  
When guest mở chi tiết,  
Then hệ thống trả lỗi không tìm thấy.

### Business Rules

- Variant final price dùng display price cộng price adjustment.
- API không công khai product inactive hoặc soft deleted.

### Ghi chú kỹ thuật

- API: `GET /api/products/{slug}`.
- Frontend: `ProductDetailPage`.
- Test: `ProductPublicApiTest`.

## US-G09: Xem review sản phẩm

**Vai trò:** Guest  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want xem review và rating của sản phẩm,  
So that tôi có thêm cơ sở trước khi mua hàng.

### Mô tả

Review list là public nhưng chỉ trả các review đã approved.

### Acceptance Criteria

#### Happy Path

Given product có approved reviews,  
When guest xem review sản phẩm,  
Then hệ thống trả review list, rating average và review count phù hợp.

#### Unhappy Path

Given product chưa có approved review,  
When guest xem review,  
Then giao diện hiển thị empty state phù hợp.

### Business Rules

- Public chỉ hiển thị review `is_approved=true`.
- Rating average được tính realtime.

### Ghi chú kỹ thuật

- API: `GET /api/products/{slug}/reviews`.
- Frontend: review components trong `ProductDetailPage`.
- Test: `ReviewTest`.

## US-G10: Quản lý guest cart

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want thêm, cập nhật và xóa sản phẩm trong giỏ hàng,  
So that tôi có thể chuẩn bị đơn hàng mà không cần đăng nhập.

### Mô tả

Guest cart được định danh bằng `X-Guest-Token` lưu ở frontend.

### Acceptance Criteria

#### Happy Path

Given variant active và còn đủ stock,  
When guest thêm hoặc cập nhật sản phẩm,  
Then cart được cập nhật và trả tổng tiền realtime.

#### Unhappy Path

Given product inactive, hết hàng hoặc quantity vượt stock,  
When guest cập nhật cart,  
Then hệ thống từ chối và trả lỗi phù hợp.

### Business Rules

- Cùng variant trong cart sẽ cộng quantity.
- Quantity bằng `0` khi update sẽ remove item.
- Cart không lưu giá cứng.

### Ghi chú kỹ thuật

- APIs: `/api/cart`, `/api/cart/items`.
- Backend: `CartService`.
- Frontend: `cart.api.ts`, `CartPage`.
- Test: `CartTest`.

## US-G11: Checkout không cần đăng nhập

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want checkout COD mà không cần tạo tài khoản,  
So that tôi có thể hoàn tất mua hàng nhanh chóng.

### Mô tả

Guest gửi thông tin liên hệ và địa chỉ giao hàng để tạo order từ guest cart.

### Acceptance Criteria

#### Happy Path

Given guest cart có item hợp lệ và đủ stock,  
When guest gửi thông tin checkout hợp lệ,  
Then hệ thống tạo COD order, trừ stock và clear cart.

#### Unhappy Path

Given cart rỗng, stock không đủ hoặc payment method khác COD,  
When guest checkout,  
Then hệ thống không tạo order và trả validation error.

### Business Rules

- Checkout phải chạy trong transaction.
- Stock phải được kiểm tra lại sau khi lock.
- Shipping fee và voucher phải theo business rules hiện hành.

### Ghi chú kỹ thuật

- API: `POST /api/checkout/guest`.
- Backend: `GuestCheckoutController`, `OrderService`.
- Frontend: `CheckoutPage`.
- Test: `CheckoutTest`.

## US-G12: Tra cứu đơn hàng công khai

**Vai trò:** Guest  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Guest,  
I want tra cứu đơn hàng bằng mã đơn và thông tin liên hệ,  
So that tôi có thể theo dõi đơn mà không cần đăng nhập.

### Mô tả

Order lookup hỗ trợ guest order và user order bằng contact snapshot.

### Acceptance Criteria

#### Happy Path

Given order code và email hoặc phone khớp,  
When guest gửi yêu cầu lookup,  
Then hệ thống trả thông tin đơn, masked address và status timeline.

#### Unhappy Path

Given chỉ có order code hoặc contact không khớp,  
When guest lookup,  
Then hệ thống trả lỗi chung và không leak PII.

### Business Rules

- Nếu gửi cả email và phone thì cả hai phải cùng khớp.
- Endpoint áp dụng `throttle:10,1`.
- Shipping address được mask khi lookup thành công.

### Ghi chú kỹ thuật

- API: `POST /api/orders/lookup`.
- Backend: `OrderLookupService`.
- Frontend: `OrderLookupPage`.
- Test: `OrderLookupTest`.

---

# 5. USER STORIES CHO CUSTOMER

## US-C01: Đăng ký tài khoản

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want đăng ký tài khoản,  
So that tôi có thể sử dụng các chức năng dành cho người dùng.

### Mô tả

Customer tạo tài khoản mới bằng thông tin cá nhân và mật khẩu hợp lệ.

### Acceptance Criteria

#### Happy Path

Given email chưa được sử dụng và dữ liệu hợp lệ,  
When customer đăng ký,  
Then hệ thống tạo user, phát token và đăng nhập customer.

#### Unhappy Path

Given email trùng hoặc password không hợp lệ,  
When customer đăng ký,  
Then hệ thống từ chối và trả validation errors.

### Business Rules

- Email phải unique.
- Password phải đáp ứng rule validation hiện tại.

### Ghi chú kỹ thuật

- API: `POST /api/auth/register`.
- Frontend: `RegisterPage`, `AuthContext`.
- Test: `AuthFlowTest`.

## US-C02: Đăng nhập

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want đăng nhập bằng email và mật khẩu,  
So that tôi có thể truy cập dữ liệu và chức năng cá nhân.

### Mô tả

Hệ thống xác thực customer và lưu Sanctum token ở frontend.

### Acceptance Criteria

#### Happy Path

Given thông tin đăng nhập đúng và user không bị ban,  
When customer đăng nhập,  
Then hệ thống phát token và tải current user.

#### Unhappy Path

Given thông tin sai hoặc user bị ban,  
When customer đăng nhập,  
Then hệ thống từ chối đăng nhập.

### Business Rules

- User bị `is_banned=true` không thể login.
- Frontend redirect về trang trước sau login nếu có.

### Ghi chú kỹ thuật

- API: `POST /api/auth/login`, `GET /api/auth/me`.
- Frontend: `LoginPage`, `AuthContext`.
- Test: `AuthFlowTest`.

## US-C03: Đăng xuất

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want đăng xuất khỏi phiên hiện tại,  
So that token hiện tại không còn được sử dụng.

### Mô tả

Customer có thể revoke current token và frontend xóa local session.

### Acceptance Criteria

#### Happy Path

Given customer đang đăng nhập,  
When customer đăng xuất,  
Then current token bị revoke và frontend xóa session.

#### Unhappy Path

Given API logout thất bại,  
When customer đăng xuất trên frontend,  
Then frontend vẫn xóa local session an toàn.

### Business Rules

- Logout current token đã được tích hợp UI.
- Logout-all có backend và frontend API method nhưng chưa thấy UI trực tiếp.

### Ghi chú kỹ thuật

- APIs: `POST /api/auth/logout`, `POST /api/auth/logout-all`.
- Frontend: `AuthContext`.
- Test: `AuthFlowTest`.

## US-C04: Xem thông tin cá nhân

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Partial

### User Story

As a Customer,  
I want xem thông tin tài khoản hiện tại,  
So that tôi có thể kiểm tra dữ liệu cá nhân đã lưu.

### Mô tả

Backend và AuthContext tải current user, nhưng chưa có profile page chuyên biệt.

### Acceptance Criteria

#### Happy Path

Given customer có token hợp lệ,  
When frontend gọi current user API,  
Then hệ thống trả thông tin user không chứa password hoặc token.

#### Unhappy Path

Given token không hợp lệ,  
When frontend tải current user,  
Then local session bị xóa và user phải đăng nhập lại.

### Business Rules

- API không trả password/hash/token.
- Chỉ user đã đăng nhập được gọi `/auth/me`.

### Ghi chú kỹ thuật

- API: `GET /api/auth/me`.
- Frontend: `AuthContext`.
- Phần thiếu: profile page chuyên biệt.

## US-C05: Cập nhật thông tin cá nhân

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Partial

### User Story

As a Customer,  
I want cập nhật thông tin cá nhân,  
So that dữ liệu tài khoản luôn chính xác.

### Mô tả

Backend và frontend API method đã có, nhưng chưa có UI/page chỉnh sửa profile.

### Acceptance Criteria

#### Happy Path

Given customer đăng nhập và gửi dữ liệu hợp lệ,  
When cập nhật profile,  
Then hệ thống lưu và trả profile mới.

#### Unhappy Path

Given tên, số điện thoại hoặc ảnh đại diện không hợp lệ,  
When cập nhật profile,  
Then hệ thống trả validation errors.

### Business Rules

- Endpoint hiện chỉ hỗ trợ cập nhật `name`, `phone` và `avatar`; không hỗ trợ đổi email.
- Upload avatar sử dụng Cloudinary service hoặc fallback hiện tại.

### Ghi chú kỹ thuật

- API: `PUT /api/auth/me`.
- Frontend API: `authApi.updateProfile`.
- Test: `AuthFlowTest`.
- Phần thiếu: profile edit UI.

## US-C06: Đổi mật khẩu

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Partial

### User Story

As a Customer,  
I want đổi mật khẩu tài khoản,  
So that tôi có thể duy trì an toàn đăng nhập.

### Mô tả

Backend và frontend API method đã có, nhưng chưa có UI/page đổi mật khẩu.

### Acceptance Criteria

#### Happy Path

Given current password đúng và password mới hợp lệ,  
When customer đổi mật khẩu,  
Then hệ thống cập nhật password và revoke các token khác.

#### Unhappy Path

Given current password sai hoặc password mới không hợp lệ,  
When customer gửi yêu cầu,  
Then hệ thống từ chối và trả lỗi.

### Business Rules

- Phải xác minh current password.
- Đổi mật khẩu phải revoke các token khác theo implementation hiện tại.

### Ghi chú kỹ thuật

- API: `PUT /api/auth/me/password`.
- Frontend API: `authApi.changePassword`.
- Test: `AuthFlowTest`.
- Phần thiếu: change-password UI.

## US-C07: Quản lý user cart

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want quản lý giỏ hàng gắn với tài khoản,  
So that tôi có thể tiếp tục mua sắm sau khi đăng nhập.

### Mô tả

Bearer token trên public cart routes giúp hệ thống xác định user cart.

### Acceptance Criteria

#### Happy Path

Given customer đăng nhập và variant hợp lệ,  
When customer thêm, cập nhật hoặc xóa item,  
Then hệ thống thao tác trên user cart.

#### Unhappy Path

Given quantity vượt stock hoặc product inactive,  
When customer cập nhật cart,  
Then hệ thống từ chối và trả lỗi phù hợp.

### Business Rules

- Mỗi user có một cart.
- Cart sử dụng giá realtime.

### Ghi chú kỹ thuật

- APIs: `/api/cart`, `/api/cart/items`.
- Frontend: `CartPage`.
- Test: `CartTest`.

## US-C08: Merge guest cart sau khi đăng nhập

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want merge guest cart vào user cart sau khi đăng nhập,  
So that tôi không mất sản phẩm đã chọn trước đó.

### Mô tả

Frontend tự gọi merge khi có guest token sau login hoặc register.

### Acceptance Criteria

#### Happy Path

Given guest cart có sản phẩm hợp lệ,  
When customer đăng nhập,  
Then sản phẩm được merge vào user cart theo giới hạn stock.

#### Unhappy Path

Given guest cart có product inactive hoặc hết hàng,  
When merge cart,  
Then hệ thống bỏ qua item không hợp lệ và trả warning.

### Business Rules

- Quantity sau merge không được vượt stock.
- Guest cart được xóa sau merge.

### Ghi chú kỹ thuật

- API: `POST /api/cart/merge`.
- Backend: `CartService::mergeGuestCart`.
- Frontend: `AuthContext`.
- Test: `CartTest`.

## US-C09: Checkout khi đã đăng nhập

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want checkout user cart bằng COD,  
So that order được gắn với tài khoản của tôi.

### Mô tả

Customer gửi thông tin giao hàng trực tiếp và checkout từ user cart.

### Acceptance Criteria

#### Happy Path

Given user cart hợp lệ và đủ stock,  
When customer checkout COD,  
Then hệ thống tạo order gắn `user_id`, trừ stock và clear cart.

#### Unhappy Path

Given cart rỗng, stock không đủ hoặc voucher không hợp lệ,  
When customer checkout,  
Then hệ thống rollback và không tạo order.

### Business Rules

- Checkout phải chạy trong transaction.
- Chỉ hỗ trợ COD.
- Order phải snapshot customer, shipping và item data.

### Ghi chú kỹ thuật

- API: `POST /api/orders`.
- Backend: `OrderService`.
- Frontend: `CheckoutPage`.
- Test: `CheckoutTest`, `PaymentFoundationTest`.

## US-C10: Xem danh sách đơn hàng

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want xem danh sách đơn hàng của mình,  
So that tôi có thể theo dõi lịch sử mua hàng.

### Mô tả

Order list chỉ trả các order thuộc customer hiện tại.

### Acceptance Criteria

#### Happy Path

Given customer đã đăng nhập và có order,  
When mở danh sách đơn hàng,  
Then hệ thống trả các order của chính customer.

#### Unhappy Path

Given guest chưa đăng nhập,  
When truy cập user order list,  
Then hệ thống từ chối truy cập.

### Business Rules

- Customer chỉ xem order của chính mình.
- List sử dụng pagination.

### Ghi chú kỹ thuật

- API: `GET /api/orders`.
- Frontend: `UserOrdersPage`.
- Test: `OrderManagementTest`.

## US-C11: Xem chi tiết đơn hàng

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want xem chi tiết một đơn hàng của mình,  
So that tôi biết items, tổng tiền và trạng thái hiện tại.

### Mô tả

Customer mở order detail bằng order code và ownership được enforce ở backend.

### Acceptance Criteria

#### Happy Path

Given order thuộc customer hiện tại,  
When customer mở chi tiết bằng order code,  
Then hệ thống trả order và order items.

#### Unhappy Path

Given order thuộc user khác,  
When customer cố xem chi tiết,  
Then hệ thống không cho truy cập.

### Business Rules

- Enforce ownership theo `user_id`.
- Order item hiển thị dữ liệu snapshot.

### Ghi chú kỹ thuật

- API: `GET /api/orders/{order_code}`.
- Frontend: `UserOrderDetailPage`.
- Test: `OrderManagementTest`.

## US-C12: Hủy đơn hàng

**Vai trò:** Customer  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want hủy đơn hàng khi trạng thái cho phép,  
So that tôi có thể dừng xử lý đơn chưa đi quá xa.

### Mô tả

Customer chỉ được hủy order của mình ở trạng thái pending hoặc confirmed.

### Acceptance Criteria

#### Happy Path

Given order thuộc customer và đang pending hoặc confirmed,  
When customer hủy order,  
Then status/payment status được cập nhật và stock/voucher được restore.

#### Unhappy Path

Given order đang processing, shipping, delivered hoặc đã cancelled,  
When customer hủy,  
Then hệ thống từ chối và không double restore.

### Business Rules

- Cancel chạy trong transaction và lock order.
- Chỉ customer owner được cancel.
- Chặn cancel lặp.

### Ghi chú kỹ thuật

- API: `POST /api/orders/{order_code}/cancel`.
- Backend: `OrderManagementService`.
- Test: `OrderManagementTest`, `PaymentFoundationTest`.

## US-C13: Kiểm tra và áp dụng voucher khi checkout

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want kiểm tra và dùng voucher trong checkout,  
So that tôi nhận được mức giảm giá hợp lệ.

### Mô tả

Customer kiểm tra voucher trước, sau đó gửi `voucher_code` trong checkout để backend validate lại.

### Acceptance Criteria

#### Happy Path

Given voucher hợp lệ với cart hiện tại,  
When customer kiểm tra và checkout với voucher,  
Then discount được tính giống nhau và usage chỉ được ghi sau order success.

#### Unhappy Path

Given voucher hết hạn, inactive, vượt usage hoặc không đạt minimum order,  
When customer áp dụng,  
Then hệ thống từ chối và không mutate usage.

### Business Rules

- Voucher check không mutate usage.
- Checkout validate voucher lại trong transaction.
- Percent voucher tôn trọng `max_discount`.

### Ghi chú kỹ thuật

- APIs: `POST /api/vouchers/check`, `POST /api/orders`.
- Backend: `VoucherCalculator`, `OrderService`.
- Frontend: `VoucherBox`, `CheckoutPage`.
- Test: `VoucherTest`, `CheckoutTest`.

## US-C14: Quản lý wishlist

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want thêm, xem và xóa sản phẩm yêu thích,  
So that tôi có thể lưu sản phẩm muốn mua sau.

### Mô tả

Wishlist chỉ dành cho user đăng nhập và chỉ chứa product hợp lệ.

### Acceptance Criteria

#### Happy Path

Given customer đăng nhập và product active,  
When customer toggle hoặc remove wishlist item,  
Then wishlist được cập nhật đúng.

#### Unhappy Path

Given product inactive hoặc soft deleted,  
When customer cố thêm wishlist,  
Then hệ thống từ chối.

### Business Rules

- Unique theo `(user_id, product_id)`.
- Delete wishlist là idempotent.

### Ghi chú kỹ thuật

- APIs: `/api/wishlist`.
- Frontend: `WishlistPage`, `WishlistButton`.
- Test: `WishlistTest`.

## US-C15: Viết và xóa review

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As a Customer,  
I want review sản phẩm đã mua và xóa review của mình,  
So that tôi có thể chia sẻ trải nghiệm mua hàng.

### Mô tả

Customer tạo review dựa trên delivered order item và có thể đính kèm tối đa 3 ảnh.

### Acceptance Criteria

#### Happy Path

Given order item thuộc customer, order delivered và chưa được review,  
When customer gửi rating hợp lệ,  
Then hệ thống tạo review và cập nhật aggregate rating realtime.

#### Unhappy Path

Given order chưa delivered, order item thuộc user khác hoặc đã được review,  
When customer gửi review,  
Then hệ thống từ chối.

### Business Rules

- Rating là integer từ 1 đến 5.
- Mỗi order item chỉ review một lần.
- Customer chỉ xóa review của chính mình.

### Ghi chú kỹ thuật

- APIs: `POST /api/products/{slug}/reviews`, `DELETE /api/reviews/{id}`.
- Backend: `ReviewService`.
- Frontend: review components trong `ProductDetailPage`.
- Test: `ReviewTest`.

---

# 6. USER STORIES CHO ADMIN

## US-A01: Đăng nhập và truy cập khu vực admin

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want đăng nhập và truy cập khu vực quản trị,  
So that tôi có thể vận hành hệ thống.

### Mô tả

Admin sử dụng auth endpoint chung nhưng phải có `role=admin`.

### Acceptance Criteria

#### Happy Path

Given user có role admin và thông tin đăng nhập đúng,  
When admin đăng nhập và mở admin route,  
Then backend và frontend cho phép truy cập.

#### Unhappy Path

Given guest hoặc customer,  
When truy cập admin route,  
Then hệ thống từ chối hoặc redirect phù hợp.

### Business Rules

- Admin API dùng `auth:sanctum + role:admin`.
- User bị ban không thể login.

### Ghi chú kỹ thuật

- Backend: `EnsureUserRole`.
- Frontend: `AdminRoute`, `AdminLayout`.
- Tests: các Admin Feature Tests.

## US-A02: Quản lý danh mục

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want tạo, xem, cập nhật và xóa category,  
So that catalog được tổ chức đúng nhóm sản phẩm.

### Mô tả

Admin Category API và frontend CRUD đã được tích hợp.

### Acceptance Criteria

#### Happy Path

Given admin đăng nhập và dữ liệu hợp lệ,  
When admin thực hiện CRUD category,  
Then dữ liệu category được cập nhật.

#### Unhappy Path

Given slug trùng hoặc dữ liệu không hợp lệ,  
When admin lưu category,  
Then hệ thống trả validation error.

### Business Rules

- Category slug phải unique.
- Chỉ admin được thao tác.

### Ghi chú kỹ thuật

- API: `/api/admin/categories`.
- Frontend: `AdminCategoriesPage`.
- Test: `AdminCategoryBrandTest`.

## US-A03: Quản lý thương hiệu

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want tạo, xem, cập nhật và xóa brand,  
So that sản phẩm được phân loại theo thương hiệu.

### Mô tả

Admin Brand API và frontend CRUD đã được tích hợp.

### Acceptance Criteria

#### Happy Path

Given admin đăng nhập và dữ liệu hợp lệ,  
When admin thực hiện CRUD brand,  
Then dữ liệu brand được cập nhật.

#### Unhappy Path

Given slug trùng hoặc dữ liệu không hợp lệ,  
When admin lưu brand,  
Then hệ thống trả validation error.

### Business Rules

- Brand slug phải unique.
- Chỉ admin được thao tác.

### Ghi chú kỹ thuật

- API: `/api/admin/brands`.
- Frontend: `AdminBrandsPage`.
- Test: `AdminCategoryBrandTest`.

## US-A04: Quản lý sản phẩm

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want quản lý product và trạng thái bán,  
So that catalog luôn chính xác.

### Mô tả

Admin có thể CRUD, soft delete, restore và toggle active product.

### Acceptance Criteria

#### Happy Path

Given dữ liệu product hợp lệ,  
When admin tạo, cập nhật, xóa mềm, restore hoặc đổi status,  
Then product được cập nhật đúng.

#### Unhappy Path

Given slug trùng hoặc dữ liệu không hợp lệ,  
When admin lưu product,  
Then hệ thống trả validation error.

### Business Rules

- Product dùng soft delete.
- Product slug unique.
- Public không hiển thị product inactive hoặc soft deleted.

### Ghi chú kỹ thuật

- API: `/api/admin/products`.
- Frontend: `AdminProductsPage`.
- Test: `AdminProductTest`.

## US-A05: Quản lý product variant

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want quản lý size, color, SKU, stock và price adjustment,  
So that mỗi biến thể sản phẩm được bán chính xác.

### Mô tả

Variant CRUD được tổ chức theo nested product routes.

### Acceptance Criteria

#### Happy Path

Given variant data hợp lệ,  
When admin tạo hoặc cập nhật variant,  
Then variant được lưu dưới đúng product.

#### Unhappy Path

Given variant trùng size/color hoặc không thuộc product route,  
When admin thao tác,  
Then hệ thống từ chối.

### Business Rules

- Unique `(product_id, size, color)`.
- Stock không được âm.
- SKU phải unique nếu có.

### Ghi chú kỹ thuật

- API: `/api/admin/products/{product}/variants`.
- Frontend: `AdminProductManagePage`.
- Test: `AdminProductVariantTest`.

## US-A06: Quản lý product image

**Vai trò:** Admin  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want upload, đặt ảnh chính và xóa product image,  
So that hình ảnh catalog được quản lý đúng.

### Mô tả

Admin Image API sử dụng Cloudinary service hoặc fallback local storage.

### Acceptance Criteria

#### Happy Path

Given file ảnh hợp lệ,  
When admin upload hoặc đặt primary image,  
Then ảnh được lưu và trạng thái primary được cập nhật.

#### Unhappy Path

Given file không hợp lệ hoặc vượt giới hạn ảnh,  
When admin upload,  
Then hệ thống từ chối.

### Business Rules

- Chỉ có một primary image theo hành vi hiện tại.
- Delete image phải xóa record và gọi service xóa media khi phù hợp.

### Ghi chú kỹ thuật

- API: `/api/admin/products/{product}/images`.
- Frontend: `AdminProductManagePage`.
- Test: `AdminProductImageTest`.

## US-A07: Xem và quản lý đơn hàng

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want xem danh sách và chi tiết mọi đơn hàng,  
So that tôi có thể vận hành quá trình xử lý đơn.

### Mô tả

Admin có thể xem order list và detail mà không bị giới hạn ownership.

### Acceptance Criteria

#### Happy Path

Given admin đăng nhập,  
When admin mở danh sách hoặc chi tiết order,  
Then hệ thống trả dữ liệu order phù hợp.

#### Unhappy Path

Given order code không tồn tại,  
When admin mở chi tiết,  
Then hệ thống trả lỗi không tìm thấy.

### Business Rules

- Chỉ admin được xem toàn bộ orders.
- Order items sử dụng snapshot data.

### Ghi chú kỹ thuật

- APIs: `GET /api/admin/orders`, `GET /api/admin/orders/{order_code}`.
- Frontend: `AdminOrdersPage`, `AdminOrderDetailPage`.
- Test: `OrderManagementTest`.

## US-A08: Cập nhật trạng thái và hủy đơn hàng

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want cập nhật trạng thái hoặc hủy đơn hàng,  
So that trạng thái vận hành phản ánh đúng quá trình xử lý.

### Mô tả

Admin thay đổi trạng thái qua một endpoint status duy nhất.

### Acceptance Criteria

#### Happy Path

Given transition hợp lệ,  
When admin cập nhật order status,  
Then hệ thống lưu trạng thái mới và cập nhật COD payment status khi cần.

#### Unhappy Path

Given transition không hợp lệ hoặc cố hủy delivered order,  
When admin cập nhật status,  
Then hệ thống từ chối.

### Business Rules

- Chỉ cho phép transition theo status flow.
- Admin cancel qua `status=cancelled`.
- Cancel phải restore stock/voucher và chặn double restore.

### Ghi chú kỹ thuật

- API: `PATCH /api/admin/orders/{order_code}/status`.
- Backend: `OrderManagementService`.
- Tests: `OrderManagementTest`, `PaymentFoundationTest`.

## US-A09: Quản lý người dùng

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want xem, tạo, cập nhật và xóa mềm user,  
So that tôi có thể quản lý tài khoản hệ thống.

### Mô tả

Admin User Management hỗ trợ search/filter, create/update và soft delete theo business rules.

### Acceptance Criteria

#### Happy Path

Given target user hợp lệ và chưa có order khi delete,  
When admin thao tác,  
Then user được cập nhật hoặc soft deleted.

#### Unhappy Path

Given admin tự xóa hoặc target user đã có order,  
When admin delete user,  
Then hệ thống từ chối.

### Business Rules

- Email user unique.
- Không hard delete user trong feature hiện tại.
- Không trả password/hash/token.

### Ghi chú kỹ thuật

- API: `/api/admin/users`.
- Backend: `UserManagementService`.
- Frontend: `AdminUsersPage`.
- Test: `AdminUserManagementTest`.

## US-A10: Ban và unban người dùng

**Vai trò:** Admin  
**Mức ưu tiên:** High  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want khóa hoặc mở khóa tài khoản user,  
So that tôi có thể kiểm soát tài khoản vi phạm hoặc khôi phục quyền truy cập.

### Mô tả

Ban/unban là hành động idempotent; ban user sẽ revoke toàn bộ token.

### Acceptance Criteria

#### Happy Path

Given target user khác admin hiện tại,  
When admin ban hoặc unban,  
Then trạng thái user được cập nhật đúng.

#### Unhappy Path

Given admin cố tự ban hoặc tự hạ role,  
When gửi yêu cầu,  
Then hệ thống từ chối.

### Business Rules

- Admin không thể tự ban hoặc tự hạ role.
- Ban user phải revoke toàn bộ Sanctum tokens.
- User bị ban không thể login.

### Ghi chú kỹ thuật

- APIs: `PATCH /api/admin/users/{user}/ban`, `/unban`.
- Frontend: `AdminUsersPage`.
- Tests: `AdminUserManagementTest`, `AuthFlowTest`.

## US-A11: Quản lý voucher

**Vai trò:** Admin  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want tạo, xem, cập nhật và ngừng kích hoạt voucher,  
So that tôi có thể cấu hình chương trình giảm giá.

### Mô tả

Admin Voucher CRUD quản lý code, type, value, giới hạn và thời gian áp dụng; thao tác delete hiện soft-disable voucher.

### Acceptance Criteria

#### Happy Path

Given voucher data hợp lệ,  
When admin thực hiện CRUD,  
Then voucher được cập nhật và có thể được kiểm tra ở checkout.

#### Unhappy Path

Given code trùng hoặc dữ liệu không hợp lệ,  
When admin lưu voucher,  
Then hệ thống trả validation error.

### Business Rules

- Voucher code unique.
- Type chỉ gồm `percent` và `fixed`.
- Voucher check không mutate usage.
- `DELETE /api/admin/vouchers/{voucher}` cập nhật `is_active=0`, không hard delete.

### Ghi chú kỹ thuật

- API: `/api/admin/vouchers`.
- Frontend: `AdminVouchersPage`.
- Test: `VoucherTest`.

## US-A12: Xem dashboard stats và analytics

**Vai trò:** Admin  
**Mức ưu tiên:** Medium  
**Trạng thái:** Implemented

### User Story

As an Admin,  
I want xem KPI, chart, đơn gần đây và sản phẩm bán chạy,  
So that tôi có thể theo dõi hoạt động hệ thống.

### Mô tả

Dashboard sử dụng stats và analytics API thật, không fake chart data.

### Acceptance Criteria

#### Happy Path

Given admin đăng nhập và hệ thống có dữ liệu,  
When admin mở dashboard,  
Then hệ thống hiển thị metrics, chart, recent orders và top products.

#### Unhappy Path

Given analytics API lỗi nhưng stats API hoạt động,  
When dashboard tải,  
Then KPI cơ bản vẫn hiển thị và khu vực analytics báo lỗi phù hợp.

### Business Rules

- Revenue chỉ tính order delivered và paid.
- Chart 12 tháng luôn có đủ 12 điểm.
- Dashboard chỉ dành cho admin.

### Ghi chú kỹ thuật

- APIs: `GET /api/admin/dashboard/stats`, `/analytics`.
- Frontend: `AdminDashboardPage`, Recharts.
- Tests: `DashboardStatsTest`, `DashboardAnalyticsTest`.
- `/api/admin/dashboard/revenue` riêng vẫn là Planned / Not Implemented.

---

# 7. USER STORIES PLANNED / FUTURE

## US-F01: Yêu cầu liên kết quên mật khẩu

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Planned / Not Implemented

### User Story

As a Customer,  
I want yêu cầu liên kết khôi phục mật khẩu,  
So that tôi có thể lấy lại quyền truy cập tài khoản.

### Mô tả

Route đã tồn tại nhưng controller hiện trả controlled `501`.

### Acceptance Criteria

#### Happy Path

Given feature được triển khai trong tương lai và email hợp lệ,  
When customer yêu cầu khôi phục,  
Then hệ thống gửi hoặc tạo quy trình reset an toàn.

#### Unhappy Path

Given trạng thái hiện tại,  
When gọi endpoint,  
Then hệ thống trả controlled `501`, không gây lỗi `500`.

### Business Rules

- Không được tiết lộ email có tồn tại hay không nếu triển khai.
- Token reset phải có thời hạn.

### Ghi chú kỹ thuật

- API: `POST /api/auth/forgot-password`.
- Hiện trạng: `ForgotPasswordController` trả `notImplemented`.

## US-F02: Reset mật khẩu

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Planned / Not Implemented

### User Story

As a Customer,  
I want đặt lại mật khẩu bằng token hợp lệ,  
So that tôi có thể đăng nhập lại.

### Mô tả

Route đã tồn tại nhưng controller hiện trả controlled `501`.

### Acceptance Criteria

#### Happy Path

Given feature được triển khai và reset token hợp lệ,  
When customer gửi password mới,  
Then hệ thống cập nhật password và vô hiệu hóa token reset.

#### Unhappy Path

Given trạng thái hiện tại,  
When gọi endpoint,  
Then hệ thống trả controlled `501`.

### Business Rules

- Password mới phải đáp ứng validation.
- Reset token chỉ được dùng một lần.

### Ghi chú kỹ thuật

- API: `POST /api/auth/reset-password`.
- Hiện trạng: `ResetPasswordController` trả `notImplemented`.

## US-F03: Quản lý địa chỉ giao hàng

**Vai trò:** Customer  
**Mức ưu tiên:** Low  
**Trạng thái:** Planned / Not Implemented

### User Story

As a Customer,  
I want lưu và quản lý nhiều địa chỉ giao hàng,  
So that checkout thuận tiện hơn.

### Mô tả

Address resource routes tồn tại nhưng controller methods hiện trả controlled `501`.

### Acceptance Criteria

#### Happy Path

Given feature được triển khai,  
When customer CRUD hoặc đặt địa chỉ mặc định,  
Then dữ liệu chỉ thuộc customer hiện tại.

#### Unhappy Path

Given trạng thái hiện tại,  
When gọi address endpoint,  
Then hệ thống trả controlled `501`.

### Business Rules

- Enforce ownership.
- Chỉ một địa chỉ được đặt mặc định nếu triển khai.

### Ghi chú kỹ thuật

- APIs: `/api/addresses`.
- Hiện trạng: `AddressController` trả `notImplemented`.

## US-F04: Bình luận sản phẩm

**Vai trò:** Customer  
**Mức ưu tiên:** Low  
**Trạng thái:** Planned / Not Implemented

### User Story

As a Customer,  
I want bình luận về sản phẩm,  
So that tôi có thể trao đổi ngoài luồng review đã mua hàng.

### Mô tả

Comment routes tồn tại nhưng toàn bộ controller methods hiện trả controlled `501`.

### Acceptance Criteria

#### Happy Path

Given feature được triển khai,  
When customer tạo comment hợp lệ,  
Then comment được lưu và public có thể xem theo rule.

#### Unhappy Path

Given trạng thái hiện tại,  
When gọi comment endpoint,  
Then hệ thống trả controlled `501`.

### Business Rules

- Cần xác định moderation và ownership trước khi triển khai.
- Comment là module riêng với Review.

### Ghi chú kỹ thuật

- APIs: product comments và delete comment.
- Hiện trạng: `CommentController` trả `notImplemented`.

## US-F05: Thanh toán online VNPay/MoMo

**Vai trò:** Customer  
**Mức ưu tiên:** Medium  
**Trạng thái:** Planned / Not Implemented

### User Story

As a Customer,  
I want thanh toán online qua VNPay hoặc MoMo,  
So that tôi có thêm lựa chọn thanh toán.

### Mô tả

Hiện hệ thống chỉ hỗ trợ COD; online checkout và callback trả controlled `501`.

### Acceptance Criteria

#### Happy Path

Given gateway được tích hợp và giao dịch thành công,  
When customer thanh toán,  
Then payment status và order được cập nhật idempotent.

#### Unhappy Path

Given trạng thái hiện tại hoặc callback không hợp lệ,  
When gọi payment endpoint,  
Then hệ thống không thay đổi order sai và hiện trả controlled `501`.

### Business Rules

- COD là payment method duy nhất đang hoạt động.
- Callback tương lai phải idempotent và xác minh chữ ký.

### Ghi chú kỹ thuật

- APIs: `/api/payments/checkout`, `/api/payments/callback`.
- Hiện trạng: `PaymentController` trả `notImplemented`.

## US-F06: Standalone voucher apply

**Vai trò:** Customer  
**Mức ưu tiên:** Low  
**Trạng thái:** Planned / Not Implemented

### User Story

As a Customer,  
I want gọi endpoint apply voucher riêng,  
So that client có thể dùng một flow áp dụng voucher độc lập nếu cần.

### Mô tả

Voucher check và voucher trong checkout đã hoạt động; riêng `/vouchers/apply` vẫn trả `501`.

### Acceptance Criteria

#### Happy Path

Given feature được triển khai,  
When customer gọi apply với voucher hợp lệ,  
Then hệ thống trả kết quả theo contract được thống nhất.

#### Unhappy Path

Given trạng thái hiện tại,  
When gọi endpoint,  
Then hệ thống trả controlled `501`.

### Business Rules

- Không được mutate usage chỉ vì kiểm tra/apply tạm thời.
- Checkout vẫn phải validate lại voucher.

### Ghi chú kỹ thuật

- API: `POST /api/vouchers/apply`.
- Hiện trạng: `VoucherController::apply` trả `notImplemented`.

## US-F07: Dashboard revenue endpoint riêng

**Vai trò:** Admin  
**Mức ưu tiên:** Low  
**Trạng thái:** Planned / Not Implemented

### User Story

As an Admin,  
I want endpoint revenue riêng nếu có nhu cầu báo cáo chuyên sâu,  
So that dashboard có thể mở rộng phân tích doanh thu.

### Mô tả

Stats và analytics đã implemented; endpoint revenue riêng hiện trả controlled `501`.

### Acceptance Criteria

#### Happy Path

Given endpoint được triển khai,  
When admin yêu cầu báo cáo revenue,  
Then dữ liệu dùng cùng revenue rule với stats/analytics.

#### Unhappy Path

Given trạng thái hiện tại,  
When admin gọi endpoint,  
Then hệ thống trả controlled `501`.

### Business Rules

- Revenue chỉ tính order delivered và paid.
- Không fake dữ liệu báo cáo.

### Ghi chú kỹ thuật

- API: `GET /api/admin/dashboard/revenue`.
- Hiện trạng: `DashboardController::revenue` trả `notImplemented`.

## US-F08: Chuẩn bị database và media cho production

**Vai trò:** Admin  
**Mức ưu tiên:** Medium  
**Trạng thái:** Planned / Not Implemented

### User Story

As an Admin,  
I want database và media storage sẵn sàng cho production,  
So that hệ thống có thể vận hành ổn định ngoài môi trường local.

### Mô tả

Database hiện tại là SQLite local; product demo images dùng local assets. Cloudinary wrapper có tồn tại nhưng production credentials/lifecycle chưa được xác minh.

### Acceptance Criteria

#### Happy Path

Given production architecture được lựa chọn và xác minh,  
When hệ thống deploy,  
Then database, media, backup và restore hoạt động ổn định.

#### Unhappy Path

Given chưa xác minh production environment,  
When đánh giá trạng thái,  
Then không được ghi hạ tầng production là đã hoàn thành.

### Business Rules

- SQLite là database chính hiện tại cho local/demo.
- Việc chuyển MySQL/PostgreSQL và production media storage thuộc roadmap.

### Ghi chú kỹ thuật

- Seeder catalog đọc local assets và không chạy trong production.
- Cần xác minh Cloudinary credentials, upload/delete và media lifecycle.

---

# 8. TRACEABILITY TỚI PRD

| Nhóm User Stories | PRD liên quan | Trạng thái chính |
|---|---|---|
| Guest `US-G01` đến `US-G12` | PRD mục 3.1, 3.2 | Chủ yếu Implemented |
| Customer `US-C01` đến `US-C15` | PRD mục 3.1, 3.2 | Implemented; profile/password UI là Partial |
| Admin `US-A01` đến `US-A12` | PRD mục 3.3, 3.4 | Implemented |
| Future `US-F01` đến `US-F08` | PRD mục 11, 12, 13.2, 13.3 | Planned / Not Implemented |

Các business rules chi tiết được đối chiếu với PRD mục 4 và `.ai/business/business-rules.md`.

# 9. GHI CHÚ CẦN XÁC MINH

- Cần chạy lại full backend/frontend test suite trước khi ghi nhận trạng thái phát hành demo.
- `PublicCategoryBrandTest` chứng minh Public Category/Brand API đã implemented, nhưng `RouteHardeningTest` và `ApiResponseContractFoundationTest` cũ vẫn còn kỳ vọng `501`.
- Public Category/Brand đã được xác minh từ controller và test chuyên biệt; cần xử lý các kỳ vọng test cũ.
- Cần xác minh Cloudinary production credentials và media lifecycle.
- Cần xác minh locale/encoding tiếng Việt trên toàn hệ thống.
- `.ai/api/routes.md` đã được đồng bộ; `.ai/project/tech-stack.md`, `.ai/project/overview.md`, `.ai/project/architecture.md` và `.ai/api/auth-flow.md` vẫn cần rà soát riêng.
