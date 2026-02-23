<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $fillable = [
        'endpoint',
        'keys',
        'content_encoding',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'keys' => 'array',
        ];
    }
}
