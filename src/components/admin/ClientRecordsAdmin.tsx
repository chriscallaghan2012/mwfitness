// ClientRecordsAdmin — the member workspace inside Staff HQ. Open a member from
// the Members list to see everything the app has submitted: check-ins, weigh-ins,
// nutrition, workouts, water & steps, cardio, supplements, messages and photos —
// plus a weekly rollup, a recent-activity feed and one-place assignment controls
// for memberships, nutrition plans, workout sessions and coaching programmes.
// The same component runs against live Neon or the in-memory demo store via
// adminDb(), so demo and live share one layout and only the data differs.
import { useEffect, useMemo, useState } from 'react';
import { adminDb } from '../../lib/admin/adminDb';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

type Dataset = 'checkins' | 'progress_logs' | 'nutrition_logs' | 'nutrition_daily_logs' | 'workout_sessions' | 'coach_messages' | 'daily_metrics' | 'cardio_logs' | 'supplement_plans';

const DATASETS: { id: Dataset; label: string; description: string }[] = [
  { id: 'checkins', label: 'Check-ins', description: 'Weekly wellbeing submissions from the mobile app.' },
  { id: 'progress_logs', label: 'Progress', description: 'Weight and progress records submitted in the app.' },
  { id: 'nutrition_logs', label: 'Nutrition logs', description: 'Daily calories, protein and water entries.' },
  { id: 'nutrition_daily_logs', label: 'Nutrition completion', description: 'Meal completion and day-complete records saved by the mobile nutrition screen.' },
  { id: 'workout_sessions', label: 'Workout sessions', description: 'Scheduled and completed sessions.' },
  { id: 'coach_messages', label: 'Messages', description: 'Coach messages associated with this client.' },
  { id: 'daily_metrics', label: 'Water & steps', description: 'Daily hydration and step totals saved by the mobile app.' },
  { id: 'cardio_logs', label: 'Cardio', description: 'Cardio sessions logged by the member.' },
  { id: 'supplement_plans', label: 'Supplements', description: 'Coach-assigned supplement plan history.' },
];

const EMPTY_RECORDS: Record<Dataset, Row[]> = {
  checkins: [], progress_logs: [], nutrition_logs: [], nutrition_daily_logs: [], workout_sessions: [],
  coach_messages: [], daily_metrics: [], cardio_logs: [], supplement_plans: [],
};

const DAY_MS = 86_400_000;
const todayStr = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
const dayKey = (value: string | Date) => new Date(value).toISOString().slice(0, 10);

/** Monday 00:00 of the week containing this date. */
function weekStart(value: string | Date) {
  const date = new Date(value);
  const shift = (date.getDay() + 6) % 7;
  const start = new Date(date.getTime() - shift * DAY_MS);
  start.setHours(0, 0, 0, 0);
  return start;
}

const average = (values: number[]): number | null =>
  values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null;

const withinWeek = (value: string, start: Date) => {
  const time = new Date(value).getTime();
  return time >= start.getTime() && time < start.getTime() + 7 * DAY_MS;
};

