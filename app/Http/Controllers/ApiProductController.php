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


        $bySku = [];
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
            $size = $this->normalizeVariantValue($row['size'] ?? ($row['product']['size'] ?? null));
            $color = $this->normalizeVariantValue($row['color'] ?? ($row['product']['color'] ?? null));
            $sku = $this->buildVariantSku($barcode, $row['product_id'] ?? null, $name, $size, $color);
            $stock = (int) ($row['stocks'] ?? $row['available_stock'] ?? 0);

            $coverImage = $row['cover_image_url'] ?? null;
            if ($coverImage && ! str_starts_with($coverImage, 'http')) {
                $coverImage = $baseUrl . '/' . ltrim($coverImage, '/');
            }

            $bySku[$sku] = [
                'name' => $name,
                'sku' => $sku,
                'size' => $size,
                'color' => $color,
                'available_products' => [
                    'product_name' => $name,
                    'product_id' => $row['product_id'] ?? null,
                    'barcode' => $barcode,
                    'size' => $size,
                    'color' => $color,
                    'warehouse_name' => config('services.inventory.canada_warehouse_name', 'Canada Warehouse'),
                ],
                'barcode' => $barcode,
                'description' => null,
                'price' => $price,
                'cover_image' => $coverImage,
                'stock' => $stock,
                'updated_at' => now()->toDateTimeString(),
                'created_at' => now()->toDateTimeString(),
            ];
        }

        $rows = array_values($bySku);

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

    private function buildVariantSku(?string $sku, mixed $productId, string $name, ?string $size, ?string $color): string
    {
        $baseSku = trim((string) $sku);

        if ($baseSku !== '') {
            return substr($baseSku, 0, 191);
        }

        $variantBits = array_filter([
            $productId ? 'INV-'.$productId : null,
            $size ? Str::slug($size) : null,
            $color ? Str::slug($color) : null,
            Str::slug($name),
        ]);

        return substr(implode('-', $variantBits) ?: uniqid('inv-', true), 0, 191);
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
        $color = $product->color ? trim((string) $product->color) : null;
        $size = $product->size ? trim((string) $product->size) : null;
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
            'color_variant' => $color ? [
                'name' => $color,
                'color_code' => $this->resolveColorCode($color),
            ] : null,
            'size' => $size,
            'size_variant' => $size ? ['size' => $size] : null,
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
