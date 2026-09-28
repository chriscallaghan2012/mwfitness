// MembershipsAdmin — which customer owns which plan (Stripe-backed).
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, ShortDate, StatusPill, btn, btnGhost, card, inp } from './fields';

const STATUSES = ['active', 'trialing', 'past_due', 'canceled', 'incomplete'];

export function MembershipsAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = async () => {
    const { data, error } = await supabase!.from('memberships').select('*, profiles(full_name,email), plans(name)').order('created_at', { ascending: false });
    if (!error && data) setRows(data as Row[]);
    const u = await supabase!.from('profiles').select('id,full_name,email').order('full_name');
    if (!u.error) setUsers(u.data as Row[]);
    const p = await supabase!.from('plans').select('id,name').order('name');
    if (!p.error) setPlans(p.data as Row[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const assign = async () => {
    if (!form.profile_id || !form.plan_id) {
      setMsg('Pick a customer and a plan.');
      return;
    }
    setBusy(true);
    const { error } = await supabase!
      .from('memberships')
      .insert({ profile_id: form.profile_id, plan_id: form.plan_id, status: form.status ?? 'active' });
    setMsg(error ? `Failed: ${error.message}` : 'Assigned ✓');
    setBusy(false);
    setForm({});
    await load();
  };

  const remove = async (id: string) => {
    await supabase!.from('memberships').delete().eq('id', id);
    await load();
  };

  return (
    <div>
      <div className={`${card} mb-4`}>
        <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Assign plan to customer</p>
        <select className={inp} value={form.profile_id ?? ''} onChange={(e) => setForm({ ...form, profile_id: e.target.value })}>
          <option value="">Customer…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} ({u.email})
            </option>
          ))}
        </select>
        <select className={`${inp} mt-2`} value={form.plan_id ?? ''} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}>
          <option value="">Plan…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.id})
            </option>
          ))}
        </select>
        <select className={`${inp} mt-2`} value={form.status ?? 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button disabled={busy} onClick={assign} className={`${btn} mt-3`}>
          Assign
        </button>
        {msg && <span className="text-xs text-zinc-400 ml-2">{msg}</span>}
      </div>

      <AdminTable
        rows={rows ?? []}
        empty="No memberships yet — assign one above."
        cols={[
          { key: 'customer', label: 'Customer', render: (r) => <span className="font-medium text-white">{r.profiles?.full_name}</span> },
          { key: 'email', label: 'Email', render: (r) => <span className="text-zinc-400">{r.profiles?.email}</span> },
          { key: 'plan', label: 'Plan', render: (r) => <span className="text-orange-300">{r.plans?.name}</span> },
          { key: 'status', label: 'Status', render: (r) => StatusPill(String(r.status)) },
          { key: 'start', label: 'Start', render: (r) => ShortDate(r.current_period_start as string) },
          {
            key: 'end',
            label: 'End',
            render: (r) => (
              <>
                {ShortDate(r.current_period_end as string)}
                <button className={`${btnGhost} ml-2`} onClick={() => void remove(String(r.id))}>
                  Remove
                </button>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}