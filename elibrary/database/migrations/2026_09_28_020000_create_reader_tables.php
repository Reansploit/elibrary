<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Data akun pembaca portal viewer. Kunci ke tb_anggota via id_anggota
     * (kartu RFID berisi ID anggota, jadi tanpa kolom baru di tb_anggota).
     */
    public function up(): void
    {
        Schema::create('reader_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('token_hash', 64)->unique();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('reader_progress', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('id_buku', 10)->index();
            $table->unsignedInteger('page')->default(1);
            $table->enum('status', ['baca', 'antre', 'selesai'])->default('baca');
            $table->timestamps();
            $table->unique(['id_anggota', 'id_buku']);
        });

        Schema::create('reader_lists', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('name', 100);
            $table->timestamps();
        });

        Schema::create('reader_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('list_id')->constrained('reader_lists')->cascadeOnDelete();
            $table->string('id_buku', 10);
            $table->timestamps();
            $table->unique(['list_id', 'id_buku']);
        });

        Schema::create('reader_history', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('id_buku', 10)->index();
            $table->string('aksi', 20)->default('buka');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('reader_notes', function (Blueprint $table) {
            $table->id();
            $table->string('id_anggota', 50)->index();
            $table->string('id_buku', 10)->index();
            $table->unsignedInteger('page')->nullable();
            $table->text('catatan');
            $table->timestamps();
        });

        Schema::create('reader_settings', function (Blueprint $table) {
            $table->string('id_anggota', 50)->primary();
            $table->string('wallpaper', 30)->default('polos');
            $table->string('theme', 10)->default('light');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reader_notes');
        Schema::dropIfExists('reader_history');
        Schema::dropIfExists('reader_list_items');
        Schema::dropIfExists('reader_lists');
        Schema::dropIfExists('reader_progress');
        Schema::dropIfExists('reader_settings');
        Schema::dropIfExists('reader_tokens');
    }
};
