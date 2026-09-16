<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('devices', 'open_apps')) {
            Schema::table('devices', function (Blueprint $table) {
                $table->json('open_apps')->nullable()->after('active_title');
            });
        }
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn('open_apps');
        });
    }
};
