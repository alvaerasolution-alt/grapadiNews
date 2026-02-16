<?php

namespace App\Http\Requests\Admin;

use App\Enums\BannerPosition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
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
        $imageRule = $this->isMethod('POST') ? 'required' : 'nullable';

        return [
            'title' => ['required', 'string', 'max:255'],
            'image' => [$imageRule, 'image', 'max:2048'],
            'url' => ['required', 'url', 'max:500'],
            'position' => ['required', Rule::enum(BannerPosition::class)],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul banner harus diisi.',
            'image.required' => 'Gambar banner harus diupload.',
            'image.image' => 'File harus berupa gambar.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
            'url.required' => 'URL link harus diisi.',
            'url.url' => 'URL harus berformat valid.',
            'position.required' => 'Posisi banner harus dipilih.',
            'ends_at.after_or_equal' => 'Tanggal berakhir harus setelah tanggal mulai.',
        ];
    }
}
