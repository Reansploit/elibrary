<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddSearchAndOperationalIndexes extends Migration
{
    public function up()
    {
        // Needed for fast ILIKE '%keyword%' queries in PostgreSQL.
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');

        // Books search indexes
        DB::statement('CREATE INDEX IF NOT EXISTS idx_books_code_trgm ON books USING gin (code gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin (title gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin (author gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_books_publisher_trgm ON books USING gin (publisher gin_trgm_ops)');

        // Members search indexes
        DB::statement('CREATE INDEX IF NOT EXISTS idx_members_rfid_code_trgm ON members USING gin (rfid_code gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_members_name_trgm ON members USING gin (name gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_members_class_name_trgm ON members USING gin (class_name gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_members_room_name_trgm ON members USING gin (room_name gin_trgm_ops)');

        // Users search indexes (admin account management)
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON users USING gin (username gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_role_btree ON users (role)');

        // Circulation search/monitoring indexes
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_legacy_id_trgm ON circulations USING gin (legacy_id gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_status_btree ON circulations (status)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_member_id_btree ON circulations (member_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_book_id_btree ON circulations (book_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_borrow_date_btree ON circulations (borrow_date)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_due_date_btree ON circulations (due_date)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_circulations_return_date_btree ON circulations (return_date)');
    }

    public function down()
    {
        DB::statement('DROP INDEX IF EXISTS idx_books_code_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_books_title_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_books_author_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_books_publisher_trgm');

        DB::statement('DROP INDEX IF EXISTS idx_members_rfid_code_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_members_name_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_members_class_name_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_members_room_name_trgm');

        DB::statement('DROP INDEX IF EXISTS idx_users_name_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_users_username_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_users_role_btree');

        DB::statement('DROP INDEX IF EXISTS idx_circulations_legacy_id_trgm');
        DB::statement('DROP INDEX IF EXISTS idx_circulations_status_btree');
        DB::statement('DROP INDEX IF EXISTS idx_circulations_member_id_btree');
        DB::statement('DROP INDEX IF EXISTS idx_circulations_book_id_btree');
        DB::statement('DROP INDEX IF EXISTS idx_circulations_borrow_date_btree');
        DB::statement('DROP INDEX IF EXISTS idx_circulations_due_date_btree');
        DB::statement('DROP INDEX IF EXISTS idx_circulations_return_date_btree');
    }
}

