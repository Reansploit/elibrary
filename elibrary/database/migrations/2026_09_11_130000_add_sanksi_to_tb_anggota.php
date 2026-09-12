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
            DB::statement('ALTER TABLE `tb_anggota` ADD COLUMN `sanksi` TINYINT(1) NOT NULL DEFAULT 0 AFTER `kelas`');
            DB::statement('ALTER TABLE `tb_anggota` ADD COLUMN `sanksi_sampai` DATE NULL DEFAULT NULL AFTER `sanksi`');
        } else {
            Schema::table('tb_anggota', function (Blueprint $table) {
                $table->boolean('sanksi')->default(false)->after('kelas');
                $table->date('sanksi_sampai')->nullable()->after('sanksi');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_anggota', function (Blueprint $table) {
            $table->dropColumn(['sanksi', 'sanksi_sampai']);
        });
    }
};
