<?php
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes — Ananas Fashion
|--------------------------------------------------------------------------
|
| Tất cả routes đều trả về JSON.
| Auth: Laravel Sanctum (Bearer Token)
|
| Prefix: /api
|
*/
// ============================================================
// PUBLIC ROUTES (không cần đăng nhập)
// ============================================================
// Auth
Route::prefix('auth')->group(function () {
    Route::post('/register', [\App\Http\Controllers\Api\Auth\RegisterController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\Api\Auth\LoginController::class, 'login']);
    Route::post('/forgot-password', [\App\Http\Controllers\Api\Auth\ForgotPasswordController::class, 'sendResetLink']);
    Route::post('/reset-password', [\App\Http\Controllers\Api\Auth\ResetPasswordController::class, 'reset']);
});
// Products
Route::prefix('products')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\Product\ProductController::class, 'index']);
    Route::get('/{slug}', [\App\Http\Controllers\Api\Product\ProductController::class, 'show']);
    Route::get('/{slug}/reviews', [\App\Http\Controllers\Api\Product\ReviewController::class, 'index']);
    Route::get('/{slug}/comments', [\App\Http\Controllers\Api\Product\CommentController::class, 'index']);
});
// Categories
Route::get('/categories', [\App\Http\Controllers\Api\Category\CategoryController::class, 'index']);
Route::get('/categories/{slug}', [\App\Http\Controllers\Api\Category\CategoryController::class, 'show']);
// Brands
Route::get('/brands', [\App\Http\Controllers\Api\Brand\BrandController::class, 'index']);
Route::get('/brands/{slug}', [\App\Http\Controllers\Api\Brand\BrandController::class, 'show']);
// Vouchers (check public)
Route::post('/vouchers/check', [\App\Http\Controllers\Api\Voucher\VoucherController::class, 'check']);
// Order lookup (public)
Route::post('/orders/lookup', [\App\Http\Controllers\Api\Order\OrderLookupController::class, 'store'])
    ->middleware('throttle:10,1');

// ============================================================
// CART ROUTES (guest + user — không yêu cầu auth)
// Xác định cart qua: Bearer token (user) hoặc X-Guest-Token header (guest)
// ============================================================
Route::prefix('cart')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\Cart\CartController::class, 'index']);
    Route::post('/items', [\App\Http\Controllers\Api\Cart\CartController::class, 'addItem']);
    Route::put('/items/{itemId}', [\App\Http\Controllers\Api\Cart\CartController::class, 'updateItem']);
    Route::delete('/items/{itemId}', [\App\Http\Controllers\Api\Cart\CartController::class, 'removeItem']);
    Route::delete('/', [\App\Http\Controllers\Api\Cart\CartController::class, 'clear']);
});

