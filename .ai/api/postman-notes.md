# Postman Notes — Ananas Fashion API

> Base URL: `{{base_url}}` = `http://127.0.0.1:8000/api`

---

## 1) Environment variables

- `base_url`: `http://127.0.0.1:8000/api`
- `customer_token`: customer bearer token
- `admin_token`: admin bearer token
- `guest_token`: UUID guest cart token
- `order_code`: order code for lookup/cancel
- `product_slug`: public product slug
- `product_id`: product id
- `variant_id`: product variant id
- `cart_item_id`: cart item id
- `voucher_code`: voucher code for check/checkout
- `review_id`: review id for delete flow
- `category_id`: admin category id
- `brand_id`: admin brand id
- `admin_product_id`: admin product id
- `admin_variant_id`: admin variant id

---

## 2) Default headers

### Public JSON

```http
Accept: application/json
```

### Authenticated user

```http
Accept: application/json
Authorization: Bearer {{customer_token}}
```

### Admin

```http
Accept: application/json
Authorization: Bearer {{admin_token}}
```

### Guest cart

```http
Accept: application/json
X-Guest-Token: {{guest_token}}
```

---

## 3) Suggested collection folders

- `00 Health / Route Hardening`
- `01 Auth`
- `02 Product Public`
- `03 Guest Cart`
- `04 User Cart`
- `05 Voucher`
- `06 Checkout Guest`
- `07 Checkout User`
- `08 Order Management`
- `09 Order Lookup`
- `10 Wishlist`
- `11 Review`
- `12 Admin Category/Brand`
- `13 Admin Product/Variant/Image`
- `14 Admin Voucher`
- `15 Admin Order`
- `16 Admin Dashboard`
- `99 Out-of-scope 501 checks`

---

## 4) Quick flow

1. Login/register customer -> save `customer_token`
2. Login admin -> save `admin_token`
3. Product list -> save `product_slug`, `product_id`, `variant_id`
4. Guest cart + guest checkout -> save `order_code`
5. Order lookup
6. User cart + voucher check + user checkout
7. User order list/show/cancel
8. Admin order status update
9. Wishlist and review flows
10. Admin dashboard stats
11. 501 route checks

---

## 5) Related feature tests map

- Auth: `tests/Feature/AuthFlowTest.php`
- Product: `tests/Feature/ProductPublicApiTest.php`
- Cart: `tests/Feature/CartTest.php`
- Voucher: `tests/Feature/VoucherTest.php`
- Checkout: `tests/Feature/CheckoutTest.php`
- Order management: `tests/Feature/OrderManagementTest.php`
- Order lookup: `tests/Feature/OrderLookupTest.php`
- Payment foundation: `tests/Feature/PaymentFoundationTest.php`
- Wishlist: `tests/Feature/WishlistTest.php`
- Review: `tests/Feature/ReviewTest.php`
- Admin catalog: `tests/Feature/AdminCategoryBrandTest.php`, `tests/Feature/AdminProductTest.php`, `tests/Feature/AdminProductVariantTest.php`, `tests/Feature/AdminProductImageTest.php`
- Dashboard: `tests/Feature/DashboardStatsTest.php`
- Route hardening: `tests/Feature/RouteHardeningTest.php`
- Response contract foundation: `tests/Feature/ApiResponseContractFoundationTest.php`

---

## 6) 501 endpoints expectation

Expected response:

```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```

Chi tiết endpoint 501 xem `.ai/api/api-documentation.md`.

---

## 7) Run Collection Runner (E2E local)

### 7.1 Import assets

1. Import collection skeleton:
   - `.ai/api/postman-collection-skeleton.json`
2. Tạo/select environment `ananas-local`.
3. Kiểm tra biến quan trọng:
   - `base_url`, `customer_token`, `admin_token`, `guest_token`

### 7.2 Prepare local backend

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

### 7.3 Runner order

- Chạy `01 Auth` trước để lấy token.
- Chạy `02 Product Public` để lấy product vars.
- Chạy tiếp `03` -> `16`.
- Chạy `99 Out-of-scope 501 checks` ở cuối.

### 7.4 Runner options

- Delay request: `100-300ms`
- Stop on error: bật khi debug flow
- Save responses: bật khi cần audit

