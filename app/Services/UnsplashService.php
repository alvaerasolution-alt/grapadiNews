<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UnsplashService
{
    private string $accessKey;

    private string $baseUrl = 'https://api.unsplash.com';

    public function __construct()
    {
        $this->accessKey = config('services.unsplash.access_key', '');
    }

    /**
     * Search for a unique image with layered fallback strategy:
     * 1. Search by title keywords
     * 2. Search by tags
     * 3. Search by category name
     * 4. Get random photo
     *
     * @param  string  $title  Post title
     * @param  string|null  $categoryName  Category name
     * @param  array  $tags  Array of tag names
     * @param  array  $usedImages  URLs already used in this batch (prevents duplicates)
     * @return string|null The regular size image URL or null
     */
    public function searchImage(string $title, ?string $categoryName = null, array $tags = [], array $usedImages = []): ?string
    {
        if (empty($this->accessKey)) {
            Log::warning('Unsplash: Access key not configured');

            return null;
        }

        // Layer 1: Search by title keywords
        $titleKeywords = $this->extractKeywords($title);
        if ($titleKeywords) {
            $result = $this->searchUnique($titleKeywords, $usedImages);
            if ($result) {
                return $result;
            }
        }

        // Layer 2: Search by tags (combine tag names)
        if (! empty($tags)) {
            $tagQuery = implode(' ', array_slice($tags, 0, 3));
            $result = $this->searchUnique($tagQuery, $usedImages);
            if ($result) {
                return $result;
            }
        }

        // Layer 3: Search by category name
        if ($categoryName) {
            $result = $this->searchUnique($categoryName, $usedImages);
            if ($result) {
                return $result;
            }
        }

        // Layer 4: Get random photo
        return $this->getRandomPhotoUnique($usedImages);
    }

    /**
     * Search Unsplash for a unique image (not already in DB or batch).
     */
    private function searchUnique(string $query, array $usedImages = []): ?string
    {
        if (empty($query)) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Client-ID {$this->accessKey}",
                'Accept-Version' => 'v1',
            ])->get("{$this->baseUrl}/search/photos", [
                'query' => $query,
                'per_page' => 10,
                'orientation' => 'landscape',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (! empty($data['results'])) {
                    foreach ($data['results'] as $img) {
                        $url = $img['urls']['regular'] ?? null;
                        if ($url && ! in_array($url, $usedImages, true) && ! $this->isImageInDatabase($url)) {
                            return $url;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Unsplash search failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Get a unique random Unsplash photo.
     */
    private function getRandomPhotoUnique(array $usedImages = []): ?string
    {
        for ($i = 0; $i < 3; $i++) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => "Client-ID {$this->accessKey}",
                    'Accept-Version' => 'v1',
                ])->get("{$this->baseUrl}/photos/random", [
                    'orientation' => 'landscape',
                    'count' => 1,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $item = isset($data[0]) ? $data[0] : $data;
                    $url = $item['urls']['regular'] ?? null;

                    if ($url && ! in_array($url, $usedImages, true) && ! $this->isImageInDatabase($url)) {
                        return $url;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Unsplash random photo failed', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return null;
    }

    /**
     * Check if image URL is already used in the database.
     */
    private function isImageInDatabase(string $url): bool
    {
        return \App\Models\Post::where('unsplash_image_url', $url)->exists();
    }

    /**
     * Extract meaningful keywords from title for better search results.
     */
    private function extractKeywords(string $title): string
    {
        $stopWords = [
            'yang', 'dan', 'ini', 'itu', 'untuk', 'dengan', 'dari', 'pada', 'ke', 'di',
            'adalah', 'akan', 'atau', 'juga', 'sudah', 'saat', 'bisa', 'ada', 'tidak',
            'lebih', 'agar', 'harus', 'dapat', 'oleh', 'sebagai', 'dalam', 'secara',
            'seperti', 'namun', 'jika', 'anda', 'kamu', 'kami', 'mereka', 'saya',
            'cara', 'tips', 'trik', 'panduan', 'inilah', 'begini', 'berikut',
            'tanpa', 'ribet', 'mudah', 'cepat', 'terbaik', 'paling',
        ];

        $words = preg_split('/\s+/', Str::lower($title));

        $keywords = array_filter($words, function ($word) use ($stopWords) {
            $word = preg_replace('/[^a-z0-9]/', '', $word);

            return strlen($word) > 2 && ! in_array($word, $stopWords, true);
        });

        $keywords = array_slice(array_values($keywords), 0, 5);

        $query = implode(' ', $keywords);

        return $query ?: $title;
    }

    /**
     * Check if the service is properly configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->accessKey);
    }
}
