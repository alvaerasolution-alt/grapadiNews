<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RedemptionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'string', 'max:500'],
            'point_cost' => ['required', 'integer', 'min:1'],
            'rupiah_value' => ['required', 'integer', 'min:1000'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama item harus diisi.',
            'point_cost.required' => 'Biaya poin harus diisi.',
            'point_cost.min' => 'Biaya poin minimal 1.',
            'rupiah_value.required' => 'Nilai rupiah harus diisi.',
            'rupiah_value.min' => 'Nilai rupiah minimal Rp1.000.',
        ];
    }
}
