<?php

namespace App\Http\Controllers;

use App\Models\SubCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $subcategories = SubCategory::query()
            ->with('category')
            ->orderBy('id')
            ->get();

        return response()->json($subcategories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:sub_categories,slug'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        $subcategory = SubCategory::query()->create($validated)->load('category');

        return response()->json($subcategory, 201);
    }

    public function show(SubCategory $sub_category): JsonResponse
    {
        return response()->json($sub_category->load('category'));
    }

    public function update(Request $request, SubCategory $sub_category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:sub_categories,slug,' . $sub_category->id],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        $sub_category->update($validated);

        return response()->json($sub_category->load('category'));
    }

    public function destroy(SubCategory $sub_category): JsonResponse
    {
        $sub_category->delete();

        return response()->json(null, 204);
    }
}