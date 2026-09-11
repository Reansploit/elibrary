<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLegacyIdToCirculationsTable extends Migration
{
    public function up()
    {
        Schema::table('circulations', function (Blueprint $table) {
            $table->string('legacy_id', 20)->nullable()->unique()->after('id');
        });
    }

    public function down()
    {
        Schema::table('circulations', function (Blueprint $table) {
            $table->dropUnique(['legacy_id']);
            $table->dropColumn('legacy_id');
        });
    }
}

