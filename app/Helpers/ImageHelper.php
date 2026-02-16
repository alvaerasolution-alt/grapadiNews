<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class ImageHelper
{
    /**
     * Store an uploaded image as WebP with optional resizing.
     *
     * @return string The storage path relative to disk root.
     */
    public static function storeAsWebp(
        UploadedFile $file,
        string $directory = 'images',
        int $quality = 80,
        ?int $maxWidth = 1200,
        string $disk = 'public',
    ): string {
        $filename = uniqid($directory.'_').'_'.time().'.webp';
        $storagePath = $directory.'/'.$filename;

        // Use GD driver (available in most environments)
        $manager = ImageManager::gd();
        $image = $manager->read($file->getRealPath());

        // Resize if wider than max width, keeping aspect ratio
        if ($maxWidth && $image->width() > $maxWidth) {
            $image->scaleDown(width: $maxWidth);
        }

        $encoded = $image->toWebp($quality);

        Storage::disk($disk)->put($storagePath, (string) $encoded);

        return $storagePath;
    }

    /**
     * Delete an old image file if it exists.
     */
    public static function delete(?string $path, string $disk = 'public'): void
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }
}
