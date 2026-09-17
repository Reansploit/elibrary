<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managed_apps', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('exe', 100);
            $table->string('launch', 255);
            $table->boolean('auto_reopen')->default(false);
            $table->timestamps();
        });

        Schema::table('device_commands', function (Blueprint $table) {
            $table->json('payload')->nullable()->after('action');
        });
    }

    public function down(): void
    {
        Schema::table('device_commands', function (Blueprint $table) {
            $table->dropColumn('payload');
        });
        Schema::dropIfExists('managed_apps');
    }
};
