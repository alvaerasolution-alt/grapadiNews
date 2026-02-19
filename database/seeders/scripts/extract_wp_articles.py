#!/usr/bin/env python3
"""
Extract WordPress articles from gra_posts SQL dump.
Outputs a JSON file ready for Laravel seeder import.
Cleans HTML: removes WP shortcodes, fixes hyperlinks, strips inline styles.
"""

import re
import json
import sys
import html
from datetime import datetime

SQL_FILE = '/home/raka/dev/grapadiNews/grapadik_grapadinewscoid.sql'
OUTPUT_FILE = '/home/raka/dev/grapadiNews/database/seeders/data/wp_articles.json'

# Categories and their keyword matching rules
CATEGORY_KEYWORDS = {
    'Market': ['saham', 'bursa', 'ihsg', 'pasar modal', 'investor', 'investasi', 'obligasi', 'reksadana', 'trading', 'emiten', 'dividen', 'idx', 'bei', 'ipo'],
    'Bisnis': ['bisnis', 'perusahaan', 'ceo', 'startup', 'umkm', 'usaha', 'industri', 'perdagangan', 'ekspor', 'impor', 'manufaktur', 'retail', 'brand', 'produk', 'pelaku usaha', 'wirausaha'],
    'Finansial': ['bank', 'keuangan', 'kredit', 'fintech', 'rupiah', 'inflasi', 'bi ', 'ojk', 'asuransi', 'pajak', 'anggaran', 'apbn', 'fiskal', 'moneter', 'suku bunga', 'ekonomi'],
    'Tech': ['teknologi', 'digital', 'internet', 'aplikasi', 'smartphone', 'gadget', 'ai ', 'artificial', 'robot', 'komputer', 'software', 'hardware', 'google', 'apple', 'microsoft', 'samsung', 'inovasi', 'cyber', 'data', 'cloud', 'programming', 'coding'],
    'Insight': ['analisis', 'riset', 'studi', 'survei', 'laporan', 'penelitian', 'tren', 'prediksi', 'outlook', 'review', 'kajian'],
    'Lifestyle': ['lifestyle', 'gaya hidup', 'travel', 'wisata', 'kuliner', 'fashion', 'kesehatan', 'health', 'food', 'resep', 'hotel', 'destinasi', 'liburan', 'olahraga', 'sport', 'hiburan', 'musik', 'film', 'seni', 'budaya', 'ramadan', 'lebaran', 'natal', 'tahun baru'],
    'Opini': ['opini', 'kolom', 'editorial', 'pendapat', 'pandangan', 'esai', 'kritik', 'gagasan'],
}


