import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getCheckoutChart, getSummary, listLoans, rangeLabel, type RangeKey } from '../lib/api';

function Card({ label, value, delta }: { label: string; value: string | number; delta?: number }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl bg-surface p-3.5 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">
        {value}{' '}
        {delta !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${up ? 'bg-brand-soft text-brand' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300'}`}>
            {up ? '+' : ''}{delta}{label.includes('Fees') ? '%' : label === 'Visitors' ? '' : '%'}
          </span>
        )}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState<Record<string, number> | null>(null);
  const [chart, setChart] = useState<{ labels: string[]; borrowed: number[]; returned: number[] } | null>(null);
  const [loans, setLoans] = useState<Awaited<ReturnType<typeof listLoans>>['data']>([]);
  const [range, setRange] = useState<RangeKey>('6m');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    getSummary(range, from || undefined, to || undefined).then(setS);
    getCheckoutChart(range, from || undefined, to || undefined).then(setChart);
    listLoans().then((r) => setLoans(r.data));
  }, [range, from, to]);

  const data = chart ? chart.labels.map((l, i) => ({ name: l, Borrowed: chart.borrowed[i], Returned: chart.returned[i] })) : [];
  const overdue = loans.filter((l) => l.status === 'overdue').slice(0, 6);
  const presets: RangeKey[] = ['7d', '1m', '6m', '1y'];

  return (
    <div className="space-y-4">
      {/* Filter tanggal — gabung dengan bagian statistik utama */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface p-3 shadow-sm">
        <p className="text-sm font-bold"><span className="bg-brand-gradient bg-clip-text text-transparent">📊</span> Statistik</p>
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
          📅 {range === 'custom' ? `${from || '?'} → ${to || '?'}` : `Last ${rangeLabel(range)}`}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5 text-xs">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setRange(p)}
              className={`rounded-full px-3 py-1.5 font-semibold ${range === p ? 'bg-brand text-white' : 'bg-surface-2 text-muted hover:text-ink'}`}
            >
              {p === '7d' ? '7H' : p === '1m' ? '1B' : p === '6m' ? '6B' : '1T'}
            </button>
          ))}
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setRange('custom'); }} className="rounded-full border border-line bg-surface px-2 py-1 text-xs text-ink outline-none focus:border-brand" />
          <span className="text-faint">→</span>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setRange('custom'); }} className="rounded-full border border-line bg-surface px-2 py-1 text-xs text-ink outline-none focus:border-brand" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Borrowed Books" value={s?.borrowed ?? '…'} delta={s?.borrowedDelta} />
        <Card label="Returned Books" value={s?.returned ?? '…'} delta={s?.returnedDelta} />
        <Card label="Overdue Books" value={s?.overdue ?? '…'} delta={s?.overdueDelta} />
        <Card label="Missing Books" value={s?.missing ?? '…'} delta={s?.missingDelta} />
        <Card label="Total Books" value={s?.totalBooks ?? '…'} delta={s?.totalBooksDelta} />
        <Card label="Visitors" value={s?.visitors ?? '…'} delta={s?.visitorsDelta} />
        <Card label="New Members" value={s?.newMembers ?? '…'} delta={s?.newMembersDelta} />
        <Card label="Pending Fees" value={s ? `$${Math.round(s.pendingFees / 1000)}` : '…'} delta={s?.pendingFeesDelta} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl bg-surface p-4 shadow-sm lg:col-span-3">
          <p className="text-sm font-bold">Check-out statistics</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--faint)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--faint)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)' }}
                  labelStyle={{ color: 'var(--ink)' }}
                />
                <Legend wrapperStyle={{ color: 'var(--muted)' }} />
                <Line type="monotone" dataKey="Borrowed" stroke="var(--brand)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Returned" stroke="#e05252" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-sm lg:col-span-2">
          <p className="text-sm font-bold">Overdue's History</p>
          <div className="mt-2 overflow-x-auto text-xs">
            <table className="w-full">
              <thead className="text-left text-faint">
                <tr><th className="py-1">Member ID</th><th>Title</th><th>ISBN</th><th>Due</th><th>Fine</th></tr>
              </thead>
              <tbody>
                {overdue.map((l) => (
                  <tr key={l.id_sk} className="border-t border-line">
                    <td className="py-1.5">{l.id_sk}</td><td className="max-w-[140px] truncate">{l.judul}</td>
                    <td>{l.isbn}</td><td>{l.due_date.slice(5)}</td><td>${Math.max(10, Math.round(l.fine / 1000))}</td>
                  </tr>
                ))}
                {overdue.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-faint">Tidak ada overdue 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-surface p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Recent Check-out's</p>
            <Link to="/checkout" className="text-xs text-brand">View All</Link>
          </div>
          <div className="mt-2 overflow-x-auto text-xs">
            <table className="w-full">
              <thead className="text-left text-faint">
                <tr><th>ID</th><th>ISBN</th><th>Title</th><th>Author</th><th>Member</th><th>Issued</th><th>Return</th></tr>
              </thead>
              <tbody>
                {loans.slice(0, 6).map((l) => (
                  <tr key={l.id_sk} className="border-t border-line">
                    <td className="py-1.5">{l.id_sk}</td><td>{l.isbn}</td>
                    <td className="max-w-[160px] truncate">{l.judul}</td><td className="max-w-[120px] truncate">{l.author}</td>
                    <td className="max-w-[120px] truncate">{l.member}</td><td>{l.issued_date.slice(5)}</td><td>{(l.return_date ?? l.due_date).slice(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-sm">
          <p className="text-xs"><span className="rounded-full bg-brand px-2 py-0.5 text-white">Top Books</span> <span className="ml-1 rounded-full border border-line px-2 py-0.5 text-muted">New arrivals</span></p>
          <div className="mt-2 space-y-2.5 text-sm">
            {[['Magnolia Palace', 'Cristofer Bator'], ['Don Quixote', 'Aspen Siphron'], ['Pride and Prejudice', 'Kianna Geidt']].map(([t, a]) => (
              <div key={t}><p className="font-semibold">{t}</p><p className="text-xs text-muted">{a}</p><span className="mt-0.5 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand">Available</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
