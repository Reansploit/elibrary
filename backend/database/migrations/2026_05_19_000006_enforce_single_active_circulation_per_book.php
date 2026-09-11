<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class EnforceSingleActiveCirculationPerBook extends Migration
{
    public function up()
    {
        // Normalize existing legacy rows: keep latest PIN per book, close older duplicates.
        DB::statement("
            WITH ranked AS (
                SELECT id, book_id,
                       ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY id DESC) AS rn
                FROM circulations
                WHERE status = 'PIN'
            )
            UPDATE circulations c
            SET status = 'KEM',
                return_date = COALESCE(c.return_date, c.due_date)
            FROM ranked r
            WHERE c.id = r.id
              AND r.rn > 1
        ");

        DB::statement("
            CREATE UNIQUE INDEX circulations_one_active_pin_per_book
            ON circulations (book_id)
            WHERE status = 'PIN'
        ");
    }

    public function down()
    {
        DB::statement("DROP INDEX IF EXISTS circulations_one_active_pin_per_book");
    }
}