export function ClientRecordsAdmin({ initialUserId = '', onMessageMember, onBack }: {
  initialUserId?: string;
  onMessageMember: (profileId: string) => void;
  onBack?: () => void;
}) {
  const db = adminDb();
  const [users, setUsers] = useState<Row[]>([]);
  const [userId, setUserId] = useState(initialUserId);
  const [dataset, setDataset] = useState<Dataset>('checkins');
  const [records, setRecords] = useState<Record<Dataset, Row[]>>(EMPTY_RECORDS);
  const [profile, setProfile] = useState<Row | null>(null);
  const [memberships, setMemberships] = useState<Row[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<Row[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<Row[]>([]);
  const [nutritionTemplates, setNutritionTemplates] = useState<Row[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<Row[]>([]);
  const [programmes, setProgrammes] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [message, setMessage] = useState('');
  const [assignNotice, setAssignNotice] = useState('');
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignMembershipStatus, setAssignMembershipStatus] = useState('active');
  const [assignNutritionTemplate, setAssignNutritionTemplate] = useState('');
  const [assignWorkoutTemplate, setAssignWorkoutTemplate] = useState('');
  const [assignWorkoutDate, setAssignWorkoutDate] = useState(todayStr);
  const [assignProgrammeId, setAssignProgrammeId] = useState('');
  const [assignProgrammeStart, setAssignProgrammeStart] = useState(todayStr);
  const [assignProgrammeDue, setAssignProgrammeDue] = useState(() => plusDays(7));
  const [supplementName, setSupplementName] = useState('');
  const [supplementDosage, setSupplementDosage] = useState('');
  const [supplementTiming, setSupplementTiming] = useState('AS_DIRECTED');
  const [supplementInstructions, setSupplementInstructions] = useState('');
  const [supplementBusy, setSupplementBusy] = useState(false);

  // Client list plus the libraries used by the "Assign to client" panel.
  useEffect(() => {
    if (!db) { setMessage('The database is not configured.'); setUsers([]); return; }
    void Promise.all([
      db.from('profiles').select('*').order('full_name'),
      db.from('nutrition_templates').select('*').order('name'),
      db.from('workout_templates').select('*').order('name'),
      db.from('coaching_programmes').select('*').order('name'),
      db.from('plans').select('id,name').order('name'),
    ]).then(([usersResult, nutritionResult, workoutResult, programmeResult, plansResult]) => {
      if (usersResult.error) {
        setMessage('Could not load clients. Check staff permissions and database policies.');
        setUsers([]);
      } else {
        setUsers((usersResult.data ?? []) as Row[]);
        setMessage('');
      }
      setNutritionTemplates((nutritionResult.data ?? []) as Row[]);
      setWorkoutTemplates((workoutResult.data ?? []) as Row[]);
      setProgrammes((programmeResult.data ?? []) as Row[]);
      setPlans((plansResult.data ?? []) as Row[]);
    }, () => setMessage('Could not load the client list. Check the connection and retry.'));
  }, []);

  // All app data for the member in one snapshot so the summary, rollup, feed
  // and submissions table stay consistent.
  useEffect(() => {
    if (!db || !userId) {
      setRecords(EMPTY_RECORDS); setProfile(null); setMemberships([]);
      setNutritionPlans([]); setProgressPhotos([]); setAssignNotice('');
      return;
    }
    let cancelled = false;
    setBusy(true);
    setMessage('');
    setAssignNotice('');
    setProfile(users.find((user) => user.id === userId) ?? null);
    const datasetIds: Dataset[] = ['checkins', 'progress_logs', 'nutrition_logs', 'nutrition_daily_logs', 'workout_sessions', 'coach_messages', 'daily_metrics', 'cardio_logs', 'supplement_plans'];
    void Promise.all([
      db.from('checkins').select('*').eq('profile_id', userId).order('checkin_date', { ascending: false }),
      db.from('progress_logs').select('*').eq('profile_id', userId).order('recorded_on', { ascending: false }),
      db.from('nutrition_logs').select('*').eq('profile_id', userId).order('logged_on', { ascending: false }),
      db.from('nutrition_daily_logs').select('*').eq('profile_id', userId).order('log_date', { ascending: false }),
      db.from('workout_sessions').select('*, workout_templates(name)').eq('profile_id', userId).order('scheduled_on', { ascending: false }),
      db.from('coach_messages').select('*').eq('athlete_profile_id', userId).order('created_at', { ascending: false }).limit(200),
      db.from('daily_metrics').select('*').eq('profile_id', userId).order('metric_date', { ascending: false }),
      db.from('cardio_logs').select('*').eq('profile_id', userId).order('completed_at', { ascending: false }),
      db.from('supplement_plans').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
      db.from('memberships').select('*, plans(name,price,kind)').eq('profile_id', userId).order('created_at', { ascending: false }),
      db.from('nutrition_plans').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
      db.from('progress_photos').select('id,recorded_on,caption,mime_type,photo_data,created_at').eq('profile_id', userId).order('recorded_on', { ascending: false }).limit(6),
    ]).then((results) => {
      if (cancelled) return;
      const next = {} as Record<Dataset, Row[]>;
      datasetIds.forEach((id, index) => { next[id] = (results[index].error ? [] : (results[index].data ?? [])) as Row[]; });
      setRecords(next);
      setMemberships((results[9].data ?? []) as Row[]);
      setNutritionPlans((results[10].data ?? []) as Row[]);
      setProgressPhotos((results[11].error ? [] : (results[11].data ?? [])) as Row[]);
      const failed = results.slice(0, 9).some((result) => result.error);
      setMessage(failed ? 'Some app data sets could not be loaded. Confirm the tables exist and staff RLS permissions are applied.' : '');
    }).catch(() => {
      if (!cancelled) setMessage('The database could not be reached. Try refreshing this member.');
    }).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [userId, users, refreshTick]);

  // ---- Derived views (computed from the loaded snapshot) ----
  const thisWeek = useMemo(() => {
    const start = weekStart(new Date());
    const sinceIso = dayKey(start);
    const sessions = records.workout_sessions.filter((row) => String(row.scheduled_on ?? '') >= sinceIso);
    const done = sessions.filter((row) => String(row.status) === 'completed').length;
    const nutrition = records.nutrition_logs.filter((row) => String(row.logged_on ?? '') >= sinceIso);
    const metrics = records.daily_metrics.filter((row) => String(row.metric_date ?? '') >= sinceIso);
    return {
      checkin: records.checkins[0] ?? null,
      workouts: `${done}/${sessions.length}`,
      kcal: average(nutrition.map((row) => Number(row.calories)).filter(Number.isFinite)),
      protein: average(nutrition.map((row) => Number(row.protein_grams)).filter(Number.isFinite)),
      steps: average(metrics.map((row) => Number(row.steps)).filter(Number.isFinite)),
      water: average(metrics.map((row) => Number(row.water_litres)).filter(Number.isFinite)),
      weight: records.progress_logs[0]?.weight ?? null,
    };
  }, [records]);

  const weeklyRollup = useMemo(() => {
    const weeks: Row[] = [];
    for (let index = 7; index >= 0; index--) {
      const start = new Date(weekStart(new Date()).getTime() - index * 7 * DAY_MS);
      const end = new Date(start.getTime() + 7 * DAY_MS);
      const inWeek = (value: string | null | undefined) => Boolean(value) && withinWeek(String(value), start);
      const sessions = records.workout_sessions.filter((row) => inWeek(row.scheduled_on));
      const nutrition = records.nutrition_logs.filter((row) => inWeek(row.logged_on));
      const metrics = records.daily_metrics.filter((row) => inWeek(row.metric_date));
      const weighIns = records.progress_logs.filter((row) => inWeek(row.recorded_on));
      const checkin = records.checkins.find((row) => inWeek(row.checkin_date));
      weeks.push({
        id: `week-${index}`,
        week: `w/c ${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
        checkin: checkin ? String(checkin.status ?? 'submitted') : '—',
        sessions: sessions.length ? `${sessions.filter((row) => String(row.status) === 'completed').length}/${sessions.length}` : '—',
        kcal: average(nutrition.map((row) => Number(row.calories)).filter(Number.isFinite)) ?? '—',
        protein: average(nutrition.map((row) => Number(row.protein_grams)).filter(Number.isFinite)) ?? '—',
        steps: average(metrics.map((row) => Number(row.steps)).filter(Number.isFinite)) ?? '—',
        water: average(metrics.map((row) => Number(row.water_litres)).filter(Number.isFinite)) ?? '—',
        weight: weighIns.length ? String(weighIns[weighIns.length - 1].weight) : '—',
        range: `${ShortDate(dayKey(start))} – ${ShortDate(dayKey(end))}`,
      });
    }
    return weeks.reverse();
  }, [records]);

  const recentActivity = useMemo(() => {
    type Event = { id: string; at: string; kind: string; detail: string };
    const events: Event[] = [
      ...records.checkins.map((row) => ({ id: `ci-${row.id}`, at: String(row.checkin_date ?? row.created_at ?? ''), kind: 'Check-in', detail: `Sleep ${row.sleep} · Energy ${row.energy} · Stress ${row.stress} · ${String(row.status ?? '')}` })),
      ...records.progress_logs.map((row) => ({ id: `pl-${row.id}`, at: String(row.recorded_on ?? row.created_at ?? ''), kind: 'Weigh-in', detail: `${row.weight} kg${row.note ? ` · ${String(row.note)}` : ''}` })),
      ...records.nutrition_logs.map((row) => ({ id: `nl-${row.id}`, at: String(row.logged_on ?? row.created_at ?? ''), kind: 'Nutrition', detail: `${row.calories} kcal · ${row.protein_grams}g protein · ${row.water_liters}L water` })),
      ...records.nutrition_daily_logs.map((row) => ({ id: `ndl-${row.id}`, at: String(row.log_date ?? row.updated_at ?? ''), kind: 'Nutrition completion', detail: `${row.completed_day ? 'Day completed' : 'Meal progress updated'} · ${Array.isArray(row.completed_meal_ids) ? row.completed_meal_ids.length : 0} meals completed` })),
      ...records.supplement_plans.map((row) => ({ id: `sp-${row.id}`, at: String(row.created_at ?? ''), kind: 'Supplement plan', detail: `${String(row.name ?? 'Supplement')}${row.dosage_string ? ` · ${String(row.dosage_string)}` : ''} · ${row.active ? 'Active' : 'Paused'}` })),
      ...progressPhotos.map((row) => ({ id: `photo-${row.id}`, at: String(row.recorded_on ?? row.created_at ?? ''), kind: 'Progress photo', detail: String(row.caption || 'Progress photo uploaded') })),
      ...records.workout_sessions.map((row) => ({ id: `ws-${row.id}`, at: String(row.scheduled_on ?? ''), kind: 'Workout', detail: `${String(row.workout_templates?.name ?? 'Session')} — ${String(row.status ?? '')}` })),
      ...records.daily_metrics.map((row) => ({ id: `dm-${row.id}`, at: String(row.metric_date ?? ''), kind: 'Water & steps', detail: `${row.water_litres} L · ${Number(row.steps ?? 0).toLocaleString('en-GB')} steps` })),
      ...records.cardio_logs.map((row) => ({ id: `cl-${row.id}`, at: String(row.completed_at ?? ''), kind: 'Cardio', detail: `${String(row.activity ?? '')} · ${row.duration_minutes} min${row.average_heart_rate ? ` · ${row.average_heart_rate} bpm` : ''}` })),
      ...records.coach_messages.map((row) => ({ id: `cm-${row.id}`, at: String(row.created_at ?? ''), kind: 'Message', detail: String(row.body ?? '').slice(0, 90) })),
    ];
    return events
      .filter((event) => event.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 12);
  }, [records]);

  // ---- Assignment actions (demo = session memory, live = Neon) ----
  const reload = () => setRefreshTick((value) => value + 1);

  const assignMembership = async () => {
    if (!db || !userId) return;
    if (!assignPlanId) { setAssignNotice('Choose a package to assign.'); return; }
    const { error } = await db.from('memberships').insert({ profile_id: userId, plan_id: assignPlanId, status: assignMembershipStatus }).select('id');
    setAssignNotice(error ? `Membership could not be assigned: ${error.message}` : 'Package assigned to this member.');
    if (!error) { setAssignPlanId(''); reload(); }
  };

  const assignNutrition = async () => {
    if (!db || !userId) return;
    if (!assignNutritionTemplate) { setAssignNotice('Choose a nutrition template to assign.'); return; }
    const { data: template, error: templateError } = await db.from('nutrition_templates').select('*').eq('id', assignNutritionTemplate).maybeSingle();
    if (templateError || !template) { setAssignNotice('That nutrition template could not be loaded.'); return; }
    const { error } = await db.from('nutrition_plans').insert({
      profile_id: userId, name: template.name, description: template.description ?? '',
      day_type: template.day_type ?? 'training', targets: template.targets ?? {}, sections: template.sections ?? [], active: true,
    }).select('id');
    setAssignNotice(error ? `Nutrition plan could not be assigned: ${error.message}` : `Assigned “${String(template.name)}” to this member.`);
    if (!error) { setAssignNutritionTemplate(''); reload(); }
  };

  const assignWorkout = async () => {
    if (!db || !userId) return;
    if (!assignWorkoutTemplate || !assignWorkoutDate) { setAssignNotice('Choose a workout template and a date.'); return; }
    const { error } = await db.from('workout_sessions').insert({
      profile_id: userId, template_id: assignWorkoutTemplate, scheduled_on: assignWorkoutDate, status: 'planned',
    }).select('id');
    setAssignNotice(error ? `Session could not be scheduled: ${error.message}` : `Session scheduled for ${ShortDate(assignWorkoutDate)}.`);
    if (!error) reload();
  };

  const assignProgramme = async () => {
    if (!db || !userId) return;
    if (!assignProgrammeId) { setAssignNotice('Choose a coaching programme to assign.'); return; }
    if (assignProgrammeDue && assignProgrammeStart && assignProgrammeDue < assignProgrammeStart) {
      setAssignNotice('The completion date must be on or after the start date.');
      return;
    }
    const { error } = await db.from('coaching_programme_assignments').insert({
      profile_id: userId, programme_id: assignProgrammeId, starts_on: assignProgrammeStart,
      due_on: assignProgrammeDue || null, status: 'active',
    }).select('id');
    setAssignNotice(error ? `Programme could not be assigned: ${error.message}` : 'Coaching programme assigned to this member.');
    if (!error) { setAssignProgrammeId(''); reload(); }
  };

  const assignSupplement = async () => {
    if (!db || !userId) return;
    if (!supplementName.trim()) { setAssignNotice('Enter a supplement name.'); return; }
    setSupplementBusy(true);
    try {
      const { data, error } = await db.from('supplement_plans').insert({
        profile_id: userId,
        name: supplementName.trim(),
        dosage_string: supplementDosage.trim(),
        timing: supplementTiming,
        instructions: supplementInstructions.trim(),
        sort_order: records.supplement_plans.length,
        active: true,
      }).select('id');
      if (error) { setAssignNotice(`Supplement plan could not be assigned: ${error.message}`); return; }
      if (!data?.length) { setAssignNotice('Supplement plan was not saved. Check staff permissions and retry.'); return; }
      setAssignNotice(`Assigned “${supplementName.trim()}” to this member.`);
      setSupplementName(''); setSupplementDosage(''); setSupplementTiming('AS_DIRECTED'); setSupplementInstructions('');
      reload();
    } catch (error) {
      setAssignNotice(`Supplement plan could not be assigned: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    } finally { setSupplementBusy(false); }
  };

  const toggleSupplement = async (row: Row) => {
    if (!db || !userId) return;
    const { data, error } = await db.from('supplement_plans').update({ active: !row.active }).eq('id', row.id).eq('profile_id', userId).select('id');
    if (error) { setAssignNotice(`Supplement status could not be updated: ${error.message}`); return; }
    if (!data?.length) { setAssignNotice('Supplement status was not updated. Check staff permissions and retry.'); return; }
    setAssignNotice(`${String(row.name)} ${row.active ? 'paused' : 'activated'}.`);
    reload();
  };

  const cols = (() => {
    if (dataset === 'checkins') return [
      { key: 'checkin_date', label: 'Date', render: (r: Row) => ShortDate(String(r.checkin_date ?? '')) },
      { key: 'sleep', label: 'Sleep' }, { key: 'energy', label: 'Energy' }, { key: 'stress', label: 'Stress' },
      { key: 'soreness', label: 'Soreness' }, { key: 'status', label: 'Status' }, { key: 'client_notes', label: 'Client notes' },
      { key: 'coach_notes', label: 'Coach notes' },
    ];
    if (dataset === 'progress_logs') return [
      { key: 'recorded_on', label: 'Date', render: (r: Row) => ShortDate(String(r.recorded_on ?? '')) },
      { key: 'weight', label: 'Weight (kg)' }, { key: 'note', label: 'Notes' },
    ];
    if (dataset === 'nutrition_logs') return [
      { key: 'logged_on', label: 'Date', render: (r: Row) => ShortDate(String(r.logged_on ?? '')) },
      { key: 'calories', label: 'Calories' }, { key: 'protein_grams', label: 'Protein (g)' }, { key: 'water_liters', label: 'Water (L)' },
    ];
    if (dataset === 'nutrition_daily_logs') return [
      { key: 'log_date', label: 'Date', render: (r: Row) => ShortDate(String(r.log_date ?? '')) },
      { key: 'day_type', label: 'Day type' }, { key: 'completed_day', label: 'Day complete', render: (r: Row) => r.completed_day ? 'Yes' : 'No' },
      { key: 'completed_meal_ids', label: 'Completed meal IDs', render: (r: Row) => Array.isArray(r.completed_meal_ids) ? r.completed_meal_ids.join(', ') || 'None' : '—' },
    ];
    if (dataset === 'workout_sessions') return [
      { key: 'scheduled_on', label: 'Scheduled', render: (r: Row) => ShortDate(String(r.scheduled_on ?? '')) },
      { key: 'template', label: 'Workout', render: (r: Row) => String(r.workout_templates?.name ?? r.template_id ?? '—') }, { key: 'status', label: 'Status' },
      { key: 'completed_on', label: 'Completed', render: (r: Row) => ShortDate(String(r.completed_on ?? '')) },
      { key: 'notes', label: 'Session notes', render: (r: Row) => typeof r.notes === 'object' && r.notes !== null ? JSON.stringify(r.notes) : String(r.notes ?? '—') },
    ];
    if (dataset === 'daily_metrics') return [
      { key: 'metric_date', label: 'Date', render: (r: Row) => ShortDate(String(r.metric_date ?? '')) },
      { key: 'water_litres', label: 'Water (L)' }, { key: 'steps', label: 'Steps' },
    ];
    if (dataset === 'cardio_logs') return [
      { key: 'completed_at', label: 'Completed', render: (r: Row) => ShortDate(String(r.completed_at ?? '')) },
      { key: 'activity', label: 'Activity' }, { key: 'duration_minutes', label: 'Minutes' }, { key: 'average_heart_rate', label: 'Avg HR' }, { key: 'notes', label: 'Notes' },
    ];
    if (dataset === 'supplement_plans') return [
      { key: 'name', label: 'Supplement' }, { key: 'dosage_string', label: 'Dosage' }, { key: 'timing', label: 'Timing' }, { key: 'instructions', label: 'Instructions' }, { key: 'active', label: 'Status', render: (r: Row) => <button type="button" className={btnGhost} onClick={() => void toggleSupplement(r)}>{r.active ? 'Active · Pause' : 'Inactive · Activate'}</button> },
    ];
    return [
      { key: 'created_at', label: 'Sent', render: (r: Row) => ShortDate(String(r.created_at ?? '')) },
      { key: 'sender_profile_id', label: 'Sender ID' }, { key: 'body', label: 'Message' }, { key: 'delivery_status', label: 'Delivery' },
    ];
  })();

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-orange-300">Member workspace</p>
            <p className="text-sm text-zinc-400">Everything this member submits in the app — workouts, nutrition, check-ins, activity — plus one-place assignment controls.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onBack ? <button type="button" className={btnGhost} onClick={onBack}>← Back to members</button> : null}
            {userId ? <button type="button" className={btnGhost} onClick={() => onMessageMember(userId)}>Message member</button> : null}
          </div>
        </div>
        <label className="mb-1 block text-xs text-zinc-400">Client</label>
        <select className={inp} value={userId} onChange={(event) => setUserId(event.target.value)}>
          <option value="">Choose a client…</option>
          {users.map((user) => <option key={String(user.id)} value={String(user.id)}>{String(user.full_name || 'Unnamed client')} · {String(user.email ?? '')}</option>)}
        </select>
        {profile && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Email', profile.email],
              ['Role / tier', [profile.role, profile.member_tier].filter(Boolean).join(' · ') || '—'],
              ['Current weight', profile.current_weight ? `${profile.current_weight} kg` : '—'],
              ['Goal weight', profile.goal_weight ? `${profile.goal_weight} kg` : '—'],
              ['Active package', (() => { const active = memberships.find((row) => String(row.status ?? '').toLowerCase() === 'active'); return active ? String(active.plans?.name ?? active.plan_id) : '—'; })()],
              ['Coach', [profile.coach_name, profile.coach_role].filter(Boolean).join(' · ') || '—'],
              ['Member since', ShortDate(String(profile.since ?? ''))],
              ['Weigh-ins logged', String(records.progress_logs.length)],
            ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-zinc-800 bg-black/20 p-3"><p className="text-[10px] uppercase text-zinc-500">{label}</p><p className="mt-1 break-words text-sm text-white">{String(value ?? '—')}</p></div>)}
          </div>
        )}
      </div>

      {userId && (
        <>
          <div className={card}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-orange-300">This week</p>
                <p className="mt-1 text-xs text-zinc-500">Week commencing {ShortDate(dayKey(weekStart(new Date())))}, from saved app data.</p>
              </div>
              <button type="button" className={btnGhost} onClick={reload} disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Latest check-in', thisWeek.checkin ? String(thisWeek.checkin.status ?? 'submitted') : 'None yet'],
                ['Workouts done', thisWeek.workouts],
                ['Avg calories', thisWeek.kcal == null ? '—' : `${thisWeek.kcal} kcal`],
                ['Avg protein', thisWeek.protein == null ? '—' : `${thisWeek.protein} g`],
                ['Avg steps', thisWeek.steps == null ? '—' : Number(thisWeek.steps).toLocaleString('en-GB')],
                ['Latest weight', thisWeek.weight == null ? '—' : `${thisWeek.weight} kg`],
              ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-zinc-800 bg-black/20 p-3"><p className="text-[10px] uppercase text-zinc-500">{label}</p><p className="mt-1 text-sm font-medium text-white">{value}</p></div>)}
            </div>
          </div>

          <div className={card}>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-orange-300">Weekly rollup</p>
            <p className="mb-3 text-xs text-zinc-500">The last eight weeks of training, nutrition, hydration and weigh-ins.</p>
            <AdminTable
              rows={weeklyRollup}
              empty="No weekly data recorded yet."
              cols={[
                { key: 'week', label: 'Week', render: (r: Row) => <span className="font-medium text-white">{r.week}</span> },
                { key: 'checkin', label: 'Check-in' },
                { key: 'sessions', label: 'Sessions done' },
                { key: 'kcal', label: 'Avg kcal' },
                { key: 'protein', label: 'Avg protein' },
                { key: 'steps', label: 'Avg steps' },
                { key: 'water', label: 'Avg water (L)' },
                { key: 'weight', label: 'Weight (kg)' },
              ]}
            />
          </div>

          <div className={card}>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-orange-300">Recent activity</p>
            <p className="mb-3 text-xs text-zinc-500">Newest records across everything this member has submitted.</p>
            {recentActivity.length ? (
              <div className="divide-y divide-zinc-800">
                {recentActivity.map((event) => (
                  <div key={event.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-orange-300">{event.kind}</p>
                      <p className="mt-1 break-words text-sm text-zinc-200">{event.detail}</p>
                    </div>
                    <time className="shrink-0 text-xs text-zinc-500">{new Date(event.at).toLocaleString('en-GB')}</time>
                  </div>
                ))}
              </div>
            ) : <p className="py-5 text-sm text-zinc-500">No activity recorded yet.</p>}
          </div>

          <div className={`${card} !border-orange-500/20`}>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-orange-300">Assign to client</p>
            <p className="mb-4 text-xs text-zinc-500">Assign everything this member needs from one place. Writes go to the same tables the dedicated tabs use.</p>
            {assignNotice && <p role="status" className="mb-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.06] p-3 text-xs text-orange-200">{assignNotice}</p>}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <p className="text-xs font-semibold text-white">Package / membership</p>
                <select className={`${inp} mt-2`} value={assignPlanId} onChange={(event) => setAssignPlanId(event.target.value)}>
                  <option value="">Choose a package…</option>
                  {plans.map((plan) => <option key={String(plan.id)} value={String(plan.id)}>{String(plan.name)}</option>)}
                </select>
                <select className={`${inp} mt-2`} value={assignMembershipStatus} onChange={(event) => setAssignMembershipStatus(event.target.value)} aria-label="Membership status">
                  {['active', 'trialing', 'past_due', 'canceled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" className={`${btn} mt-3`} onClick={() => void assignMembership()}>Assign package</button>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <p className="text-xs font-semibold text-white">Nutrition plan</p>
                <select className={`${inp} mt-2`} value={assignNutritionTemplate} onChange={(event) => setAssignNutritionTemplate(event.target.value)}>
                  <option value="">Choose a meal template…</option>
                  {nutritionTemplates.map((template) => <option key={String(template.id)} value={String(template.id)}>{String(template.name)}</option>)}
                </select>
                <button type="button" className={`${btn} mt-3`} onClick={() => void assignNutrition()}>Assign nutrition plan</button>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <p className="text-xs font-semibold text-white">Workout session</p>
                <select className={`${inp} mt-2`} value={assignWorkoutTemplate} onChange={(event) => setAssignWorkoutTemplate(event.target.value)}>
                  <option value="">Choose a workout template…</option>
                  {workoutTemplates.map((template) => <option key={String(template.id)} value={String(template.id)}>{String(template.name)}</option>)}
                </select>
                <input type="date" className={`${inp} mt-2`} value={assignWorkoutDate} onChange={(event) => setAssignWorkoutDate(event.target.value)} aria-label="Session date" />
                <button type="button" className={`${btn} mt-3`} onClick={() => void assignWorkout()}>Schedule session</button>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <p className="text-xs font-semibold text-white">Coaching programme</p>
                <select className={`${inp} mt-2`} value={assignProgrammeId} onChange={(event) => setAssignProgrammeId(event.target.value)}>
                  <option value="">Choose a programme…</option>
                  {programmes.filter((programme) => programme.active !== false).map((programme) => <option key={String(programme.id)} value={String(programme.id)}>{String(programme.name)}</option>)}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-[11px] text-zinc-500">Starts<input type="date" className={inp} value={assignProgrammeStart} onChange={(event) => setAssignProgrammeStart(event.target.value)} /></label>
                  <label className="text-[11px] text-zinc-500">Complete by<input type="date" min={assignProgrammeStart} className={inp} value={assignProgrammeDue} onChange={(event) => setAssignProgrammeDue(event.target.value)} /></label>
                </div>
                <button type="button" className={`${btn} mt-3`} onClick={() => void assignProgramme()}>Assign programme</button>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <p className="text-xs font-semibold text-white">Supplement plan</p>
                <input className={`${inp} mt-2`} value={supplementName} onChange={(event) => setSupplementName(event.target.value)} placeholder="Supplement name" aria-label="Supplement name" />
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input className={inp} value={supplementDosage} onChange={(event) => setSupplementDosage(event.target.value)} placeholder="Dosage, e.g. 5 g" aria-label="Supplement dosage" />
                  <select className={inp} value={supplementTiming} onChange={(event) => setSupplementTiming(event.target.value)} aria-label="Supplement timing">
                    <option value="AM">Morning</option><option value="PM">Evening</option><option value="WITH_MEAL">With a meal</option><option value="AS_DIRECTED">As directed</option>
                  </select>
                </div>
                <input className={`${inp} mt-2`} value={supplementInstructions} onChange={(event) => setSupplementInstructions(event.target.value)} placeholder="Instructions (optional)" aria-label="Supplement instructions" />
                <button type="button" disabled={supplementBusy} className={`${btn} mt-3`} onClick={() => void assignSupplement()}>{supplementBusy ? 'Saving…' : 'Assign supplement'}</button>
              </div>
            </div>
          </div>

          <div className={card}>
            <p className="mb-2 font-mono text-[10px] uppercase text-zinc-500">Memberships</p>
            {memberships.length ? memberships.map((item) => <div key={String(item.id)} className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3"><div><p className="text-sm text-white">{String(item.plans?.name ?? item.plan_id)}</p><p className="mt-1 text-xs text-zinc-500">Started {ShortDate(String(item.created_at ?? ''))}</p></div><div className="flex items-center gap-3"><span className="text-xs text-zinc-400">{item.plans?.price != null ? `£${Number(item.plans.price).toFixed(2)}` : '—'}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${String(item.status) === 'active' ? 'border-green-500/40 text-green-400' : 'border-zinc-600 text-zinc-400'}`}>{String(item.status)}</span></div></div>) : <p className="text-sm text-zinc-500">No memberships found — assign one above.</p>}
          </div>

          <div className={card}>
            <p className="mb-2 font-mono text-[10px] uppercase text-zinc-500">Assigned nutrition plans</p>
            {nutritionPlans.length ? nutritionPlans.map((plan) => <div key={String(plan.id)} className="mb-2 rounded-lg border border-zinc-800 p-3"><p className="text-sm font-medium text-white">{String(plan.name)} <span className="text-[10px] uppercase text-zinc-500">· {String(plan.day_type ?? 'training')} day</span></p><p className="mt-1 text-xs text-zinc-400">{String((plan.targets as Row)?.calories ?? '—')} kcal · {(plan.targets as Row)?.protein ?? '—'}g protein · {plan.active ? 'Active' : 'Inactive'}</p></div>) : <p className="text-sm text-zinc-500">No nutrition plans assigned.</p>}
          </div>

          <div className={card}>
            <p className="mb-2 font-mono text-[10px] uppercase text-zinc-500">Private progress photos</p>
            <p className="mb-3 text-xs text-zinc-500">Recent photos uploaded through the mobile daily check-in. Visible to authorised staff only.</p>
            {progressPhotos.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {progressPhotos.map((photo) => (
                  <figure key={String(photo.id)} className="overflow-hidden rounded-lg border border-zinc-800 bg-black/20">
                    <img
                      src={`data:${String(photo.mime_type || 'image/jpeg')};base64,${String(photo.photo_data || '')}`}
                      alt={String(photo.caption || 'Client progress photo')}
                      className="aspect-[3/4] w-full object-cover"
                      loading="lazy"
                    />
                    <figcaption className="space-y-1 p-2">
                      <p className="truncate text-xs text-white">{String(photo.caption || 'Progress photo')}</p>
                      <p className="text-[10px] text-zinc-500">{ShortDate(String(photo.recorded_on || ''))}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : <p className="text-sm text-zinc-500">No progress photos uploaded for this client yet.</p>}
          </div>

          <div className={card}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase text-orange-300">Client submissions</p><p className="mt-1 text-xs text-zinc-500">{DATASETS.find((item) => item.id === dataset)?.description}</p></div>
              <button type="button" className={btnGhost} onClick={reload} disabled={busy}>{busy ? 'Loading…' : 'Refresh selection'}</button>
            </div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{DATASETS.map((item) => <button key={item.id} onClick={() => setDataset(item.id)} className={dataset === item.id ? 'shrink-0 rounded-lg bg-[#ff5500] px-3 py-2 font-mono text-[10px] font-bold uppercase text-black' : 'shrink-0 rounded-lg border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase text-zinc-400'}>{item.label}</button>)}</div>
            {message && <p role="status" className="mb-3 text-xs text-orange-200">{message}</p>}
            <AdminTable rows={records[dataset]} cols={cols} empty={busy ? 'Loading records…' : 'No records found for this client.'} />
          </div>
        </>
      )}
    </div>
  );
}
