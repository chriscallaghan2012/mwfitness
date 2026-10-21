// CheckinsAdmin + ProgressAdmin — coach review of check-ins and weight logs.
import { useEffect, useRef, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, ShortDate, StatusPill, btn, btnGhost, inp } from './fields';

export function CheckinsAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [checkinMsg, setCheckinMsg] = useState('');
  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    if (!neon) { setRows([]); setCheckinMsg('Neon is not configured; check-ins cannot be loaded.'); return; }
    try {
      const { data, error } = await neon.from('checkins').select('*, profiles(full_name,email)').order('checkin_date', { ascending: false });
      if (error) setCheckinMsg('Could not load check-ins: ' + error.message);
      else { setRows((data ?? []) as Row[]); setCheckinMsg(''); }
    } catch (error) {
      setCheckinMsg('Could not load check-ins: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    }
  };

  const review = async (r: Row) => {
    const notes = window.prompt('Coach notes for this check-in', String(r.coach_notes ?? ''));
    if (notes === null) return;
    if (!neon) { setCheckinMsg('Neon is not configured; check-ins cannot be updated.'); return; }
    try {
      const result = await neon.from('checkins').update({ status: 'reviewed', coach_notes: notes || null, coach_prescription: notes || null }).eq('id', r.id).select('id');
      if (result.error) { setCheckinMsg('Could not save review: ' + result.error.message); return; }
      if (!result.data?.length) { setCheckinMsg('The check-in was not updated. It may no longer exist or your staff permissions may not allow this change.'); return; }
      setCheckinMsg('Check-in review saved.');
      await load();
    } catch (error) {
      setCheckinMsg('Could not save review: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    }
  };

  const remove = async (id: string) => {
    if (!neon) { setCheckinMsg('Neon is not configured; check-ins cannot be deleted.'); return; }
    try {
      const result = await neon.from('checkins').delete().eq('id', id).select('id');
      if (result.error) { setCheckinMsg('Could not delete check-in: ' + result.error.message); return; }
      if (!result.data?.length) { setCheckinMsg('The check-in was not deleted. It may already be gone or your staff permissions may not allow this change.'); return; }
      setCheckinMsg('Check-in deleted.');
      await load();
    } catch (error) {
      setCheckinMsg('Could not delete check-in: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    }
  };

  return (
    <>
    {checkinMsg && <p role="status" className="mb-3 text-xs text-zinc-400">{checkinMsg}</p>}
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
    </>
  );
}

export function ProgressAdmin() {
  const [users, setUsers] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [userId, setUserId] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const loadRequest = useRef(0);

  useEffect(() => {
    if (!neon) { setMsg('Neon is not configured; progress records cannot be loaded.'); return; }
    void neon.from('profiles').select('id,full_name').order('full_name').then(({ data, error }) => {
      if (error) setMsg(`Could not load customers: ${error.message}`);
      else setUsers((data ?? []) as Row[]);
    }, (error) => setMsg(`Could not load customers: ${error instanceof Error ? error.message : 'Unexpected error'}`));
  }, []);

  const load = async (profileId = userId) => {
    const requestId = ++loadRequest.current;
    if (!profileId) { setRows(null); return; }
    if (!neon) { setMsg('Neon is not configured; progress records cannot be loaded.'); setRows([]); return; }
    // Never leave the previous customer's weigh-ins visible during a new query.
    setRows([]);
    try {
      const { data, error } = await neon.from('progress_logs').select('*').eq('profile_id', profileId).order('recorded_on', { ascending: false });
      if (requestId !== loadRequest.current) return;
      if (error) { setMsg(`Could not load progress: ${error.message}`); setRows([]); }
      else { setRows((data ?? []) as Row[]); setMsg(''); }
    } catch (error) {
      if (requestId !== loadRequest.current) return;
      setRows([]);
      setMsg(`Could not load progress: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  const add = async () => {
    const parsedWeight = Number(weight);
    if (!userId) { setMsg('Choose a customer first.'); return; }
    if (!weight.trim() || !Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 999) {
      setMsg('Enter a valid weight greater than 0 and no more than 999 kg.');
      return;
    }
    if (!neon) { setMsg('Neon is not configured; progress cannot be saved.'); return; }
    try {
      const result = await neon.from('progress_logs').insert({
        profile_id: userId,
        weight: parsedWeight,
        recorded_on: new Date().toISOString().slice(0, 10),
        note: note.trim() || null,
      }).select('id');
      if (result.error) { setMsg(`Failed: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('The weigh-in was not saved. Check your staff permissions and try again.'); return; }
      setMsg('Weigh-in logged.');
      setWeight('');
      setNote('');
      await load(userId);
    } catch (error) {
      setMsg(`Failed: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  const remove = async (id: string) => {
    if (!neon) { setMsg('Neon is not configured; progress cannot be deleted.'); return; }
    try {
      const result = await neon.from('progress_logs').delete().eq('id', id).select('id');
      if (result.error) { setMsg(`Could not delete weigh-in: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('The weigh-in was not deleted. It may already be gone or your staff permissions may not allow this change.'); return; }
      setMsg('Weigh-in deleted.');
      await load(userId);
    } catch (error) {
      setMsg(`Could not delete weigh-in: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <select className={inp} value={userId} onChange={(e) => { const nextUserId = e.target.value; setUserId(nextUserId); void load(nextUserId); }}>
          <option value="">Customer…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>
        {userId && <input className={inp} placeholder="weight kg" value={weight} onChange={(e) => setWeight(e.target.value)} />}
        {userId && <input className={inp} placeholder="Progress note for member" value={note} onChange={(e) => setNote(e.target.value)} />}
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