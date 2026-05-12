<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('BrandSeeder should not run in production.');
            return;
        }

        Brand::factory()->count(12)->create();
    }
}
