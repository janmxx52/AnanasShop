# Folder Rules — Ananas Fashion (Laravel)

## Cấu Trúc Thư Mục `app/`

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── Auth/           # RegisterController, LoginController, ...
│   │       ├── Product/        # ProductController, ReviewController
│   │       ├── Category/
│   │       ├── Brand/
│   │       ├── Cart/
│   │       ├── Order/
│   │       ├── Payment/
│   │       ├── User/           # AddressController, WishlistController
│   │       ├── Voucher/
│   │       └── Admin/          # Admin-only controllers
│   ├── Requests/
│   │   ├── Auth/
│   │   ├── Product/
│   │   ├── Order/
│   │   └── ...
│   └── Resources/
│       ├── ProductResource.php
│       ├── OrderResource.php
│       └── ...
├── Models/
│   ├── User.php
│   ├── Product.php
│   ├── ProductVariant.php
│   ├── ProductImage.php
│   ├── Category.php
│   ├── Brand.php
│   ├── Cart.php
│   ├── CartItem.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── Voucher.php
│   ├── VoucherUsage.php
│   ├── Review.php
│   ├── Wishlist.php
│   └── Address.php
├── Services/
│   ├── Auth/
│   │   └── AuthService.php
│   ├── Product/
│   │   └── ProductService.php
│   ├── Cart/
│   │   └── CartService.php
│   ├── Order/
│   │   ├── OrderService.php
│   │   └── OrderCodeService.php
│   ├── Payment/
│   │   ├── PaymentService.php
│   │   ├── VNPayService.php
│   │   └── MoMoService.php
│   ├── Voucher/
│   │   └── VoucherService.php
│   └── Cloudinary/
│       └── CloudinaryService.php
├── Repositories/
│   ├── Interfaces/
│   │   ├── ProductRepositoryInterface.php
│   │   ├── OrderRepositoryInterface.php
│   │   └── ...
│   ├── ProductRepository.php
│   ├── OrderRepository.php
│   ├── CartRepository.php
│   └── ...
├── DTOs/
│   ├── CreateOrderDTO.php
│   ├── CreateProductDTO.php
│   └── ...
├── Actions/
│   ├── CreateOrderAction.php
│   ├── ApplyVoucherAction.php
│   └── ...
├── Jobs/
│   └── SendOrderConfirmationJob.php
├── Events/
│   └── OrderPlacedEvent.php
├── Listeners/
│   └── SendOrderConfirmationListener.php
└── Policies/
    ├── OrderPolicy.php
    └── ReviewPolicy.php
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Controller | PascalCase + Controller suffix | `ProductController` |
| Service | PascalCase + Service suffix | `CartService` |
| Repository | PascalCase + Repository suffix | `ProductRepository` |
| Interface | PascalCase + RepositoryInterface | `ProductRepositoryInterface` |
| DTO | PascalCase + DTO suffix | `CreateOrderDTO` |
| Action | PascalCase + Action suffix | `CreateOrderAction` |
| FormRequest | PascalCase + Request suffix | `StoreProductRequest` |
| Resource | PascalCase + Resource suffix | `ProductResource` |
| Model | PascalCase, singular | `Product` |
| Migration | snake_case, timestamp prefix | `2025_05_11_create_products_table` |
| Seeder | PascalCase + Seeder suffix | `ProductSeeder` |
| Factory | PascalCase + Factory suffix | `ProductFactory` |

---

## Rules

1. **Controllers** chỉ có: nhận request, gọi service, return response
2. **Services** chứa toàn bộ business logic
3. **Repositories** chỉ chứa database queries (dùng Eloquent)
4. **Interfaces** phải được bind trong `AppServiceProvider`
5. **DTOs** dùng để truyền dữ liệu giữa controller ↔ service
6. **Actions** = 1 class = 1 use case cụ thể (thay cho method service phức tạp)
7. **FormRequest** = validate + authorize; KHÔNG validate trong controller
8. **Resource** = transform data trước khi return; KHÔNG return model trực tiếp
9. API Controller đặt trong `Api/` namespace theo domain
10. Admin controller đặt trong `Api/Admin/` và dùng middleware `role:admin`
