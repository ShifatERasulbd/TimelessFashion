<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;

class CanadaWarehouseStockController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = Product::query()
            ->orderBy('name')
            ->orderBy('size')
            ->orderBy('color')
            ->orderBy('sku')
            ->get()
            ->map(fn (Product $product): array => $this->formatWarehouseStockRow($product))
            ->values();

        return response()->json([
            'data' => $rows,
            'message' => 'Canada warehouse stock loaded from local database.',
        ]);
    }

    private function formatWarehouseStockRow(Product $product): array
    {
        $color = $product->color ? trim((string) $product->color) : null;
        $size = $product->size ? trim((string) $product->size) : null;

        return [
            'id' => $product->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'cover_image_url' => $product->cover_image,
            'color_variant' => $color ? [
                'name' => $color,
                'color_code' => $this->resolveColorCode($color),
            ] : null,
            'size_variant' => $size ? ['size' => $size] : null,
            'selling_price' => $product->price,
            'warehouse_name' => config('services.inventory.canada_warehouse_name', 'Canada Warehouse'),
            'stocks' => $product->stock,
        ];
    }

    private function resolveColorCode(?string $color): ?string
    {
        if ($color === null) {
            return null;
        }

        $map = [
            'black' => '#111827',
            'blue' => '#2563eb',
            'brown' => '#92400e',
            'gray' => '#6b7280',
            'green' => '#16a34a',
            'navy' => '#1d4ed8',
            'orange' => '#ea580c',
            'pink' => '#ec4899',
            'purple' => '#7c3aed',
            'red' => '#dc2626',
            'white' => '#f9fafb',
            'yellow' => '#eab308',
        ];

        return $map[strtolower($color)] ?? null;
    }
}