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
     * Search for an image with layered fallback strategy:
     * 1. Search by title keywords
     * 2. Search by category name
     * 3. Get random photo
     *
     * @return string|null The regular size image URL or null if not found
     */
    /**
     * Search for an image with uniqueness guarantee.
     *
     * @param  array  $usedImages  (optional array of URLs already used)
     * @return string|null Unique Unsplash image URL or null if not found
     */
    public function searchImage(string $title, ?string $categoryName = null, array $usedImages = []): ?string
    {
        if (empty($this->accessKey)) {
            Log::warning('Unsplash: Access key not configured');

            return null;
        }

        // Layer 1: Search by title keywords (extract meaningful words)
        $titleKeywords = $this->extractKeywords($title);
        if ($titleKeywords) {
            $result = $this->searchUnique($titleKeywords, $usedImages);
            if ($result) {
                return $result;
            }
        }

        // Layer 2: Search by category name
        if ($categoryName) {
            $result = $this->searchUnique($categoryName, $usedImages);
            if ($result) {
                return $result;
            }
        }

        // Layer 3: Get random photo
        return $this->getRandomPhotoUnique($usedImages);
    }

    /**
     * Search Unsplash for unique image.
     */
    private function searchUnique(string $query, array $usedImages = []): ?string
    {
        // Try up to 5 image results for uniqueness
        if (empty($query)) {
            return null;
        }
        try {
            $response = Http::withHeaders([
                'Authorization' => "Client-ID {$this->accessKey}",
                'Accept-Version' => 'v1',
            ])->get("{$this->baseUrl}/search/photos", [
                'query' => $query,
                'per_page' => 10, // Increased page size to find unique easier
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
        // Try up to 3 times for uniqueness
        for ($i = 0; $i < 3; $i++) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => "Client-ID {$this->accessKey}",
                    'Accept-Version' => 'v1',
                ])->get("{$this->baseUrl}/photos/random", [
                    'orientation' => 'landscape',
                    'count' => 1, // Explicitly request 1
                ]);
                if ($response->successful()) {
                    $data = $response->json();
                    // Handling if response is array of photos (when count > 1) or single object
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
        // Remove common Indonesian stop words and short words
        $stopWords = [
            'yang', 'dan', 'ini', 'itu', 'untuk', 'dengan', 'dari', 'pada', 'ke', 'di',
            'adalah', 'akan', 'atau', 'juga', 'sudah', 'saat', 'bisa', 'ada', 'tidak',
            'lebih', 'agar', 'harus', 'dapat', 'oleh', 'sebagai', 'dalam', 'secara',
            'seperti', 'namun', 'jika', 'anda', 'kamu', 'kami', 'mereka', 'saya',
            'cara', 'tips', 'trik', 'panduan', 'inilah', 'begini', 'berikut',
            'tanpa', 'ribet', 'mudah', 'cepat', 'terbaik', 'paling',
        ];

        // Convert to lowercase and split
        $words = preg_split('/\s+/', Str::lower($title));

        // Filter out stop words and short words
        $keywords = array_filter($words, function ($word) use ($stopWords) {
            $word = preg_replace('/[^a-z0-9]/', '', $word);

            return strlen($word) > 2 && ! in_array($word, $stopWords, true);
        });

        // Take first 5-6 meaningful keywords
        $keywords = array_slice(array_values($keywords), 0, 6);

        $query = implode(' ', $keywords);

        // Fallback to original title if extraction results in empty string
        return $query ?: $title;
    }

    /**
     * Search photos on Unsplash.
     */
    private function search(string $query): ?string
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
                'per_page' => 1,
                'orientation' => 'landscape',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (! empty($data['results'][0]['urls']['regular'])) {
                    return $data['results'][0]['urls']['regular'];
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
     * Get a random photo from Unsplash.
     */
    private function getRandomPhoto(): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Client-ID {$this->accessKey}",
                'Accept-Version' => 'v1',
            ])->get("{$this->baseUrl}/photos/random", [
                'orientation' => 'landscape',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (! empty($data['urls']['regular'])) {
                    return $data['urls']['regular'];
                }
            }
        } catch (\Exception $e) {
            Log::error('Unsplash random photo failed', [
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Check if the service is properly configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->accessKey);
    }
}
