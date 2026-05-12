<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('CategorySeeder should not run in production.');
            return;
        }

        Category::factory()->count(8)->create();
    }
}
