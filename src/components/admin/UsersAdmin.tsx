// UsersAdmin — customers and coaches backed by Neon Auth and the shared profiles table.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

export function UsersAdmin() {
  const [users, setUsers] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [f, setF] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    if (!supabase) { setMsg('Neon is not configured; user records cannot be loaded.'); setUsers([]); return; }
    const { data, error } = await supabase!.from('profiles').select('*').order('created_at');
    if (error) { setMsg(`Could not load users: ${error.message}`); return; }
    setUsers((data ?? []) as Row[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const saveEdit = async () => {
    if (!edit) return;
    setBusy(true);
    setMsg('');
    const numericFields = ['current_weight', 'start_weight', 'goal_weight'];
    const payload: Record<string, unknown> = { ...f };
    for (const field of numericFields) {
      const value = f[field]?.trim();
      if (!value) payload[field] = null;
      else if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 999) {
        setMsg(`${field.replaceAll('_', ' ')} must be a valid weight between 0 and 999 kg.`);
        setBusy(false);
        return;
      } else payload[field] = Number(value);
    }
    if (!String(f.full_name ?? '').trim()) {
      setMsg('Client name cannot be blank.');
      setBusy(false);
      return;
    }
    payload.full_name = String(f.full_name).trim();
    const { error } = await supabase!.from('profiles').update(payload).eq('id', edit.id);
    setMsg(error ? `Save failed: ${error.message}` : 'Client profile saved.');
    setBusy(false);
    if (!error) { setEdit(null); await load(); }
  };

  const addCustomer = async () => {
    if (!email.trim() || newPassword.length < 12) {
      setMsg('Enter an email and a temporary password of at least 12 characters.');
      return;
    }
    setBusy(true);
    setMsg('Creating…');
    const { error } = await supabase!.auth.signUp({
      email: email.trim(),
      password: newPassword,
      options: { data: { full_name: email.trim().split('@')[0] } },
    });
    setMsg(error ? `Failed: ${error.message}` : `Created ${email.trim()}. Share the temporary password securely and ask them to change it when account settings are available.`);
    setBusy(false);
    setAddOpen(false);
    setEmail('');
    setNewPassword('');
    await load();
  };



  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
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
          <input className={`${inp} mt-2`} type="password" placeholder="Temporary password (12+ characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
          <button disabled={busy} onClick={addCustomer} className={`${btn} mt-3`}>
            Create account
          </button>
        </div>
      )}

      <AdminTable
        rows={users ?? []}
        empty="No customers yet — create the first account in Neon Auth, then refresh."
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