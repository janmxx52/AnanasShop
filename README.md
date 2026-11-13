# Ananas Fashion – Full-stack E-commerce Platform

A full-stack fashion e-commerce platform inspired by Ananas, featuring a customer-facing shopping experience and a comprehensive admin dashboard.

**Live Demo:** https://ananas-shop.vercel.app/  
**Source Code:** https://github.com/janmxx52/AnanasShop


After running the database seeders, the following local demo accounts can be used:

| **Role** | **Email** | **Password** |

| Admin | admin@example.com | Password1 |
| Customer | customer.e2e@example.com | Password1 |

---

## 1. Project Overview

Ananas Fashion is a full-stack e-commerce web application developed to simulate a real-world fashion retail platform.

The system provides two main interfaces:

- **Customer Website:** Browse products, search and filter catalogs, manage shopping carts, place orders, track purchases, and manage wishlists.
- **Admin Dashboard:** Manage products, categories, brands, inventory, orders, users, vouchers, and business analytics.

The application follows a decoupled architecture, with a Laravel RESTful API serving a React frontend.

The project has been deployed to production and uses a cloud-hosted database. Both customer and administrative workflows are accessible through the live application.

## 2. Live Deployment

| Component | Technology | Platform |
|---|---|---|
| Frontend | React + Vite + TypeScript | Vercel |
| Backend | Laravel 12 REST API | Render |
| Production Database | MySQL-compatible database | TiDB Cloud |
| Local Database | SQLite | Local environment |
| CI | GitHub Actions | Automated testing |

**Production architecture:**

```text
                 Customer / Admin
                        |
                        v
              React + TypeScript SPA
                     (Vercel)
                        |
                  HTTP REST API
                     (Axios)
                        |
                        v
                Laravel 12 API
                    (Render)
                        |
                  MySQL Protocol
                        |
                        v
                  TiDB Cloud
                 (Production DB)
```

## 3. Technology Stack

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- RESTful API
- Eloquent ORM
- MySQL / TiDB Cloud
- SQLite for local development
- Cloudinary integration
- Laravel Migrations and Seeders

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Recharts

### Testing & Development

- PHPUnit
- Laravel Feature Tests
- Vitest
- React Testing Library
- Git & GitHub
- GitHub Actions

### Deployment

- Vercel – Frontend hosting
- Render – Backend hosting
- TiDB Cloud – Production database

## 4. Key Features

### 4.1. Customer Website

**Product Catalog**
- Browse product listings and product details.
- Search products by keywords.
- Filter products by category, brand, size, color, and price range.
- Sort products by price, newest arrivals, and featured products.
- Display product variants, images, ratings, and reviews.

**Authentication**
- Customer registration and login.
- Token-based authentication using Laravel Sanctum.
- Logout and current user session management.
- Role-based access control.

**Shopping Cart**
- Guest shopping cart without requiring an account.
- Authenticated customer shopping cart.
- Add, update, and remove cart items.
- Validate product availability and stock quantity.
- Merge guest cart into customer cart after login.

**Checkout & Orders**
- Guest and authenticated customer checkout.
- Cash on Delivery (COD) payment.
- Shipping information and order creation.
- Voucher validation during checkout.
- Automatic stock deduction after successful checkout.
- Customer order history and order details.
- Order cancellation based on business rules.
- Public order lookup using order code and customer contact information.

**Wishlist & Reviews**
- Add and remove products from wishlist.
- Submit product reviews after successful delivery.
- Display approved product reviews and ratings.

### 4.2. Admin Dashboard

**Dashboard & Analytics**
- Overview of users, products, orders, and revenue.
- Revenue and order charts covering 12 months.
- Order status statistics.
- Inventory and low-stock monitoring.
- Recent orders and top-selling products.
- Analytics based on actual database records.

**Product Management**
- Create, view, update, and soft-delete products.
- Manage product categories and brands.
- Manage product variants, sizes, colors, and stock.
- Upload, delete, and set primary product images.

**Order Management**
- View and manage customer orders.
- View order details and customer shipping information.
- Update order statuses based on predefined business rules.
- Cancel eligible orders and restore stock where applicable.

**User Management**
- View and manage customer accounts.
- Create and update user information.
- Ban and unban accounts.
- Revoke authentication tokens when an account is banned.
- Protect administrator accounts from unsafe self-modification.

**Voucher Management**
- Create and update discount vouchers.
- Support percentage-based and fixed-amount discounts.
- Configure validity periods and usage limits.
- Activate and deactivate vouchers.

## 5. Backend Architecture & Business Logic

The backend is structured around Laravel's MVC architecture with dedicated services for business operations.

Key implementation details:

- **Authentication & Authorization:** Sanctum Bearer Tokens and admin role middleware.
- **Data Validation:** Form Requests for validating incoming API requests.
- **Business Logic:** Dedicated service classes for core operations.
- **Database Management:** Eloquent ORM, migrations, relationships, and seeders.
- **API Responses:** Structured JSON responses and appropriate HTTP status codes.
- **Error Handling:** Validation errors, authorization errors, and controlled responses for unsupported endpoints.

### Important Business Rules

**Product Pricing**

- Product display price uses the sale price when available; otherwise, it uses the base price.
- Variant prices include the product price adjustment.
- Product pricing remains consistent across catalog, cart, and checkout.

**Cart & Inventory**

- Supports both guest and authenticated carts.
- Prevents purchasing quantities exceeding available stock.
- Revalidates inventory during checkout.

**Checkout & Order Processing**

- Uses database transactions to maintain data consistency.
- Locks relevant cart, variant, and voucher records during checkout.
- Creates order and order-item snapshots.
- Deducts stock and records voucher usage within the checkout transaction.
- Restores stock and handles voucher usage when eligible orders are cancelled.

