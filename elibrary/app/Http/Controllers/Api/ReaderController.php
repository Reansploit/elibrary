<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Member;
use App\Models\ReaderHistory;
use App\Models\ReaderList;
use App\Models\ReaderListItem;
use App\Models\ReaderNote;
use App\Models\ReaderProgress;
use App\Models\ReaderSetting;
use App\Models\ReaderToken;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReaderController extends Controller
{
    /**
     * Masuk dengan kartu RFID (berisi ID anggota). Tanpa password:
     * siapa memegang kartu dianggap pemiliknya, seperti meja sirkulasi.
     */
    public function login(Request $request)
    {
        $uid = trim((string) $request->input('rfid', ''));

        if ($uid === '') {
            return response()->json(['message' => 'Tempelkan kartu dulu.'], 422);
        }

        $member = Member::find($uid);

        if (! $member || ! $member->aktif) {
            return response()->json(['message' => 'Kartu tidak dikenal.'], 404);
        }

        $plain = Str::random(60);
        ReaderToken::create([
            'id_anggota' => $member->id_anggota,
            'token_hash' => hash('sha256', $plain),
        ]);

        $photo = static::photoUrl($member->foto);

        return response()->json([
            'token' => $plain,
            'member' => [
                'id' => $member->id_anggota,
                'name' => $member->nama,
                'photo' => $photo ? url($photo) : null,
                'class' => $member->kelas,
                'gender' => $member->jekel,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $plain = ltrim((string) $request->bearerToken());
        ReaderToken::where('token_hash', hash('sha256', $plain))->delete();

        return response()->json(['ok' => true]);
    }

    /** Progres baca milik akun (sedang dibaca / antre / selesai). */
    public function progress(Request $request)
    {
        $rows = ReaderProgress::where('id_anggota', $request->reader->id_anggota)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($p) => $this->withBook($p));

        return response()->json(['progress' => $rows]);
    }

    /** Simpan halaman terakhir + status sebuah buku. */
    public function saveProgress(Request $request)
    {
        $validated = $request->validate([
            'id_buku' => 'required|string|max:10',
            'page' => 'nullable|integer|min:1',
            'status' => 'nullable|in:baca,antre,selesai',
        ]);

        $progress = ReaderProgress::updateOrCreate(
            ['id_anggota' => $request->reader->id_anggota, 'id_buku' => $validated['id_buku']],
            [
                'page' => max(1, (int) ($validated['page'] ?? 1)),
                'status' => $validated['status'] ?? 'baca',
            ]
        );

        return response()->json($this->withBook($progress));
    }

    /** Daftar putar (playlist) milik akun. */
    public function lists(Request $request)
    {
        $rows = ReaderList::where('id_anggota', $request->reader->id_anggota)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
                'count' => ReaderListItem::where('list_id', $l->id)->count(),
            ]);

        return response()->json(['lists' => $rows]);
    }

    public function storeList(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:100']);

        $list = ReaderList::create([
            'id_anggota' => $request->reader->id_anggota,
            'name' => $validated['name'],
        ]);

        return response()->json(['id' => $list->id, 'name' => $list->name, 'count' => 0], 201);
    }

    public function destroyList(Request $request, $id)
    {
        $list = ReaderList::where('id_anggota', $request->reader->id_anggota)->findOrFail($id);
        $list->delete();

        return response()->json(['ok' => true]);
    }

    /** Isi sebuah daftar putar (beserta data bukunya). */
    public function listItems(Request $request, $id)
    {
        $list = ReaderList::where('id_anggota', $request->reader->id_anggota)->findOrFail($id);

        $items = ReaderListItem::where('list_id', $list->id)
            ->orderBy('id')
            ->get()
            ->map(fn ($i) => $this->bookCard($i->id_buku))
            ->filter()
            ->values();

        return response()->json(['id' => $list->id, 'name' => $list->name, 'items' => $items]);
    }

    public function addItem(Request $request, $id)
    {
        $validated = $request->validate(['id_buku' => 'required|string|max:10']);
        $list = ReaderList::where('id_anggota', $request->reader->id_anggota)->findOrFail($id);

        ReaderListItem::firstOrCreate(['list_id' => $list->id, 'id_buku' => $validated['id_buku']]);

        return response()->json(['ok' => true], 201);
    }

    public function removeItem(Request $request, $id, $bookId)
    {
        $list = ReaderList::where('id_anggota', $request->reader->id_anggota)->findOrFail($id);
        ReaderListItem::where('list_id', $list->id)->where('id_buku', $bookId)->delete();

        return response()->json(['ok' => true]);
    }

    /** Riwayat buka buku milik akun. */
    public function history(Request $request)
    {
        $rows = ReaderHistory::where('id_anggota', $request->reader->id_anggota)
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn ($h) => [
                'id' => $h->id,
                'aksi' => $h->aksi,
                'at' => $h->created_at,
                'book' => $this->bookCard($h->id_buku),
            ])
            ->filter(fn ($h) => $h['book']);

        return response()->json(['history' => $rows->values()]);
    }

    /** Catat sekali buka (dipanggil viewer saat buku dibuka). */
    public function logOpen(Request $request)
    {
        $validated = $request->validate(['id_buku' => 'required|string|max:10']);

        $log = ReaderHistory::create([
            'id_anggota' => $request->reader->id_anggota,
            'id_buku' => $validated['id_buku'],
            'aksi' => 'buka',
        ]);

        return response()->json(['ok' => true, 'id' => $log->id], 201);
    }

    /** Catatan milik akun per buku. */
    public function notes(Request $request)
    {
        $rows = ReaderNote::where('id_anggota', $request->reader->id_anggota)
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'page' => $n->page,
                'catatan' => $n->catatan,
                'at' => $n->updated_at,
                'book' => $this->bookCard($n->id_buku),
            ]);

        return response()->json(['notes' => $rows]);
    }

    public function storeNote(Request $request)
    {
        $validated = $request->validate([
            'id_buku' => 'required|string|max:10',
            'page' => 'nullable|integer|min:1',
            'catatan' => 'required|string|max:2000',
        ]);

        $note = ReaderNote::create([
            'id_anggota' => $request->reader->id_anggota,
            'id_buku' => $validated['id_buku'],
            'page' => $validated['page'] ?? null,
            'catatan' => $validated['catatan'],
        ]);

        return response()->json(['id' => $note->id], 201);
    }

    public function destroyNote(Request $request, $id)
    {
        $note = ReaderNote::where('id_anggota', $request->reader->id_anggota)->findOrFail($id);
        $note->delete();

        return response()->json(['ok' => true]);
    }

    /** Pengaturan tampilan milik akun (wallpaper + tema). */
    public function settings(Request $request)
    {
        $setting = ReaderSetting::firstOrCreate(
            ['id_anggota' => $request->reader->id_anggota],
            ['wallpaper' => 'polos', 'theme' => 'light']
        );

        return response()->json([
            'wallpaper' => $setting->wallpaper === 'polos' ? 'polos' : url(ltrim($setting->wallpaper, '/')),
            'theme' => $setting->theme,
        ]);
    }

    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'wallpaper' => 'nullable|string|max:255',
            'theme' => 'nullable|in:light,dark',
        ]);

        $setting = ReaderSetting::firstOrCreate(['id_anggota' => $request->reader->id_anggota]);
        $patch = array_filter($validated, fn ($v) => $v !== null);
        if (isset($patch['wallpaper']) && str_starts_with($patch['wallpaper'], 'http')) {
            $patch['wallpaper'] = ltrim((string) parse_url($patch['wallpaper'], PHP_URL_PATH), '/');
        }
        $setting->fill($patch)->save();

        return response()->json([
            'wallpaper' => $setting->wallpaper === 'polos' ? 'polos' : url(ltrim($setting->wallpaper, '/')),
            'theme' => $setting->theme,
        ]);
    }

    /** Unggah foto wallpaper milik akun (maks 2MB). */
    public function uploadWallpaper(Request $request)
    {
        $validated = $request->validate([
            'photo' => 'required|image|max:8192',
        ]);

        $setting = ReaderSetting::firstOrCreate(['id_anggota' => $request->reader->id_anggota]);

        $file = $request->file('photo');
        $name = \Illuminate\Support\Str::random(40) . '.' . strtolower($file->getClientOriginalExtension() ?: 'jpg');
        \Illuminate\Support\Facades\File::ensureDirectoryExists(public_path('wallpaper-reader'));
        $file->move(public_path('wallpaper-reader'), $name);

        $this->deleteWallpaperFile($setting->wallpaper);
        $setting->wallpaper = 'wallpaper-reader/' . $name;
        $setting->save();

        return response()->json(['wallpaper' => url($setting->wallpaper)], 201);
    }

    /** Kembali ke polos (hapus foto milik akun). */
    public function deleteWallpaper(Request $request)
    {
        $setting = ReaderSetting::firstOrCreate(['id_anggota' => $request->reader->id_anggota]);
        $this->deleteWallpaperFile($setting->wallpaper);
        $setting->wallpaper = 'polos';
        $setting->save();

        return response()->json(['wallpaper' => 'polos']);
    }

    private function deleteWallpaperFile(?string $path): void
    {
        if (! $path || $path === 'polos' || str_contains($path, '..')) {
            return;
        }

        $path = ltrim($path, '/');
        if (is_file(public_path($path))) {
            @unlink(public_path($path));
        }
    }

    private function withBook(ReaderProgress $progress): array
    {
        return [
            'id_buku' => $progress->id_buku,
            'page' => $progress->page,
            'status' => $progress->status,
            'updated' => $progress->updated_at,
            'book' => $this->bookCard($progress->id_buku),
        ];
    }

    private function bookCard(string $bookId): ?array
    {
        $book = Book::find($bookId);

        if (! $book) {
            return null;
        }

        $photo = static::photoUrl($book->foto);
        $file = static::photoUrl($book->file_ebook);

        return [
            'id' => $book->id_buku,
            'title' => $book->judul_buku,
            'author' => $book->pengarang,
            'photo' => $photo ? url($photo) : null,
            'file' => $file ? url($file) : null,
        ];
    }
}
