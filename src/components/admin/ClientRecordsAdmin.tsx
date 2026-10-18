import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, ShortDate, btnGhost, card, inp } from './fields';

type Dataset = 'checkins' | 'progress_logs' | 'nutrition_logs' | 'workout_sessions' | 'coach_messages';

const DATASETS: { id: Dataset; label: string; dateKey: string; description: string }[] = [
  { id: 'checkins', label: 'Check-ins', dateKey: 'checkin_date', description: 'Weekly wellbeing submissions from the mobile app.' },
  { id: 'progress_logs', label: 'Progress', dateKey: 'recorded_on', description: 'Weight and progress records submitted in the app.' },
  { id: 'nutrition_logs', label: 'Nutrition logs', dateKey: 'logged_on', description: 'Daily calories, protein and water entries.' },
  { id: 'workout_sessions', label: 'Workout sessions', dateKey: 'scheduled_on', description: 'Scheduled and completed sessions.' },
  { id: 'coach_messages', label: 'Messages', dateKey: 'created_at', description: 'Coach messages associated with this client.' },
];

export function ClientRecordsAdmin() {
  const [users, setUsers] = useState<Row[]>([]);
  const [userId, setUserId] = useState('');
  const [dataset, setDataset] = useState<Dataset>('checkins');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [profile, setProfile] = useState<Row | null>(null);
  const [memberships, setMemberships] = useState<Row[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<Row[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<Row[]>([]);
  const [photosMessage, setPhotosMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void supabase?.from('profiles').select('id,full_name,email,role,member_tier,since,current_weight,start_weight,goal_weight').order('full_name')
      .then(({ data, error }) => {
        if (error) setMessage('Could not load clients. Check staff permissions and database policies.');
        else setUsers((data ?? []) as Row[]);
      });
  }, []);

  useEffect(() => {
    if (!supabase || !userId) {
      setRows(null); setProfile(null); setMemberships([]); setNutritionPlans([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    setMessage('');
    const selected = users.find((user) => user.id === userId) ?? null;
    setProfile(selected);
    Promise.all([
      supabase.from(dataset).select('*').eq(dataset === 'coach_messages' ? 'athlete_profile_id' : 'profile_id', userId).order(DATASETS.find((item) => item.id === dataset)?.dateKey ?? 'created_at', { ascending: false }),
      supabase.from('memberships').select('*, plans(name,price,kind)').eq('profile_id', userId).order('created_at', { ascending: false }),
      supabase.from('nutrition_plans').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
    ]).then(([records, membershipResult, nutritionResult]) => {
      if (cancelled) return;
      if (records.error) {
        setRows([]);
        setMessage('Could not read this app data set. Confirm the table exists and staff RLS permissions are applied.');
      } else setRows((records.data ?? []) as Row[]);
      setMemberships((membershipResult.data ?? []) as Row[]);
      setNutritionPlans((nutritionResult.data ?? []) as Row[]);
    }).catch(() => {
      if (!cancelled) setMessage('The shared database could not be reached. Try refreshing the client records.');
    }).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [userId, dataset, users, refreshTick]);

  useEffect(() => {
    if (!supabase || !userId) {
      setProgressPhotos([]);
      setPhotosMessage('');
      return;
    }
    let cancelled = false;
    supabase.from('progress_photos')
      .select('id,recorded_on,caption,mime_type,photo_data,created_at')
      .eq('profile_id', userId)
      .order('recorded_on', { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setProgressPhotos([]);
          setPhotosMessage('Progress photo storage is not enabled yet. Apply the reviewed mobile migration before expecting uploaded photos here.');
        } else {
          setProgressPhotos((data ?? []) as Row[]);
          setPhotosMessage('');
        }
      }, () => {
        if (!cancelled) {
          setProgressPhotos([]);
          setPhotosMessage('Could not load private progress photos. Check staff permissions and database availability.');
        }
      });
    return () => { cancelled = true; };
  }, [userId, refreshTick]);

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
    if (dataset === 'workout_sessions') return [
      { key: 'scheduled_on', label: 'Scheduled', render: (r: Row) => ShortDate(String(r.scheduled_on ?? '')) },
      { key: 'template_id', label: 'Workout template' }, { key: 'status', label: 'Status' }, { key: 'completed_on', label: 'Completed' }, { key: 'notes', label: 'Session notes' },
    ];
    return [
      { key: 'created_at', label: 'Sent', render: (r: Row) => ShortDate(String(r.created_at ?? '')) },
      { key: 'sender_profile_id', label: 'Sender ID' }, { key: 'body', label: 'Message' }, { key: 'delivery_status', label: 'Delivery' },
    ];
  })();

  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-orange-300">App data explorer</p>
        <p className="mb-4 text-sm text-zinc-400">Inspect submissions synced from the mobile app. This is read-only scaffolding; it does not change the app's dummy data or write into client records.</p>
        <label className="mb-1 block text-xs text-zinc-400">Client</label>
        <select className={inp} value={userId} onChange={(event) => setUserId(event.target.value)}>
          <option value="">Choose a client…</option>
          {users.map((user) => <option key={String(user.id)} value={String(user.id)}>{String(user.full_name || 'Unnamed client')} · {String(user.email ?? '')}</option>)}
        </select>
        {profile && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Email', profile.email], ['Role / tier', [profile.role, profile.member_tier].filter(Boolean).join(' · ') || '—'],
              ['Current weight', profile.current_weight ? `${profile.current_weight} kg` : '—'],
              ['Goal weight', profile.goal_weight ? `${profile.goal_weight} kg` : '—'],
            ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-zinc-800 bg-black/20 p-3"><p className="text-[10px] uppercase text-zinc-500">{label}</p><p className="mt-1 break-words text-sm text-white">{String(value ?? '—')}</p></div>)}
          </div>
        )}
      </div>
      {userId && (
        <>
          <div className={card}>
            <p className="mb-2 font-mono text-[10px] uppercase text-zinc-500">Memberships</p>
            {memberships.length ? <div className="space-y-2">{memberships.map((item) => <div key={String(item.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3"><div><p className="text-sm font-medium text-white">{String(item.plans?.name ?? item.plan_id)}</p><p className="text-xs text-zinc-500">{String(item.status)} · {item.current_period_end ? `ends ${ShortDate(String(item.current_period_end))}` : 'no end date recorded'}</p></div><span className="text-sm text-orange-300">{item.plans?.price != null ? `£${Number(item.plans.price).toFixed(2)}` : '—'}</span></div>)}</div> : <p className="text-sm text-zinc-500">No memberships found.</p>}
            <p className="mb-2 mt-5 font-mono text-[10px] uppercase text-zinc-500">Assigned nutrition plans</p>
            {nutritionPlans.length ? nutritionPlans.map((plan) => <div key={String(plan.id)} className="mb-2 rounded-lg border border-zinc-800 p-3"><p className="text-sm font-medium text-white">{String(plan.name)}</p><p className="mt-1 text-xs text-zinc-400">{String((plan.targets as Row)?.calories ?? '—')} kcal · {(plan.targets as Row)?.protein ?? '—'}g protein · {plan.active ? 'Active' : 'Inactive'}</p></div>) : <p className="text-sm text-zinc-500">No nutrition plans assigned.</p>}
          </div>
          <div className={card}>
            <div className="mb-3">
              <p className="font-mono text-[10px] uppercase text-orange-300">Private progress photos</p>
              <p className="mt-1 text-xs text-zinc-500">Recent photos uploaded through the mobile daily check-in. Visible to authorised staff only.</p>
            </div>
            {photosMessage && <p role="status" className="mb-3 text-xs text-orange-200">{photosMessage}</p>}
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
            ) : !photosMessage ? <p className="text-sm text-zinc-500">No progress photos uploaded for this client yet.</p> : null}
          </div>
          <div className={card}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase text-orange-300">Client submissions</p><p className="mt-1 text-xs text-zinc-500">{DATASETS.find((item) => item.id === dataset)?.description}</p></div>
              <button type="button" className={btnGhost} onClick={() => setRefreshTick((value) => value + 1)} disabled={busy}>{busy ? 'Loading…' : 'Refresh selection'}</button>
            </div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{DATASETS.map((item) => <button key={item.id} onClick={() => setDataset(item.id)} className={dataset === item.id ? 'shrink-0 rounded-lg bg-[#ff5500] px-3 py-2 font-mono text-[10px] font-bold uppercase text-black' : 'shrink-0 rounded-lg border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase text-zinc-400'}>{item.label}</button>)}</div>
            {message && <p role="status" className="mb-3 text-xs text-orange-200">{message}</p>}
            <AdminTable rows={rows ?? []} cols={cols} empty={busy ? 'Loading records…' : 'No records found for this client.'} />
          </div>
        </>
      )}
    </div>
  );
}
