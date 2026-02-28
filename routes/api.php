<?php

use App\Http\Controllers\MarketDataController;
use Illuminate\Support\Facades\Route;

Route::get('/market-data', [MarketDataController::class, 'index']);
