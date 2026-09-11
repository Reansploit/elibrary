<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Circulation;
use App\Models\Member;
use Illuminate\Database\Seeder;

class LegacyLibrarySeeder extends Seeder
{
    public function run()
    {
        Book::upsert([
            ['code' => 'B001', 'title' => 'Matematika', 'author' => 'anastasya', 'publisher' => 'armi print', 'published_year' => 2010],
            ['code' => 'B002', 'title' => 'RPL 2', 'author' => 'Eko', 'publisher' => 'UMK', 'published_year' => 2020],
            ['code' => 'B003', 'title' => 'C++', 'author' => 'Anton', 'publisher' => 'Toni Perc', 'published_year' => 2010],
            ['code' => 'B004', 'title' => 'CI 4', 'author' => 'anastasya', 'publisher' => 'armi print', 'published_year' => 2009],
            ['code' => 'B005', 'title' => 'Data Mining', 'author' => 'Anton', 'publisher' => 'Toni Perc', 'published_year' => 2020],
        ], ['code'], ['title', 'author', 'publisher', 'published_year']);

        Member::upsert([
            ['rfid_code' => 'A001', 'name' => 'Ana', 'class_name' => 'juwana', 'room_name' => '-'],
            ['rfid_code' => 'A002', 'name' => 'Bagus', 'class_name' => 'demak', 'room_name' => '-'],
            ['rfid_code' => 'A003', 'name' => 'Citra', 'class_name' => 'demak', 'room_name' => '-'],
            ['rfid_code' => 'A004', 'name' => 'Didik', 'class_name' => 'pati', 'room_name' => '-'],
            ['rfid_code' => 'A005', 'name' => 'Edi', 'class_name' => 'demak', 'room_name' => '-'],
        ], ['rfid_code'], ['name', 'class_name', 'room_name']);

        $bookMap = Book::pluck('id', 'code');
        $memberMap = Member::pluck('id', 'rfid_code');

        $legacyCirculations = [
            ['legacy_id' => 'S001', 'book_code' => 'B001', 'member_code' => 'A001', 'borrow_date' => '2020-06-23', 'due_date' => '2020-06-30', 'status' => 'KEM'],
            ['legacy_id' => 'S002', 'book_code' => 'B002', 'member_code' => 'A001', 'borrow_date' => '2020-06-13', 'due_date' => '2020-06-20', 'status' => 'PIN'],
            ['legacy_id' => 'S003', 'book_code' => 'B003', 'member_code' => 'A002', 'borrow_date' => '2020-06-22', 'due_date' => '2020-06-29', 'status' => 'PIN'],
            ['legacy_id' => 'S004', 'book_code' => 'B002', 'member_code' => 'A005', 'borrow_date' => '2020-06-23', 'due_date' => '2020-06-30', 'status' => 'PIN'],
        ];

        // Keep only one active PIN per book (latest borrow date wins) to satisfy DB unique index.
        usort($legacyCirculations, function ($a, $b) {
            return strcmp($b['borrow_date'], $a['borrow_date']);
        });
        $activePinBookCodes = [];

        foreach ($legacyCirculations as $row) {
            $bookId = $bookMap[$row['book_code']] ?? null;
            $memberId = $memberMap[$row['member_code']] ?? null;

            if (!$bookId || !$memberId) {
                continue;
            }

            $status = $row['status'];
            if ($status === 'PIN') {
                if (in_array($row['book_code'], $activePinBookCodes, true)) {
                    $status = 'KEM';
                } else {
                    $activePinBookCodes[] = $row['book_code'];
                }
            }

            Circulation::updateOrCreate(
                ['legacy_id' => $row['legacy_id']],
                [
                    'book_id' => $bookId,
                    'member_id' => $memberId,
                    'borrow_date' => $row['borrow_date'],
                    'due_date' => $row['due_date'],
                    'status' => $status,
                    'return_date' => $status === 'KEM' ? $row['due_date'] : null,
                ]
            );
        }
    }
}
