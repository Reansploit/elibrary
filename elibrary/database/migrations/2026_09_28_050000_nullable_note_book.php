<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Catatan bebas: id_buku boleh kosong (tidak terikat buku).
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE `reader_notes` MODIFY `id_buku` VARCHAR(10) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `reader_notes` MODIFY `id_buku` VARCHAR(10) NOT NULL');
    }
};
