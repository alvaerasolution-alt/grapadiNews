<?php

namespace App\Enums;

enum PointType: string
{
    case Publish = 'publish';
    case Views = 'views';
    case Redemption = 'redemption';
    case Refund = 'refund';
}
