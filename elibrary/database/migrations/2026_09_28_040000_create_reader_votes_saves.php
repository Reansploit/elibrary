<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Suara (suka/tidak) dan simpanan ebook per akun. Satu suara per
     * akun per buku berlaku di Katalog dan Baca sekaligus.
     */
    public function up(): void
    {
        Schema::create('reader_votes', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('id_buku', 10)->index();
            $table->tinyInteger('vote');
            $table->timestamps();
            $table->unique(['id_anggota', 'id_buku']);
        });

        Schema::create('reader_saves', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('id_buku', 10)->index();
            $table->timestamps();
            $table->unique(['id_anggota', 'id_buku']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reader_saves');
        Schema::dropIfExists('reader_votes');
    }
};
