import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createBook, listBooks } from '../lib/api';

export default function Books() {
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listBooks>>['data']>([]);
  const [form, setForm] = useState({ id_buku: '', isbn: '', judul: '', pengarang: '', penerbit: '', th_terbit: 2024, kategori: 'Umum', rak: 'A1', stok_total: 5 });
  const load = () => listBooks(q).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [q]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
        <p className="text-sm font-bold">Data Buku ({rows.length})</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ISBN / judul / author…" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#5cb86b]" />
        <div className="mt-2 max-h-[480px] space-y-1 overflow-auto text-sm">
          {rows.map((b) => (
            <div key={b.id_buku} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
              <span className="font-mono text-xs text-slate-400">{b.id_buku}</span>
              <span className="font-medium">{b.judul}</span>
              <span className="text-xs text-slate-500">— {b.pengarang} • {b.isbn} • {b.th_terbit}</span>
              <span className={`ml-auto text-xs ${b.stok_tersedia > 0 ? 'text-green-600' : 'text-red-500'}`}>{b.stok_tersedia}/{b.stok_total}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-bold">Add Books</p>
        <div className="mt-2 grid gap-2 text-sm">
          {(['id_buku', 'isbn', 'judul', 'pengarang', 'penerbit', 'kategori', 'rak'] as const).map((k) => (
            <input key={k} placeholder={k} value={String(form[k])} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="rounded-lg border px-3 py-1.5 outline-none focus:border-[#5cb86b]" />
          ))}
          <div className="flex gap-2">
            <input type="number" placeholder="th_terbit" value={form.th_terbit} onChange={(e) => setForm({ ...form, th_terbit: Number(e.target.value) })} className="w-1/2 rounded-lg border px-3 py-1.5 outline-none" />
            <input type="number" placeholder="stok" value={form.stok_total} onChange={(e) => setForm({ ...form, stok_total: Number(e.target.value) })} className="w-1/2 rounded-lg border px-3 py-1.5 outline-none" />
          </div>
          <button
            onClick={async () => { await createBook({ ...form }); setForm({ id_buku: '', isbn: '', judul: '', pengarang: '', penerbit: '', th_terbit: 2024, kategori: 'Umum', rak: 'A1', stok_total: 5 }); load(); }}
            className="rounded-xl bg-[#5cb86b] py-2 font-bold text-white hover:bg-[#45a055]"
          >
            Simpan Buku
          </button>
        </div>
      </div>
    </div>
  );
}
