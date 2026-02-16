<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RedemptionRequest extends FormRequest
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
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            // Bank transfer fields
            'bank_name' => ['required_if:payment_method,bank_transfer', 'nullable', 'string', 'max:100'],
            'account_number' => ['required_if:payment_method,bank_transfer', 'nullable', 'string', 'max:50'],
            'account_holder' => ['required_if:payment_method,bank_transfer', 'nullable', 'string', 'max:150'],
            // E-wallet fields
            'ewallet_provider' => ['required_if:payment_method,e_wallet', 'nullable', 'string', 'max:100'],
            'ewallet_number' => ['required_if:payment_method,e_wallet', 'nullable', 'string', 'max:20'],
            'ewallet_name' => ['required_if:payment_method,e_wallet', 'nullable', 'string', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'bank_name.required_if' => 'Nama bank harus diisi untuk metode transfer bank.',
            'account_number.required_if' => 'Nomor rekening harus diisi untuk metode transfer bank.',
            'account_holder.required_if' => 'Nama pemilik rekening harus diisi untuk metode transfer bank.',
            'ewallet_provider.required_if' => 'Penyedia e-wallet harus diisi untuk metode e-wallet.',
            'ewallet_number.required_if' => 'Nomor e-wallet harus diisi untuk metode e-wallet.',
            'ewallet_name.required_if' => 'Nama pemilik e-wallet harus diisi untuk metode e-wallet.',
        ];
    }
}
