<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductVariantStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'size' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'size:7'],
            'sku' => ['nullable', 'string', 'max:100'],
            'stock' => ['required', 'integer', 'min:0'],
            'price_adjustment' => ['nullable', 'numeric'],
        ];
    }
}
