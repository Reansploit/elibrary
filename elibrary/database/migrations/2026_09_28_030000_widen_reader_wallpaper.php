<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `reader_settings` MODIFY `wallpaper` VARCHAR(255) NOT NULL DEFAULT 'polos'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `reader_settings` MODIFY `wallpaper` VARCHAR(30) NOT NULL DEFAULT 'polos'");
    }
};
