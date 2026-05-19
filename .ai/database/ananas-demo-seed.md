# Ananas Demo Catalog Seed

> Updated: 2026-05-18  
> Seeder: `database/seeders/AnanasCatalogSeeder.php`

---

## 1) Danh sách category

Seeder tạo category theo folder thực tế trong `ananas-fashion-frontend/public/ananas-assets/products`:

- `giay` → **Giày**
- `ao` → **Áo**
- `phu-kien` → **Phụ kiện**
- `vo` → **Vớ**
- `van-truot` → **Ván trượt** (chỉ tạo khi folder tồn tại)

Brand demo mặc định:

- `ananas` → **Ananas**

---

## 2) Quy tắc product_code / slug / sku

Schema hiện tại chưa có cột `products.product_code`. Seeder xử lý tương thích như sau:

- Nếu cột `product_code` tồn tại trong schema, seeder sẽ set bằng mã folder (ví dụ `AV00193`).
- Nếu cột chưa tồn tại, frontend vẫn match ảnh qua:
  - `products.slug`: `{category-slug}-{PRODUCTCODE}` (ví dụ `giay-av00193`)
  - `products.name`: chứa code rõ ràng (ví dụ `Giày Ananas AV00193`)
  - `product_variants.sku`: `PRODUCTCODE-SIZE-COLOR` (ví dụ `AV00193-40-BLACK`)

Nhờ đó resolver ở frontend (`productImageMap` + `product-images.ts`) có thể map đúng ảnh local theo code.

---

## 3) Quy tắc image_url

Mỗi product lấy ảnh từ folder:

- `/ananas-assets/products/{category}/{PRODUCTCODE}/{filename}`

Ghi vào bảng `product_images`:

- `url`: dùng đúng path public local phía trên
- `public_id`: `local:ananas-assets/products/{category}/{PRODUCTCODE}/{filename}`
- `is_primary`:
  - ưu tiên file chứa `_front_01`
  - fallback file chứa `_front_`
  - fallback ảnh đầu tiên theo sort tự nhiên

---

## 4) Quy tắc variants

- **Giày**: `39, 40, 41, 42, 43`
- **Áo**: `S, M, L, XL`
- **Vớ / Phụ kiện / Ván trượt**: `One Size`
- `stock`: trong khoảng `10..50` (deterministic theo code)
- `price_adjustment`: theo cấu hình category (hoặc `0`)
- `color`:
  - cố gắng suy luận từ tên file ảnh (black/white/gray/beige/navy/olive/brown/red)
  - nếu không suy luận được thì fallback deterministic palette

---

## 5) Lệnh reset database

```bash
php artisan migrate:fresh --seed
```

Thứ tự seed trong `DatabaseSeeder`:

1. Tạo user demo customer
2. Tạo user demo admin
3. Gọi `AnanasCatalogSeeder`

---

## 6) Checklist kiểm tra sau seed

- `GET /api/products` trả catalog mới theo assets Ananas.
- `name / slug / sku` chứa mã sản phẩm để frontend map đúng ảnh local.
- `GET /api/products/{slug}` trả `images` với `url` dưới `/ananas-assets/products/...`.
- Frontend product list/detail hiển thị đúng ảnh local map.
- Không có dữ liệu cũ từ carts/orders/wishlists/reviews sau `migrate:fresh`.
