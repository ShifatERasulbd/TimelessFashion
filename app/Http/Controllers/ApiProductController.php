<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class ApiProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->where('sku', 'NOT LIKE', 'test%')
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')
                    ->from('products')
                    ->groupBy('name', 'size', 'color');
            })
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product): array => [
                'id'           => $product->id,
                'name'         => $product->name,
                'sku'          => $product->sku,
                    'color'        => $product->color,
                    'size'         => $product->size,
                    'description'  => $product->description,
                    'price'        => $product->price,
                    'cover_image'  => $product->cover_image,
                    'stock'        => $product->stock,
                    'created_at'   => $product->created_at,
                    'updated_at'   => $product->updated_at,
            ]);

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


        // Deduplicate by product name and keep the row with highest stock.
        $byKey = [];
        foreach ($stocks as $row) {
            if (! is_array($row)) {
                continue;
            }

            $name = $row['product_name'] ?? $row['product']['name'] ?? null;
            $size = $row['size'] ?? ($row['product']['size'] ?? null);
            $color = $row['color'] ?? ($row['product']['color'] ?? null);
            $sku = $row['barcode'] ?? ($row['sku'] ?? null);
            if (is_array($sku)) {
                $sku = implode('-', array_filter($sku, 'is_scalar')) ?: null;
            }
            if (! $name) {
                continue;
            }
            $key = strtolower(trim($name));
            $stock = (int) ($row['stocks'] ?? $row['available_stock'] ?? 0);

            if (! isset($byKey[$key]) || $stock > $byKey[$key]['stock']) {
                $coverImage = $row['cover_image_url'] ?? null;
                if ($coverImage && ! str_starts_with($coverImage, 'http')) {
                    $coverImage = $baseUrl . '/' . ltrim($coverImage, '/');
                }
                $byKey[$key] = [
                    'name'        => $name,
                    'size'        => $size,
                    'color'       => $color,
                    'sku'         => $sku,
                    'description' => null,
                    'price'       => 0,
                    'cover_image' => $coverImage,
                    'stock'       => $stock,
                    'updated_at'  => now()->toDateTimeString(),
                    'created_at'  => now()->toDateTimeString(),
                ];
            }
        }

        $rows = array_values($byKey);

        foreach ($rows as $row) {
            Product::query()->updateOrCreate(
                ['name' => $row['name']],
                [
                    'sku' => $row['sku'],
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
}
