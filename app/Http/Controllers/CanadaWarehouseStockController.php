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
        $color = $this->decodeJsonList($product->color);
        $size = $this->decodeJsonList($product->size);

        return [
            'id' => $product->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'cover_image_url' => $product->cover_image,
            'color' => $color,
            'size' => $size,
            'color_variant' => $this->buildPrimaryColorVariant($color),
            'size_variant' => $this->buildPrimarySizeVariant($size),
            'selling_price' => $product->price,
            'warehouse_name' => config('services.inventory.canada_warehouse_name', 'Canada Warehouse'),
            'stocks' => $product->stock,
        ];
    }

    private function decodeJsonList(mixed $value): array|string|null
    {
        if (is_array($value)) {
            return array_values(array_filter($value, fn ($item) => is_scalar($item) && trim((string) $item) !== ''));
        }

        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return null;
        }

        $decoded = json_decode($trimmed, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_values(array_filter($decoded, fn ($item) => is_scalar($item) && trim((string) $item) !== ''));
        }

        return $trimmed;
    }

    private function buildPrimaryColorVariant(array|string|null $color): ?array
    {
        if (! is_array($color) || empty($color)) {
            return is_string($color) && $color !== '' ? [
                'name' => $color,
                'color_code' => $this->resolveColorCode($color),
            ] : null;
        }

        $first = $color[0] ?? null;
        if (! is_string($first) || $first === '') {
            return null;
        }

        return [
            'name' => $first,
            'color_code' => $this->resolveColorCode($first),
        ];
    }

    private function buildPrimarySizeVariant(array|string|null $size): ?array
    {
        if (! is_array($size) || empty($size)) {
            return is_string($size) && $size !== '' ? ['size' => $size] : null;
        }

        $first = $size[0] ?? null;
        if (! is_string($first) || $first === '') {
            return null;
        }

        return ['size' => $first];
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