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
            DB::statement('ALTER TABLE `tb_buku` MODIFY `pengarang` VARCHAR(30) NULL');
            DB::statement('ALTER TABLE `tb_buku` MODIFY `penerbit` VARCHAR(30) NULL');
            DB::statement('ALTER TABLE `tb_buku` MODIFY `th_terbit` YEAR NULL');
        } else {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->string('pengarang', 30)->nullable()->change();
                $table->string('penerbit', 30)->nullable()->change();
                $table->year('th_terbit')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `tb_buku` MODIFY `pengarang` VARCHAR(30) NOT NULL');
            DB::statement('ALTER TABLE `tb_buku` MODIFY `penerbit` VARCHAR(30) NOT NULL');
            DB::statement('ALTER TABLE `tb_buku` MODIFY `th_terbit` YEAR NOT NULL');
        } else {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->string('pengarang', 30)->nullable(false)->change();
                $table->string('penerbit', 30)->nullable(false)->change();
                $table->year('th_terbit')->nullable(false)->change();
            });
        }
    }
};
