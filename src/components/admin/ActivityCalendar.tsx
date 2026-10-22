import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ListFilter, RefreshCw } from 'lucide-react';
import { adminDb } from '../../lib/admin/adminDb';

type Member = { id: string; full_name: string | null; email: string | null };
type ActivityEvent = { id: string; profile_id: string; occurred_at: string; kind: string; detail: string };
type ViewMode = 'calendar' | 'table';

const panel = 'rounded-xl border border-zinc-800 bg-[#121315] p-4';
const button = 'rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40';
const keyFor = (value: string | Date) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};
const localKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const memberLabel = (member: Member | undefined, id: string) => member?.full_name || member?.email || `Member ${id.slice(0, 8)}`;

export function ActivityCalendar({ profileId, onOpenClient }: { profileId?: string; onOpenClient?: (profileId: string) => void }) {
  const db = adminDb();
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(() => localKey(new Date()));
  const [view, setView] = useState<ViewMode>('calendar');
  const [memberFilter, setMemberFilter] = useState(profileId || 'all');
  const [kindFilter, setKindFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!db) { setError('The shared data connection is not configured.'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all([
        db.from('profiles').select('id,full_name,email').eq('role', 'athlete').order('full_name').limit(500),
        db.from('workout_sessions').select('id,profile_id,status,completed_on,created_at,workout_templates(name)').order('created_at', { ascending: false }).limit(500),
        db.from('checkins').select('id,profile_id,status,checkin_date,created_at').order('created_at', { ascending: false }).limit(500),
        db.from('progress_logs').select('id,profile_id,weight,recorded_on,created_at').order('created_at', { ascending: false }).limit(500),
        db.from('nutrition_logs').select('id,profile_id,calories,protein_grams,logged_on,created_at').order('created_at', { ascending: false }).limit(500),
        db.from('nutrition_daily_logs').select('id,profile_id,completed_day,completed_meal_ids,log_date,updated_at').order('updated_at', { ascending: false }).limit(500),
        db.from('progress_photos').select('id,profile_id,caption,recorded_on,created_at').order('created_at', { ascending: false }).limit(500),
        db.from('daily_metrics').select('profile_id,metric_date,water_litres,steps').order('metric_date', { ascending: false }).limit(500),
        db.from('cardio_logs').select('id,profile_id,completed_at,activity,duration_minutes').order('completed_at', { ascending: false }).limit(500),
        db.from('coach_messages').select('id,athlete_profile_id,sender_profile_id,created_at').order('created_at', { ascending: false }).limit(500),
      ]);
      const [memberRows, workouts, checkins, progress, nutrition, nutritionDaily, photos, metrics, cardio, messages] = results;
      if (memberRows.error) throw new Error('Member list could not be loaded. Check Staff HQ access and the profiles table.');
      setMembers((memberRows.data || []) as Member[]);
      const next: ActivityEvent[] = [];
      const add = (rows: any[] | null, kind: string, profileKey: string, dateKey: string, detail: (row: any) => string, prefix: string) => {
        (rows || []).forEach((row) => {
          const id = String(row[profileKey] || '');
          const occurredAt = String(row[dateKey] || '');
          if (!id || !occurredAt) return;
          next.push({ id: `${prefix}-${String(row.id ?? `${id}-${occurredAt}`)}`, profile_id: id, occurred_at: occurredAt, kind, detail: detail(row) });
        });
      };
      // Only completed workouts count as activity; planned/scheduled sessions remain in Training.
      add((workouts.data || []).filter((row: any) => String(row.status).toLowerCase() === 'completed'), 'Workout completed', 'profile_id', 'completed_on', (row) => {
        const template = Array.isArray(row.workout_templates) ? row.workout_templates[0]?.name : row.workout_templates?.name;
        return String(template || 'Workout session');
      }, 'workout');
      // Some historical completed rows predate completed_on; retain their saved record date.
      (workouts.data || []).filter((row: any) => String(row.status).toLowerCase() === 'completed' && !row.completed_on).forEach((row: any) => {
        next.push({ id: `workout-history-${row.id}`, profile_id: String(row.profile_id), occurred_at: String(row.created_at || ''), kind: 'Workout completed', detail: (Array.isArray(row.workout_templates) ? row.workout_templates[0]?.name : row.workout_templates?.name) || 'Workout session' });
      });
      add(checkins.data, 'Check-in submitted', 'profile_id', 'checkin_date', (row) => `Status: ${String(row.status || 'submitted')}`, 'checkin');
      add(progress.data, 'Progress / weigh-in', 'profile_id', 'recorded_on', (row) => `Weight: ${row.weight ?? '—'} kg`, 'progress');
      add(nutrition.data, 'Nutrition log', 'profile_id', 'logged_on', (row) => `${row.calories ?? '—'} kcal · ${row.protein_grams ?? '—'} g protein`, 'nutrition');
      add(nutritionDaily.data, 'Nutrition activity', 'profile_id', 'log_date', (row) => row.completed_day ? 'Daily nutrition marked complete' : `Meal progress updated · ${Array.isArray(row.completed_meal_ids) ? row.completed_meal_ids.length : 0} meals`, 'nutrition-day');
      add(photos.data, 'Progress photo', 'profile_id', 'recorded_on', (row) => String(row.caption || 'Progress photo uploaded'), 'photo');
      add(metrics.data, 'Water & steps', 'profile_id', 'metric_date', (row) => `${Number(row.water_litres || 0).toFixed(1)} L water · ${Number(row.steps || 0).toLocaleString('en-GB')} steps`, 'metrics');
      add(cardio.data, 'Cardio completed', 'profile_id', 'completed_at', (row) => `${row.activity || 'Cardio'} · ${Number(row.duration_minutes || 0)} min`, 'cardio');
      add(messages.data, 'Coach message', 'athlete_profile_id', 'created_at', (row) => String(row.sender_profile_id) === String(row.athlete_profile_id) ? 'Member sent a message' : 'Coach sent a message', 'message');
      const failedCategories = results.slice(1).filter((result) => result.error);
      if (failedCategories.length) setError('Some activity categories could not be loaded. Check the latest Neon migrations and Staff HQ read policies; available categories are still shown.');
      setEvents(next.filter((event) => event.occurred_at).sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load member activity. Check the connection and staff permissions.');
    } finally { setLoading(false); }
  }, [db]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (profileId) setMemberFilter(profileId); }, [profileId]);

  const visibleEvents = useMemo(() => events.filter((event) =>
    (!profileId || event.profile_id === profileId) &&
    (profileId || memberFilter === 'all' || event.profile_id === memberFilter) &&
    (kindFilter === 'all' || event.kind === kindFilter) &&
    (!search.trim() || `${event.kind} ${event.detail} ${memberLabel(members.find((member) => member.id === event.profile_id), event.profile_id)}`.toLowerCase().includes(search.trim().toLowerCase()))
  ), [events, profileId, memberFilter, kindFilter, search, members]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    visibleEvents.forEach((event) => {
      const key = keyFor(event.occurred_at);
      if (!key) return;
      map.set(key, [...(map.get(key) || []), event]);
    });
    return map;
  }, [visibleEvents]);

  const gridDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }, [month]);

  const dayEvents = eventsByDay.get(selectedDay) || [];
  const kinds = Array.from(new Set(events.map((event) => event.kind))).sort();

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-white">{profileId ? 'Client activity calendar' : 'All-client activity calendar'}</h2><p className="mt-1 text-sm text-zinc-500">{profileId ? 'Completed and logged activity for this client only.' : 'Review completed and logged activity across your clients. Planned workouts and assigned plans are excluded.'}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-zinc-700 p-1">
          <button type="button" onClick={() => setView('calendar')} aria-pressed={view === 'calendar'} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs ${view === 'calendar' ? 'bg-[#ff5500] font-semibold text-black' : 'text-zinc-300 hover:bg-zinc-800'}`}><CalendarDays className="h-3.5 w-3.5" />Calendar</button>
          <button type="button" onClick={() => setView('table')} aria-pressed={view === 'table'} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs ${view === 'table' ? 'bg-[#ff5500] font-semibold text-black' : 'text-zinc-300 hover:bg-zinc-800'}`}><ListFilter className="h-3.5 w-3.5" />Table</button>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className={button}><RefreshCw className={`mr-1.5 inline h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
      </div>
    </div>
    {error && <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {!profileId && <label className="grid gap-1.5 text-xs text-zinc-400">Client<select value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-[#0b0c0e] px-3 py-2.5 text-zinc-200"><option value="all">All clients</option>{members.map((member) => <option key={member.id} value={member.id}>{memberLabel(member, member.id)}</option>)}</select></label>}
      <label className="grid gap-1.5 text-xs text-zinc-400">Activity type<select value={kindFilter} onChange={(event) => setKindFilter(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-[#0b0c0e] px-3 py-2.5 text-zinc-200"><option value="all">All activity types</option>{kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select></label>
      <label className="grid gap-1.5 text-xs text-zinc-400">Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients or activity…" className="w-full rounded-lg border border-zinc-700 bg-[#0b0c0e] px-3 py-2.5 text-zinc-200 placeholder:text-zinc-600" /></label>
    </div>
    {view === 'calendar' ? <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className={panel}>
        <div className="mb-4 flex items-center justify-between gap-2"><button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className={button}><ChevronLeft className="h-4 w-4" /></button><h3 className="text-sm font-semibold text-white">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h3><button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className={button}><ChevronRight className="h-4 w-4" /></button></div>
        <div className="grid grid-cols-7 gap-1 text-center">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-2 text-[10px] font-mono uppercase text-zinc-500">{day}</div>)}
          {gridDays.map((day) => { const key = localKey(day); const count = eventsByDay.get(key)?.length || 0; const inMonth = day.getMonth() === month.getMonth(); return <button key={key} type="button" onClick={() => { setSelectedDay(key); if (!inMonth) setMonth(new Date(day.getFullYear(), day.getMonth(), 1)); }} aria-pressed={selectedDay === key} className={`min-h-[68px] rounded-lg border p-1.5 text-left transition sm:min-h-[82px] ${selectedDay === key ? 'border-orange-400 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-600'} ${inMonth ? 'text-zinc-200' : 'text-zinc-600'}`}><span className="text-xs">{day.getDate()}</span>{count > 0 && <span className="mt-1 flex items-center gap-1 text-[10px] text-orange-300"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{count} {count === 1 ? 'record' : 'records'}</span>}</button>; })}
        </div>
      </section>
      <section className={panel}>
        <h3 className="font-semibold text-white">{new Date(`${selectedDay}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3><p className="mt-1 text-xs text-zinc-500">{dayEvents.length} activity {dayEvents.length === 1 ? 'record' : 'records'}</p>
        <div className="mt-3 divide-y divide-zinc-800">{dayEvents.length ? dayEvents.map((event) => <div key={event.id} className="py-3"><p className="text-[10px] font-mono uppercase tracking-wide text-orange-300">{event.kind}</p><p className="mt-1 break-words text-sm text-zinc-200">{event.detail}</p>{!profileId && <button type="button" onClick={() => onOpenClient?.(event.profile_id)} className="mt-2 text-xs font-medium text-orange-300 hover:text-orange-200">{memberLabel(members.find((member) => member.id === event.profile_id), event.profile_id)} ↗</button>}</div>) : <p className="py-5 text-sm text-zinc-500">{loading ? 'Loading activity…' : 'No completed or logged activity on this day.'}</p>}</div>
      </section>
    </div> : <section className={panel}>
      <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-white">Activity records</h3><span className="text-xs text-zinc-500">{visibleEvents.length} records</span></div>
      {visibleEvents.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="text-[10px] font-mono uppercase tracking-wide text-zinc-500"><th className="border-b border-zinc-800 px-3 py-3">Date</th>{!profileId && <th className="border-b border-zinc-800 px-3 py-3">Client</th>}<th className="border-b border-zinc-800 px-3 py-3">Activity</th><th className="border-b border-zinc-800 px-3 py-3">Details</th>{!profileId && <th className="border-b border-zinc-800 px-3 py-3">Open</th>}</tr></thead><tbody>{visibleEvents.map((event) => <tr key={event.id} className="hover:bg-white/[0.02]"><td className="border-b border-zinc-800 px-3 py-3 text-zinc-400">{new Date(`${keyFor(event.occurred_at)}T12:00:00`).toLocaleDateString('en-GB')}</td>{!profileId && <td className="border-b border-zinc-800 px-3 py-3 text-zinc-200">{memberLabel(members.find((member) => member.id === event.profile_id), event.profile_id)}</td>}<td className="border-b border-zinc-800 px-3 py-3 text-orange-300">{event.kind}</td><td className="border-b border-zinc-800 px-3 py-3 text-zinc-300">{event.detail}</td>{!profileId && <td className="border-b border-zinc-800 px-3 py-3"><button type="button" onClick={() => onOpenClient?.(event.profile_id)} className="text-orange-300 hover:text-orange-200">Open client ↗</button></td>}</tr>)}</tbody></table></div> : <p className="py-5 text-sm text-zinc-500">{loading ? 'Loading activity…' : 'No activity records match these filters.'}</p>}
    </section>}
  </div>;
}
