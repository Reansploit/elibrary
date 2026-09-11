<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->unique()->after('name');
        });

        // Backfill usernames for existing rows using the local part of their email
        DB::statement("UPDATE users SET username = LOWER(REGEXP_REPLACE(SUBSTRING_INDEX(email, '@', 1), '[^a-z0-9_]', '_')) WHERE username IS NULL");

        // If any generated usernames collide (edge case), append a suffix
        $duplicates = DB::select("SELECT username FROM users GROUP BY username HAVING COUNT(*) > 1");
        foreach ($duplicates as $dup) {
            $rows = DB::table('users')->where('username', $dup->username)->orderBy('id')->get();
            foreach ($rows as $i => $row) {
                if ($i === 0) continue; // keep the first one as-is
                DB::table('users')->where('id', $row->id)->update([
                    'username' => $row->username . '_' . $row->id,
                ]);
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
