import type { Book, Loan, LoanSettings, Member } from '../lib/types';

const KEY = 'elib_db_v2';

export interface Db {
  books: Book[];
  members: Member[];
  loans: Loan[];
  settings: LoanSettings;
}

function seed(): Db {
  return {
    settings: { default_loan_days: 7, max_books_per_member: 4, max_extend_times: 1, fine_per_day: 1000 },
    books: [
      { id_buku: 'B001', isbn: '3234', judul: 'Magnolia Palace', pengarang: 'Fiona Davis', penerbit: 'Armi Print', th_terbit: 2010, kategori: 'Novel', rak: 'A1', stok_total: 10, stok_tersedia: 4 },
      { id_buku: 'B002', isbn: '3234', judul: 'Don Quixote', pengarang: 'Miguel de Cervantes', penerbit: 'UMK', th_terbit: 2020, kategori: 'Klasik', rak: 'A2', stok_total: 8, stok_tersedia: 5 },
      { id_buku: 'B003', isbn: '3234', judul: "Alice's Adventures in Wonderland", pengarang: 'Lewis Carroll', penerbit: 'Toni Perc', th_terbit: 2010, kategori: 'Anak', rak: 'B1', stok_total: 12, stok_tersedia: 6 },
      { id_buku: 'B004', isbn: '3234', judul: 'Pride and Prejudice', pengarang: 'Jane Austen', penerbit: 'Armi Print', th_terbit: 2009, kategori: 'Romance', rak: 'B2', stok_total: 6, stok_tersedia: 2 },
      { id_buku: 'B005', isbn: '3234', judul: 'Treasure Island', pengarang: 'Philip Siphon', penerbit: 'Toni Perc', th_terbit: 2020, kategori: 'Petualangan', rak: 'C1', stok_total: 9, stok_tersedia: 7 },
    ],
    members: [
      { id_anggota: 'A001', rfid_uid: 'A1B2C3D4', nama: 'Ana', jekel: 'Perempuan', kelas: 'Juwana', kamar: '1-2-3', status: 'active', registered_via: 'petugas', registered_at: '2024-01-10' },
      { id_anggota: 'A002', rfid_uid: 'B2C3D4E5', nama: 'Bagus', jekel: 'Laki-laki', kelas: 'Demak', kamar: '1-3-4', status: 'active', registered_via: 'petugas', registered_at: '2024-02-01' },
      { id_anggota: 'A005', rfid_uid: 'C3D4E5F6', nama: 'Edi', jekel: 'Laki-laki', kelas: 'Demak', kamar: '2-1-1', status: 'blacklisted', blacklist_reason: 'Buku hilang belum ganti', registered_via: 'petugas', registered_at: '2024-03-01' },
    ],
    loans: [
      { id_sk: '#48964', id_buku: 'B001', isbn: '3234', judul: 'Magnolia Palace', author: 'Fiona Davis', id_anggota: 'A001', member: 'Philip Workman', issued_date: '2026-09-02', due_date: '2026-09-09', fine: 10000, status: 'overdue' },
      { id_sk: '#48965', id_buku: 'B002', isbn: '3234', judul: 'Don Quixote', author: 'Miguel de Cervantes', id_anggota: 'A002', member: 'Kianna Donin', issued_date: '2026-09-02', due_date: '2026-09-15', fine: 0, status: 'borrowed' },
      { id_sk: '#48966', id_buku: 'B003', isbn: '3234', judul: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', id_anggota: 'A001', member: 'Cristofer Bator', issued_date: '2026-09-03', due_date: '2026-09-13', fine: 0, status: 'borrowed' },
      { id_sk: '#48967', id_buku: 'B004', isbn: '3234', judul: 'Pride and Prejudice', author: 'Jane Austen', id_anggota: 'A002', member: 'Livia Kenter', issued_date: '2026-09-03', due_date: '2026-09-13', fine: 0, status: 'borrowed' },
    ],
  };
}

export function loadDb(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Db;
  } catch {
    return seed();
  }
}

export function saveDb(db: Db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function resetDb(): Db {
  const s = seed();
  saveDb(s);
  return s;
}
