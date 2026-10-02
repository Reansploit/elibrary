<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel warisan era sebelum migrasi (pondok lama): bila belum ada
     * (instalasi baru), buat dengan skema awal; migrasi-migrasi
     * berikutnya yang mengubahnya tetap jalan di atasnya.
     */
    public function up(): void
    {
        if (! Schema::hasTable('tb_anggota')) {
            Schema::create('tb_anggota', function (Blueprint $table) {
                $table->string('id_anggota', 10)->primary();
                $table->string('nama', 50);
                $table->enum('jekel', ['Laki-laki', 'Perempuan']);
                $table->string('kelas', 50);
            });
        }

        if (! Schema::hasTable('tb_buku')) {
            Schema::create('tb_buku', function (Blueprint $table) {
                $table->string('id_buku', 10)->primary();
                $table->string('judul_buku', 30);
                $table->string('pengarang', 30);
                $table->string('penerbit', 30);
                $table->year('th_terbit');
            });
        }

        if (! Schema::hasTable('log_pinjam')) {
            Schema::create('log_pinjam', function (Blueprint $table) {
                $table->increments('id_log');
                $table->string('id_buku', 10)->index();
                $table->string('id_anggota', 50)->index();
                $table->date('tgl_pinjam');
            });
        }

        if (! Schema::hasTable('tb_sirkulasi')) {
            Schema::create('tb_sirkulasi', function (Blueprint $table) {
                $table->string('id_sk', 20)->primary();
                $table->string('id_buku', 10)->index();
                $table->string('id_anggota', 50)->index();
                $table->date('tgl_pinjam');
                $table->date('tgl_kembali');
                $table->enum('status', ['PIN', 'KEM']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_sirkulasi');
        Schema::dropIfExists('log_pinjam');
        Schema::dropIfExists('tb_buku');
        Schema::dropIfExists('tb_anggota');
    }
};