def clean_html(content):
    """Clean WordPress HTML content."""
    if not content:
        return ''

    text = content

    # Unescape HTML entities that might be double-escaped
    text = text.replace('\\r\\n', '\n')
    text = text.replace('\\n', '\n')
    text = text.replace('\\t', '\t')
    text = text.replace("\\'", "'")
    text = text.replace('\\"', '"')

    # Remove WordPress shortcodes: [shortcode ...], [/shortcode]
    text = re.sub(r'\[/?[a-zA-Z_][a-zA-Z0-9_]*(?:\s[^\]]*?)?\]', '', text)

    # Remove inline styles
    text = re.sub(r'\s*style\s*=\s*"[^"]*"', '', text, flags=re.IGNORECASE)
    text = re.sub(r"\s*style\s*=\s*'[^']*'", '', text, flags=re.IGNORECASE)

    # Remove WordPress-specific classes
    text = re.sub(r'\s*class\s*=\s*"[^"]*wp-[^"]*"', '', text, flags=re.IGNORECASE)

    # Remove empty paragraphs and multiple &nbsp;
    text = re.sub(r'<p>\s*&nbsp;\s*</p>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<p>\s*</p>', '', text, flags=re.IGNORECASE)
    text = text.replace('&nbsp;', ' ')

    # Clean up hyperlinks - remove broken/empty links
    text = re.sub(r'<a\s[^>]*href\s*=\s*["\']?\s*["\']?[^>]*>\s*</a>', '', text, flags=re.IGNORECASE)
    # Remove links pointing to old WordPress URLs, keep the text
    text = re.sub(r'<a\s[^>]*href\s*=\s*["\']https?://grapadinews\.co\.id/wp-content/[^"\']*["\'][^>]*>(.*?)</a>', r'\1', text, flags=re.IGNORECASE | re.DOTALL)
    # Clean up remaining hyperlinks - ensure proper format
    def clean_link(match):
        attrs = match.group(1)
        inner = match.group(2)
        href_match = re.search(r'href\s*=\s*["\']([^"\']+)["\']', attrs, re.IGNORECASE)
        if not href_match:
            return inner  # No href, just return inner text
        href = href_match.group(1)
        # Skip empty or hash-only links
        if not href or href == '#' or href.strip() == '':
            return inner
        # Remove tracking parameters
        href = re.sub(r'[?&]utm_[^&]*', '', href)
        href = re.sub(r'\?$', '', href)  # Remove trailing ?
        return f'<a href="{href}" target="_blank" rel="noopener noreferrer">{inner}</a>'

    text = re.sub(r'<a\s([^>]*)>(.*?)</a>', clean_link, text, flags=re.IGNORECASE | re.DOTALL)

    # Remove WordPress caption divs
    text = re.sub(r'<div[^>]*class="[^"]*wp-caption[^"]*"[^>]*>.*?</div>', '', text, flags=re.IGNORECASE | re.DOTALL)

    # Remove empty divs
    text = re.sub(r'<div[^>]*>\s*</div>', '', text, flags=re.IGNORECASE)

    # Remove consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Fix images - keep src, remove WordPress-specific attrs
    def clean_img(match):
        attrs = match.group(0)
        src_match = re.search(r'src\s*=\s*["\']([^"\']+)["\']', attrs, re.IGNORECASE)
        alt_match = re.search(r'alt\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        if not src_match:
            return ''
        src = src_match.group(1)
        alt = alt_match.group(1) if alt_match else ''
        return f'<img src="{src}" alt="{alt}" loading="lazy" />'

    text = re.sub(r'<img\s[^>]*/?>', clean_img, text, flags=re.IGNORECASE)

    # Remove remaining WordPress-specific elements
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)

    # Clean up excessive whitespace
    text = text.strip()

    return text


def generate_excerpt(body, max_length=200):
    """Generate excerpt from body by stripping HTML tags."""
    text = re.sub(r'<[^>]+>', '', body)
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > max_length:
        text = text[:max_length].rsplit(' ', 1)[0] + '...'
    return text


def assign_category(title, content):
    """Assign category based on keyword matching in title and content."""
    combined = (title + ' ' + content[:500]).lower()

    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            # Title matches count double
            if keyword in title.lower():
                score += 2
            if keyword in combined:
                score += 1
        if score > 0:
            scores[cat] = score

    if scores:
        return max(scores, key=scores.get)

    # Default to "Insight" for general articles
    return 'Insight'


