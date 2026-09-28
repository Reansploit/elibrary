<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_buku', function (Blueprint $table) {
            $table->string('file_ebook', 255)->nullable()->after('foto');
        });
    }

    public function down(): void
    {
        Schema::table('tb_buku', function (Blueprint $table) {
            $table->dropColumn('file_ebook');
        });
    }
};
