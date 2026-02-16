<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerClickController extends Controller
{
    public function __invoke(Banner $banner): JsonResponse
    {
        $banner->increment('click_count');

        return response()->json(['redirect' => $banner->url]);
    }
}
