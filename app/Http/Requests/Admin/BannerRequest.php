<?php

namespace App\Http\Requests\Admin;

use App\Enums\BannerPosition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:2048'],
            'position' => ['required', Rule::enum(BannerPosition::class)],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];

        // If it's a create request, the image is required. On update, it's optional.
        if ($this->isMethod('POST')) {
            $rules['image'] = ['required', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'];
        } else {
            $rules['image'] = ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'];
        }

        return $rules;
    }
}
