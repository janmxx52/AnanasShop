<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id', 'user_id', 'guest_token', 'order_id',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
