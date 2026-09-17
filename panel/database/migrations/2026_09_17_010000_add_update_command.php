<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE device_commands MODIFY COLUMN action ENUM('open_app','close_app','restart_agent','update_agent') NOT NULL");
    }

    public function down(): void
    {
        DB::table('device_commands')->where('action', 'update_agent')->delete();
        DB::statement("ALTER TABLE device_commands MODIFY COLUMN action ENUM('open_app','close_app','restart_agent') NOT NULL");
    }
};
