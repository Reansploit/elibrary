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
     * Toleran terhadap skema warisan: lewati langkah yang sudah sesuai,
     * perbaiki yang kurang, tanpa menghapus data.
     */
    public function up(): void
    {
        // 1. Lepas FK lama di id_anggota (apapun namanya) agar kolom bisa diubah.
        foreach (['tb_sirkulasi', 'log_pinjam'] as $table) {
            $fks = DB::select(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                 AND COLUMN_NAME = 'id_anggota' AND REFERENCED_TABLE_NAME = 'tb_anggota'",
                [$table]
            );
            foreach ($fks as $fk) {
                try {
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                } catch (\Throwable $e) {
                    // Abaikan bila sudah terlepas.
                }
            }
        }

        // 2. Samakan panjang id_anggota menjadi VARCHAR(50) bila masih lebih pendek.
        foreach (['tb_anggota', 'tb_sirkulasi', 'log_pinjam'] as $table) {
            $col = DB::selectOne(
                "SELECT CHARACTER_MAXIMUM_LENGTH AS l FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'id_anggota'",
                [$table]
            );
            if ($col && (int) $col->l < 50) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `id_anggota` VARCHAR(50) NOT NULL");
            }
        }

        // 3. Pastikan kolom no_hp ada dan nullable.
        if (! Schema::hasColumn('tb_anggota', 'no_hp')) {
            DB::statement('ALTER TABLE `tb_anggota` ADD COLUMN `no_hp` VARCHAR(15) NULL AFTER `kelas`');
        } else {
            DB::statement('ALTER TABLE `tb_anggota` MODIFY `no_hp` VARCHAR(15) NULL');
        }

        // 4. Pasang kembali FK cascade (lewati bila sudah ada).
        foreach (['tb_sirkulasi' => 'tb_sirkulasi_ibfk_2', 'log_pinjam' => 'log_pinjam_ibfk_1'] as $table => $name) {
            $exists = DB::selectOne(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
                [$table, $name]
            );
            if (! $exists) {
                DB::statement(
                    "ALTER TABLE `{$table}` ADD CONSTRAINT `{$name}` FOREIGN KEY (`id_anggota`)
                     REFERENCES `tb_anggota` (`id_anggota`) ON DELETE CASCADE ON UPDATE CASCADE"
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_sirkulasi', function (Blueprint $table) {
            $table->dropForeign('tb_sirkulasi_ibfk_2');
        });

        Schema::table('log_pinjam', function (Blueprint $table) {
            $table->dropForeign('log_pinjam_ibfk_1');
        });

        Schema::table('tb_anggota', function (Blueprint $table) {
            $table->string('id_anggota', 10)->change();
            $table->string('no_hp', 15)->nullable(false)->change();
        });

        Schema::table('tb_sirkulasi', function (Blueprint $table) {
            $table->string('id_anggota', 10)->change();
        });

        Schema::table('log_pinjam', function (Blueprint $table) {
            $table->string('id_anggota', 10)->change();
        });

        Schema::table('tb_sirkulasi', function (Blueprint $table) {
            $table->foreign('id_anggota')
                ->references('id_anggota')
                ->on('tb_anggota')
                ->onDelete('cascade')
                ->onUpdate('cascade')
                ->name('tb_sirkulasi_ibfk_2');
        });

        Schema::table('log_pinjam', function (Blueprint $table) {
            $table->foreign('id_anggota')
                ->references('id_anggota')
                ->on('tb_anggota')
                ->onDelete('cascade')
                ->onUpdate('cascade')
                ->name('log_pinjam_ibfk_1');
        }
    }
};
