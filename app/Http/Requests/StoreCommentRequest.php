<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'body' => ['required', 'string', 'max:1000'],
        ];

        // Guest users must provide name and email
        if (! $this->user()) {
            $rules['guest_name'] = ['required', 'string', 'max:100'];
            $rules['guest_email'] = ['required', 'email', 'max:255'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'Komentar tidak boleh kosong.',
            'body.max' => 'Komentar maksimal 1000 karakter.',
            'guest_name.required' => 'Nama wajib diisi.',
            'guest_email.required' => 'Email wajib diisi.',
            'guest_email.email' => 'Format email tidak valid.',
        ];
    }
}
