<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warga', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->unique();
            $table->string('nama');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->text('alamat');
            $table->string('rt', 3);
            $table->string('rw', 3);
            $table->enum('status_warga', ['tetap', 'kontrak', 'pendatang'])->default('tetap');
            $table->enum('status_pernikahan', ['belum_menikah', 'menikah', 'cerai'])->default('belum_menikah');
            $table->string('pekerjaan')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('foto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warga');
    }
};