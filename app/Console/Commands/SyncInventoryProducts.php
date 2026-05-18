<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

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

        $bysku = [];
        foreach ($stocks as $row) {
            if (! is_array($row)) {
                continue;
            }

            $rawBarcode = $row['barcode'] ?? null;
            if (is_array($rawBarcode)) {
                $rawBarcode = implode('-', array_filter($rawBarcode, 'is_scalar')) ?: null;
            }
            $sku = is_string($rawBarcode) && $rawBarcode !== '' ? (string) $rawBarcode : null;

            if (! $sku) {
                $rawProductId = $row['product_id'] ?? null;
                if (is_array($rawProductId)) {
                    $rawProductId = implode('-', array_filter($rawProductId, 'is_scalar'));
                }
                $sku = 'INV-' . ($rawProductId ?: uniqid());
            }

            $stock = (int) ($row['stocks'] ?? $row['available_stock'] ?? 0);

            if (! isset($bysku[$sku]) || $stock > $bysku[$sku]['stock']) {
                $coverImage = $row['cover_image_url'] ?? null;
                if ($coverImage && ! str_starts_with($coverImage, 'http')) {
                    $coverImage = $baseUrl . '/' . ltrim($coverImage, '/');
                }

                $timestamp = now()->toDateTimeString();

                $bysku[$sku] = [
                    'name' => $row['product_name'] ?? $row['product']['name'] ?? $sku,
                    'sku' => $sku,
                    'description' => null,
                    'price' => 0,
                    'cover_image' => $coverImage,
                    'stock' => $stock,
                    'updated_at' => $timestamp,
                    'created_at' => $timestamp,
                ];
            }
        }

        $rows = array_values($bysku);

        Product::query()->upsert(
            $rows,
            ['sku'],
            ['name', 'cover_image', 'stock', 'updated_at'],
        );

        $this->info('Products synced successfully.');
        $this->line('Synced rows: ' . count($rows));

        return self::SUCCESS;
    }
}
