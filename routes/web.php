<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ArtikelController;
use App\Http\Controllers\KategoriArtikelController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrasiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InteraksiUserController;
use App\Http\Controllers\ModelMlController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/registrasi-saya', [RegistrasiController::class, 'index'])->name('my-registrations.index');
    Route::get('/events/{event}/register', [RegistrasiController::class, 'create'])->name('registrations.create');
    Route::post('/events/{event}/register', [RegistrasiController::class, 'store'])->name('registrations.store');
    Route::get('/pendaftaran/{registrasi}', [RegistrasiController::class, 'show'])->name('registrations.show');

    Route::middleware('role:admin|reporter|verifikator')->group(function () {
        Route::get('/artikels', [ArtikelController::class, 'index'])->name('artikels.index')
            ->middleware('role:admin|reporter|verifikator');
        Route::put('/artikels/{artikel}', [ArtikelController::class, 'update'])->name('artikels.update');
    });
    Route::middleware('role:admin|reporter')->group(function () {
        Route::get('/artikels/create', [ArtikelController::class, 'create'])->name('artikels.create');
        Route::post('/artikels', [ArtikelController::class, 'store'])->name('artikels.store');
        Route::get('/artikels/{artikel}/edit', [ArtikelController::class, 'edit'])->name('artikels.edit');
        Route::put('/artikels/{artikel}', [ArtikelController::class, 'update'])->name('artikels.update');
    });

    Route::middleware('role:admin|verifikator')->group(function () {
        Route::delete('/artikels/{artikel}', [ArtikelController::class, 'destroy'])->name('artikels.destroy');
        Route::put('/artikels/{artikel}/publish', [ArtikelController::class, 'publish'])->name('artikels.publish');
        Route::put('/artikels/{artikel}/archive', [ArtikelController::class, 'archive'])->name('artikels.archive');
        Route::put('/artikels/{artikel}/reject', [ArtikelController::class, 'reject'])->name('artikels.reject');
    });

    Route::middleware('role:admin')->group(function () {
        Route::resource('kategori-artikels', KategoriArtikelController::class);
    });

    Route::middleware('role:admin|verifikator')->group(function () {
        Route::resource('events', EventController::class)->except(['show']);
        Route::put('/events/{event}/open-registration', [EventController::class, 'openRegistration'])->name('events.openRegistration');
        Route::put('/events/{event}/close-registration', [EventController::class, 'closeRegistration'])->name('events.closeRegistration');
        Route::put('/events/{event}/start', [EventController::class, 'startEvent'])->name('events.startEvent');
        Route::put('/events/{event}/complete', [EventController::class, 'completeEvent'])->name('events.completeEvent');
        Route::put('/events/{event}/cancel', [EventController::class, 'cancelEvent'])->name('events.cancelEvent');

        Route::get('/admin/registrations', [RegistrasiController::class, 'index'])->name('admin.registrations.index');
        Route::get('/admin/registrations/{registrasi}', [RegistrasiController::class, 'show'])->name('admin.registrations.show');
        Route::put('/admin/registrations/{registrasi}/confirm', [RegistrasiController::class, 'confirm'])->name('admin.registrations.confirm');
        Route::put('/admin/registrations/{registrasi}/cancel', [RegistrasiController::class, 'cancel'])->name('admin.registrations.cancel');
        Route::put('/admin/registrations/{registrasi}/payment-status', [RegistrasiController::class, 'updatePaymentStatus'])->name('admin.registrations.updatePaymentStatus');
        Route::delete('/admin/registrations/{registrasi}', [RegistrasiController::class, 'destroy'])->name('admin.registrations.destroy');
    });

    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('ml-models', ModelMlController::class)->parameters([
            'ml-models' => 'modelMl'
        ]);
        Route::put('ml-models/{modelMl}/activate', [ModelMlController::class, 'activate'])->name('ml-models.activate');
        Route::resource('interaksi-users', InteraksiUserController::class)->except(['store']);
    });
});

Route::get('/artikels/{artikel:slug}', [ArtikelController::class, 'show'])->name('artikels.show');

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
