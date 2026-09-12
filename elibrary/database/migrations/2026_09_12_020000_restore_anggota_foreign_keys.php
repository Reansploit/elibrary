<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Mengembalikan FK id_anggota yang seharusnya dibuat migrasi
     * expand_member_rfid_id (lepas di sebagian database).
     */
    public function up(): void
    {
        foreach (['tb_sirkulasi' => 'tb_sirkulasi_ibfk_2', 'log_pinjam' => 'log_pinjam_ibfk_1'] as $table => $name) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $exists = false;

            if (DB::getDriverName() === 'mysql') {
                $exists = (bool) DB::selectOne(
                    "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
                    [$table, $name]
                );
            }

            if (! $exists) {
                try {
                    Schema::table($table, function (Blueprint $table) use ($name) {
                        $table->foreign('id_anggota')
                            ->references('id_anggota')
                            ->on('tb_anggota')
                            ->onDelete('cascade')
                            ->onUpdate('cascade')
                            ->name($name);
                    });
                } catch (\Throwable $e) {
                    // Sudah ada atau tidak kompatibel — biarkan apa adanya.
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (['tb_sirkulasi' => 'tb_sirkulasi_ibfk_2', 'log_pinjam' => 'log_pinjam_ibfk_1'] as $table => $name) {
            try {
                Schema::table($table, function (Blueprint $table) use ($name) {
                    $table->dropForeign($name);
                });
            } catch (\Throwable $e) {
                // Abaikan bila tidak ada.
            }
        }
    }
};
