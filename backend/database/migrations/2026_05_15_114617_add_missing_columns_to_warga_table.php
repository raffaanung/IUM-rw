<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->string('pendidikan')->nullable()->after('pekerjaan');
            $table->decimal('pendapatan', 15, 2)->nullable()->after('pendidikan');
            $table->string('agama')->nullable()->after('nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->dropColumn(['pendidikan', 'pendapatan', 'agama']);
        });
    }
};
