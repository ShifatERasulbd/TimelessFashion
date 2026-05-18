<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HeroController extends Controller
{
    private function toResponseArray(Hero $hero): array
    {
        $data = $hero->toArray();
        $data['image_url'] = $hero->image ? Storage::url($hero->image) : null;
        $data['video_url'] = $hero->video ? Storage::url($hero->video) : null;

        return $data;
    }

    public function index(): JsonResponse
    {
        $heroes = Hero::query()->orderBy('id')->get()->map(fn (Hero $hero) => $this->toResponseArray($hero));

        return response()->json($heroes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,avi,webm', 'max:10240'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('heroes/images', 'public');
        }

        if ($request->hasFile('video')) {
            $validated['video'] = $request->file('video')->store('heroes/videos', 'public');
        }

        $hero = Hero::query()->create($validated);

        return response()->json($this->toResponseArray($hero), 201);
    }

    public function show(Hero $hero): JsonResponse
    {
        return response()->json($this->toResponseArray($hero));
    }

    public function update(Request $request, Hero $hero): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,avi,webm', 'max:10240'],
        ]);

        if ($request->hasFile('image')) {
            if ($hero->image) {
                Storage::disk('public')->delete($hero->image);
            }
            $validated['image'] = $request->file('image')->store('heroes/images', 'public');
        }

        if ($request->hasFile('video')) {
            if ($hero->video) {
                Storage::disk('public')->delete($hero->video);
            }
            $validated['video'] = $request->file('video')->store('heroes/videos', 'public');
        }

        $hero->update($validated);

        return response()->json($this->toResponseArray($hero->fresh()));
    }

    public function destroy(Hero $hero): JsonResponse
    {
        if ($hero->image) {
            Storage::disk('public')->delete($hero->image);
        }

        if ($hero->video) {
            Storage::disk('public')->delete($hero->video);
        }

        $hero->delete();

        return response()->json(['message' => 'Hero deleted']);
    }
}

