<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master kategori kitab/buku + kolom opsional di tb_buku.
     */
    public function up(): void
    {
        if (! Schema::hasTable('tb_kategori')) {
            Schema::create('tb_kategori', function (Blueprint $table) {
                $table->string('id_kategori', 10)->primary();
                $table->string('nama', 50);
                $table->string('keterangan', 100)->nullable();
            });
        }

        if (! Schema::hasColumn('tb_buku', 'kategori')) {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->string('kategori', 10)->nullable()->after('lokasi');
                $table->foreign('kategori')
                    ->references('id_kategori')
                    ->on('tb_kategori')
                    ->onUpdate('cascade')
                    ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_buku', function (Blueprint $table) {
            $table->dropForeign(['kategori']);
            $table->dropColumn('kategori');
        });

        Schema::dropIfExists('tb_kategori');
    }
};
