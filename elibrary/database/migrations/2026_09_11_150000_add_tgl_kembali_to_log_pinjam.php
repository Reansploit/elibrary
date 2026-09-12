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
            DB::statement('ALTER TABLE `log_pinjam` ADD COLUMN `tgl_kembali` DATE NULL DEFAULT NULL AFTER `tgl_pinjam`');
        } else {
            Schema::table('log_pinjam', function (Blueprint $table) {
                $table->date('tgl_kembali')->nullable()->after('tgl_pinjam');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('log_pinjam', function (Blueprint $table) {
            $table->dropColumn('tgl_kembali');
        });
    }
};
