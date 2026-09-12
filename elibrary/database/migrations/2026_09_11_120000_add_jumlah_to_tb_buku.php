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
            DB::statement('ALTER TABLE `tb_buku` ADD COLUMN `jumlah` INT NOT NULL DEFAULT 1 AFTER `pengarang`');
        } else {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->integer('jumlah')->default(1)->after('pengarang');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_buku', function (Blueprint $table) {
            $table->dropColumn('jumlah');
        });
    }
};
