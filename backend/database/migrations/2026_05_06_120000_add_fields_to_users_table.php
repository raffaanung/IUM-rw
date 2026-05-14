<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nik', 16)->unique()->nullable()->after('name');
            $table->enum('role', ['rw', 'rt', 'warga'])->default('warga')->after('nik');
            $table->string('rt', 3)->nullable()->after('role'); // diisi kalau role = rt atau warga
            $table->foreignId('warga_id')->nullable()->constrained('warga')->onDelete('set null')->after('rt');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nik', 'role', 'rt', 'warga_id']);
        });
    }
};