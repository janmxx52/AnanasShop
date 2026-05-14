<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Services\Cloudinary\CloudinaryService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(CloudinaryService::class, function () {
            return new CloudinaryService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register route middleware aliases used by routes/api.php
        $router = $this->app->make(\Illuminate\Routing\Router::class);
        $router->aliasMiddleware('role', \App\Http\Middleware\EnsureUserRole::class);
    }
}
