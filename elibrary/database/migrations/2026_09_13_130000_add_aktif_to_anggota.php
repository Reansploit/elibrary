<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Penanda santri masih aktif atau sudah lulus/keluar.
     * Yang nonaktif tidak bisa meminjam lagi.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('tb_anggota', 'aktif')) {
            Schema::table('tb_anggota', function (Blueprint $table) {
                $table->boolean('aktif')->default(true)->after('sanksi_sampai');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_anggota', function (Blueprint $table) {
            $table->dropColumn('aktif');
        });
    }
};
