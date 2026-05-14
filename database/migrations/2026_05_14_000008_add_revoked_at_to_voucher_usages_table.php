<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voucher_usages', function (Blueprint $table) {
            $table->timestamp('revoked_at')->nullable()->after('order_id');
            $table->index(['voucher_id', 'revoked_at']);
        });
    }

    public function down(): void
    {
        Schema::table('voucher_usages', function (Blueprint $table) {
            $table->dropIndex(['voucher_id', 'revoked_at']);
            $table->dropColumn('revoked_at');
        });
    }
};
