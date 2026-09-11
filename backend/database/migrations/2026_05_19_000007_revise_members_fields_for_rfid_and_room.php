<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReviseMembersFieldsForRfidAndRoom extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE members RENAME COLUMN member_code TO rfid_code");

        Schema::table('members', function (Blueprint $table) {
            $table->string('room_name', 80)->default('-')->after('class_name');
            $table->dropColumn('gender');
            $table->dropColumn('phone_number');
        });
    }

    public function down()
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('gender', 20)->default('Laki-laki')->after('name');
            $table->string('phone_number', 20)->default('-')->after('room_name');
            $table->dropColumn('room_name');
        });

        DB::statement("ALTER TABLE members RENAME COLUMN rfid_code TO member_code");
    }
}

