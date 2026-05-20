<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardAnalyticsResource;
use App\Http\Resources\Admin\DashboardStatsResource;
use App\Services\Dashboard\DashboardAnalyticsService;
use App\Services\Dashboard\DashboardStatsService;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private DashboardStatsService $dashboardStatsService,
        private DashboardAnalyticsService $dashboardAnalyticsService,
    ) {
    }

    public function analytics()
    {
        $analytics = $this->dashboardAnalyticsService->getAnalytics();

        return $this->success(
            (new DashboardAnalyticsResource($analytics))->resolve(),
            'Lấy dữ liệu phân tích dashboard thành công.'
        );
    }

    public function stats()
    {
        $stats = $this->dashboardStatsService->getStats();

        return $this->success((new DashboardStatsResource($stats))->resolve(), 'Lấy số liệu tổng quan thành công.');
    }

    public function revenue()
    {
        return $this->notImplemented();
    }
}
