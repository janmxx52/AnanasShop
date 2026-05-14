<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdminProductVariantUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'size' => ['sometimes', 'required', 'string', 'max:50'],
            'color' => ['sometimes', 'required', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'size:7'],
            'sku' => ['nullable', 'string', 'max:100'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'price_adjustment' => ['nullable', 'numeric'],
        ];
    }
}
