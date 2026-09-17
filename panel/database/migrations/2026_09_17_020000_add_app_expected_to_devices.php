<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('devices', 'app_expected')) {
            Schema::table('devices', function (Blueprint $table) {
                $table->boolean('app_expected')->default(true)->after('app_open');
            });
        }
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn('app_expected');
        });
    }
};
