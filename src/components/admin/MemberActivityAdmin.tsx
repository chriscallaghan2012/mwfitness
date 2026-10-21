import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { adminDb } from '../../lib/admin/adminDb';

type MetricRow = { profile_id: string; metric_date: string; water_litres: number | string; steps: number };
type CardioRow = { id: string; profile_id: string; completed_at: string; activity: string; duration_minutes: number; average_heart_rate: number | null };
type SupplementRow = { id: string; profile_id: string; name: string; dosage_string: string; timing: string; active: boolean; created_at: string };
type MemberRow = { id: string; full_name: string | null; email: string | null };
type ActivityEvent = { id: string; profile_id: string; occurred_at: string; kind: string; detail: string };

const panel = 'rounded-xl border border-zinc-800 bg-[#121315] p-4';
const tableClass = 'w-full min-w-[620px] text-left text-xs';
const cell = 'border-b border-zinc-800 px-3 py-3 align-top';

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-5 text-sm text-zinc-500">{children}</p>;
}

function memberName(profileId: string, members: MemberRow[]) {
  const member = members.find((candidate) => candidate.id === profileId);
  return member?.full_name || member?.email || `Member ${profileId.slice(0, 8)}`;
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const query = search.trim().toLocaleLowerCase();
  const filteredRows = query ? rows.filter((row) => JSON.stringify(row).toLocaleLowerCase().includes(query)) : rows;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  if (!rows.length) return <Empty>{empty}</Empty>;
  return <div>
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <span className="sr-only">Search activity records</span>
        <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search these records…" className="w-full rounded-lg border border-zinc-700 bg-[#0b0c0e] py-2.5 pl-3 pr-14 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/70" />{search ? <button type="button" onClick={() => { setSearch(""); setPage(0); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[10px] text-zinc-400 hover:bg-white/10 hover:text-white">Clear</button> : null}
      </label>
      <label className="flex shrink-0 items-center gap-2 text-[11px] text-zinc-500">Rows per page
        <select aria-label="Activity rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="rounded-lg border border-zinc-700 bg-[#0b0c0e] px-2.5 py-2 text-xs text-zinc-200">
          {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
    </div>
    {filteredRows.length ? <div className="overflow-x-auto"><table className={tableClass}>
      <thead><tr>{columns.map((column) => <th key={column.label} className={cell + ' font-mono uppercase tracking-wide text-zinc-500'}>{column.label}</th>)}</tr></thead>
      <tbody>{pageRows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.label} className={cell + ' text-zinc-300'}>{column.render(row)}</td>)}</tr>)}</tbody>
    </table></div> : <Empty>No matching records. Try a different search.</Empty>}
    {filteredRows.length > 0 ? <div className="mt-3 flex flex-col gap-3 border-t border-zinc-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11px] text-zinc-500">Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filteredRows.length)} of {filteredRows.length} records</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={currentPage === 0} onClick={() => setPage(Math.max(0, currentPage - 1))} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 disabled:opacity-40">Previous</button>
        <span className="min-w-20 text-center text-[11px] text-zinc-400">Page {currentPage + 1} of {pageCount}</span>
        <button type="button" disabled={currentPage >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 disabled:opacity-40">Next</button>
      </div>
    </div> : null}
  </div>;
}

