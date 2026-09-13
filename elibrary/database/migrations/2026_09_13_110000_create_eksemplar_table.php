<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lacak tiap eksemplar buku (kode unit + status) agar buku hilang/rusak
     * ketahuan per unit, bukan cuma angka stok.
     */
    public function up(): void
    {
        if (! Schema::hasTable('tb_eksemplar')) {
            Schema::create('tb_eksemplar', function (Blueprint $table) {
                $table->id();
                $table->string('id_buku', 10);
                $table->string('kode', 20)->unique();
                $table->enum('status', ['tersedia', 'dipinjam', 'hilang', 'rusak'])->default('tersedia');

                $table->foreign('id_buku')
                    ->references('id_buku')
                    ->on('tb_buku')
                    ->onUpdate('cascade')
                    ->onDelete('cascade');
            });
        }

        if (! Schema::hasColumn('tb_sirkulasi', 'id_eksemplar')) {
            Schema::table('tb_sirkulasi', function (Blueprint $table) {
                $table->unsignedBigInteger('id_eksemplar')->nullable()->after('id_anggota');
                $table->foreign('id_eksemplar')
                    ->references('id')
                    ->on('tb_eksemplar')
                    ->onUpdate('cascade')
                    ->onDelete('set null');
            });
        }

        // Seed eksemplar dari stok (jumlah) yang sudah ada.
        $books = DB::table('tb_buku')->select('id_buku', 'jumlah')->get();
        foreach ($books as $book) {
            $count = max(0, (int) $book->jumlah);
            for ($i = 1; $i <= $count; $i++) {
                $kode = $book->id_buku . '-' . str_pad($i, 2, '0', STR_PAD_LEFT);
                DB::table('tb_eksemplar')->insertOrIgnore([
                    'id_buku' => $book->id_buku,
                    'kode' => $kode,
                    'status' => 'tersedia',
                ]);
            }
        }

        // Kaitkan pinjaman aktif yang lama ke eksemplar tersedia.
        $activeLoans = DB::table('tb_sirkulasi')
            ->where('status', 'PIN')
            ->whereNull('id_eksemplar')
            ->orderBy('id_sk')
            ->get();
        foreach ($activeLoans as $loan) {
            $copy = DB::table('tb_eksemplar')
                ->where('id_buku', $loan->id_buku)
                ->where('status', 'tersedia')
                ->orderBy('kode')
                ->first();
            if (! $copy) {
                continue;
            }
            DB::table('tb_eksemplar')->where('id', $copy->id)->update(['status' => 'dipinjam']);
            DB::table('tb_sirkulasi')->where('id_sk', $loan->id_sk)->update(['id_eksemplar' => $copy->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_sirkulasi', function (Blueprint $table) {
            $table->dropForeign(['id_eksemplar']);
            $table->dropColumn('id_eksemplar');
        });

        Schema::dropIfExists('tb_eksemplar');
    }
};
