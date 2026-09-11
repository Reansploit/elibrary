<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCirculationsTable extends Migration
{
    public function up()
    {
        Schema::create('circulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->date('borrow_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status', 10)->default('PIN');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('circulations');
    }
}

