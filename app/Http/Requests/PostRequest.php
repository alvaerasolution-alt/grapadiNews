<?php

namespace App\Http\Requests;

use App\Enums\PostStatus;
use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowedStatuses = [PostStatus::Draft->value, PostStatus::Pending->value];

        if ($this->user()->hasRole('admin')) {
            $allowedStatuses = array_column(PostStatus::cases(), 'value');
        }

        return [
            'title' => ['required', 'string', 'max:255', $this->reservedSlugRule()],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'category_id' => ['required', 'exists:categories,id'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
            'status' => ['required', Rule::in($allowedStatuses)],
            'meta_title' => ['nullable', 'string', 'max:60'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.not_reserved_slug' => 'This title generates a URL that conflicts with system routes. Please choose a different title.',
        ];
    }

    /**
     * Validation rule to prevent titles that generate reserved slugs.
     */
    protected function reservedSlugRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            $slug = Str::slug($value);

            if (Post::isReservedSlug($slug)) {
                $fail('title.not_reserved_slug');
            }
        };
    }
}
