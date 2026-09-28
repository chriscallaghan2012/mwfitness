// UsersAdmin — customers & coaches: list, edit, create, demo bootstrap.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

const DEMO_USERS: [string, string, string][] = [
  ['Christopher Vance', 'athlete@mwfitness.co.uk', 'athlete'],
  ['Sarah Jenkins', 'sarah.jenkins@londonfit.co.uk', 'athlete'],
  ['Marcus Sterling', 'marcus.sterling@ukpower.org', 'athlete'],
  ['Elena Rostova', 'elena.r@vitality.io', 'athlete'],
  ['Tom Bradley', 'tom.bradley@techcorp.co.uk', 'athlete'],
  ['Coach Mike', 'coach.mike@mwfitness.co.uk', 'coach'],
];
const DEMO_PASS = 'password123';
const DEMO_COACH_PASS = 'coachhq2024';

export function UsersAdmin() {
  const [users, setUsers] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [f, setF] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    const { data, error } = await supabase!.from('profiles').select('*').order('created_at');
    if (!error && data) setUsers(data as Row[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const saveEdit = async () => {
    if (!edit) return;
    setBusy(true);
    setMsg('');
    const { error } = await supabase!.from('profiles').update(f).eq('id', edit.id);
    setMsg(error ? `Failed: ${error.message}` : 'Saved ✓');
    setBusy(false);
    setEdit(null);
    await load();
  };

  const addCustomer = async () => {
    if (!email) return;
    setBusy(true);
    setMsg('Creating…');
    const { error } = await supabase!.auth.signUp({
      email: email.trim(),
      password: DEMO_PASS,
      options: { data: { full_name: email.trim().split('@')[0] } },
    });
    setMsg(error ? `Failed: ${error.message}` : `Created ${email.trim()} (temp password: ${DEMO_PASS}) — edit their profile next`);
    setBusy(false);
    setAddOpen(false);
    await load();
  };

  const addDemo = async () => {
    setBusy(true);
    setMsg('Booting demo customers…');
    let ok = 0;
    for (const [name, mail, role] of DEMO_USERS) {
      const { data, error } = await supabase!.auth.signUp({
        email: mail,
        password: role === 'coach' ? DEMO_COACH_PASS : DEMO_PASS,
        options: { data: { full_name: name } },
      });
      if (error || !data.user) continue;
      const { error: upErr } = await supabase!
        .from('profiles')
        .update({
          full_name: name,
          role,
          member_tier: role === 'coach' ? 'Staff' : 'MW Elite Performance Member',
          coach_name: 'Coach Mike (Lead Strength Specialist)',
          coach_role: 'Lead Strength Specialist',
        })
        .eq('id', data.user.id as string);
      if (!upErr) ok += 1;
    }
    setMsg(`${ok} demo customer(s) ready — coach sign-in: coach.mike@mwfitness.co.uk / ${DEMO_COACH_PASS}`);
    setBusy(false);
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button disabled={busy} onClick={addDemo} className={btn}>
          + Add demo customers
        </button>
        <button onClick={() => setAddOpen(!addOpen)} className={btnGhost}>
          + Add customer
        </button>
        <button onClick={() => void load()} className={btnGhost}>
          Refresh
        </button>
        {msg && <span className="text-xs text-zinc-400">{msg}</span>}
      </div>

      {addOpen && (
        <div className={`${card} mb-4`}>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">New customer sign-in</p>
          <input className={inp} placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={busy} onClick={addCustomer} className={`${btn} mt-3`}>
            Create account (temp password {DEMO_PASS})
          </button>
        </div>
      )}

      <AdminTable
        rows={users ?? []}
        empty="No customers yet — hit “Add demo customers” to bootstrap."
        onEdit={(u) => {
          setEdit(u);
          setF({
            full_name: String(u.full_name ?? ''),
            role: String(u.role ?? 'athlete'),
            member_tier: String(u.member_tier ?? ''),
            coach_name: String(u.coach_name ?? ''),
            coach_role: String(u.coach_role ?? ''),
            current_weight: String(u.current_weight ?? ''),
            start_weight: String(u.start_weight ?? ''),
            goal_weight: String(u.goal_weight ?? ''),
          });
        }}
        cols={[
          { key: 'full_name', label: 'Name', render: (r) => <span className="font-medium text-white">{r.full_name}</span> },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (r) => <span className={`text-[11px] font-mono uppercase ${r.role === 'athlete' ? 'text-zinc-400' : 'text-orange-400'}`}>{r.role}</span> },
          { key: 'member_tier', label: 'Tier' },
          { key: 'current_weight', label: 'KG' },
          { key: 'since', label: 'Since', render: (r) => <span className="text-zinc-500">{ShortDate(r.since as string)}</span> },
        ]}
      />
      {edit && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`${card} w-full max-w-md max-h-[85vh] overflow-y-auto`}>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Edit customer — {edit.email}</p>
            <label className="text-[11px] text-zinc-500 uppercase">Name</label>
            <input className={inp} value={f.full_name ?? ''} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
            <label className="text-[11px] text-zinc-500 uppercase mt-2">Role</label>
            <select className={inp} value={f.role ?? 'athlete'} onChange={(e) => setF({ ...f, role: e.target.value })}>
              <option value="athlete">athlete</option>
              <option value="coach">coach</option>
              <option value="admin">admin</option>
            </select>
            <label className="text-[11px] text-zinc-500 uppercase mt-2">Member tier</label>
            <input className={inp} value={f.member_tier ?? ''} onChange={(e) => setF({ ...f, member_tier: e.target.value })} />
            <label className="text-[11px] text-zinc-500 uppercase mt-2">Coach name / role</label>
            <input className={inp} value={f.coach_name ?? ''} onChange={(e) => setF({ ...f, coach_name: e.target.value })} />
            <input className={`${inp} mt-1`} value={f.coach_role ?? ''} onChange={(e) => setF({ ...f, coach_role: e.target.value })} />
            <label className="text-[11px] text-zinc-500 uppercase mt-2">Weights (current / start / goal)</label>
            <div className="flex gap-2">
              <input className={inp} placeholder="current" value={f.current_weight ?? ''} onChange={(e) => setF({ ...f, current_weight: e.target.value })} />
              <input className={inp} placeholder="start" value={f.start_weight ?? ''} onChange={(e) => setF({ ...f, start_weight: e.target.value })} />
              <input className={inp} placeholder="goal" value={f.goal_weight ?? ''} onChange={(e) => setF({ ...f, goal_weight: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-4">
              <button disabled={busy} onClick={saveEdit} className={btn}>
                Save
              </button>
              <button onClick={() => setEdit(null)} className={btnGhost}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}