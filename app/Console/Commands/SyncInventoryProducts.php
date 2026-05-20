<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SyncInventoryProducts extends Command
{
    protected $signature = 'products:sync-inventory';

    protected $description = 'Sync products from Inventory API into local database';

    public function handle(): int
    {
        $baseUrl = rtrim((string) config('services.inventory.base_url'), '/');
        $apiKey = (string) config('services.inventory.canada_api_key');
        $warehouseId = (int) config('services.inventory.canada_warehouse_id');
        $verifySsl = filter_var(config('services.inventory.verify_ssl', true), FILTER_VALIDATE_BOOL);
        $caBundlePath = trim((string) config('services.inventory.ca_bundle_path', ''));

        if ($baseUrl === '' || $apiKey === '') {
            $this->error('Inventory API configuration is missing.');
            return self::FAILURE;
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
            $this->error(
                str_contains($exception->getMessage(), 'cURL error 60')
                    ? 'SSL certificate error. Set INVENTORY_API_VERIFY_SSL=false or configure CA bundle.'
                    : 'Failed to connect to Inventory API.'
            );

            return self::FAILURE;
        }

        if (! $response->successful()) {
            $upstream = $response->json();
            $this->error(
                is_array($upstream)
                    ? ($upstream['message'] ?? 'Inventory API returned an error.')
                    : 'Inventory API returned an error.'
            );

            return self::FAILURE;
        }

        $payload = $response->json();
        $stocks = is_array($payload['data'] ?? null) ? $payload['data'] : (is_array($payload) ? $payload : []);

        if (empty($stocks)) {
            $this->warn('No products returned from Inventory API.');
            return self::SUCCESS;
        }

        $rowsToSync = [];
        foreach ($stocks as $row) {
            if (! is_array($row)) {
                continue;
            }

            $rawBarcode = $row['barcode'] ?? null;
            if (is_array($rawBarcode)) {
                $barcodeArray = $rawBarcode;
                $rawBarcode = null;
                foreach ($barcodeArray as $bc) {
                    if (is_scalar($bc) && $bc !== "" && $bc !== null) {
                        $rawBarcode = (string) $bc;
                        break;
                    }
                }
            }
            $barcode = is_string($rawBarcode) && trim($rawBarcode) !== "" ? trim($rawBarcode) : null;
            $sku = $barcode;

            if (! $sku) {
                $rawProductId = $row['product_id'] ?? null;
                if (is_array($rawProductId)) {
                    $rawProductId = current(array_filter($rawProductId, 'is_scalar'));
                }
                $sku = 'INV-' . ($rawProductId ?: uniqid());
            }
            
            if (strlen($sku) > 191) {
                $sku = substr($sku, 0, 191);
            }

            $stock = (int) ($row['stocks'] ?? $row['available_stock'] ?? 0);
            $price = (float) ($row['selling_price'] ?? $row['price'] ?? 0);

            $name = $row['product_name'] ?? $row['product']['name'] ?? $sku;
            $name = trim((string) $name);
            if ($name === '') {
                continue;
            }

            $size = $this->normalizeVariantValue($row['size'] ?? ($row['product']['size'] ?? null));
            $color = $this->normalizeVariantValue($row['color'] ?? ($row['product']['color'] ?? null));
            $variantSku = $this->buildVariantSku($sku, $row['product_id'] ?? null, $name, $size, $color);

            $coverImage = $row['cover_image_url'] ?? null;
            if ($coverImage && ! str_starts_with($coverImage, 'http')) {
                $coverImage = $baseUrl . '/' . ltrim($coverImage, '/');
            }

            $colorVariant = null;
            if ($color !== null) {
                $colorVariant = [
                    'name' => $color,
                    'color_code' => $this->resolveColorCode($color),
                ];
            }

            $rowsToSync[$variantSku] = [
                'sku' => $variantSku,
                'name' => $name,
                'price' => $price,
                'stock' => $stock,
                'image' => $coverImage,
                'color' => $color,
                'size' => $size,
                'barcode' => $barcode,
                'product_id' => $row['product_id'] ?? null,
                'available_products' => [
                    'product_name' => $name,
                    'product_id' => $row['product_id'] ?? null,
                    'barcode' => $barcode,
                    'size' => $size,
                    'color' => $color,
                    'warehouse_name' => config('services.inventory.canada_warehouse_name', 'Canada Warehouse'),
                ],
                'color_variant' => $colorVariant,
            ];
        }

        foreach ($rowsToSync as $item) {
            Product::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'cover_image' => $item['image'],
                    'color' => $item['color'],
                    'size' => $item['size'],
                    'barcode' => $item['barcode'],
                    'available_products' => $item['available_products'],
                ]
            );
        }

        $this->info('Successfully synced ' . count($rowsToSync) . ' products from Inventory API.');

        return self::SUCCESS;
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
