<?php

namespace App\Http\Controllers;

use App\Http\Requests\MediaUploadRequest;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;

class MediaController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    /**
     * Upload an image and return URLs for all generated sizes.
     */
    public function store(MediaUploadRequest $request): JsonResponse
    {
        $paths = $this->imageService->upload($request->file('image'));

        return response()->json([
            'urls' => [
                'original' => ImageService::url($paths['original']),
                'thumbnail' => ImageService::url($paths['thumbnail']),
                'medium' => ImageService::url($paths['medium']),
            ],
            'paths' => $paths,
        ]);
    }
}