export function MemberActivityAdmin() {
  const db = adminDb();
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [cardio, setCardio] = useState<CardioRow[]>([]);
  const [supplements, setSupplements] = useState<SupplementRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [memberFilter, setMemberFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityWarning, setActivityWarning] = useState('');

  const refresh = useCallback(async () => {
    if (!db) {
      setError('The shared Neon data connection is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setActivityWarning('');
    try {
      const [membersResult, metricsResult, cardioResult, supplementResult, workoutsResult, checkinsResult, progressResult, nutritionResult, photosResult, messagesResult] = await Promise.all([
        db.from('profiles').select('id,full_name,email').eq('role', 'athlete').order('full_name').limit(500),
        db.from('daily_metrics').select('profile_id,metric_date,water_litres,steps').order('metric_date', { ascending: false }).limit(25),
        db.from('cardio_logs').select('id,profile_id,completed_at,activity,duration_minutes,average_heart_rate').order('completed_at', { ascending: false }).limit(25),
        db.from('supplement_plans').select('id,profile_id,name,dosage_string,timing,active,created_at').order('created_at', { ascending: false }).limit(25),
        db.from('workout_sessions').select('id,profile_id,status,completed_on,created_at,workout_templates(name)').order('created_at', { ascending: false }).limit(40),
        db.from('checkins').select('id,profile_id,status,checkin_date,created_at').order('created_at', { ascending: false }).limit(40),
        db.from('progress_logs').select('id,profile_id,weight,recorded_on,created_at').order('created_at', { ascending: false }).limit(40),
        db.from('nutrition_daily_logs').select('id,profile_id,day_type,completed_day,completed_meal_ids,log_date,updated_at').order('updated_at', { ascending: false }).limit(40),
        db.from('progress_photos').select('id,profile_id,caption,recorded_on,created_at').order('created_at', { ascending: false }).limit(40),
        db.from('coach_messages').select('id,athlete_profile_id,sender_profile_id,created_at').order('created_at', { ascending: false }).limit(40),
      ]);
      const profiles = (membersResult.data || []) as MemberRow[];
      setMembers(profiles);
      const memberNames = new Map(profiles.map((member) => [member.id, member.full_name || member.email || `Member ${member.id.slice(0, 8)}`]));
      const failed = [metricsResult.error, cardioResult.error, supplementResult.error].filter(Boolean);
      if (failed.length) {
        setError('Member activity tables are unavailable. Confirm migration 0007 is applied to the MW Fitness Neon project and staff read policies are enabled.');
      }
      setMetrics((metricsResult.data || []) as MetricRow[]);
      setCardio((cardioResult.data || []) as CardioRow[]);
      setSupplements((supplementResult.data || []) as SupplementRow[]);

      const events: ActivityEvent[] = [];
      const addEvents = (
        rows: Array<Record<string, any>> | null,
        kind: string,
        getProfileId: (row: Record<string, any>) => string,
        getDate: (row: Record<string, any>) => string,
        getDetail: (row: Record<string, any>) => string,
        prefix: string,
      ) => (rows || []).forEach((row) => {
        const profileId = getProfileId(row);
        const occurredAt = getDate(row);
        if (!profileId || !occurredAt) return;
        events.push({ id: `${prefix}-${String(row.id)}`, profile_id: profileId, occurred_at: occurredAt, kind, detail: getDetail(row) });
      });

      addEvents(metricsResult.data as Array<Record<string, any>> | null, 'Daily metrics', (row) => String(row.profile_id), (row) => String(row.metric_date), (row) => `${Number(row.water_litres || 0).toFixed(1)} L water · ${Number(row.steps || 0).toLocaleString('en-GB')} steps`, 'metrics');
      addEvents(cardioResult.data as Array<Record<string, any>> | null, 'Cardio', (row) => String(row.profile_id), (row) => String(row.completed_at), (row) => `${row.activity || 'Cardio'} · ${Number(row.duration_minutes || 0)} min`, 'cardio');
      addEvents(supplementResult.data as Array<Record<string, any>> | null, 'Supplement plan', (row) => String(row.profile_id), (row) => String(row.created_at), (row) => `${row.name || 'Supplement'} · ${row.active ? 'active' : 'inactive'}`, 'supplement');
      addEvents(workoutsResult.data as Array<Record<string, any>> | null, 'Workout', (row) => String(row.profile_id), (row) => String(row.completed_on || row.created_at), (row) => `${row.status || 'planned'} · ${(Array.isArray(row.workout_templates) ? row.workout_templates[0]?.name : row.workout_templates?.name) || 'Workout session'}`, 'workout');
      addEvents(checkinsResult.data as Array<Record<string, any>> | null, 'Check-in', (row) => String(row.profile_id), (row) => String(row.created_at || row.checkin_date), (row) => row.status === 'reviewed' ? 'Coach reviewed check-in' : 'Member submitted check-in', 'checkin');
      addEvents(progressResult.data as Array<Record<string, any>> | null, 'Progress', (row) => String(row.profile_id), (row) => String(row.created_at || row.recorded_on), (row) => `Weight logged: ${row.weight ?? '—'} kg`, 'progress');
      addEvents(nutritionResult.data as Array<Record<string, any>> | null, 'Nutrition', (row) => String(row.profile_id), (row) => String(row.updated_at || row.log_date), (row) => `${row.completed_day ? 'Day complete' : 'Nutrition updated'} · ${Array.isArray(row.completed_meal_ids) ? row.completed_meal_ids.length : 0} meals`, 'nutrition');
      addEvents(photosResult.data as Array<Record<string, any>> | null, 'Progress photo', (row) => String(row.profile_id), (row) => String(row.created_at || row.recorded_on), (row) => String(row.caption || 'Progress photo uploaded'), 'photo');
      addEvents(messagesResult.data as Array<Record<string, any>> | null, 'Message', (row) => String(row.athlete_profile_id), (row) => String(row.created_at), (row) => String(row.sender_profile_id) === String(row.athlete_profile_id) ? 'Member sent a coach message' : 'Coach sent a message', 'message');

      const missingActivity = [membersResult, workoutsResult, checkinsResult, progressResult, nutritionResult, photosResult, messagesResult].some((result) => result.error);
      if (missingActivity) setActivityWarning('Some activity categories are unavailable. Review migrations and staff read policies before relying on this feed.');
      setActivity(events.sort((left, right) => right.occurred_at.localeCompare(left.occurred_at)));
    } catch {
      setError('Could not load member activity. Check the connection and staff permissions, then retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleActivity = memberFilter === 'all' ? activity : activity.filter((event) => event.profile_id === memberFilter);

  useEffect(() => { void refresh(); }, [refresh]);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-white">Member activity</h2><p className="mt-1 text-sm text-zinc-500">Recent hydration, steps, cardio logs and coach-assigned supplement plans from the shared mobile-app database.</p></div>
      <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Refreshing…' : 'Refresh activity'}</button>
    </div>
    {error && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-200">{error}</div>}
    {loading && <p role="status" className="text-sm text-zinc-500">Loading live member records…</p>}
    <section className={panel}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h3 className="font-semibold text-white">Recent member activity</h3><p className="mt-1 text-xs text-zinc-500">Most recent saved records across member app activity</p></div>
        <label className="grid min-w-0 gap-1.5 text-xs text-zinc-400 sm:w-56">Member
          <select value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)} className="block w-full rounded-lg border border-zinc-700 bg-[#0b0c0e] px-3 py-2.5 text-zinc-200">
            <option value="all">All members</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email || `Member ${member.id.slice(0, 8)}`}</option>)}
          </select>
        </label>
      </div>
      {activityWarning && <p role="status" className="mt-3 text-xs text-amber-200">{activityWarning}</p>}
      {visibleActivity.length ? <div className="mt-4 divide-y divide-zinc-800">
        {visibleActivity.slice(0, 50).map((event) => <div key={event.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase text-orange-300">{event.kind} · {memberName(event.profile_id, members)}</p><p className="mt-1 break-words text-sm text-zinc-200">{event.detail}</p></div>
          <time className="shrink-0 text-xs text-zinc-500">{new Date(event.occurred_at).toLocaleString('en-GB')}</time>
        </div>)}
      </div> : <Empty>{loading ? 'Loading activity…' : 'No saved activity found for this selection.'}</Empty>}
    </section>
    <details className={panel}><summary className="group flex cursor-pointer list-none items-center justify-between gap-3"><span className="min-w-0"><span className="block font-semibold text-white">Daily hydration &amp; steps</span><span className="mt-1 block text-xs text-zinc-500">Latest 25 member-day records · expand to search</span></span><ChevronDown aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180" /></summary><div className="mt-3"><RecordTable rows={metrics} rowKey={(r) => r.profile_id + r.metric_date} empty={loading ? 'Loading…' : 'No daily metrics have been recorded yet.'} columns={[
      { label: 'Member ID', render: (r) => r.profile_id.slice(0, 8) + '…' },
      { label: 'Date', render: (r) => r.metric_date },
      { label: 'Water', render: (r) => `${Number(r.water_litres).toFixed(2)} L` },
      { label: 'Steps', render: (r) => Number(r.steps || 0).toLocaleString('en-GB') },
    ]} /></div></details>
    <details className={panel}><summary className="group flex cursor-pointer list-none items-center justify-between gap-3"><span className="min-w-0"><span className="block font-semibold text-white">Cardio sessions</span><span className="mt-1 block text-xs text-zinc-500">Latest 25 completed sessions · expand to search</span></span><ChevronDown aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180" /></summary><div className="mt-3"><RecordTable rows={cardio} rowKey={(r) => r.id} empty={loading ? 'Loading…' : 'No cardio sessions have been logged yet.'} columns={[
      { label: 'Member ID', render: (r) => r.profile_id.slice(0, 8) + '…' },
      { label: 'Completed', render: (r) => new Date(r.completed_at).toLocaleString('en-GB') },
      { label: 'Activity', render: (r) => r.activity },
      { label: 'Duration', render: (r) => `${r.duration_minutes} min` },
      { label: 'Avg. HR', render: (r) => r.average_heart_rate ? `${r.average_heart_rate} bpm` : '—' },
    ]} /></div></details>
    <details className={panel}><summary className="group flex cursor-pointer list-none items-center justify-between gap-3"><span className="min-w-0"><span className="block font-semibold text-white">Supplement plans</span><span className="mt-1 block text-xs text-zinc-500">Coach-assigned records · expand to search</span></span><ChevronDown aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180" /></summary><div className="mt-3"><RecordTable rows={supplements} rowKey={(r) => r.id} empty={loading ? 'Loading…' : 'No supplement plans have been assigned yet.'} columns={[
      { label: 'Member ID', render: (r) => r.profile_id.slice(0, 8) + '…' },
      { label: 'Supplement', render: (r) => r.name },
      { label: 'Instructions', render: (r) => r.dosage_string || 'As directed' },
      { label: 'Timing', render: (r) => r.timing.replaceAll('_', ' ').toLowerCase() },
      { label: 'Status', render: (r) => r.active ? 'Active' : 'Inactive' },
    ]} /></div></details>
  </div>;
}
