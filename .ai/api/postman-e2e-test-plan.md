# Postman End-to-End API Test Plan — Ananas Fashion

> Updated: 2026-05-15  
> Scope: kiểm tra API local server bằng Postman, không sửa business logic/backend code.

---

## A) Local server setup

### 1) Start local API server

```bash
php artisan serve
```

- Base URL dùng cho Postman:
  - `http://127.0.0.1:8000/api`

### 2) Database setup

Tối thiểu chạy:

```bash
php artisan migrate
php artisan db:seed
```

Nếu cần reset sạch:

```bash
php artisan migrate:fresh --seed
```

### 3) Test accounts cần có

- **Customer account**: có thể tự tạo qua `POST /api/auth/register`.
- **Admin account**: cần có 1 user với `role=admin` trong DB.

Gợi ý tạo admin nhanh (Tinker):

```bash
php artisan tinker
```

```php
\App\Models\User::updateOrCreate(
    ['email' => 'admin@example.com'],
    [
        'name' => 'Admin',
        'password' => bcrypt('Password1'),
        'role' => 'admin',
        'is_banned' => false,
    ]
);
```

---

## B) Postman Environment variables

Tạo environment `ananas-local` với các biến:

- `base_url` = `http://127.0.0.1:8000/api`
- `customer_token`
- `admin_token`
- `guest_token`
- `product_slug`
- `product_id`
- `variant_id`
- `cart_item_id`
- `voucher_code`
- `order_code`
- `review_id`
- `category_id`
- `brand_id`
- `admin_product_id`
- `admin_variant_id`

---

## C) Collection folder structure

Tạo collection theo thứ tự:

1. `00 Health / Route Hardening`
2. `01 Auth`
3. `02 Product Public`
4. `03 Guest Cart`
5. `04 User Cart`
6. `05 Voucher`
7. `06 Checkout Guest`
8. `07 Checkout User`
9. `08 Order Management`
10. `09 Order Lookup`
11. `10 Wishlist`
12. `11 Review`
13. `12 Admin Category/Brand`
14. `13 Admin Product/Variant/Image`
15. `14 Admin Voucher`
16. `15 Admin Order`
17. `16 Admin Dashboard`
18. `99 Out-of-scope 501 checks`

---

## D) Recommended E2E flow order

1. Register customer  
2. Login customer, save `customer_token`  
3. Login admin, save `admin_token`  
4. Get product list, save `product_slug` / `product_id` / `variant_id`  
5. Guest add cart with `X-Guest-Token`  
6. Guest checkout, save `order_code`  
7. Lookup guest order  
8. User add cart  
9. Voucher check  
10. User checkout, save `order_code`  
11. User list/show/cancel order (nếu order còn `pending`)  
12. Admin update order status  
13. Wishlist toggle/list/delete  
14. Review delivered order item (nếu dữ liệu phù hợp)  
15. Admin dashboard stats  
16. 501 route checks  

---

## E) Postman test scripts mẫu

## E.1 Status code checks

```javascript
pm.test("Status code is expected", function () {
  pm.expect([200, 201, 401, 403, 404, 422, 501]).to.include(pm.response.code);
});
```

## E.2 Success/data/message shape (envelope endpoint)

```javascript
pm.test("Response has envelope keys", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
  pm.expect(json).to.have.property("message");
  pm.expect(json).to.have.property("data");
});
```

## E.3 Save token from login

```javascript
pm.test("Save login token", function () {
  const json = pm.response.json();
  pm.expect(pm.response.code).to.eql(200);
  pm.expect(json.data).to.have.property("token");
  pm.environment.set("customer_token", json.data.token);
});
```

Admin login request script:

```javascript
pm.test("Save admin token", function () {
  const json = pm.response.json();
  pm.expect(pm.response.code).to.eql(200);
  pm.environment.set("admin_token", json.data.token);
});
```

## E.4 Save `product_slug` / `product_id` / `variant_id` from product list

```javascript
pm.test("Save first product & variant", function () {
  const json = pm.response.json();
  const products = json.data || [];
  pm.expect(products.length).to.be.greaterThan(0);

  const product = products[0];
  pm.environment.set("product_slug", product.slug);
  pm.environment.set("product_id", String(product.id));

  if (product.variants && product.variants.length > 0) {
    pm.environment.set("variant_id", String(product.variants[0].id));
  }
});
```

## E.5 Save `order_code` from checkout

```javascript
pm.test("Save order_code", function () {
  const json = pm.response.json();
  pm.expect(pm.response.code).to.eql(201);
  pm.expect(json.data).to.have.property("code");
  pm.environment.set("order_code", json.data.code);
});
```

## E.6 Save `guest_token` from response header (nếu backend trả header)

```javascript
pm.test("Save guest token header if present", function () {
  const token = pm.response.headers.get("X-Guest-Token");
  if (token) {
    pm.environment.set("guest_token", token);
  }
});
```

## E.7 Check 501 notImplemented envelope

```javascript
pm.test("501 not implemented envelope", function () {
  pm.expect(pm.response.code).to.eql(501);
  const json = pm.response.json();
  pm.expect(json.success).to.eql(false);
  pm.expect(json.message).to.eql("Feature not implemented");
  pm.expect(json).to.have.property("errors");
});
```

---

## F) Negative tests

Chạy tối thiểu các ca âm sau:

1. **Guest cannot access admin**
   - `GET /api/admin/dashboard/stats` không token => `401`.
2. **Customer cannot access admin**
   - `GET /api/admin/dashboard/stats` với `customer_token` => `403`.
3. **Wrong voucher code**
   - `POST /api/vouchers/check` code sai => `422`.
4. **Lookup only order_code should fail**
   - `POST /api/orders/lookup` chỉ có `order_code` => `422`.
5. **Invalid payment_method should fail**
   - Checkout với `payment_method != cod` => `422`.
6. **Add inactive/out-of-stock variant should fail** (nếu test data có)
   - `POST /api/cart/items` với variant invalid => `422`.
7. **501 endpoints return controlled envelope**
   - Ví dụ: `/api/categories`, `/api/payments/checkout`, `/api/admin/users` => `501 + envelope`.

---

## Suggested request checklist by folder

- `00`: ping 501 endpoints + verify envelope
- `01`: register/login/me/logout/logout-all
- `02`: product list/detail/reviews public
- `03`: guest cart add/update/remove/clear
- `04`: user cart + merge
- `05`: voucher check valid/invalid
- `06`: guest checkout success + invalid payment method
- `07`: user checkout success + voucher
- `08`: user orders list/show/cancel
- `09`: order lookup success/fail/throttle
- `10`: wishlist toggle/list/delete + auth checks
- `11`: review create/list/delete + permissions
- `12`: admin category/brand CRUD
- `13`: admin product/variant/image flows
- `14`: admin voucher CRUD
- `15`: admin order list/show/status update
- `16`: dashboard stats
- `99`: out-of-scope 501 validations

