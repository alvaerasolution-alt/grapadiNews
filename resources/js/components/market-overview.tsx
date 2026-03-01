import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IHSGData {
    price: number;
    change: number;
    changePct: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    marketCap: number;
}

interface StockQuote {
    code: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
    volume: number;
    isUp: boolean;
}

interface MarketDataResponse {
    ihsg: IHSGData | null;
    stocks: StockQuote[];
    fetchedAt: string;
    isFallback?: boolean;
}

const PERIODS = [
    { label: '1H', range: '1d' },
    { label: '1D', range: '1d' },
    { label: '5D', range: '5d' },
    { label: '1M', range: '1mo' },
] as const;

function formatNumber(num: number): string {
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(vol: number): string {
    if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1).replace('.', ',') + ' B';
    if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1).replace('.', ',') + ' M';
    if (vol >= 1_000) return (vol / 1_000).toFixed(1).replace('.', ',') + ' K';
    return vol.toLocaleString('id-ID');
}

function formatMarketCap(cap: number): string {
    if (cap >= 1_000_000_000_000) return (cap / 1_000_000_000_000).toFixed(0).toLocaleString() + ' T';
    if (cap >= 1_000_000_000) return (cap / 1_000_000_000).toFixed(0).toLocaleString() + ' B';
    return cap.toLocaleString('id-ID');
}

// Shared fetch + cache for market data (used by both MarketOverview and MarketDashboard)
const cachedData: Record<string, MarketDataResponse> = {};
const fetchPromises: Record<string, Promise<MarketDataResponse>> = {};

export async function fetchMarketData(range: string = '1d'): Promise<MarketDataResponse> {
    // Return cached if we already fetched this range
    if (range in cachedData) return cachedData[range];
    // Deduplicate in-flight requests for same range
    if (range in fetchPromises) return fetchPromises[range];

    const promise = fetch(`/api/market-data?range=${range}`)
        .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch market data');
            return res.json();
        })
        .then((data: MarketDataResponse) => {
            cachedData[range] = data;
            delete fetchPromises[range];
            // Clear cache after 5 minutes so next call re-fetches
            setTimeout(() => { delete cachedData[range]; }, 5 * 60 * 1000);
            return data;
        })
        .catch((err) => {
            delete fetchPromises[range];
            throw err;
        });

    fetchPromises[range] = promise;
    return promise;
}

export default function MarketOverview() {
    const [activePeriod, setActivePeriod] = useState(1); // index into PERIODS
    const [ihsg, setIhsg] = useState<IHSGData | null>(null);
    const [stocks, setStocks] = useState<StockQuote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentRange = PERIODS[activePeriod].range;

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchMarketData(currentRange);
                setIhsg(data.ihsg);
                // Show top 6 stocks as "comparisons"
                setStocks(data.stocks.slice(0, 6));
            } catch {
                setError('Gagal memuat data market');
            } finally {
                setIsLoading(false);
            }
        };
        load();

        // Refresh every 5 minutes
        const interval = setInterval(() => {
            delete cachedData[currentRange];
            load();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [currentRange]);

    const isUp = ihsg ? ihsg.change >= 0 : true;

    return (
        <div className="flex flex-col rounded-xl border border-gray-800 bg-[#1A1A1A] overflow-hidden h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800/60 p-4">
                <h3 className="text-sm font-bold text-gray-100 lg:text-base">
                    Market Overview
                </h3>
                <div className="flex gap-1 rounded bg-black/40 p-1">
                    {PERIODS.map((p, idx) => (
                        <button
                            key={p.label}
                            onClick={() => setActivePeriod(idx)}
                            className={`rounded px-2 flex py-0.5 text-[10px] font-medium transition-colors ${activePeriod === idx
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* IHSG Data */}
            <div className="flex-1 p-4 flex flex-col gap-4">
                {isLoading ? (
                    <>
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
                        <div className="h-8 w-48 animate-pulse rounded bg-gray-700" />
                        <div className="grid grid-cols-2 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-5 animate-pulse rounded bg-gray-700/50" />
                            ))}
                        </div>
                    </>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-red-400">
                        {error}
                    </div>
                ) : ihsg ? (
                    <>
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-4 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span className="text-xs font-bold text-gray-200">IHSG Composite</span>
                            <span className="ml-auto rounded-full bg-green-500/20 px-1.5 py-0.5 text-[9px] font-medium text-green-400">LIVE</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold text-gray-100">{formatNumber(ihsg.price)}</span>
                            <span className={`text-sm font-semibold pb-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isUp ? '+' : ''}{formatNumber(ihsg.change)} ({isUp ? '+' : ''}{ihsg.changePct.toFixed(2)}%)
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Open</span>
                                <span className="font-medium text-gray-300">{formatNumber(ihsg.open)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">High</span>
                                <span className="font-medium text-emerald-500">{formatNumber(ihsg.high)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Low</span>
                                <span className="font-medium text-rose-500">{formatNumber(ihsg.low)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Close</span>
                                <span className="font-medium text-gray-300">{formatNumber(ihsg.price)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Volume</span>
                                <span className="font-medium text-gray-300">{formatVolume(ihsg.volume)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Prev Close</span>
                                <span className="font-medium text-gray-300">{formatNumber(ihsg.close)}</span>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Stock comparison list */}
            <div className="border-t border-gray-800/60 p-4">
                <div className="mb-3 flex items-center justify-between text-[10px] text-gray-500">
                    <span>Simbol Saham</span>
                    <span>Harga & Perubahan</span>
                </div>
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 animate-pulse rounded bg-gray-700/50" />
                        ))}
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {stocks.map((stock) => (
                            <li key={stock.code} className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-200">{stock.code}</span>
                                <div className="flex flex-col items-end">
                                    <span className={`text-sm font-bold ${stock.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {stock.price.toLocaleString('id-ID')}
                                    </span>
                                    <div className={`flex items-center gap-1 text-[10px] font-medium ${stock.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {stock.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        <span>{stock.isUp ? '+' : ''}{stock.changePct.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
