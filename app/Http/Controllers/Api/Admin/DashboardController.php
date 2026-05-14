<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardStatsResource;
use App\Services\Dashboard\DashboardStatsService;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(private DashboardStatsService $dashboardStatsService)
    {
    }

    public function stats()
    {
        $stats = $this->dashboardStatsService->getStats();

        return $this->success((new DashboardStatsResource($stats))->resolve(), 'Dashboard stats fetched');
    }

    public function revenue()
    {
        return $this->notImplemented();
    }
}
