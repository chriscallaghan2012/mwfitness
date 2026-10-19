import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type MetricRow = { profile_id: string; metric_date: string; water_litres: number | string; steps: number };
type CardioRow = { id: string; profile_id: string; completed_at: string; activity: string; duration_minutes: number; average_heart_rate: number | null };
type SupplementRow = { id: string; profile_id: string; name: string; dosage_string: string; timing: string; active: boolean };

const panel = 'rounded-xl border border-zinc-800 bg-[#121315] p-4';
const tableClass = 'w-full min-w-[620px] text-left text-xs';
const cell = 'border-b border-zinc-800 px-3 py-3 align-top';

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-5 text-sm text-zinc-500">{children}</p>;
}

function RecordTable<T extends object>({
  rows,
  columns,
  empty,
  rowKey,
}: {
  rows: T[];
  columns: { label: string; render: (row: T) => React.ReactNode }[];
  empty: string;
  rowKey: (row: T) => string;
}) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  return <div className="overflow-x-auto"><table className={tableClass}>
    <thead><tr>{columns.map((column) => <th key={column.label} className={cell + ' font-mono uppercase tracking-wide text-zinc-500'}>{column.label}</th>)}</tr></thead>
    <tbody>{rows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.label} className={cell + ' text-zinc-300'}>{column.render(row)}</td>)}</tr>)}</tbody>
  </table></div>;
}

export function MemberActivityAdmin() {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [cardio, setCardio] = useState<CardioRow[]>([]);
  const [supplements, setSupplements] = useState<SupplementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!supabase) {
      setError('The shared Neon data connection is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [metricsResult, cardioResult, supplementResult] = await Promise.all([
        supabase.from('daily_metrics').select('profile_id,metric_date,water_litres,steps').order('metric_date', { ascending: false }).limit(25),
        supabase.from('cardio_logs').select('id,profile_id,completed_at,activity,duration_minutes,average_heart_rate').order('completed_at', { ascending: false }).limit(25),
        supabase.from('supplement_plans').select('id,profile_id,name,dosage_string,timing,active').order('created_at', { ascending: false }).limit(25),
      ]);
      const failed = [metricsResult.error, cardioResult.error, supplementResult.error].filter(Boolean);
      if (failed.length) {
        setError('Member activity tables are unavailable. Confirm migration 0007 is applied to the MW Fitness Neon project and staff read policies are enabled.');
        setMetrics([]);
        setCardio([]);
        setSupplements([]);
        return;
      }
      setMetrics((metricsResult.data || []) as MetricRow[]);
      setCardio((cardioResult.data || []) as CardioRow[]);
      setSupplements((supplementResult.data || []) as SupplementRow[]);
    } catch {
      setError('Could not load member activity. Check the connection and staff permissions, then retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-white">Member activity</h2><p className="mt-1 text-sm text-zinc-500">Recent hydration, steps, cardio logs and coach-assigned supplement plans from the shared mobile-app database.</p></div>
      <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Refreshing…' : 'Refresh activity'}</button>
    </div>
    {error && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-200">{error}</div>}
    {loading && <p role="status" className="text-sm text-zinc-500">Loading live member records…</p>}
    <section className={panel}><h3 className="font-semibold text-white">Daily hydration & steps</h3><p className="mt-1 text-xs text-zinc-500">Latest 25 member-day records</p><RecordTable rows={metrics} rowKey={(r) => r.profile_id + r.metric_date} empty={loading ? 'Loading…' : 'No daily metrics have been recorded yet.'} columns={[
      { label: 'Member ID', render: (r) => r.profile_id.slice(0, 8) + '…' },
      { label: 'Date', render: (r) => r.metric_date },
      { label: 'Water', render: (r) => `${Number(r.water_litres).toFixed(2)} L` },
      { label: 'Steps', render: (r) => Number(r.steps || 0).toLocaleString('en-GB') },
    ]} /></section>
    <section className={panel}><h3 className="font-semibold text-white">Cardio sessions</h3><p className="mt-1 text-xs text-zinc-500">Latest 25 completed sessions</p><RecordTable rows={cardio} rowKey={(r) => r.id} empty={loading ? 'Loading…' : 'No cardio sessions have been logged yet.'} columns={[
      { label: 'Member ID', render: (r) => r.profile_id.slice(0, 8) + '…' },
      { label: 'Completed', render: (r) => new Date(r.completed_at).toLocaleString('en-GB') },
      { label: 'Activity', render: (r) => r.activity },
      { label: 'Duration', render: (r) => `${r.duration_minutes} min` },
      { label: 'Avg. HR', render: (r) => r.average_heart_rate ? `${r.average_heart_rate} bpm` : '—' },
    ]} /></section>
    <section className={panel}><h3 className="font-semibold text-white">Supplement plans</h3><p className="mt-1 text-xs text-zinc-500">Coach-assigned records; use approved instructions only</p><RecordTable rows={supplements} rowKey={(r) => r.id} empty={loading ? 'Loading…' : 'No supplement plans have been assigned yet.'} columns={[
      { label: 'Member ID', render: (r) => r.profile_id.slice(0, 8) + '…' },
      { label: 'Supplement', render: (r) => r.name },
      { label: 'Instructions', render: (r) => r.dosage_string || 'As directed' },
      { label: 'Timing', render: (r) => r.timing.replaceAll('_', ' ').toLowerCase() },
      { label: 'Status', render: (r) => r.active ? 'Active' : 'Inactive' },
    ]} /></section>
  </div>;
}
