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
        Schema::table('tb_sirkulasi', function (Blueprint $table) {
            $table->dropForeign('tb_sirkulasi_ibfk_2');
        });

        Schema::table('log_pinjam', function (Blueprint $table) {
            $table->dropForeign('log_pinjam_ibfk_1');
        });

        Schema::table('tb_anggota', function (Blueprint $table) {
            $table->string('id_anggota', 50)->change();
            $table->string('no_hp', 15)->nullable()->change();
        });

        Schema::table('tb_sirkulasi', function (Blueprint $table) {
            $table->string('id_anggota', 50)->change();
        });

        Schema::table('log_pinjam', function (Blueprint $table) {
            $table->string('id_anggota', 50)->change();
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
        });
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
        });
    }
};
