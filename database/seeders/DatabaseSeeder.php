<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'customer.e2e@example.com'],
            [
                'name' => 'E2E Customer',
                'password' => 'Password1',
                'phone' => '0900000001',
                'role' => 'customer',
                'is_banned' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'E2E Admin',
                'password' => 'Password1',
                'phone' => '0900000002',
                'role' => 'admin',
                'is_banned' => false,
            ]
        );


        $seeders = [
            \Database\Seeders\AnanasCatalogSeeder::class,
        ];

        if (class_exists(\Database\Seeders\VoucherSeeder::class)) {
            $seeders[] = \Database\Seeders\VoucherSeeder::class;
        }

        $this->call($seeders);
    }
}
