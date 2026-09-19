<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cabut total modul perangkat/LUNAR dari panel.
     * Backend LUNAR sudah mandiri — tabel-tabel ini tidak dipakai lagi.
     */
    public function up(): void
    {
        Schema::dropIfExists('device_managed_app');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('device_logs');
        Schema::dropIfExists('device_commands');
        Schema::dropIfExists('devices');
        Schema::dropIfExists('managed_apps');
        Schema::dropIfExists('personal_access_tokens');
    }

    public function down(): void
    {
        // Tidak dikembalikan — modul sudah pindah ke backend LUNAR.
    }
};
