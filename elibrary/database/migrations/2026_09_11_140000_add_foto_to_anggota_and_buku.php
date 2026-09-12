<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `tb_anggota` ADD COLUMN `foto` VARCHAR(255) NULL DEFAULT NULL AFTER `kelas`');
            DB::statement('ALTER TABLE `tb_buku` ADD COLUMN `foto` VARCHAR(255) NULL DEFAULT NULL AFTER `jumlah`');
        } else {
            Schema::table('tb_anggota', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('kelas');
            });
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('jumlah');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_anggota', function (Blueprint $table) {
            $table->dropColumn('foto');
        });
        Schema::table('tb_buku', function (Blueprint $table) {
            $table->dropColumn('foto');
        });
    }
};
