<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        $search = request('search');
        $perPage = (int) request('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $query = Book::query();
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                    ->orWhere('title', 'ilike', "%{$search}%")
                    ->orWhere('author', 'ilike', "%{$search}%")
                    ->orWhere('publisher', 'ilike', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:books,code'],
            'title' => ['required', 'string', 'max:120'],
            'author' => ['required', 'string', 'max:120'],
            'publisher' => ['required', 'string', 'max:120'],
            'published_year' => ['required', 'integer', 'between:1900,2100'],
        ]);

        $book = Book::create($data);

        return response()->json($book, 201);
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json([
            'message' => 'Buku berhasil dihapus.',
        ]);
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:books,code,' . $book->id],
            'title' => ['required', 'string', 'max:120'],
            'author' => ['required', 'string', 'max:120'],
            'publisher' => ['required', 'string', 'max:120'],
            'published_year' => ['required', 'integer', 'between:1900,2100'],
        ]);

        $book->update($data);

        return response()->json($book);
    }
}
