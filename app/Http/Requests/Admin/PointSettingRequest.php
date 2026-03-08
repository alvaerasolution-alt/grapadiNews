<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PointSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'publish_points_enabled' => ['required', 'boolean'],
            'points_per_publish' => ['required', 'integer', 'min:0', 'max:1000'],
            'view_points_enabled' => ['required', 'boolean'],
            'views_per_point' => ['required', 'integer', 'min:1', 'max:1000000'],
            'max_points_per_article' => ['required', 'integer', 'min:1', 'max:1000'],
            'rupiah_per_point' => ['required', 'integer', 'min:0', 'max:10000000'],
            'max_pending_requests' => ['required', 'integer', 'min:1', 'max:10'],
            'redemption_cooldown_hours' => ['required', 'integer', 'min:0', 'max:720'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'points_per_publish.min' => 'Poin per publish tidak boleh negatif.',
            'views_per_point.min' => 'Views per poin minimal 1.',
            'max_points_per_article.min' => 'Maksimum poin per artikel minimal 1.',
            'rupiah_per_point.min' => 'Nilai rupiah per poin tidak boleh negatif.',
            'max_pending_requests.min' => 'Maksimum pending request minimal 1.',
            'redemption_cooldown_hours.min' => 'Cooldown tidak boleh negatif.',
        ];
    }
}
