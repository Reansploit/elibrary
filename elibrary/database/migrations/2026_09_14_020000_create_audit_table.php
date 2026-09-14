<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jejak siapa mengubah data (tambah/ubah/hapus).
     */
    public function up(): void
    {
        if (! Schema::hasTable('tb_audit')) {
            Schema::create('tb_audit', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('aksi', 10);
                $table->string('tabel', 30);
                $table->string('record_id', 50)->nullable();
                $table->string('keterangan', 255)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_audit');
    }
};
