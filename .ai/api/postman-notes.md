# Postman Notes — Ananas Fashion API

> Base URL: `{{base_url}}` = `http://localhost:8000/api`

---

## 1) Environment variables

- `base_url`: `http://localhost:8000/api`
- `token`: user token (customer)
- `admin_token`: admin token
- `guest_token`: UUID cho guest cart
- `order_code`: order code dùng cho lookup/cancel
- `product_slug`: slug sản phẩm
- `product_id`: id sản phẩm
- `variant_id`: id variant
- `voucher_code`: mã voucher test

---

## 2) Default headers

### Public JSON

```http
Accept: application/json
```

### Authenticated user

```http
Accept: application/json
Authorization: Bearer {{token}}
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

- `Auth`
- `Public Products`
- `Cart (Guest/User)`
- `Voucher`
- `Checkout & Orders`
- `Wishlist`
- `Reviews`
- `Admin Catalog`
- `Admin Orders`
- `Admin Dashboard`
- `Out-of-scope 501`

---

## 4) Flow khuyến nghị để test nhanh

1. `POST /auth/register` hoặc `POST /auth/login` lấy `token`.
2. Admin login lấy `admin_token`.
3. Guest tạo cart (`GET /cart`), lấy `X-Guest-Token` response header và set vào `guest_token`.
4. Guest add item (`POST /cart/items`) -> check voucher (`POST /vouchers/check`) -> checkout guest (`POST /checkout/guest`).
5. Customer checkout (`POST /orders`) -> list/show/cancel order.
6. Lookup công khai bằng `POST /orders/lookup`.
7. Admin update order status (`PATCH /admin/orders/{order_code}/status`).

---

## 5) Tests for expected behavior (tham chiếu nhanh)

- Auth: `tests/Feature/AuthFlowTest.php`
- Cart: `tests/Feature/CartTest.php`
- Voucher: `tests/Feature/VoucherTest.php`
- Checkout: `tests/Feature/CheckoutTest.php`
- Orders: `tests/Feature/OrderManagementTest.php`
- Lookup: `tests/Feature/OrderLookupTest.php`
- Wishlist: `tests/Feature/WishlistTest.php`
- Review: `tests/Feature/ReviewTest.php`
- Admin CRUD: `tests/Feature/AdminCategoryBrandTest.php`, `tests/Feature/AdminProductTest.php`, `tests/Feature/AdminProductVariantTest.php`, `tests/Feature/AdminProductImageTest.php`, `tests/Feature/VoucherTest.php`
- Dashboard: `tests/Feature/DashboardStatsTest.php`
- Route hardening/stub 501: `tests/Feature/RouteHardeningTest.php`

---

## 6) 501 endpoints

Khi gọi endpoint ngoài scope, expected:

```json
{
  "success": false,
  "message": "Feature not implemented",
  "errors": null
}
```

Chi tiết danh sách xem `.ai/api/api-documentation.md` mục **Out-of-scope endpoints**.
