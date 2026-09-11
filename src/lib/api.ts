import axios from 'axios';
import { loadDb, saveDb } from '../mocks/db';
import { isValidUid, normalizeUid } from './rfid';
import { ApiError, type Book, type CheckinResult, type CheckoutResult, type Loan, type LoanSettings, type Member } from './types';

const MOCK = import.meta.env.VITE_API_MOCK !== 'false';
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const http = axios.create({ baseURL: BASE });

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t.toISOString().slice(0, 10);
};
const diffDays = (a: string, b: string) =>
  Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

// ---------- Auth (mock) ----------
const USERS = [
  { id: '1', nama: 'Allison', username: 'admin', password: '123', role: 'Administrator' as const },
  { id: '2', nama: 'Petugas', username: 'petugas', password: '123', role: 'Petugas' as const },
];

export async function login(username: string, password: string) {
  await delay();
  if (MOCK) {
    const u = USERS.find((x) => x.username === username && x.password === password);
    if (!u) throw new ApiError('INVALID_CREDENTIALS', 'Username atau password salah', 401);
    return { accessToken: 'mock.' + u.id, user: { id: u.id, nama: u.nama, username: u.username, role: u.role } };
  }
  const { data } = await http.post('/auth/login', { username, password });
  return data;
}

// ---------- Stats ----------
export async function getSummary() {
  await delay();
  if (!MOCK) return (await http.get('/stats/summary?range=6m')).data;
  const db = loadDb();
  const borrowed = db.loans.filter((l) => l.status !== 'returned').length;
  const overdue = db.loans.filter((l) => l.status === 'overdue').length;
  return {
    borrowed: 2405 + borrowed, borrowedDelta: 23,
    returned: 783, returnedDelta: -14,
    overdue: 45 + overdue, overdueDelta: -11,
    missing: 12, missingDelta: 11,
    totalBooks: 32345 + db.books.length, totalBooksDelta: 11,
    visitors: 1504, visitorsDelta: 3,
    newMembers: 34, newMembersDelta: -10,
    pendingFees: 765000, pendingFeesDelta: 56,
  };
}

export async function getCheckoutChart() {
  await delay();
  if (!MOCK) return (await http.get('/stats/checkouts?groupBy=day&range=7d')).data;
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    borrowed: [2500, 4500, 3000, 3200, 3500, 1800, 3500],
    returned: [1400, 3200, 2100, 4400, 3800, 4200, 2500],
  };
}

// ---------- Books ----------
export async function listBooks(search = ''): Promise<{ data: Book[]; total: number }> {
  await delay();
  if (!MOCK) return (await http.get('/books', { params: { search } })).data;
  const db = loadDb();
  const q = search.toLowerCase();
  const data = db.books.filter(
    (b) => !q || b.judul.toLowerCase().includes(q) || b.pengarang.toLowerCase().includes(q) || b.isbn.includes(q) || b.id_buku.toLowerCase().includes(q),
  );
  return { data, total: data.length };
}

export async function createBook(input: Omit<Book, 'stok_tersedia'> & { stok_tersedia?: number }): Promise<Book> {
  await delay();
  if (!MOCK) return (await http.post('/books', input)).data;
  const db = loadDb();
  const book: Book = { ...input, stok_tersedia: input.stok_tersedia ?? input.stok_total };
  db.books.unshift(book);
  saveDb(db);
  return book;
}

// ---------- Members + RFID ----------
export async function registerMember(input: { rfid_uid: string; nama: string; jekel: Member['jekel']; kelas: string; no_hp: string }): Promise<Member> {
  await delay();
  const uid = normalizeUid(input.rfid_uid);
  if (!isValidUid(uid)) throw new ApiError('UID_INVALID', 'UID kartu tidak valid (harus hex 8-10 karakter)', 400);
  if (!MOCK) return (await http.post('/members/register', { ...input, rfid_uid: uid })).data;
  const db = loadDb();
  if (db.members.some((m) => m.rfid_uid === uid)) throw new ApiError('ALREADY_REGISTERED', 'Kartu sudah terdaftar', 409);
  const n = db.members.length + 1;
  const m: Member = {
    id_anggota: 'A' + String(100 + n).padStart(3, '0'),
    rfid_uid: uid,
    nama: input.nama, jekel: input.jekel, kelas: input.kelas, no_hp: input.no_hp,
    status: 'active', registered_via: 'kiosk', registered_at: today(),
  };
  db.members.unshift(m);
  saveDb(db);
  return m;
}

export async function lookupMember(uidRaw: string): Promise<Member & { pinjaman_aktif: number; overdue: number; denda: number }> {
  await delay();
  const uid = normalizeUid(uidRaw);
  if (!MOCK) return (await http.get('/members/lookup', { params: { rfid_uid: uid } })).data;
  const db = loadDb();
  const m = db.members.find((x) => x.rfid_uid === uid);
  if (!m) throw new ApiError('NOT_FOUND', 'Kartu belum terdaftar, arahkan ke kiosk pendaftaran', 404);
  if (m.status === 'blacklisted') throw new ApiError('BLACKLISTED', `Anggota di-blacklist: ${m.blacklist_reason ?? '-'}`, 403);
  const active = db.loans.filter((l) => l.id_anggota === m.id_anggota && l.status !== 'returned');
  return { ...m, pinjaman_aktif: active.length, overdue: active.filter((l) => l.status === 'overdue').length, denda: active.reduce((a, l) => a + l.fine, 0) };
}

