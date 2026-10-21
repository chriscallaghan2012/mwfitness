// WorkoutsAdmin — template exercises + per-customer session schedule.
import { useEffect, useRef, useState } from 'react';
import { adminDb } from '../../lib/admin/adminDb';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

export function WorkoutsAdmin() {
  const db = adminDb();
  const [templates, setTemplates] = useState<Row[] | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [sessions, setSessions] = useState<Row[] | null>(null);
  const [userId, setUserId] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<Record<string, string>>({});
  const [sessForm, setSessForm] = useState<Record<string, string>>({});
  const sessionLoadRequest = useRef(0);

  const load = async () => {
    if (!db) { setMsg('Neon is not configured; live workouts cannot be loaded.'); setTemplates([]); setSessions([]); return; }
    try {
      const [templateResult, userResult, planResult] = await Promise.all([
        db.from('workout_templates').select('*, plans(name)').order('name'),
        db.from('profiles').select('id,full_name').order('full_name'),
        db.from('plans').select('id,name').order('name'),
      ]);
      if (templateResult.error) setMsg(`Could not load workout templates: ${templateResult.error.message}`);
      else setTemplates((templateResult.data ?? []) as Row[]);
      if (userResult.error) setMsg(`Could not load customers: ${userResult.error.message}`);
      else setUsers((userResult.data ?? []) as Row[]);
      if (planResult.error) setMsg(`Could not load plans: ${planResult.error.message}`);
      else setPlans((planResult.data ?? []) as Row[]);
    } catch (error) {
      setMsg(`Could not load workout setup: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };
  const loadSessions = async (profileId = userId) => {
    const requestId = ++sessionLoadRequest.current;
    if (!profileId) { setSessions(null); return; }
    if (!db) { setMsg('Neon is not configured; sessions cannot be loaded.'); setSessions([]); return; }
    setSessions([]);
    try {
      const { data, error } = await db.from('workout_sessions').select('*, workout_templates(name)').eq('profile_id', profileId).order('scheduled_on');
      if (requestId !== sessionLoadRequest.current) return;
      if (error) { setMsg(`Could not load sessions: ${error.message}`); setSessions([]); return; }
      setSessions((data ?? []) as Row[]);
    } catch (error) {
      if (requestId !== sessionLoadRequest.current) return;
      setSessions([]);
      setMsg(`Could not load sessions: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const addTemplate = async () => {
    if (!form.name?.trim()) { setMsg('Enter a workout template name.'); return; }
    const days = Number(form.days_per_week || 0);
    if (days && (!Number.isInteger(days) || days < 1 || days > 7)) { setMsg('Days per week must be between 1 and 7.'); return; }
    if (!db) { setMsg('Neon is not configured; workout templates cannot be created.'); return; }
    try {
      const result = await db.from('workout_templates').insert({
        name: form.name.trim(),
        description: form.description ?? '',
        days_per_week: days || null,
        plan_id: form.plan_id || null,
      }).select('id');
      if (result.error) { setMsg(`Could not add template: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('Workout template was not saved. Check staff permissions and retry.'); return; }
      setMsg('Workout template added.');
      setForm({});
      await load();
    } catch (error) {
      setMsg(`Could not add template: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  const removeTemplate = async (row: Row) => {
    if (!db) { setMsg('Neon is not configured; no changes were made.'); return; }
    if (!window.confirm(`Delete workout template “${String(row.name)}”? Scheduled sessions may prevent deletion.`)) return;
    setMsg('');
    try {
      const result = await db.from('workout_templates').delete().eq('id', row.id).select('id');
      if (result.error) { setMsg(`Delete failed: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('The template was not deleted. It may already be gone or your staff permissions may not allow this change.'); return; }
      setMsg('Template deleted.');
      await load();
    } catch (error) {
      setMsg(`Delete failed: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  const addSession = async () => {
    if (!userId || !sessForm.template_id) { setMsg('Choose a client and workout template first.'); return; }
    if (!db) { setMsg('Neon is not configured; sessions cannot be scheduled.'); return; }
    try {
      const result = await db.from('workout_sessions').insert({
        profile_id: userId,
        template_id: sessForm.template_id,
        scheduled_on: sessForm.scheduled_on || null,
        status: 'planned',
      }).select('id');
      if (result.error) { setMsg(`Could not schedule session: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('Workout session was not saved. Check staff permissions and retry.'); return; }
      setMsg('Workout session scheduled.');
      setSessForm({});
      await loadSessions(userId);
    } catch (error) {
      setMsg(`Could not schedule session: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  const flipStatus = async (s: Row) => {
    if (!db) { setMsg('Neon is not configured; session status cannot be updated.'); return; }
    const status = s.status === 'completed' ? 'planned' : 'completed';
    try {
      const result = await db.from('workout_sessions').update({ status, completed_on: status === 'completed' ? new Date().toISOString() : null }).eq('id', s.id).select('id');
      if (result.error) { setMsg(`Could not update session: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('The session was not updated. It may no longer exist or your staff permissions may not allow this change.'); return; }
      setMsg(`Session marked ${status}.`);
      await loadSessions(userId);
    } catch (error) {
      setMsg(`Could not update session: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  return (
    <div>
      <div className={`${card} mb-4`}>
        <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">New template</p>
        <div className="grid grid-cols-3 gap-2">
          <input className={inp} placeholder="title" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inp} placeholder="description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className={inp} placeholder="days/week" value={form.days_per_week ?? ''} onChange={(e) => setForm({ ...form, days_per_week: e.target.value })} />
        </div>
        <select className={`${inp} mt-2`} value={form.plan_id ?? ''} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}>
          <option value="">Any plan…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button onClick={addTemplate} className={`${btn} mt-3`}>
          Add template
        </button>
        {msg && <span className="text-xs text-zinc-400 ml-2">{msg}</span>}
      </div>

      <AdminTable
        rows={templates ?? []}
        empty="No templates yet — add one above."
        cols={[
          { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { key: 'description', label: 'Description', render: (r) => <span className="text-zinc-400">{r.description}</span> },
          { key: 'days_per_week', label: 'Days' },
          { key: 'xd', label: '', render: (r) => <button className={btnGhost} onClick={() => void removeTemplate(r)}>Delete</button> },
        ]}
      />
      <div className={`${card} mt-4`}>
        <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Schedule sessions for a customer</p>
        <select className={inp} value={userId} onChange={(e) => { setUserId(e.target.value); void loadSessions(e.target.value); }}>
          <option value="">Customer…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>
        {userId && (
          <div className="flex flex-wrap gap-2 mt-2">
            <select className={inp} value={sessForm.template_id ?? ''} onChange={(e) => setSessForm({ ...sessForm, template_id: e.target.value })}>
              <option value="">Template…</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input className={inp} type="date" value={sessForm.scheduled_on ?? ''} onChange={(e) => setSessForm({ ...sessForm, scheduled_on: e.target.value })} />
            <button onClick={addSession} className={btn}>
              Schedule
            </button>
          </div>
        )}
        <AdminTable
          rows={sessions ?? []}
          empty={userId ? 'No sessions for this customer yet.' : 'Pick a customer to see their schedule.'}
          cols={[
            { key: 'template', label: 'Session', render: (r) => <span className="font-medium text-white">{r.workout_templates?.name}</span> },
            { key: 'scheduled_on', label: 'Date', render: (r) => ShortDate(r.scheduled_on as string) },
            { key: 'status', label: 'Status', render: (r) => <button className={btnGhost} onClick={() => void flipStatus(r)}>{r.status}</button> },
          ]}
        />
      </div>
    </div>
  );
}