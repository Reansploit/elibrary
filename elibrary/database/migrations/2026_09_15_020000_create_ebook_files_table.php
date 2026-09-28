<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tb_ebook_files')) {
            Schema::create('tb_ebook_files', function (Blueprint $table) {
                $table->id();
                $table->string('id_buku', 10);
                $table->string('format', 10)->default('pdf');
                $table->string('original_name', 255);
                $table->string('stored_name', 255);
                $table->string('mime_type', 100)->default('application/pdf');
                $table->unsignedBigInteger('size_bytes')->default(0);
                $table->timestamps();

                $table->unique(['id_buku', 'format']);
                $table->foreign('id_buku')
                    ->references('id_buku')
                    ->on('tb_buku')
                    ->onUpdate('cascade')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_ebook_files');
    }
};
