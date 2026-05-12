<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Warga Role Controllers (Read-Only)
use App\Http\Controllers\Api\Warga\DashboardController as WargaDashboard;
use App\Http\Controllers\Api\Warga\WargaListController as WargaList;
use App\Http\Controllers\Api\Warga\KeuanganController as WargaKeuangan;

// RT Role Controllers (CRUD)
use App\Http\Controllers\Api\Rt\DashboardController as RtDashboard;
use App\Http\Controllers\Api\Rt\WargaController as RtWarga;
use App\Http\Controllers\Api\Rt\KartuKeluargaController as RtKK;
use App\Http\Controllers\Api\Rt\KeuanganController as RtKeuangan;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (harus login)
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    /**
     * ENDPOINTS KHUSUS ROLE WARGA (Read-Only)
     */
    Route::prefix('portal-warga')->middleware('role:warga')->group(function () {
        Route::get('/dashboard', [WargaDashboard::class, 'summary']);
        Route::get('/data-warga', [WargaList::class, 'index']);
        Route::get('/data-warga/{id}', [WargaList::class, 'show']);
        Route::get('/laporan-keuangan', [WargaKeuangan::class, 'index']);
    });

    /**
     * ENDPOINTS KHUSUS ADMIN RT (CRUD Manajemen Data Terbatas pada RT)
     */
    Route::prefix('rt')->middleware('role:admin')->group(function () {
        
        // 1. Dashboard Admin RT
        Route::get('/dashboard', [RtDashboard::class, 'summary']);

        // 2. Warga RT CRUD
        Route::get('/warga', [RtWarga::class, 'index']);
        Route::post('/warga', [RtWarga::class, 'store']);
        Route::get('/warga/{id}', [RtWarga::class, 'show']);
        Route::put('/warga/{id}', [RtWarga::class, 'update']);
        Route::delete('/warga/{id}', [RtWarga::class, 'destroy']);

        // 3. Kartu Keluarga RT CRUD
        Route::get('/kartu-keluarga', [RtKK::class, 'index']);
        Route::post('/kartu-keluarga', [RtKK::class, 'store']);
        Route::get('/kartu-keluarga/{id}', [RtKK::class, 'show']);
        Route::put('/kartu-keluarga/{id}', [RtKK::class, 'update']);
        Route::delete('/kartu-keluarga/{id}', [RtKK::class, 'destroy']);
        Route::post('/kartu-keluarga/{id}/anggota', [RtKK::class, 'tambahAnggota']);
        Route::delete('/kartu-keluarga/{kkId}/anggota/{wargaId}', [RtKK::class, 'hapusAnggota']);

        // 4. Keuangan RT CRUD
        Route::get('/keuangan', [RtKeuangan::class, 'index']);
        Route::post('/keuangan', [RtKeuangan::class, 'store']);
        Route::put('/keuangan/{id}', [RtKeuangan::class, 'update']);
        Route::delete('/keuangan/{id}', [RtKeuangan::class, 'destroy']);
    });
});