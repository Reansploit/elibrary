import axios from 'axios';
import { loadDb, saveDb } from '../mocks/db';
import { isValidUid, normalizeUid } from './rfid';
import { ApiError, type AppNotification, type Book, type CheckinResult, type CheckoutResult, type Loan, type LoanSettings, type Member } from './types';

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

export async function changePassword(oldPassword: string, newPassword: string) {
  await delay();
  if (newPassword.length < 4) throw new ApiError('WEAK_PASSWORD', 'Password baru minimal 4 karakter', 400);
  if (!MOCK) return (await http.patch('/auth/password', { oldPassword, newPassword })).data;
  if (!oldPassword) throw new ApiError('WRONG_PASSWORD', 'Password lama salah', 401);
  return { ok: true };
}

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
export type RangeKey = '7d' | '1m' | '6m' | '1y' | 'custom';

const RANGE_FACTOR: Record<RangeKey, number> = { '7d': 0.06, '1m': 0.22, '6m': 1, '1y': 1.9, custom: 0.5 };
const RANGE_LABEL: Record<RangeKey, string> = { '7d': '7 hari', '1m': '1 bulan', '6m': '6 bulan', '1y': '1 tahun', custom: 'kustom' };

export function rangeLabel(r: RangeKey) {
  return RANGE_LABEL[r];
}

export async function getSummary(range: RangeKey = '6m', from?: string, to?: string) {
  await delay();
  if (!MOCK) return (await http.get('/stats/summary', { params: { range, from, to } })).data;
  const db = loadDb();
  const f = RANGE_FACTOR[range];
  const scale = (n: number) => Math.max(1, Math.round(n * f));
  const borrowed = db.loans.filter((l) => l.status !== 'returned').length;
  const overdue = db.loans.filter((l) => l.status === 'overdue').length;
  void from; void to;
  return {
    borrowed: scale(2405) + borrowed, borrowedDelta: 23,
    returned: scale(783), returnedDelta: -14,
    overdue: scale(45) + overdue, overdueDelta: -11,
    missing: scale(12), missingDelta: 11,
    totalBooks: 32345 + db.books.length, totalBooksDelta: 11,
    visitors: scale(1504), visitorsDelta: 3,
    newMembers: scale(34), newMembersDelta: -10,
    pendingFees: Math.round(765000 * f), pendingFeesDelta: 56,
  };
}

const CHARTS: Record<Exclude<RangeKey, 'custom'>, { labels: string[]; borrowed: number[]; returned: number[] }> = {
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    borrowed: [2500, 4500, 3000, 3200, 3500, 1800, 3500],
    returned: [1400, 3200, 2100, 4400, 3800, 4200, 2500],
  },
  '1m': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    borrowed: [9800, 11200, 8600, 10400],
    returned: [7200, 9100, 8300, 9600],
  },
  '6m': {
    labels: ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'],
    borrowed: [32000, 38000, 35000, 41000, 39000, 42000],
    returned: [28000, 31000, 33000, 36000, 35000, 38000],
  },
  '1y': {
    labels: ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'],
    borrowed: [28000, 30000, 26000, 31000, 33000, 32000, 38000, 35000, 41000, 39000, 40000, 42000],
    returned: [24000, 27000, 23000, 28000, 30000, 29000, 31000, 33000, 36000, 35000, 37000, 38000],
  },
};

export async function getCheckoutChart(range: RangeKey = '6m', from?: string, to?: string) {
  await delay();
  if (!MOCK) return (await http.get('/stats/checkouts', { params: { range, from, to } })).data;
  void from; void to;
  return CHARTS[range === 'custom' ? '1m' : range];
}

// ---------- Books ----------
export type BookField = 'all' | 'judul' | 'pengarang' | 'penerbit' | 'isbn' | 'kategori' | 'rak';

export async function listBooks(search = '', field: BookField = 'all'): Promise<{ data: Book[]; total: number }> {
  await delay();
  if (!MOCK) return (await http.get('/books', { params: { search, field } })).data;
  const db = loadDb();
  const q = search.toLowerCase();
  const hit = (b: Book) => {
    if (!q) return true;
    const get = (f: Exclude<BookField, 'all'>) => String(b[f] ?? '').toLowerCase();
    if (field === 'all') {
      return b.judul.toLowerCase().includes(q) || b.pengarang.toLowerCase().includes(q) || b.isbn.includes(q) || b.id_buku.toLowerCase().includes(q) || b.penerbit.toLowerCase().includes(q) || b.kategori.toLowerCase().includes(q);
    }
    if (field === 'isbn') return b.isbn.includes(q) || b.id_buku.toLowerCase().includes(q);
    return get(field).includes(q);
  };
  const data = db.books.filter(hit);
  return { data, total: data.length };
}

export async function createBook(input: Omit<Book, 'stok_tersedia'> & { stok_tersedia?: number }): Promise<Book> {
  await delay();
  if (input.stok_total < 0) throw new ApiError('INVALID_STOK', 'Stok tidak boleh negatif', 400);
  if (!MOCK) return (await http.post('/books', input)).data;
  const db = loadDb();
  if (db.books.some((b) => b.id_buku === input.id_buku)) throw new ApiError('DUPLICATE_ID', `ID ${input.id_buku} sudah dipakai`, 409);
  const book: Book = { ...input, stok_tersedia: input.stok_tersedia ?? input.stok_total };
  db.books.unshift(book);
  saveDb(db);
  return book;
}

