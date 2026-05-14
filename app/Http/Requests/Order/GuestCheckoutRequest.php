<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class GuestCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'payment_method' => ['sometimes', 'string', 'in:cod'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
