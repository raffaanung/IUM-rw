<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WargaController;
use App\Http\Controllers\KartuKeluargaController;
use App\Http\Controllers\TransaksiController;

// Public routes (tidak perlu login)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (harus login)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Warga
    Route::get('/warga', [WargaController::class, 'index']);
    Route::get('/warga/{id}', [WargaController::class, 'show']);
    Route::post('/warga', [WargaController::class, 'store']);
    Route::put('/warga/{id}', [WargaController::class, 'update']);
    Route::delete('/warga/{id}', [WargaController::class, 'destroy']);

    // Kartu Keluarga
    Route::get('/kk', [KartuKeluargaController::class, 'index']);
    Route::get('/kk/{id}', [KartuKeluargaController::class, 'show']);
    Route::post('/kk', [KartuKeluargaController::class, 'store']);
    Route::put('/kk/{id}', [KartuKeluargaController::class, 'update']);
    Route::delete('/kk/{id}', [KartuKeluargaController::class, 'destroy']);
    Route::post('/kk/{id}/anggota', [KartuKeluargaController::class, 'tambahAnggota']);
    Route::delete('/kk/{kkId}/anggota/{wargaId}', [KartuKeluargaController::class, 'hapusAnggota']);

    // Transaksi / Keuangan
    Route::get('/transaksi', [TransaksiController::class, 'index']);
    Route::post('/transaksi', [TransaksiController::class, 'store']);
    Route::put('/transaksi/{id}', [TransaksiController::class, 'update']);
    Route::delete('/transaksi/{id}', [TransaksiController::class, 'destroy']);
});