**Security**

- Enforces customer ownership of private resources.
- Restricts administrative endpoints using role-based middleware.
- Validates order lookup using order code and customer contact information.
- Applies rate limiting to public order lookup.

## 6. Database & Data Initialization

The project supports different database configurations for local development and production.

| Environment | Database |
|---|---|
| Local development | SQLite |
| Production | TiDB Cloud (MySQL-compatible) |
| CI testing | SQLite |

Database initialization is handled through Laravel migrations and seeders.

No manual SQL import is required.

The demo catalog is generated through `AnanasCatalogSeeder`, which reads product assets from the frontend's local public directory.

## 7. Project Structure

```text
AnanasShop/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Services/
│   └── Repositories/
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
│
├── routes/
│   └── api.php
│
├── tests/
│   └── Feature/
│
├── ananas-fashion-frontend/
│   ├── public/
│   │   └── ananas-assets/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── contexts/
│       └── ...
│
├── .ai/
│   ├── api/
│   ├── business/
│   ├── database/
│   └── project/
│
└── README.md
```

## 8. Getting Started – Local Development

### Prerequisites

Install the following tools:

- PHP 8.2 or later
- Composer
- Node.js and npm
- Git

No MySQL Server, SQL Server, or XAMPP database installation is required for local development.

### 8.1. Clone Repository

```bash
git clone https://github.com/janmxx52/AnanasShop.git

cd AnanasShop
```

### 8.2. Backend Setup

Install dependencies:

```bash
composer install
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

#### Configure SQLite

Create the local database file:

```powershell
New-Item -ItemType File -Path .\database\database.sqlite -Force
```

Update the following variables in `.env`:

```env
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
```

#### Run Migrations & Seeders

```bash
php artisan migrate:fresh --seed
```

This command initializes the database and generates demo data, including:

- Admin and customer accounts.
- Product categories and brands.
- Product catalog and variants.
- Demo product images.
- Initial demo data configured by the project seeders.

#### Start Backend Server

```bash
php artisan serve
```

Backend API:

```text
http://127.0.0.1:8000
```

API base URL:

```text
http://127.0.0.1:8000/api
```

### 8.3. Frontend Setup

Open another terminal:

```powershell
cd ananas-fashion-frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Configure the API URL in `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://127.0.0.1:5173
```

## 9. Demo Accounts

After running the database seeders, the following local demo accounts can be used:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Password1 |
| Customer | customer.e2e@example.com | Password1 |

**Note:** These are local seeded demo credentials. Do not use them as production administrator credentials.

## 10. Production Configuration

The application is deployed using separate frontend and backend environments.

### Frontend – Vercel

Configure the following environment variable:

```env
VITE_API_URL=https://ananasshop.onrender.com/api
```

Replace the example URL with the actual deployed backend API URL.

### Backend – Render

Configure the Laravel production environment variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ananasshop.onrender.com
FRONTEND_URL=https://ananas-shop.vercel.app

DB_CONNECTION=mysql
DB_HOST=your-tidb-host
DB_PORT=4000
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt
```

Additional configuration:

- Set `APP_KEY` using the generated Laravel application key.
- Configure `SANCTUM_STATEFUL_DOMAINS` according to the frontend domain.
- Configure CORS to allow requests from the deployed frontend origin.
- Configure Cloudinary credentials if using remote media storage.
- Keep all database credentials and API secrets in hosting environment variables.

**Important:** Never commit production `.env` files, database passwords, API keys, or Cloudinary secrets to GitHub.

Production migrations should be run using:

```bash
php artisan migrate --force
```

Do not run `migrate:fresh --seed` against the production database.

## 11. Testing

The project includes automated tests for both backend and frontend.

### Backend Tests

From the repository root:

```bash
php artisan test
```

### Frontend Tests

From the frontend directory:

```bash
npm run test
```

### Production Build Verification

```bash
npm run build
```

### GitHub Actions – CI Pipeline

GitHub Actions automatically runs the CI workflow on:

- Push events.
- Pull request events.

The workflow contains two independent jobs:

**Backend (Laravel)**
- Set up PHP 8.3.
- Install Composer dependencies.
- Prepare SQLite test database.
- Run Laravel tests using PHPUnit.

**Frontend (React)**
- Set up Node.js 22.
- Install dependencies using `npm ci`.
- Run Vitest tests.
- Build the frontend using Vite and TypeScript.

This helps detect backend regressions, frontend test failures, and build errors before changes are integrated.

## 12. API Documentation

Detailed technical documentation is maintained inside the repository:

| Document | Description |
|---|---|
| `.ai/api/api-documentation.md` | API endpoints, request parameters, responses, and authentication |
| `.ai/api/routes.md` | API route reference |
| `.ai/business/business-rules.md` | Core business logic and validation rules |
| `.ai/database/ananas-demo-seed.md` | Demo catalog and database seeding |
| `.ai/api/postman-collection-skeleton.json` | Postman collection structure |

## 13. Current Limitations

The following features are outside the current implemented scope:

- Online payments such as VNPay and MoMo.
- Forgot password and reset password.
- Customer address management.
- Product comment module.
- Standalone voucher apply endpoint.
- Dedicated dashboard revenue endpoint.

The current checkout implementation supports Cash on Delivery (COD).

Some API response contracts are still being standardized across legacy and newer endpoints.

## 14. Project Links

- **Live Website:** https://ananas-shop.vercel.app/
- **GitHub Repository:** https://github.com/janmxx52/AnanasShop

---

**Project Type:** Full-stack E-commerce Web Application  
**Backend:** Laravel 12 REST API  
**Frontend:** React + TypeScript  
**Database:** TiDB Cloud / SQLite  
**Deployment:** Vercel + Render  
**CI:** GitHub Actions