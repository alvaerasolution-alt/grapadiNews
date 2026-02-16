<?php

namespace App\Exceptions;

use RuntimeException;

class MaxPendingRequestsException extends RuntimeException
{
    public function __construct(int $maxPending)
    {
        parent::__construct(
            "Anda sudah memiliki {$maxPending} permintaan yang belum diproses. Silakan tunggu hingga permintaan sebelumnya selesai."
        );
    }
}
