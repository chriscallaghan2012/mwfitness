// CheckinsAdmin + ProgressAdmin — coach review of check-ins and weight logs.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, ShortDate, StatusPill, btn, btnGhost, inp } from './fields';

export function CheckinsAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const { data, error } = await supabase!.from('checkins').select('*, profiles(full_name,email)').order('checkin_date', { ascending: false });
    if (!error && data) setRows(data as Row[]);
  };

  const review = async (r: Row) => {
    const notes = window.prompt('Coach notes for this check-in', String(r.coach_notes ?? ''));
    if (notes === null) return;
    await supabase!
      .from('checkins')
      .update({ status: 'reviewed', coach_notes: notes || null, coach_prescription: notes || null })
      .eq('id', r.id);
    await load();
  };

  const remove = async (id: string) => {
    await supabase!.from('checkins').delete().eq('id', id);
    await load();
  };

  return (
    <AdminTable
      rows={rows ?? []}
      empty="No check-ins yet."
      cols={[
        { key: 'who', label: 'Customer', render: (r) => <span className="font-medium text-white">{r.profiles?.full_name}</span> },
        { key: 'date', label: 'Date', render: (r) => ShortDate(r.checkin_date as string) },
        {
          key: 'scores',
          label: 'Scores',
          render: (r) => (
            <span className="text-zinc-400 font-mono text-[11px]">
              😴 {r.sleep} · ⚡ {r.energy} · 😣 {r.stress} · 💪 {r.soreness}
            </span>
          ),
        },
        { key: 'status', label: 'Status', render: (r) => StatusPill(String(r.status)) },
        {
          key: 'x',
          label: '',
          render: (r) => (
            <>
              <button onClick={() => void review(r)} className={btnGhost}>
                Review
              </button>
              <button className={`${btnGhost} ml-1`} onClick={() => void remove(String(r.id))}>
                Delete
              </button>
            </>
          ),
        },
      ]}
    />
  );
}

export function ProgressAdmin() {
  const [users, setUsers] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [userId, setUserId] = useState('');
  const [weight, setWeight] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    void supabase!.from('profiles').select('id,full_name').order('full_name').then((r) => !r.error && setUsers(r.data as Row[]));
  }, []);

  const load = async () => {
    if (!userId) {
      setRows(null);
      return;
    }
    const { data, error } = await supabase!.from('progress_logs').select('*').eq('profile_id', userId).order('recorded_on', { ascending: false });
    if (!error && data) setRows(data as Row[]);
  };

  const add = async () => {
    if (!weight) return;
    const { error } = await supabase!.from('progress_logs').insert({
      profile_id: userId,
      weight: Number(weight),
      recorded_on: new Date().toISOString().slice(0, 10),
    });
    setMsg(error ? `Failed: ${error.message}` : 'Logged ✓');
    setWeight('');
    await load();
  };

  const remove = async (id: string) => {
    await supabase!.from('progress_logs').delete().eq('id', id);
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <select className={inp} value={userId} onChange={(e) => { setUserId(e.target.value); void load(); }}>
          <option value="">Customer…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>
        {userId && <input className={inp} placeholder="weight kg" value={weight} onChange={(e) => setWeight(e.target.value)} />}
        {userId && (
          <button onClick={add} className={btn}>
            Log weigh-in
          </button>
        )}
        {msg && <span className="text-xs text-zinc-400">{msg}</span>}
      </div>
      <AdminTable
        rows={rows ?? []}
        empty={userId ? 'No weigh-ins for this customer yet.' : 'Pick a customer to see progress.'}
        cols={[
          { key: 'recorded_on', label: 'Date', render: (r) => ShortDate(r.recorded_on as string) },
          { key: 'weight', label: 'Weight', render: (r) => <span className="font-medium text-white">{r.weight} kg</span> },
          { key: 'note', label: 'Note' },
          { key: 'x', label: '', render: (r) => <button className={btnGhost} onClick={() => void remove(String(r.id))}>Delete</button> },
        ]}
      />
    </div>
  );
}