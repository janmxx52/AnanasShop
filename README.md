# Ananas Fashion E-commerce

## 1. Giới thiệu project

Ananas Fashion là project e-commerce thời trang lấy cảm hứng từ Ananas, gồm:

- **Backend API**: Laravel 12
- **Frontend**: React + Vite + TypeScript
- Có đủ flow **client site** và **admin site**
- Dữ liệu demo được tạo bằng **migrations + seeders**, không cần import `.sql` thủ công

Project phù hợp để demo học phần/đồ án fullstack.

---

## 2. Công nghệ sử dụng

### Backend
- Laravel 12
- Laravel Sanctum (token-based auth)
- SQLite local database
- Cloudinary service wrapper (có fallback local storage khi chạy local)

### Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- Axios
- React Router DOM
- Recharts (dashboard chart)

### Testing
- PHPUnit / Laravel Feature Tests
- Vitest + React Testing Library

---

## 3. Yêu cầu cài đặt

### Cần có
- PHP **>= 8.2**
- Composer
- Node.js + npm
- Git (nếu clone repository)

### Không yêu cầu
- SQL Server
- MySQL
- XAMPP database
- Import file `.sql`

---

## 4. Cấu trúc thư mục chính

- `app/` – logic backend (Controllers, Services, Models...)
- `routes/api.php` – toàn bộ API routes
- `database/migrations/` – schema database
- `database/seeders/` – dữ liệu seed demo
- `ananas-fashion-frontend/` – source frontend
- `ananas-fashion-frontend/public/ananas-assets/` – ảnh demo catalog
- `.ai/` – tài liệu phân tích/rules/API nội bộ project

---

## 5. Hướng dẫn chạy Backend Laravel (Windows PowerShell)

```bash
cd Ananas-Fashion
composer install
copy .env.example .env
php artisan key:generate
```

### Cấu hình SQLite local

1) Tạo file database:

```bash
New-Item -ItemType File -Path .\database\database.sqlite -Force
```

2) Mở file `.env`, chỉnh các biến DB:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
```

> Lưu ý: project demo này chạy bằng SQLite local file.

### Migrate + seed dữ liệu demo

```bash
php artisan migrate:fresh --seed
```

Seeder chính sẽ tạo:
- tài khoản demo admin/customer
- catalog Ananas từ local assets (`AnanasCatalogSeeder`)
- voucher demo (nếu `VoucherSeeder` tồn tại)

### Chạy backend server

```bash
php artisan serve
```

Backend chạy mặc định tại: `http://127.0.0.1:8000`

---

## 6. Hướng dẫn chạy Frontend

Mở terminal mới:

```bash
cd Ananas-Fashion\ananas-fashion-frontend
npm install
copy .env.example .env
```

Kiểm tra `.env` frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Chạy frontend:

```bash
npm run dev
```

Frontend chạy mặc định tại: `http://127.0.0.1:5173`

---

## 7. Tài khoản demo

Sau khi `migrate:fresh --seed`, dùng:

- **Admin**
  - Email: `admin@example.com`
  - Password: `Password1`

- **Customer**
  - Email: `customer.e2e@example.com`
  - Password: `Password1`

---

## 8. Chạy test

### Backend

```bash
cd Ananas-Fashion
php artisan test
```

### Frontend

```bash
cd Ananas-Fashion\ananas-fashion-frontend
npm run test
npm run build
```

---

## 9. API & tài liệu tham khảo

- API documentation: `.ai/api/api-documentation.md`
- Route notes: `.ai/api/routes.md`
- Business rules: `.ai/business/business-rules.md`
- Demo seed guide: `.ai/database/ananas-demo-seed.md`
- Postman skeleton: `.ai/api/postman-collection-skeleton.json`

---

## 10. Quy trình chạy demo nhanh (gợi ý cho giảng viên/người chấm)

1) Backend:
- `composer install`
- cấu hình `.env` dùng SQLite
- `php artisan migrate:fresh --seed`
- `php artisan serve`

2) Frontend:
- `cd ananas-fashion-frontend`
- `npm install`
- `npm run dev`

3) Truy cập:
- Client: `http://127.0.0.1:5173`
- Đăng nhập admin để vào khu vực quản trị

---

## 11. Troubleshooting nhanh

- Nếu báo lỗi DB connection: kiểm tra lại `DB_CONNECTION=sqlite` và file `database/database.sqlite`.
- Nếu frontend không gọi được API: kiểm tra `VITE_API_BASE_URL` và backend đã `php artisan serve`.
- Nếu cần reset dữ liệu demo:

```bash
php artisan migrate:fresh --seed
```