export async function updateBook(id: string, patch: Partial<Book>): Promise<Book> {
  await delay();
  if (patch.stok_total !== undefined && patch.stok_total < 0) throw new ApiError('INVALID_STOK', 'Stok tidak boleh negatif', 400);
  if (!MOCK) return (await http.patch(`/books/${id}`, patch)).data;
  const db = loadDb();
  const b = db.books.find((x) => x.id_buku === id);
  if (!b) throw new ApiError('NOT_FOUND', 'Buku tidak ditemukan', 404);
  Object.assign(b, patch);
  // jaga konsistensi: tersedia tidak boleh melebihi total
  if (b.stok_tersedia > b.stok_total) b.stok_tersedia = b.stok_total;
  saveDb(db);
  return b;
}

export async function deleteBook(id: string): Promise<void> {
  await delay();
  if (!MOCK) { await http.delete(`/books/${id}`); return; }
  const db = loadDb();
  const active = db.loans.some((l) => l.id_buku === id && l.status !== 'returned');
  if (active) throw new ApiError('BOOK_BORROWED', 'Buku masih dipinjam, tidak bisa dihapus', 422);
  db.books = db.books.filter((b) => b.id_buku !== id);
  saveDb(db);
}

// ---------- Members + RFID ----------
export const KAMAR_RE = /^\d{1,2}-\d{1,2}-\d{1,3}$/;

export function normalizeKamar(raw: string): string {
  return raw.replace(/[^0-9-]/g, '').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

export function isValidKamar(kamar: string): boolean {
  return KAMAR_RE.test(kamar.trim());
}

export async function registerMember(input: { rfid_uid: string; nama: string; jekel: Member['jekel']; kelas: string; kamar: string }): Promise<Member> {
  await delay();
  const uid = normalizeUid(input.rfid_uid);
  if (!isValidUid(uid)) throw new ApiError('UID_INVALID', 'UID kartu tidak valid (harus hex 8-10 karakter)', 400);
  const kamar = input.kamar.trim();
  if (!isValidKamar(kamar)) throw new ApiError('KAMAR_INVALID', 'Format kamar salah, contoh: 1-3-4', 400);
  if (!MOCK) return (await http.post('/members/register', { ...input, kamar, rfid_uid: uid })).data;
  const db = loadDb();
  if (db.members.some((m) => m.rfid_uid === uid)) throw new ApiError('ALREADY_REGISTERED', 'Kartu sudah terdaftar', 409);
  const n = db.members.length + 1;
  const m: Member = {
    id_anggota: 'A' + String(100 + n).padStart(3, '0'),
    rfid_uid: uid,
    nama: input.nama, jekel: input.jekel, kelas: input.kelas, kamar,
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

// ---------- Notifications (mock: diturunkan dari data; real: GET /notifications) ----------
const NOTIF_READ_KEY = 'elib_notif_read_v1';

function readIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_READ_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export async function getNotifications(): Promise<(AppNotification & { read: boolean })[]> {
  await delay(150);
  if (!MOCK) {
    const { data } = await http.get('/notifications');
    const read = new Set(readIds());
    return (data as AppNotification[]).map((n) => ({ ...n, read: read.has(n.id) }));
  }
  const db = loadDb();
  const items: AppNotification[] = [];
  for (const l of db.loans.filter((x) => x.status === 'overdue')) {
    items.push({
      id: `ov-${l.id_sk}`, kind: 'overdue',
      title: `Overdue: ${l.judul}`,
      desc: `${l.member} • jatuh tempo ${l.due_date} • denda Rp${l.fine}`,
      link: '/checkout',
    });
  }
  for (const b of db.books.filter((x) => x.stok_tersedia <= 2)) {
    items.push({
      id: `st-${b.id_buku}`, kind: 'stock',
      title: `Stok menipis: ${b.judul}`,
      desc: `Tersisa ${b.stok_tersedia} dari ${b.stok_total} • rak ${b.rak}`,
      link: '/books',
    });
  }
  for (const m of db.members.filter((x) => x.registered_via === 'kiosk')) {
    items.push({
      id: `nm-${m.id_anggota}`, kind: 'member',
      title: `Anggota baru via kiosk: ${m.nama}`,
      desc: `${m.id_anggota} • kamar ${m.kamar}`,
      link: '/members',
    });
  }
  const pending = db.loans.reduce((a, l) => a + l.fine, 0);
  if (pending > 0) {
    items.push({
      id: 'fee-pending', kind: 'fee',
      title: 'Denda pending perlu ditagih',
      desc: `Total Rp${pending} dari pinjaman overdue`,
      link: '/checkout',
    });
  }
  const read = new Set(readIds());
  return items.map((n) => ({ ...n, read: read.has(n.id) }));
}

export async function markNotificationRead(id: string) {
  const ids = new Set(readIds());
  ids.add(id);
  localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...ids]));
}

export async function markAllNotificationsRead() {
  const items = await getNotifications();
  localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(items.map((i) => i.id)));
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
