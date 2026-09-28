// WorkoutsAdmin — template exercises + per-customer session schedule.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

export function WorkoutsAdmin() {
  const [templates, setTemplates] = useState<Row[] | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [sessions, setSessions] = useState<Row[] | null>(null);
  const [userId, setUserId] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<Record<string, string>>({});
  const [sessForm, setSessForm] = useState<Record<string, string>>({});

  const load = async () => {
    const { data, error } = await supabase!.from('workout_templates').select('*, plans(name)').order('name');
    if (!error && data) setTemplates(data as Row[]);
    void supabase!.from('profiles').select('id,full_name').order('full_name').then((r) => !r.error && setUsers(r.data as Row[]));
    void supabase!.from('plans').select('id,name').order('name').then((r) => !r.error && setPlans(r.data as Row[]));
  };
  const loadSessions = async () => {
    if (!userId) {
      setSessions(null);
      return;
    }
    const { data, error } = await supabase!.from('workout_sessions').select('*, workout_templates(name)').eq('profile_id', userId).order('scheduled_on');
    if (!error && data) setSessions(data as Row[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const addTemplate = async () => {
    const { error } = await supabase!.from('workout_templates').insert({
      name: form.name,
      description: form.description ?? '',
      days_per_week: Number(form.days_per_week || 0),
      plan_id: form.plan_id || null,
    });
    setMsg(error ? `Failed: ${error.message}` : 'Added ✓');
    setForm({});
    await load();
  };

  const removeTemplate = async (id: string) => {
    await supabase!.from('workout_templates').delete().eq('id', id);
    await load();
  };

  const addSession = async () => {
    if (!userId || !sessForm.template_id) return;
    const { error } = await supabase!.from('workout_sessions').insert({
      profile_id: userId,
      template_id: sessForm.template_id,
      scheduled_on: sessForm.scheduled_on || null,
      status: 'planned',
    });
    setMsg(error ? `Failed: ${error.message}` : 'Scheduled ✓');
    setSessForm({});
    await loadSessions();
  };

  const flipStatus = async (s: Row) => {
    const status = s.status === 'completed' ? 'planned' : 'completed';
    await supabase!.from('workout_sessions').update({ status, completed_on: status === 'completed' ? new Date().toISOString() : null }).eq('id', s.id);
    await loadSessions();
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
          { key: 'xd', label: '', render: (r) => <button className={btnGhost} onClick={() => void removeTemplate(String(r.id))}>Delete</button> },
        ]}
      />
      <div className={`${card} mt-4`}>
        <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Schedule sessions for a customer</p>
        <select className={inp} value={userId} onChange={(e) => { setUserId(e.target.value); void loadSessions(); }}>
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