<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientPointsException extends RuntimeException
{
    public function __construct(int $required, int $available)
    {
        parent::__construct(
            "Poin tidak cukup. Dibutuhkan {$required} poin, tersedia {$available} poin."
        );
    }
}
