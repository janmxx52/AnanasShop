MVC + Service Layer + Repository Pattern + Modular/Domain-based Structure + Dependency Injection (IoC Container)

Controller
   ↓
Service
   ↓
Repository
   ↓
Model


VD:
ProductController
   ↓
ProductService
   ↓
ProductRepository
   ↓
Product Model


Folder structure
app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Services/
├── Repositories/
├── Interfaces/
├── DTOs/
├── Actions/
├── Jobs/
├── Events/
├── Listeners/
├── Policies/
└── Providers/


Vai trò từng layer

Controller

Nhận request
Validate
Gọi service
Return response

Service

Business logic
Ví dụ:
CreateOrderService
ApplyCouponService
CalculateShippingService

Repository

Query database
Che giấu Eloquent khỏi business layer

DTO

Data transfer object
Giúp truyền dữ liệu sạch.


MVC
+ Service Layer
+ Repository Pattern
+ DTO
+ Form Request Validation
+ API Resource
+ Domain/Modular structure