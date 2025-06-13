<?php

use App\Http\Controllers\ArtikelController;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\InteraksiUserController;
use App\Http\Controllers\KategoriArtikelController;
use App\Http\Controllers\ModelMlController;
use App\Http\Controllers\RegistrasiController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->name('api.')->group(function () {
    Route::get('/artikels', [ArtikelController::class, 'index'])->name('artikels.index');
    Route::get('/artikels/{artikel:slug}', [ArtikelController::class, 'show'])->name('artikels.show');
    Route::get('/kategori-artikels', [KategoriArtikelController::class, 'index'])->name('kategori-artikels.index');
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/events/{event:slug}', [EventController::class, 'show'])->name('events.show');
    Route::post('/interactions', [InteraksiUserController::class, 'store'])->name('interactions.store');
    Route::get('/ml-models/active/{type}', [ModelMlController::class, 'getActiveModel'])->name('ml-models.active');
});

Route::middleware(['auth:sanctum'])->prefix('v1')->name('api.')->group(function () {

    Route::middleware('role:admin|reporter|verifikator')->group(function () {
        Route::apiResource('artikels', ArtikelController::class)->except(['index', 'show']);
        Route::put('artikels/{artikel}/publish', [ArtikelController::class, 'publish'])->name('artikels.publish');
        Route::put('artikels/{artikel}/archive', [ArtikelController::class, 'archive'])->name('artikels.archive');
    });

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('kategori-artikels', KategoriArtikelController::class)->except(['index']);
        Route::apiResource('users', UserController::class);
        Route::apiResource('ml-models', ModelMlController::class)->parameters([
            'ml-models' => 'modelMl'
        ]);
        Route::put('ml-models/{modelMl}/activate', [ModelMlController::class, 'activate'])->name('ml-models.activate');
        Route::get('ml-models/{modelMl}/performance', [ModelMlController::class, 'getPerformance'])->name('ml-models.performance');
        Route::apiResource('interaksi-users', InteraksiUserController::class)->except(['store']);
    });

    Route::middleware('role:admin|verifikator')->group(function () {
        Route::apiResource('events', EventController::class)->except(['index', 'show']);
        Route::put('events/{event}/open-registration', [EventController::class, 'openRegistration'])->name('events.openRegistration');
        Route::put('events/{event}/close-registration', [EventController::class, 'closeRegistration'])->name('events.closeRegistration');
        Route::put('events/{event}/start', [EventController::class, 'startEvent'])->name('events.startEvent');
        Route::put('events/{event}/complete', [EventController::class, 'completeEvent'])->name('events.completeEvent');
        Route::put('events/{event}/cancel', [EventController::class, 'cancelEvent'])->name('events.cancelEvent');
        Route::put('/admin/registrations/{registrasi}/confirm', [RegistrasiController::class, 'confirm'])->name('admin.registrations.confirm');
        Route::put('/admin/registrations/{registrasi}/cancel', [RegistrasiController::class, 'cancel'])->name('admin.registrations.cancel');
        Route::put('/admin/registrations/{registrasi}/payment-status', [RegistrasiController::class, 'updatePaymentStatus'])->name('admin.registrations.updatePaymentStatus');
        Route::delete('/admin/registrations/{registrasi}', [RegistrasiController::class, 'destroy'])->name('admin.registrations.destroy');
    });
    Route::post('/events/{event}/register', [RegistrasiController::class, 'store'])->name('registrations.store');
});
