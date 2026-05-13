<?php

namespace App\Http\Controllers;

use App\Models\Personalization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PersonalizationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'string'],
            'meta' => ['nullable', 'array'],
        ]);

        if (!preg_match('/^data:image\/(png|jpeg|jpg);base64,/', $validated['image'])) {
            return response()->json(['message' => 'Invalid image data.'], 422);
        }

        $base64 = preg_replace('/^data:image\/(png|jpeg|jpg);base64,/', '', $validated['image']);
        $binary = base64_decode(str_replace(' ', '+', $base64), true);

        if ($binary === false) {
            return response()->json(['message' => 'Unable to decode image.'], 422);
        }

        $fileName = 'order-design-' . Str::uuid() . '.png';
        $path = 'personalizations/orders/' . $fileName;
        Storage::disk('public')->put($path, $binary);

        $record = Personalization::query()->create([
            'user_id' => $request->user()?->id,
            'title' => $validated['title'] ?? 'Customized Product Design',
            'image_path' => $path,
            'meta' => $validated['meta'] ?? [],
        ]);

        return response()->json([
            'message' => 'Design saved successfully.',
            'data' => [
                'id' => $record->id,
                'title' => $record->title,
                'image_path' => $record->image_path,
                'image_url' => Storage::url($record->image_path),
                'meta' => $record->meta,
            ],
        ], 201);
    }
}
