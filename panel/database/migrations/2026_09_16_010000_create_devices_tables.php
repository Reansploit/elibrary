<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('mac', 17)->unique();
            $table->string('hostname', 100);
            $table->string('custom_name', 100)->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('token_hash', 64);
            $table->string('agent_version', 20)->nullable();
            $table->boolean('app_open')->default(false);
            $table->string('active_title', 255)->nullable();
            $table->string('last_foreign_title', 255)->nullable();
            $table->unsignedTinyInteger('closed_beats')->default(0);
            $table->unsignedTinyInteger('foreign_beats')->default(0);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        Schema::create('device_commands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->enum('action', ['open_app', 'close_app', 'restart_agent']);
            $table->enum('status', ['pending', 'done', 'failed'])->default('pending');
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('done_at')->nullable();
            $table->timestamps();
        });

        Schema::create('device_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->enum('kind', [
                'enrolled', 'online', 'app_opened', 'app_closed',
                'foreign_window', 'renamed', 'command',
            ]);
            $table->string('detail', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->enum('kind', ['unexpected_close', 'foreign_app', 'offline_gap']);
            $table->string('message', 255);
            $table->boolean('handled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('device_logs');
        Schema::dropIfExists('device_commands');
        Schema::dropIfExists('devices');
    }
};
