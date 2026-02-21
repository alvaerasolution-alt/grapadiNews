import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';

export default function Disclaimer() {
    const { webSettings } = usePage().props as any;

    return (
        <PublicLayout>
            <Head title="Disclaimer" />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-[#1A1A1A] rounded-2xl p-8 md:p-12 border border-gray-800 shadow-xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-amber-400 border-b border-gray-800 pb-4">
                        Disclaimer
                    </h1>

                    <div
                        className="space-y-6 text-gray-300 leading-relaxed md:text-lg prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: webSettings?.disclaimer || '<p>Konten belum tersedia.</p>'
                        }}
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
