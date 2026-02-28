<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarketDataController extends Controller
{
    /**
     * Stock symbols to fetch (Yahoo Finance format).
     */
    private const STOCK_SYMBOLS = [
        'BBCA.JK',
        'TLKM.JK',
        'GOTO.JK',
        'BBRI.JK',
        'WIIM.JK',
        'ASII.JK',
        'UNVR.JK',
        'BMRI.JK',
        'ANTM.JK',
        'INDF.JK',
        'PGAS.JK',
        'KLBF.JK',
        'ICBP.JK',
        'SMGR.JK',
        'EXCL.JK',
        'ADRO.JK',
        'MDKA.JK',
        'BRIS.JK',
        'ACES.JK',
        'ESSA.JK',
        'CPIN.JK',
        'INKP.JK',
        'EMTK.JK',
        'MAPI.JK',
    ];

    /**
     * Full names for each stock code.
     */
    private const STOCK_NAMES = [
        'BBCA' => 'Bank Central Asia',
        'TLKM' => 'Telkom Indonesia',
        'GOTO' => 'GoTo Gojek Tokopedia',
        'BBRI' => 'Bank Rakyat Indonesia',
        'WIIM' => 'Wismilak Inti Makmur',
        'ASII' => 'Astra International',
        'UNVR' => 'Unilever Indonesia',
        'BMRI' => 'Bank Mandiri',
        'ANTM' => 'Aneka Tambang',
        'INDF' => 'Indofood Sukses Makmur',
        'PGAS' => 'Perusahaan Gas Negara',
        'KLBF' => 'Kalbe Farma',
        'ICBP' => 'Indofood CBP Sukses',
        'SMGR' => 'Semen Indonesia',
        'EXCL' => 'XL Axiata',
        'ADRO' => 'Adaro Energy',
        'MDKA' => 'Merdeka Copper Gold',
        'BRIS' => 'Bank Syariah Indonesia',
        'ACES' => 'Ace Hardware Indonesia',
        'ESSA' => 'Surya Esa Perkasa',
        'CPIN' => 'Charoen Pokphand',
        'INKP' => 'Indah Kiat Pulp',
        'EMTK' => 'Elang Mahkota Teknologi',
        'MAPI' => 'Mitra Adiperkasa',
    ];

    /**
     * Allowed ranges and their Yahoo Finance interval mapping.
     */
    private const RANGE_MAP = [
        '1d'  => '1d',
        '5d'  => '1d',
        '1mo' => '1d',
        '3mo' => '1wk',
    ];

    /**
     * GET /api/market-data?range=1d
     *
     * Returns IHSG composite data + individual stock quotes.
     * Cached for 5 minutes per range.
     */
    public function index()
    {
        $range = request()->get('range', '1d');
        if (!array_key_exists($range, self::RANGE_MAP)) {
            $range = '1d';
        }
        $interval = self::RANGE_MAP[$range];

        $data = Cache::remember("market_data_{$range}", 300, function () use ($range, $interval) {
            return $this->fetchAllMarketData($range, $interval);
        });

        return response()->json($data);
    }

    /**
     * Fetch IHSG + all stocks from Yahoo Finance v8 chart API.
     * Uses Http::pool for parallel requests.
     */
    private function fetchAllMarketData(string $range = '1d', string $interval = '1d'): array
    {
        $allSymbols = array_merge(['^JKSE'], self::STOCK_SYMBOLS);

        try {
            // Parallel requests using Http::pool
            $responses = Http::pool(function ($pool) use ($allSymbols, $range, $interval) {
                foreach ($allSymbols as $symbol) {
                    $pool->as($symbol)
                        ->timeout(15)
                        ->withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ])
                        ->get('https://query2.finance.yahoo.com/v8/finance/chart/' . rawurlencode($symbol), [
                            'interval' => $interval,
                            'range' => $range,
                        ]);
                }
            });

            $ihsg = null;
            $stocks = [];

            foreach ($allSymbols as $symbol) {
                $response = $responses[$symbol] ?? null;

                if (!$response || !$response->successful()) {
                    Log::warning("Failed to fetch data for {$symbol}");
                    continue;
                }

                $json = $response->json();
                $result = $json['chart']['result'][0] ?? null;

                if (!$result) continue;

                $meta = $result['meta'] ?? [];
                $quote = $result['indicators']['quote'][0] ?? [];

                $metaVolume = $meta['regularMarketVolume'] ?? 0;
                $quoteVolume = $quote['volume'][0] ?? 0;

                if ($symbol === '^JKSE') {
                    $ihsg = [
                        'price' => $meta['regularMarketPrice'] ?? 0,
                        'change' => ($meta['regularMarketPrice'] ?? 0) - ($meta['chartPreviousClose'] ?? 0),
                        'changePct' => $meta['chartPreviousClose']
                            ? round((($meta['regularMarketPrice'] - $meta['chartPreviousClose']) / $meta['chartPreviousClose']) * 100, 2)
                            : 0,
                        'open' => $quote['open'][0] ?? ($meta['regularMarketPrice'] ?? 0),
                        'high' => $meta['regularMarketDayHigh'] ?? ($quote['high'][0] ?? 0),
                        'low' => $meta['regularMarketDayLow'] ?? ($quote['low'][0] ?? 0),
                        'close' => $meta['chartPreviousClose'] ?? 0,
                        'volume' => $metaVolume > 0 ? $metaVolume : $quoteVolume,
                    ];
                } else {
                    $code = str_replace('.JK', '', $symbol);
                    $price = $meta['regularMarketPrice'] ?? 0;
                    $prevClose = $meta['chartPreviousClose'] ?? 0;
                    $change = $price - $prevClose;
                    $changePct = $prevClose > 0 ? round(($change / $prevClose) * 100, 2) : 0;

                    $stocks[] = [
                        'code' => $code,
                        'name' => self::STOCK_NAMES[$code] ?? ($meta['shortName'] ?? $code),
                        'price' => $price,
                        'change' => round($change, 2),
                        'changePct' => $changePct,
                        'volume' => $meta['regularMarketVolume'] ?? ($quote['volume'][0] ?? 0),
                        'isUp' => $change >= 0,
                    ];
                }
            }

            // If we got at least some data, return it
            if ($ihsg || count($stocks) > 0) {
                return [
                    'ihsg' => $ihsg,
                    'stocks' => $stocks,
                    'fetchedAt' => now()->toIso8601String(),
                ];
            }

            return $this->fallbackData();
        } catch (\Exception $e) {
            Log::error('Failed to fetch market data from Yahoo Finance', [
                'error' => $e->getMessage(),
            ]);
            return $this->fallbackData();
        }
    }

    /**
     * Fallback static data when API is unavailable.
     */
    private function fallbackData(): array
    {
        return [
            'ihsg' => [
                'price' => 7255.42,
                'change' => 85.31,
                'changePct' => 1.19,
                'open' => 7170.11,
                'high' => 7280.54,
                'low' => 7155.20,
                'close' => 7255.42,
                'volume' => 12500000,
                'marketCap' => 0,
            ],
            'stocks' => [
                ['code' => 'BBCA', 'name' => 'Bank Central Asia', 'price' => 9225, 'change' => -38, 'changePct' => -0.41, 'volume' => 28500000, 'isUp' => false],
                ['code' => 'TLKM', 'name' => 'Telkom Indonesia', 'price' => 3840, 'change' => 23, 'changePct' => 0.60, 'volume' => 42100000, 'isUp' => true],
                ['code' => 'GOTO', 'name' => 'GoTo Gojek Tokopedia', 'price' => 82, 'change' => 2, 'changePct' => 2.50, 'volume' => 1200000000, 'isUp' => true],
                ['code' => 'BBRI', 'name' => 'Bank Rakyat Indonesia', 'price' => 4750, 'change' => 50, 'changePct' => 1.06, 'volume' => 65300000, 'isUp' => true],
                ['code' => 'WIIM', 'name' => 'Wismilak Inti Makmur', 'price' => 840, 'change' => 8, 'changePct' => 0.96, 'volume' => 3200000, 'isUp' => true],
                ['code' => 'ASII', 'name' => 'Astra International', 'price' => 5100, 'change' => -25, 'changePct' => -0.49, 'volume' => 18700000, 'isUp' => false],
                ['code' => 'UNVR', 'name' => 'Unilever Indonesia', 'price' => 2960, 'change' => 10, 'changePct' => 0.34, 'volume' => 8400000, 'isUp' => true],
                ['code' => 'BMRI', 'name' => 'Bank Mandiri', 'price' => 6375, 'change' => -50, 'changePct' => -0.78, 'volume' => 22100000, 'isUp' => false],
                ['code' => 'ANTM', 'name' => 'Aneka Tambang', 'price' => 1785, 'change' => 15, 'changePct' => 0.85, 'volume' => 55200000, 'isUp' => true],
                ['code' => 'INDF', 'name' => 'Indofood Sukses Makmur', 'price' => 6800, 'change' => -75, 'changePct' => -1.09, 'volume' => 9800000, 'isUp' => false],
                ['code' => 'PGAS', 'name' => 'Perusahaan Gas Negara', 'price' => 1520, 'change' => 20, 'changePct' => 1.33, 'volume' => 31400000, 'isUp' => true],
                ['code' => 'KLBF', 'name' => 'Kalbe Farma', 'price' => 1640, 'change' => 5, 'changePct' => 0.31, 'volume' => 14600000, 'isUp' => true],
            ],
            'fetchedAt' => now()->toIso8601String(),
            'isFallback' => true,
        ];
    }
}
