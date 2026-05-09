<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anggota_kk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kartu_keluarga_id')->constrained('kartu_keluarga')->onDelete('cascade');
            $table->foreignId('warga_id')->constrained('warga')->onDelete('cascade');
            $table->string('hubungan_keluarga'); // kepala, istri, anak, dll
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anggota_kk');
    }
};