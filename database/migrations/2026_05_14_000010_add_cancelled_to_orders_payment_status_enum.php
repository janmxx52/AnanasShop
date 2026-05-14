<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("
            ALTER TABLE `orders`
            MODIFY `payment_status` ENUM('pending','paid','failed','cancelled','refunded')
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("
            UPDATE `orders`
            SET `payment_status` = 'failed'
            WHERE `payment_status` = 'cancelled'
        ");

        DB::statement("
            ALTER TABLE `orders`
            MODIFY `payment_status` ENUM('pending','paid','failed','refunded')
            NOT NULL DEFAULT 'pending'
        ");
    }
};