export async function listMembers(search = '', status = '') {
  await delay();
  if (!MOCK) return (await http.get('/members', { params: { search, status } })).data;
  const db = loadDb();
  const q = search.toLowerCase();
  const data = db.members.filter(
    (m) => (!q || m.nama.toLowerCase().includes(q) || m.id_anggota.toLowerCase().includes(q) || m.rfid_uid.includes(q.toUpperCase())) && (!status || m.status === status),
  );
  return { data, total: data.length };
}

export async function setBlacklist(id: string, is_blacklisted: boolean, reason?: string): Promise<Member> {
  await delay();
  if (!MOCK) return (await http.patch(`/members/${id}/blacklist`, { is_blacklisted, reason })).data;
  const db = loadDb();
  const m = db.members.find((x) => x.id_anggota === id);
  if (!m) throw new ApiError('NOT_FOUND', 'Anggota tidak ditemukan', 404);
  m.status = is_blacklisted ? 'blacklisted' : 'active';
  m.blacklist_reason = is_blacklisted ? reason ?? 'Diblokir petugas' : undefined;
  saveDb(db);
  return m;
}

// ---------- Loans ----------
export async function listLoans(status = ''): Promise<{ data: Loan[] }> {
  await delay();
  if (!MOCK) return (await http.get('/loans', { params: { status } })).data;
  const db = loadDb();
  const data = status ? db.loans.filter((l) => l.status === status) : db.loans;
  return { data };
}

export async function checkout(member_rfid: string, book_ids: string[], due_days?: number): Promise<CheckoutResult> {
  await delay();
  if (!MOCK) return (await http.post('/loans/checkout', { member_rfid, book_ids, due_days })).data;
  const db = loadDb();
  const member = await lookupMember(member_rfid);
  const ndays = due_days ?? db.settings.default_loan_days;
  const activeCount = db.loans.filter((l) => l.id_anggota === member.id_anggota && l.status !== 'returned').length;
  if (activeCount + book_ids.length > db.settings.max_books_per_member)
    throw new ApiError('LOAN_LIMIT_EXCEEDED', `Maks ${db.settings.max_books_per_member} buku per anggota`, 422);
  const items: Loan[] = [];
  for (const id of book_ids) {
    const b = db.books.find((x) => x.id_buku === id);
    if (!b || b.stok_tersedia <= 0) throw new ApiError('BOOK_UNAVAILABLE', `Buku ${id} stok habis`, 422);
    b.stok_tersedia -= 1;
    const loan: Loan = {
      id_sk: '#' + Math.floor(48000 + Math.random() * 1999),
      id_buku: b.id_buku, isbn: b.isbn, judul: b.judul, author: b.pengarang,
      id_anggota: member.id_anggota, member: member.nama,
      issued_date: today(), due_date: addDays(today(), ndays), fine: 0, status: 'borrowed',
    };
    db.loans.unshift(loan);
    items.push(loan);
  }
  saveDb(db);
  return { id_transaksi: 'SK-2026-' + String(Math.floor(Math.random() * 9000) + 1000), due_date: addDays(today(), ndays), items };
}

export async function checkin(member_rfid: string, loan_ids: string[], confirm_uid: string): Promise<CheckinResult> {
  await delay();
  if (normalizeUid(member_rfid) !== normalizeUid(confirm_uid))
    throw new ApiError('CONFIRM_MISMATCH', 'Scan konfirmasi tidak sama dengan kartu anggota', 422);
  if (!MOCK) return (await http.post('/loans/checkin', { member_rfid, loan_ids, confirm_uid })).data;
  const db = loadDb();
  let total = 0;
  const items: CheckinResult['items'] = [];
  for (const id of loan_ids) {
    const l = db.loans.find((x) => x.id_sk === id);
    if (!l || l.status === 'returned') continue;
    const late = Math.max(0, diffDays(today(), l.due_date));
    const fine = late * db.settings.fine_per_day;
    l.status = 'returned';
    l.return_date = today();
    l.fine = fine;
    const b = db.books.find((x) => x.id_buku === l.id_buku);
    if (b) b.stok_tersedia += 1;
    total += fine;
    items.push({ id_sk: l.id_sk, fine, late_days: late });
  }
  saveDb(db);
  return { returned: items.length, total_fine: total, items };
}

// ---------- Settings ----------
export async function getLoanSettings(): Promise<LoanSettings> {
  await delay(150);
  if (!MOCK) return (await http.get('/settings/loan')).data;
  return loadDb().settings;
}

export async function saveLoanSettings(s: LoanSettings): Promise<LoanSettings> {
  await delay(150);
  if (!MOCK) return (await http.put('/settings/loan', s)).data;
  const db = loadDb();
  db.settings = s;
  saveDb(db);
  return s;
}
