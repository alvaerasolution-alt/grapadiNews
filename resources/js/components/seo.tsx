import { Head, usePage } from '@inertiajs/react';

interface SeoProps {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    canonicalUrl?: string;
    jsonLd?: Record<string, unknown>;
    noIndex?: boolean;
}

export default function Seo({
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    ogUrl,
    twitterCard = 'summary_large_image',
    canonicalUrl,
    jsonLd,
    noIndex = false,
}: SeoProps) {
    const { name, appUrl } = usePage().props as { name: string; appUrl?: string };
    const siteTitle = title ? `${title} | ${name}` : String(name);
    const resolvedOgTitle = ogTitle ?? title ?? String(name);
    const resolvedOgDescription = ogDescription ?? description;

    // Ensure og:image is always an absolute URL (required by WhatsApp/social media)
    const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const resolvedOgImage = ogImage
        ? ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
        : undefined;
    const resolvedOgUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : undefined);

    return (
        <Head title={title}>
            {description && (
                <meta
                    name="description"
                    content={description}
                    head-key="description"
                />
            )}
            {noIndex && (
                <meta
                    name="robots"
                    content="noindex, nofollow"
                    head-key="robots"
                />
            )}
            {canonicalUrl && (
                <link
                    rel="canonical"
                    href={canonicalUrl}
                    head-key="canonical"
                />
            )}

            {/* Open Graph */}
            <meta
                property="og:title"
                content={resolvedOgTitle}
                head-key="og:title"
            />
            {resolvedOgDescription && (
                <meta
                    property="og:description"
                    content={resolvedOgDescription}
                    head-key="og:description"
                />
            )}
            <meta property="og:type" content={ogType} head-key="og:type" />
            {resolvedOgUrl && (
                <meta
                    property="og:url"
                    content={resolvedOgUrl}
                    head-key="og:url"
                />
            )}
            {resolvedOgImage && (
                <>
                    <meta
                        property="og:image"
                        content={resolvedOgImage}
                        head-key="og:image"
                    />
                    <meta
                        property="og:image:width"
                        content="1200"
                        head-key="og:image:width"
                    />
                    <meta
                        property="og:image:height"
                        content="630"
                        head-key="og:image:height"
                    />
                </>
            )}
            <meta
                property="og:site_name"
                content={String(name)}
                head-key="og:site_name"
            />

            {/* Twitter Card */}
            <meta
                name="twitter:card"
                content={twitterCard}
                head-key="twitter:card"
            />
            <meta
                name="twitter:title"
                content={resolvedOgTitle}
                head-key="twitter:title"
            />
            {resolvedOgDescription && (
                <meta
                    name="twitter:description"
                    content={resolvedOgDescription}
                    head-key="twitter:description"
                />
            )}
            {resolvedOgImage && (
                <meta
                    name="twitter:image"
                    content={resolvedOgImage}
                    head-key="twitter:image"
                />
            )}

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    head-key="json-ld"
                />
            )}
        </Head>
    );
}

/**
 * Generate JSON-LD structured data for a BlogPosting.
 */
export function createBlogPostingJsonLd({
    title,
    description,
    url,
    image,
    authorName,
    publishedAt,
    updatedAt,
    siteName,
}: {
    title: string;
    description?: string;
    url: string;
    image?: string;
    authorName: string;
    publishedAt: string;
    updatedAt?: string;
    siteName: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        ...(description && { description }),
        ...(image && { image }),
        url,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: siteName,
        },
        datePublished: publishedAt,
        ...(updatedAt && { dateModified: updatedAt }),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };
}

/**
 * Generate JSON-LD structured data for the WebSite (homepage).
 */
export function createWebSiteJsonLd({
    name,
    url,
    description,
}: {
    name: string;
    url: string;
    description?: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        ...(description && { description }),
    };
}
