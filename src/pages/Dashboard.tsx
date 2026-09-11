import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getCheckoutChart, getSummary, listLoans } from '../lib/api';

function Card({ label, value, delta }: { label: string; value: string | number; delta?: number }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl bg-white p-3.5 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">
        {value}{' '}
        {delta !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
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

  useEffect(() => {
    getSummary().then(setS);
    getCheckoutChart().then(setChart);
    listLoans().then((r) => setLoans(r.data));
  }, []);

  const data = chart ? chart.labels.map((l, i) => ({ name: l, Borrowed: chart.borrowed[i], Returned: chart.returned[i] })) : [];
  const overdue = loans.filter((l) => l.status === 'overdue').slice(0, 6);

  return (
    <div className="space-y-4">
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
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-3">
          <p className="text-sm font-bold">Check-out statistics</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Borrowed" stroke="#5cb86b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Returned" stroke="#e05252" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <p className="text-sm font-bold">Overdue's History</p>
          <div className="mt-2 overflow-x-auto text-xs">
            <table className="w-full">
              <thead className="text-left text-slate-400">
                <tr><th className="py-1">Member ID</th><th>Title</th><th>ISBN</th><th>Due</th><th>Fine</th></tr>
              </thead>
              <tbody>
                {overdue.map((l) => (
                  <tr key={l.id_sk} className="border-t">
                    <td className="py-1.5">{l.id_sk}</td><td className="max-w-[140px] truncate">{l.judul}</td>
                    <td>{l.isbn}</td><td>{l.due_date.slice(5)}</td><td>${Math.max(10, Math.round(l.fine / 1000))}</td>
                  </tr>
                ))}
                {overdue.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-slate-400">Tidak ada overdue 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Recent Check-out's</p>
            <Link to="/checkout" className="text-xs text-green-600">View All</Link>
          </div>
          <div className="mt-2 overflow-x-auto text-xs">
            <table className="w-full">
              <thead className="text-left text-slate-400">
                <tr><th>ID</th><th>ISBN</th><th>Title</th><th>Author</th><th>Member</th><th>Issued</th><th>Return</th></tr>
              </thead>
              <tbody>
                {loans.slice(0, 6).map((l) => (
                  <tr key={l.id_sk} className="border-t">
                    <td className="py-1.5">{l.id_sk}</td><td>{l.isbn}</td>
                    <td className="max-w-[160px] truncate">{l.judul}</td><td className="max-w-[120px] truncate">{l.author}</td>
                    <td className="max-w-[120px] truncate">{l.member}</td><td>{l.issued_date.slice(5)}</td><td>{(l.return_date ?? l.due_date).slice(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs"><span className="rounded-full bg-green-500 px-2 py-0.5 text-white">Top Books</span> <span className="ml-1 rounded-full border px-2 py-0.5 text-slate-500">New arrivals</span></p>
          <div className="mt-2 space-y-2.5 text-sm">
            {[['Magnolia Palace', 'Cristofer Bator'], ['Don Quixote', 'Aspen Siphron'], ['Pride and Prejudice', 'Kianna Geidt']].map(([t, a]) => (
              <div key={t}><p className="font-semibold">{t}</p><p className="text-xs text-slate-500">{a}</p><span className="mt-0.5 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">Available</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
