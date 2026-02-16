import { useState } from 'react';
import { Facebook, Link2, MessageCircle, Check } from 'lucide-react';

interface SocialShareProps {
    url: string;
    title: string;
}

const XIcon = () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function SocialShare({ url, title }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: <Facebook className="h-4 w-4" />,
            bg: 'bg-[#1877F2] hover:bg-[#166FE5]',
        },
        {
            name: 'X',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            icon: <XIcon />,
            bg: 'bg-gray-700 hover:bg-gray-600',
        },
        {
            name: 'WhatsApp',
            href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            icon: <MessageCircle className="h-4 w-4" />,
            bg: 'bg-[#25D366] hover:bg-[#20BD5A]',
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">Share:</span>
            {shareLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors ${link.bg}`}
                    aria-label={`Share on ${link.name}`}
                >
                    {link.icon}
                </a>
            ))}
            <button
                onClick={handleCopy}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${copied
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                aria-label="Copy link"
            >
                {copied ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Link2 className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
