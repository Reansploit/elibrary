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
            $tables = ['tb_buku', 'tb_anggota', 'tb_sirkulasi', 'log_pinjam'];
            $in = "'" . implode("','", $tables) . "'";

            // Kumpulkan semua FK yang menyentuh tabel-tabel ini.
            $fks = DB::select(
                "SELECT k.CONSTRAINT_NAME AS name, k.TABLE_NAME AS tbl,
                        GROUP_CONCAT(k.COLUMN_NAME ORDER BY k.ORDINAL_POSITION) AS cols,
                        k.REFERENCED_TABLE_NAME AS ref_tbl,
                        GROUP_CONCAT(k.REFERENCED_COLUMN_NAME ORDER BY k.ORDINAL_POSITION) AS ref_cols,
                        r.UPDATE_RULE AS on_update, r.DELETE_RULE AS on_delete
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
                 JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS r
                   ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
                  AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
                  AND r.TABLE_NAME = k.TABLE_NAME
                 WHERE k.CONSTRAINT_SCHEMA = DATABASE()
                   AND (k.TABLE_NAME IN ({$in}) OR k.REFERENCED_TABLE_NAME IN ({$in}))
                 GROUP BY k.CONSTRAINT_NAME, k.TABLE_NAME, k.REFERENCED_TABLE_NAME,
                          r.UPDATE_RULE, r.DELETE_RULE"
            );

            // Lepas dulu (CONVERT menolak tabel yang terikat FK).
            foreach ($fks as $fk) {
                DB::statement("ALTER TABLE `{$fk->tbl}` DROP FOREIGN KEY `{$fk->name}`");
            }

            // Samakan charset (mentranskode data dengan benar).
            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    DB::statement(
                        "ALTER TABLE `{$table}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                    );
                }
            }

            // Pasang kembali FK persis seperti semula.
            foreach ($fks as $fk) {
                $cols = '`' . str_replace(',', '`,`', $fk->cols) . '`';
                $refCols = '`' . str_replace(',', '`,`', $fk->ref_cols) . '`';
                DB::statement(
                    "ALTER TABLE `{$fk->tbl}` ADD CONSTRAINT `{$fk->name}` FOREIGN KEY ({$cols})
                     REFERENCES `{$fk->ref_tbl}` ({$refCols})
                     ON UPDATE {$fk->on_update} ON DELETE {$fk->on_delete}"
                );
            }
        }

        if (! Schema::hasTable('tb_lokasi')) {
            Schema::create('tb_lokasi', function (Blueprint $table) {
                $table->string('id_lokasi', 10)->primary();
                $table->string('nama', 50);
                $table->string('keterangan', 100)->nullable();
            });
        }

        if (! Schema::hasColumn('tb_buku', 'lokasi')) {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->string('lokasi', 10)->nullable()->after('jumlah');
            });
        }

        $fkExists = false;

        if (DB::getDriverName() === 'mysql') {
            $fkExists = (bool) DB::selectOne(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tb_buku'
                 AND CONSTRAINT_NAME = 'tb_buku_lokasi_foreign'"
            );
        }

        if (! $fkExists) {
            try {
                Schema::table('tb_buku', function (Blueprint $table) {
                    $table->foreign('lokasi')
                        ->references('id_lokasi')
                        ->on('tb_lokasi')
                        ->onUpdate('cascade')
                        ->onDelete('restrict');
                });
            } catch (\Throwable $e) {
                // FK sudah ada (mis. migrasi sempat berjalan sebagian).
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_buku', function (Blueprint $table) {
            $table->dropForeign(['lokasi']);
        });

        Schema::table('tb_buku', function (Blueprint $table) {
            $table->dropColumn('lokasi');
        });

        Schema::dropIfExists('tb_lokasi');
    }
};
