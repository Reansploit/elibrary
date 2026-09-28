<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tb_buku', 'jenis')) {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->string('jenis', 10)->default('buku')->after('kategori');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tb_buku', 'jenis')) {
            Schema::table('tb_buku', function (Blueprint $table) {
                $table->dropColumn('jenis');
            });
        }
    }
};
