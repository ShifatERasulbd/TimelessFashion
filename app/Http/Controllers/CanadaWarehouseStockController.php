<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class CanadaWarehouseStockController extends Controller
{
    public function index(): JsonResponse
    {
        $baseUrl = rtrim((string) config('services.inventory.base_url'), '/');
        $apiKey = (string) config('services.inventory.canada_api_key');
        $warehouseId = (int) config('services.inventory.canada_warehouse_id');
        $verifySsl = filter_var(config('services.inventory.verify_ssl', true), FILTER_VALIDATE_BOOL);
        $caBundlePath = trim((string) config('services.inventory.ca_bundle_path', ''));

        if ($baseUrl === '' || $apiKey === '' || $warehouseId <= 0) {
            return response()->json([
                'message' => 'Inventory API configuration is missing.',
            ], 500);
        }

        $httpOptions = [
            'verify' => $caBundlePath !== '' ? $caBundlePath : $verifySsl,
        ];

        try {
            $response = Http::timeout(15)
                ->withOptions($httpOptions)
                ->acceptJson()
                ->withHeaders([
                    'X-API-Key' => $apiKey,
                ])
                ->get($baseUrl.'/api/public/stocks', [
                    'warehouse_id' => $warehouseId,
                ]);
        } catch (ConnectionException $exception) {
            $message = $exception->getMessage();

            if (str_contains($message, 'cURL error 60')) {
                return response()->json([
                    'message' => 'SSL certificate validation failed while connecting to Inventory API. Set INVENTORY_API_VERIFY_SSL=false for local testing, or configure INVENTORY_API_CA_BUNDLE_PATH with a valid CA bundle.',
                ], 502);
            }

            return response()->json([
                'message' => 'Failed to connect to Inventory API.',
            ], 502);
        }

        if (! $response->successful()) {
            $upstreamPayload = $response->json();

            return response()->json([
                'message' => is_array($upstreamPayload)
                    ? ($upstreamPayload['message'] ?? 'Failed to fetch stock data from Inventory API.')
                    : 'Failed to fetch stock data from Inventory API.',
                'status' => $response->status(),
            ], $response->status());
        }

        $payload = $response->json();

        return response()->json(is_array($payload) ? $payload : []);
    }
}