<?php

namespace App\Exceptions;

use RuntimeException;

class CooldownActiveException extends RuntimeException
{
    public function __construct(int $remainingHours)
    {
        parent::__construct(
            "Anda harus menunggu {$remainingHours} jam lagi sebelum dapat mengajukan permintaan baru."
        );
    }
}
