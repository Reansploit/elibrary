import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookModal from '../components/BookModal';
import { deleteBook, listBooks, type BookField } from '../lib/api';
import type { Book } from '../lib/types';
import { ApiError } from '../lib/types';

const PAGE_SIZE = 20;
const FIELDS: { v: BookField; l: string }[] = [
  { v: 'all', l: 'Semua' },
  { v: 'judul', l: 'Judul' },
  { v: 'pengarang', l: 'Pengarang' },
  { v: 'penerbit', l: 'Penerbit' },
  { v: 'isbn', l: 'ISBN' },
  { v: 'kategori', l: 'Kategori' },
  { v: 'rak', l: 'Rak' },
];

export default function Books() {
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [field, setField] = useState<BookField>('all');
  const [kategori, setKategori] = useState('all');
  const [stok, setStok] = useState<'all' | 'available' | 'empty'>('all');
  const [rows, setRows] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const load = () => listBooks(q, field).then((r) => { setRows(r.data); setPage(0); });
  useEffect(() => { load(); }, [q, field]);

  const kategoris = useMemo(() => [...new Set(rows.map((b) => b.kategori))].sort(), [rows]);
  const filtered = useMemo(
    () => rows.filter((b) => (kategori === 'all' || b.kategori === kategori) && (stok === 'all' || (stok === 'available' ? b.stok_tersedia > 0 : b.stok_tersedia <= 0))),
    [rows, kategori, stok],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const doDelete = async (id: string) => {
    setErr('');
    try {
      await deleteBook(id);
      setConfirmDel(null);
      load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Gagal menghapus');
    }
  };

  const sel = 'rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink outline-none focus:border-brand';

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold">Data Buku ({filtered.length})</p>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="ml-auto rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            + Tambah Buku
          </button>
        </div>
        {/* Filter pelengkap: field + teks + kategori + stok */}
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={field} onChange={(e) => setField(e.target.value as BookField)} className={sel}>
            {FIELDS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik untuk mencari…" className={`${sel} min-w-52 flex-1`} />
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} className={sel}>
            <option value="all">Semua kategori</option>
            {kategoris.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={stok} onChange={(e) => setStok(e.target.value as typeof stok)} className={sel}>
            <option value="all">Semua stok</option>
            <option value="available">Tersedia</option>
            <option value="empty">Habis</option>
          </select>
          {(q || field !== 'all' || kategori !== 'all' || stok !== 'all') && (
            <button onClick={() => { setQ(''); setField('all'); setKategori('all'); setStok('all'); }} className="text-xs text-faint underline">Reset</button>
          )}
        </div>
        {err && <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">{err}</p>}

        <div className="mt-3 overflow-x-auto text-sm">
          <table className="w-full">
            <thead className="text-left text-xs text-faint">
              <tr><th className="py-1">ID</th><th>ISBN</th><th>Judul</th><th>Pengarang</th><th>Penerbit</th><th>Thn</th><th>Kategori</th><th>Rak</th><th>Stok</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {shown.map((b) => (
                <tr key={b.id_buku} className="border-t border-line">
                  <td className="py-2 font-mono text-xs text-faint">{b.id_buku}</td>
                  <td className="font-mono text-xs">{b.isbn}</td>
                  <td className="font-medium">{b.judul}</td>
                  <td>{b.pengarang}</td>
                  <td className="text-muted">{b.penerbit}</td>
                  <td>{b.th_terbit}</td>
                  <td className="text-muted">{b.kategori}</td>
                  <td className="font-mono text-xs">{b.rak}</td>
                  <td className={b.stok_tersedia > 0 ? 'text-brand' : 'text-red-500 dark:text-red-400'}>{b.stok_tersedia}/{b.stok_total}</td>
                  <td className="whitespace-nowrap">
                    {confirmDel === b.id_buku ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        Yakin?
                        <button onClick={() => doDelete(b.id_buku)} className="rounded bg-red-500 px-2 py-0.5 font-bold text-white">Ya</button>
                        <button onClick={() => setConfirmDel(null)} className="rounded border border-line px-2 py-0.5 text-muted">Batal</button>
                      </span>
                    ) : (
                      <span className="inline-flex gap-1 text-xs">
                        <button onClick={() => { setEditing(b); setModalOpen(true); }} className="rounded-lg border border-line px-2 py-1 text-brand hover:bg-brand-soft">Edit</button>
                        <button onClick={() => setConfirmDel(b.id_buku)} className="rounded-lg border border-line px-2 py-1 text-red-500 hover:bg-red-500/10 dark:text-red-400">Hapus</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={10} className="py-6 text-center text-sm text-faint">Tidak ada buku yang cocok.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>Halaman {page + 1} dari {pages} • {filtered.length} buku</span>
          <span className="flex gap-1.5">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line px-3 py-1 disabled:opacity-40">‹ Prev</button>
            <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line px-3 py-1 disabled:opacity-40">Next ›</button>
          </span>
        </div>
      </div>

      <BookModal book={editing} open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} />
    </div>
  );
}
