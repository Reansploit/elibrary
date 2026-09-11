import { useEffect, useState } from 'react';
import { createBook, updateBook } from '../lib/api';
import type { Book } from '../lib/types';
import { ApiError } from '../lib/types';

interface Props {
  /** null = mode tambah, Book = mode edit */
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const empty = { id_buku: '', isbn: '', judul: '', pengarang: '', penerbit: '', th_terbit: new Date().getFullYear(), kategori: 'Umum', rak: 'A1', stok_total: 5 };

/** Modal tambah/edit buku: melayang di atas tabel tanpa pindah halaman. */
export default function BookModal({ book, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setErr('');
      setForm(book ? { id_buku: book.id_buku, isbn: book.isbn, judul: book.judul, pengarang: book.pengarang, penerbit: book.penerbit, th_terbit: book.th_terbit, kategori: book.kategori, rak: book.rak, stok_total: book.stok_total } : empty);
    }
  }, [open, book]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;

  const save = async () => {
    setErr('');
    if (!form.id_buku.trim() || !form.judul.trim() || !form.pengarang.trim()) {
      setErr('ID, Judul, dan Pengarang wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      if (book) await updateBook(book.id_buku, { ...form });
      else await createBook({ ...form });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-surface p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold">{book ? `Edit Buku ${book.id_buku}` : 'Tambah Buku'}</p>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">✕</button>
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          {(['id_buku', 'isbn', 'judul', 'pengarang', 'penerbit', 'kategori', 'rak'] as const).map((k) => (
            <label key={k} className="grid gap-1">
              <span className="text-xs capitalize text-muted">{k.replace('_', ' ')}</span>
              <input
                value={String(form[k])} disabled={!!book && k === 'id_buku'}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink outline-none placeholder:text-faint focus:border-brand disabled:opacity-60"
              />
            </label>
          ))}
          <div className="flex gap-2">
            <label className="grid w-1/2 gap-1">
              <span className="text-xs text-muted">Tahun terbit</span>
              <input type="number" value={form.th_terbit} onChange={(e) => setForm({ ...form, th_terbit: Number(e.target.value) })} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink outline-none focus:border-brand" />
            </label>
            <label className="grid w-1/2 gap-1">
              <span className="text-xs text-muted">Stok total</span>
              <input type="number" min={0} value={form.stok_total} onChange={(e) => setForm({ ...form, stok_total: Number(e.target.value) })} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink outline-none focus:border-brand" />
            </label>
          </div>
          {err && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">{err}</p>}
          <div className="mt-1 flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2 font-semibold text-muted hover:bg-surface-2">Batal</button>
            <button disabled={saving} onClick={save} className="flex-1 rounded-xl bg-brand py-2 font-bold text-white hover:bg-brand-dark disabled:opacity-60">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
