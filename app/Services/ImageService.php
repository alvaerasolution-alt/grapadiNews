<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageService
{
    private ImageManager $manager;

    /** @var array<string, array{width: int, height: int}> */
    private array $sizes = [
        'thumbnail' => ['width' => 300, 'height' => 200],
        'medium' => ['width' => 800, 'height' => 600],
    ];

    private int $quality = 80;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver);
    }

    /**
     * Upload and convert an image to WebP in multiple sizes.
     *
     * @return array{original: string, thumbnail: string, medium: string}
     */
    public function upload(UploadedFile $file): array
    {
        $directory = 'uploads/'.now()->format('Y/m');
        $baseName = $this->generateFileName($file);

        $paths = [];

        // Original (converted to WebP, no resize)
        $paths['original'] = $this->processImage($file, $directory, $baseName);

        // Sized variants
        foreach ($this->sizes as $sizeName => $dimensions) {
            $paths[$sizeName] = $this->processImage(
                $file,
                $directory,
                "{$baseName}-{$sizeName}",
                $dimensions['width'],
                $dimensions['height'],
            );
        }

        return $paths;
    }

    /**
     * Process a single image: read, optionally resize, convert to WebP, and store.
     */
    private function processImage(
        UploadedFile $file,
        string $directory,
        string $fileName,
        ?int $width = null,
        ?int $height = null,
    ): string {
        $image = $this->manager->read($file->getPathname());

        if ($width && $height) {
            $image->scaleDown(width: $width, height: $height);
        }

        $encoded = $image->toWebp(quality: $this->quality);

        $path = "{$directory}/{$fileName}.webp";

        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }

    /**
     * Generate a unique file name based on the original name.
     */
    private function generateFileName(UploadedFile $file): string
    {
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = str($name)->slug()->limit(50, '');

        return $slug.'-'.substr(uniqid(), -8);
    }

    /**
     * Delete all image variants from storage.
     *
     * @param  array<string, string>  $paths
     */
    public function delete(array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Get the public URL for a stored image path.
     */
    public static function url(string $path): string
    {
        return Storage::disk('public')->url($path);
    }
}
