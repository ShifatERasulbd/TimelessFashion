<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\PersonalizationController;
use App\Http\Controllers\UserController;

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

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [UserController::class, 'me']);

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::apiResource('/heroes', HeroController::class);
        Route::get('/personalizations', [PersonalizationController::class, 'index']);
        Route::get('/personalizations/{personalization}', [PersonalizationController::class, 'show']);
        Route::put('/personalizations/{personalization}', [PersonalizationController::class, 'update']);
        Route::delete('/personalizations/{personalization}', [PersonalizationController::class, 'destroy']);
       
        
        // Season Controller
        Route::apiResource('/seasons', SeasonController::class);

    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api).*$');
});
