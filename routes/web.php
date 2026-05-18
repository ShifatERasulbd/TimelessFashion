<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\PersonalizationController;
use App\Http\Controllers\FeaturesController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CanadaWarehouseStockController;
use App\Http\Controllers\ApiProductController;
use App\Http\Controllers\SubCategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response('', 200);
});

Route::get('/admin', function () {
    return view('app');
})->name('login');

Route::get('/personalizer/{path?}', function () {
    return view('app');
})->where('path', '.*');

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/personalizations', [PersonalizationController::class, 'store']);
    Route::patch('/personalizations/{personalization}/confirm', [PersonalizationController::class, 'confirm']);

    Route::middleware('auth:sanctum')->group(function () {
        

        Route::get('/user', function (Request $request) {
            return response()->json($request->user());
        });

        Route::post('/logout', [AuthController::class, 'logout']);
        // personalization controller
        Route::get('/personalizations', [PersonalizationController::class, 'index']);
        Route::get('/personalizations/{personalization}', [PersonalizationController::class, 'show']);
        Route::put('/personalizations/{personalization}', [PersonalizationController::class, 'update']);
        Route::delete('/personalizations/{personalization}', [PersonalizationController::class, 'destroy']);

        // Hero Controller
        Route::apiResource('/heroes', HeroController::class);

        // Features Controller
        Route::apiResource('/features', FeaturesController::class);

        // Category Controller
        Route::apiResource('/categories', CategoryController::class);

        // SubCategory Controller
        Route::apiResource('/sub-categories', SubCategoryController::class);

        // Inventory public API proxy (Canada warehouse)
        Route::get('/inventory/canada-warehouse-stocks', [CanadaWarehouseStockController::class, 'index']);

        // API Products (synced from Inventory)
        Route::get('/api-products', [ApiProductController::class, 'index']);
        Route::post('/api-products/sync', [ApiProductController::class, 'sync']);
       
        

    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api).*$');
});