// Guest checkout (không cần đăng nhập)
Route::post('/checkout/guest', [\App\Http\Controllers\Api\Order\GuestCheckoutController::class, 'store']);
// Payment callback (public vì gateway gọi lại)
Route::get('/payments/callback', [\App\Http\Controllers\Api\Payment\PaymentController::class, 'callback']);
Route::post('/payments/callback', [\App\Http\Controllers\Api\Payment\PaymentController::class, 'callback']);
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\Auth\LoginController::class, 'logout']);
            Route::post('/logout-all', [\App\Http\Controllers\Api\Auth\LoginController::class, 'logoutAll']);
        Route::get('/me', [\App\Http\Controllers\Api\Auth\ProfileController::class, 'me']);
        Route::put('/me', [\App\Http\Controllers\Api\Auth\ProfileController::class, 'update']);
        Route::put('/me/password', [\App\Http\Controllers\Api\Auth\ProfileController::class, 'changePassword']);
    });
    // Addresses
    Route::apiResource('addresses', \App\Http\Controllers\Api\User\AddressController::class);
    Route::put('/addresses/{id}/default', [\App\Http\Controllers\Api\User\AddressController::class, 'setDefault']);
    // Cart Merge (sau khi đăng nhập, merge guest cart vào user cart)
    Route::post('/cart/merge', [\App\Http\Controllers\Api\Cart\CartController::class, 'merge']);

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Order\OrderController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\Order\OrderController::class, 'store']);
        Route::get('/{order_code}', [\App\Http\Controllers\Api\Order\OrderController::class, 'show']);
        Route::post('/{order_code}/cancel', [\App\Http\Controllers\Api\Order\OrderController::class, 'cancel']);
    });
    // Payment (checkout yêu cầu auth)
    Route::post('/payments/checkout', [\App\Http\Controllers\Api\Payment\PaymentController::class, 'checkout']);

    // Reviews & Comments (write)
    Route::post('/products/{slug}/reviews', [\App\Http\Controllers\Api\Product\ReviewController::class, 'store']);
    Route::post('/products/{slug}/comments', [\App\Http\Controllers\Api\Product\CommentController::class, 'store']);
    Route::delete('/reviews/{id}', [\App\Http\Controllers\Api\Product\ReviewController::class, 'destroy']);
    Route::delete('/comments/{id}', [\App\Http\Controllers\Api\Product\CommentController::class, 'destroy']);
    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\User\WishlistController::class, 'index']);
        Route::post('/toggle', [\App\Http\Controllers\Api\User\WishlistController::class, 'toggle']);
        Route::delete('/{product}', [\App\Http\Controllers\Api\User\WishlistController::class, 'destroy'])->whereNumber('product');
    });
    // Vouchers (apply)
    Route::post('/vouchers/apply', [\App\Http\Controllers\Api\Voucher\VoucherController::class, 'apply']);
});
// ============================================================
// ADMIN ROUTES
// ============================================================
// (debug ping removed)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Products
    Route::apiResource('products', \App\Http\Controllers\Api\Admin\ProductController::class);
    // Admin product images (separate controller)
    Route::get('/products/{product}/images', [\App\Http\Controllers\Api\Admin\ProductImageController::class, 'index']);
    Route::post('/products/{product}/images', [\App\Http\Controllers\Api\Admin\ProductImageController::class, 'store']);
    Route::delete('/products/{product}/images/{image}', [\App\Http\Controllers\Api\Admin\ProductImageController::class, 'destroy']);
    Route::patch('/products/{product}/images/{image}/primary', [\App\Http\Controllers\Api\Admin\ProductImageController::class, 'setPrimary']);
    Route::post('/products/{id}/restore', [\App\Http\Controllers\Api\Admin\ProductController::class, 'restore']);
    Route::patch('/products/{id}/status', [\App\Http\Controllers\Api\Admin\ProductController::class, 'status']);
    // Product Variants (nested)
    Route::get('/products/{product}/variants', [\App\Http\Controllers\Api\Admin\ProductVariantController::class, 'index']);
    Route::post('/products/{product}/variants', [\App\Http\Controllers\Api\Admin\ProductVariantController::class, 'store']);
    Route::get('/products/{product}/variants/{variant}', [\App\Http\Controllers\Api\Admin\ProductVariantController::class, 'show']);
    Route::put('/products/{product}/variants/{variant}', [\App\Http\Controllers\Api\Admin\ProductVariantController::class, 'update']);
    Route::patch('/products/{product}/variants/{variant}', [\App\Http\Controllers\Api\Admin\ProductVariantController::class, 'update']);
    Route::delete('/products/{product}/variants/{variant}', [\App\Http\Controllers\Api\Admin\ProductVariantController::class, 'destroy']);
    // Categories
    Route::apiResource('categories', \App\Http\Controllers\Api\Admin\CategoryController::class);
    // Brands
    Route::apiResource('brands', \App\Http\Controllers\Api\Admin\BrandController::class);
    // Orders
    Route::get('/orders', [\App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
    Route::get('/orders/{order_code}', [\App\Http\Controllers\Api\Admin\OrderController::class, 'show']);
    Route::patch('/orders/{order_code}/status', [\App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus']);
    // Users
    Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
    Route::post('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'store']);
    Route::get('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'show']);
    Route::put('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'update']);
    Route::delete('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
    Route::patch('/users/{user}/ban', [\App\Http\Controllers\Api\Admin\UserController::class, 'ban']);
    Route::patch('/users/{user}/unban', [\App\Http\Controllers\Api\Admin\UserController::class, 'unban']);
    // Vouchers
    Route::apiResource('vouchers', \App\Http\Controllers\Api\Admin\VoucherController::class);
    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'stats']);
    Route::get('/dashboard/revenue', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'revenue']);
});
