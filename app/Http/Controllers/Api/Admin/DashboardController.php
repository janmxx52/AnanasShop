<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardStatsResource;
use App\Services\Dashboard\DashboardStatsService;

class DashboardController extends Controller
{
    public function __construct(private DashboardStatsService $dashboardStatsService)
    {
    }

    public function stats()
    {
        $stats = $this->dashboardStatsService->getStats();

        return response()->json([
            'success' => true,
            'data' => (new DashboardStatsResource($stats))->resolve(),
        ]);
    }
}
