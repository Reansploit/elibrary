export type Role = 'Administrator' | 'Petugas' | 'Anggota';

export interface User {
  id: string;
  nama: string;
  username: string;
  role: Role;
}

export interface Book {
  id_buku: string;
  isbn: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  th_terbit: number;
  kategori: string;
  rak: string;
  cover_url?: string;
  stok_total: number;
  stok_tersedia: number;
}

export interface Member {
  id_anggota: string;
  rfid_uid: string;
  nama: string;
  jekel: 'Laki-laki' | 'Perempuan';
  kelas: string;
  /** Nomor kamar santri, format angka-angka-angka, contoh "1-3-4". */
  kamar: string;
  status: 'active' | 'blacklisted';
  blacklist_reason?: string;
  registered_via: 'kiosk' | 'petugas';
  registered_at: string;
}

export interface Loan {
  id_sk: string;
  id_buku: string;
  isbn: string;
  judul: string;
  author: string;
  id_anggota: string;
  member: string;
  issued_date: string; // YYYY-MM-DD
  due_date: string;
  return_date?: string;
  fine: number;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface LoanSettings {
  default_loan_days: number;
  max_books_per_member: number;
  max_extend_times: number;
  fine_per_day: number;
}

export interface AppNotification {
  id: string;
  kind: 'overdue' | 'stock' | 'fee' | 'member';
  title: string;
  desc: string;
  link: string;
}

export interface CheckoutResult {
  id_transaksi: string;
  due_date: string;
  items: Loan[];
}

export interface CheckinResult {
  returned: number;
  total_fine: number;
  items: { id_sk: string; fine: number; late_days: number }[];
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
