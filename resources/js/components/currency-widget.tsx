import { useEffect, useRef, useState } from 'react';
import { TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';

interface CurrencyRate {
    code: string;
    name: string;
    flag: string;
    rate: number;
    previousRate: number | null;
    change: number | null;
    changePct: number | null;
}

const CURRENCIES = [
    { code: 'USD', name: 'Dolar AS', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'JPY', name: 'Yen Jepang', flag: '🇯🇵' },
    { code: 'SGD', name: 'Dolar Singapura', flag: '🇸🇬' },
    { code: 'MYR', name: 'Ringgit Malaysia', flag: '🇲🇾' },
    { code: 'GBP', name: 'Poundsterling', flag: '🇬🇧' },
    { code: 'CNY', name: 'Yuan China', flag: '🇨🇳' },
    { code: 'AUD', name: 'Dolar Australia', flag: '🇦🇺' },
];

async function fetchRates(): Promise<Record<string, number>> {
    // Frankfurter API: base IDR, get all our target currencies
    // This gives us how many IDR per 1 target currency
    const symbols = CURRENCIES.map((c) => c.code).join(',');
    const res = await fetch(
        `https://api.frankfurter.app/latest?from=IDR&to=${symbols}`,
    );
    if (!res.ok) throw new Error('Failed to fetch rates');
    const data = await res.json();
    return data.rates;
}

export default function CurrencyWidget() {
    const [rates, setRates] = useState<CurrencyRate[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const prevRatesRef = useRef<Record<string, number> | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number | null>(null);
    const posRef = useRef(0);

    const loadRates = async () => {
        try {
            setError(null);
            const current = await fetchRates();

            const mapped: CurrencyRate[] = CURRENCIES.map((currency) => {
                // Frankfurter returns rates relative to IDR base
                // e.g. from IDR: USD = 0.0000623 means 1 IDR = 0.0000623 USD → 1 USD = 16057 IDR
                const currentRate = current[currency.code];
                const prevRate = prevRatesRef.current?.[currency.code] ?? null;

                // IDR per 1 foreign currency
                const idrPerUnit = 1 / currentRate;
                const prevIdrPerUnit =
                    prevRate !== null ? 1 / prevRate : null;

                const change =
                    prevIdrPerUnit !== null
                        ? idrPerUnit - prevIdrPerUnit
                        : null;
                const changePct =
                    prevIdrPerUnit !== null && prevIdrPerUnit !== 0
                        ? ((idrPerUnit - prevIdrPerUnit) / prevIdrPerUnit) *
                        100
                        : null;

                return {
                    code: currency.code,
                    name: currency.name,
                    flag: currency.flag,
                    rate: idrPerUnit,
                    previousRate: prevIdrPerUnit,
                    change,
                    changePct,
                };
            });

            // Store current rates for change comparison on next refresh
            prevRatesRef.current = current;

            setRates(mapped);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Gagal memuat data kurs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRates();
        const interval = setInterval(loadRates, 10 * 60 * 1000); // refresh every 10 min
        return () => clearInterval(interval);
    }, []);

    // Smooth infinite scroll ticker animation
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || rates.length === 0) return;

        let speed = 0.6; // px per frame

        const animate = () => {
            posRef.current += speed;
            // Reset when we've scrolled half (since content is doubled)
            const halfWidth = el.scrollWidth / 2;
            if (posRef.current >= halfWidth) {
                posRef.current = 0;
            }
            el.scrollLeft = posRef.current;
            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);

        // Pause on hover
        const pause = () => {
            speed = 0;
        };
        const resume = () => {
            speed = 0.6;
        };
        el.addEventListener('mouseenter', pause);
        el.addEventListener('mouseleave', resume);

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            el.removeEventListener('mouseenter', pause);
            el.removeEventListener('mouseleave', resume);
        };
    }, [rates]);

    const RateCard = ({ rate }: { rate: CurrencyRate }) => {
        const isUp = rate.change !== null ? rate.change > 0 : null;
        const isDown = rate.change !== null ? rate.change < 0 : null;

        return (
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm transition-all hover:border-amber-500/30 hover:bg-white/8">
                <span className="text-xl">{rate.flag}</span>
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold text-amber-400">
                            {rate.code}
                        </span>
                        <span className="text-sm font-bold text-white">
                            Rp {rate.rate.toLocaleString('id-ID', {
                                minimumFractionDigits: rate.rate >= 1000 ? 0 : 2,
                                maximumFractionDigits: rate.rate >= 1000 ? 0 : 2,
                            })}
                        </span>
                    </div>
                    {rate.changePct !== null ? (
                        <div
                            className={`flex items-center gap-0.5 text-xs ${isUp
                                ? 'text-green-400'
                                : isDown
                                    ? 'text-red-400'
                                    : 'text-gray-400'
                                }`}
                        >
                            {isUp ? (
                                <TrendingUp className="size-3" />
                            ) : isDown ? (
                                <TrendingDown className="size-3" />
                            ) : null}
                            <span>
                                {rate.changePct > 0 ? '+' : ''}
                                {rate.changePct.toFixed(2)}%
                            </span>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">{rate.name}</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="border-t border-white/10 bg-gradient-to-b from-[#0D0D0D] to-[#111111] py-6">
            <div className="mx-auto max-w-7xl px-4">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-amber-600/20">
                            <span className="text-base">💱</span>
                        </div>
                        <h2 className="text-sm font-bold text-white">
                            Kurs Valuta Asing
                        </h2>
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                            LIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {lastUpdated && (
                            <span>
                                {lastUpdated.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        )}
                        <button
                            onClick={loadRates}
                            className="rounded-md p-1 text-gray-500 transition hover:bg-white/10 hover:text-amber-400"
                            title="Refresh kurs"
                        >
                            <RefreshCw className="size-3.5" />
                        </button>
                    </div>
                </div>

                {/* Ticker */}
                {isLoading ? (
                    <div className="flex gap-3 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-14 w-44 shrink-0 animate-pulse rounded-xl bg-white/5"
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-3 overflow-hidden"
                        style={{ cursor: 'default' }}
                    >
                        {/* Duplicate content for seamless infinite scroll */}
                        {[...rates, ...rates].map((rate, idx) => (
                            <RateCard key={`${rate.code}-${idx}`} rate={rate} />
                        ))}
                    </div>
                )}

                {/* Source attribution */}
                <p className="mt-3 text-right text-xs text-gray-600">
                    Sumber: European Central Bank (ECB) via Frankfurter.app •
                    Update setiap 10 menit
                </p>
            </div>
        </section>
    );
}
