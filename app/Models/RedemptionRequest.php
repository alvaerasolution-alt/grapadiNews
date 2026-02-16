<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\RedemptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RedemptionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'redemption_item_id',
        'point_cost',
        'rupiah_value',
        'payment_method',
        'bank_name',
        'account_number',
        'account_holder',
        'ewallet_provider',
        'ewallet_number',
        'ewallet_name',
        'status',
        'admin_note',
        'processed_by',
        'processed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment_method' => PaymentMethod::class,
            'status' => RedemptionStatus::class,
            'point_cost' => 'integer',
            'rupiah_value' => 'integer',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<RedemptionItem, $this>
     */
    public function redemptionItem(): BelongsTo
    {
        return $this->belongsTo(RedemptionItem::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
