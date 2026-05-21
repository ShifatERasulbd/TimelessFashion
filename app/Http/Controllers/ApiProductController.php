<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ApiProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->orderBy('name')
            ->orderBy('size')
            ->orderBy('color')
            ->orderBy('sku')
            ->get()
            ->map(fn (Product $product): array => $this->formatProduct($product));

        return response()->json($products);
    }

    public function sync(): JsonResponse
    {
        $baseUrl    = rtrim((string) config('services.inventory.base_url'), '/');
        $apiKey     = (string) config('services.inventory.canada_api_key');
        $warehouseId = (int) config('services.inventory.canada_warehouse_id');
        $verifySsl  = filter_var(config('services.inventory.verify_ssl', true), FILTER_VALIDATE_BOOL);
        $caBundlePath = trim((string) config('services.inventory.ca_bundle_path', ''));

        if ($baseUrl === '' || $apiKey === '') {
            return response()->json(['message' => 'Inventory API configuration is missing.'], 500);
        }

        $httpOptions = [
            'verify' => $caBundlePath !== '' ? $caBundlePath : $verifySsl,
        ];

        try {
            $response = Http::timeout(20)
                ->withOptions($httpOptions)
                ->acceptJson()
                ->withHeaders(['X-API-Key' => $apiKey])
                ->get($baseUrl . '/api/public/stocks', array_filter(['warehouse_id' => $warehouseId ?: null]));
        } catch (ConnectionException $exception) {
            return response()->json([
                'message' => str_contains($exception->getMessage(), 'cURL error 60')
                    ? 'SSL certificate error. Set INVENTORY_API_VERIFY_SSL=false or configure CA bundle.'
                    : 'Failed to connect to Inventory API.',
            ], 502);
        }

        if (! $response->successful()) {
            $upstream = $response->json();
            return response()->json([
                'message' => is_array($upstream)
                    ? ($upstream['message'] ?? 'Inventory API returned an error.')
                    : 'Inventory API returned an error.',
            ], $response->status());
        }

        $payload = $response->json();
        $stocks  = is_array($payload['data'] ?? null) ? $payload['data'] : (is_array($payload) ? $payload : []);

        if (empty($stocks)) {
            return response()->json(['message' => 'No products returned from Inventory API.', 'synced' => 0]);
        }


        $byName = [];
        foreach ($stocks as $row) {
            if (! is_array($row)) {
                continue;
            }

            $name = trim((string) ($row['product_name'] ?? $row['product']['name'] ?? ''));
            $rawBarcode = $row['barcode'] ?? null;
            if (is_array($rawBarcode)) {
                $rawBarcode = implode('-', array_filter($rawBarcode, 'is_scalar')) ?: null;
            }
            $barcode = is_string($rawBarcode) && trim($rawBarcode) !== ''
                ? trim($rawBarcode)
                : null;

            $price = (float) ($row['selling_price'] ?? $row['price'] ?? 0);
            if ($name === '') {
                continue;
            }
            $size = $this->normalizeVariantValue($row['size_variant']['size'] ?? ($row['size'] ?? ($row['product']['size'] ?? null)));
            $color = $this->normalizeVariantValue($row['color_variant']['name'] ?? ($row['color'] ?? ($row['product']['color'] ?? null)));
            $sku = \Illuminate\Support\Str::slug($name) ?: ('inv-' . md5($name));
            $stock = (int) ($row['stocks'] ?? $row['available_stock'] ?? 0);

            $coverImage = $row['cover_image_url'] ?? null;
            if ($coverImage && ! str_starts_with($coverImage, 'http')) {
                $coverImage = $baseUrl . '/' . ltrim($coverImage, '/');
            }

            if (! isset($byName[$name])) {
                $byName[$name] = [
                    'sku' => $sku,
                    'name' => $name,
                    'price' => $price,
                    'stock' => 0,
                    'cover_image' => $coverImage,
                    'barcodes' => [],
                    'colors' => [],
                    'sizes' => [],
                    'product_ids' => [],
                ];
            }

            $byName[$name]['stock'] += max(0, $stock);

            if ($price > 0) {
                $byName[$name]['price'] = max($byName[$name]['price'], $price);
            }

            if (! $byName[$name]['cover_image'] && $coverImage) {
                $byName[$name]['cover_image'] = $coverImage;
            }

            if ($barcode !== null) {
                $byName[$name]['barcodes'][] = $barcode;
            }

            if ($color !== null) {
                $byName[$name]['colors'][] = $color;
            }

            if ($size !== null) {
                $byName[$name]['sizes'][] = $size;
            }

            if (! empty($row['product_id'])) {
                $byName[$name]['product_ids'][] = $row['product_id'];
            }
        }

        $rows = [];
        foreach ($byName as $item) {
            $colors = array_values(array_unique(array_filter($item['colors'])));
            $sizes = array_values(array_unique(array_filter($item['sizes'])));
            $barcodes = array_values(array_unique(array_filter($item['barcodes'])));
            $productIds = array_values(array_unique(array_filter($item['product_ids'])));

            $rows[] = [
                'name' => $item['name'],
                'sku' => $item['sku'],
                'size' => json_encode($sizes, JSON_UNESCAPED_SLASHES),
                'color' => json_encode($colors, JSON_UNESCAPED_SLASHES),
                'available_products' => [
                    'product_name' => $item['name'],
                    'product_ids' => $productIds,
                    'barcodes' => $barcodes,
                    'colors' => $colors,
                    'sizes' => $sizes,
                    'warehouse_name' => config('services.inventory.canada_warehouse_name', 'Canada Warehouse'),
                    'variant_count' => max(count($colors), count($sizes), count($barcodes), 1),
                ],
                'barcode' => $barcodes[0] ?? null,
                'description' => null,
                'price' => $item['price'],
                'cover_image' => $item['cover_image'],
                'stock' => $item['stock'],
                'updated_at' => now()->toDateTimeString(),
                'created_at' => now()->toDateTimeString(),
            ];
        }

        foreach ($rows as $row) {
            Product::query()->updateOrCreate(
                ['sku' => $row['sku']],
                [
                    'name' => $row['name'],
                    'available_products' => $row['available_products'],
                    'barcode' => $row['barcode'],
                    'size' => $row['size'],
                    'color' => $row['color'],
                    'description' => $row['description'],
                    'price' => $row['price'],
                    'cover_image' => $row['cover_image'],
                    'stock' => $row['stock'],
                ],
            );
        }

        return response()->json([
            'message' => 'Products fetched successfully.',
            'products' => $rows,
            'synced'  => count($rows),
        ]);
    }

    private function buildProductSku(mixed $productId, string $name): string
    {
        $baseSku = $productId ? 'INV-'.$productId : Str::slug($name);

        return substr($baseSku !== '' ? $baseSku : uniqid('inv-', true), 0, 191);
    }

    private function normalizeVariantValue(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function formatProduct(Product $product): array
    {
        $color = $this->decodeJsonList($product->color);
        $size = $this->decodeJsonList($product->size);
        $warehouseName = config('services.inventory.canada_warehouse_name', 'Canada Warehouse');

        return [
            'id' => $product->id,
            'product_id' => $product->id,
            'name' => $product->name,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'available_products' => $product->available_products,
            'barcode' => $product->barcode,
            'color' => $color,
            'color_variant' => $this->buildPrimaryColorVariant($color),
            'size' => $size,
            'size_variant' => $this->buildPrimarySizeVariant($size),
            'description' => $product->description,
            'price' => $product->price,
            'selling_price' => $product->price,
            'cover_image' => $product->cover_image,
            'cover_image_url' => $product->cover_image,
            'stock' => $product->stock,
            'stocks' => $product->stock,
            'warehouse_name' => $warehouseName,
            'warehouse_id' => (int) config('services.inventory.canada_warehouse_id'),
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
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