def slugify(text):
    """Generate URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    text = text.strip('-')
    return text[:200]  # limit slug length


def parse_sql_value(val):
    """Parse a single SQL value, handling escaping."""
    if val is None:
        return None
    val = val.replace("\\'", "'")
    val = val.replace('\\"', '"')
    val = val.replace('\\\\', '\\')
    return val


def extract_posts():
    """Extract posts from gra_posts SQL INSERT statements."""
    print("Reading SQL file...")
    with open(SQL_FILE, 'r', errors='replace') as f:
        content = f.read()

    # Find all INSERT INTO gra_posts blocks
    # The INSERT format is:
    # INSERT INTO `gra_posts` (...columns...) VALUES
    # (id, author, date, date_gmt, content, title, excerpt, status, ..., post_type, mime, comment_count),
    # (next row),
    # ...;

    # We need to find the gra_posts INSERT blocks and parse individual row tuples
    print("Extracting gra_posts INSERT blocks...")

    # Find all INSERT INTO gra_posts sections
    insert_pattern = r"INSERT INTO `gra_posts` \([^)]+\) VALUES\s*\n(.*?);\s*\n"
    blocks = re.findall(insert_pattern, content, re.DOTALL)

    print(f"Found {len(blocks)} INSERT blocks")

    articles = []
    seen_slugs = set()

    for block in blocks:
        # Parse each row tuple from the VALUES block
        # This is tricky because content can contain parentheses.
        # We'll use a state machine approach.
        rows = parse_values_block(block)

        for row in rows:
            if len(row) < 23:
                continue

            post_id = row[0]
            post_author = row[1]
            post_date = row[2]
            post_content = row[4]
            post_title = row[5]
            post_excerpt = row[6]
            post_status = row[7]
            post_name = row[11]  # slug
            post_type = row[20]

            # Only process actual articles that are published
            if post_type != 'post':
                continue
            if post_status not in ('publish', 'draft'):
                continue

            # Clean HTML
            clean_body = clean_html(post_content)
            clean_title = html.unescape(parse_sql_value(post_title)).strip()

            # Skip very short or empty content
            if len(clean_body) < 50:
                continue

            # Generate excerpt
            raw_excerpt = parse_sql_value(post_excerpt)
            if raw_excerpt and len(raw_excerpt.strip()) > 10:
                excerpt = re.sub(r'<[^>]+>', '', raw_excerpt).strip()[:300]
            else:
                excerpt = generate_excerpt(clean_body)

            # Generate slug
            slug = parse_sql_value(post_name)
            if not slug:
                slug = slugify(clean_title)

            # Ensure unique slug
            original_slug = slug
            counter = 1
            while slug in seen_slugs:
                slug = f"{original_slug}-{counter}"
                counter += 1
            seen_slugs.add(slug)

            # Assign category
            category = assign_category(clean_title, clean_body)

            # Parse date
            try:
                published_at = post_date if post_date != '0000-00-00 00:00:00' else None
            except:
                published_at = None

            status = 'published' if post_status == 'publish' else 'draft'

            articles.append({
                'wp_id': int(post_id) if post_id.isdigit() else 0,
                'title': clean_title,
                'slug': slug,
                'excerpt': excerpt,
                'body': clean_body,
                'category': category,
                'status': status,
                'published_at': published_at,
                'view_count': 0,
            })

    return articles


def parse_values_block(block):
    """Parse a VALUES block into individual row tuples using a state machine."""
    rows = []
    current_row = []
    current_value = ''
    in_string = False
    escape_next = False
    depth = 0
    i = 0

    while i < len(block):
        ch = block[i]

        if escape_next:
            current_value += ch
            escape_next = False
            i += 1
            continue

        if ch == '\\':
            current_value += ch
            escape_next = True
            i += 1
            continue

        if in_string:
            if ch == "'":
                # Check for ''  (escaped quote in SQL)
                if i + 1 < len(block) and block[i + 1] == "'":
                    current_value += "''"
                    i += 2
                    continue
                in_string = False
            current_value += ch
            i += 1
            continue

        # Not in string
        if ch == "'":
            in_string = True
            current_value += ch
            i += 1
            continue

        if ch == '(':
            if depth == 0:
                current_row = []
                current_value = ''
            else:
                current_value += ch
            depth += 1
            i += 1
            continue

        if ch == ')':
            depth -= 1
            if depth == 0:
                # End of a row tuple
                val = current_value.strip()
                if val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                current_row.append(val)
                rows.append(current_row)
                current_row = []
                current_value = ''
            else:
                current_value += ch
            i += 1
            continue

        if ch == ',' and depth == 1:
            val = current_value.strip()
            if val.startswith("'") and val.endswith("'"):
                val = val[1:-1]
            current_row.append(val)
            current_value = ''
            i += 1
            continue

        if depth >= 1:
            current_value += ch

        i += 1

    return rows


def main():
    articles = extract_posts()
    print(f"\nExtracted {len(articles)} articles")

    # Stats
    cats = {}
    for a in articles:
        cats[a['category']] = cats.get(a['category'], 0) + 1

    print("\nCategory distribution:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    statuses = {}
    for a in articles:
        statuses[a['status']] = statuses.get(a['status'], 0) + 1
    print(f"\nStatus distribution: {statuses}")

    # Write output
    import os
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
