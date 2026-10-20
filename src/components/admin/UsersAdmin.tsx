// UsersAdmin — customers and coaches backed by Neon Auth and the shared profiles table.
import { useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

export function UsersAdmin() {
  const [users, setUsers] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [f, setF] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    if (!neon) {
      setMsg('Neon is not configured; user records cannot be loaded.');
      setUsers([]);
      return;
    }
    try {
      const { data, error } = await neon.from('profiles').select('*').order('created_at');
      if (error) {
        setMsg(`Could not load users: ${error.message}`);
        return;
      }
      setUsers((data ?? []) as Row[]);
      setMsg('');
    } catch (error) {
      setMsg(`Could not load users: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const saveEdit = async () => {
    if (!edit) return;
    if (!neon) {
      setMsg('Neon is not configured; profile changes cannot be saved.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const numericFields = ['current_weight', 'start_weight', 'goal_weight'];
      const payload: Record<string, unknown> = { ...f };
      for (const field of numericFields) {
        const value = f[field]?.trim();
        if (!value) payload[field] = null;
        else if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 999) {
          setMsg(`${field.replaceAll('_', ' ')} must be a valid weight between 0 and 999 kg.`);
          return;
        } else payload[field] = Number(value);
      }
      if (!String(f.full_name ?? '').trim()) {
        setMsg('Client name cannot be blank.');
        return;
      }
      payload.full_name = String(f.full_name).trim();
      const result = await neon.from('profiles').update(payload).eq('id', edit.id).select('id');
      if (result.error) {
        setMsg(`Save failed: ${result.error.message}`);
        return;
      }
      if (!result.data?.length) {
        setMsg('Nothing was saved. This profile may no longer exist or your staff permissions may not allow this change.');
        return;
      }
      setMsg('Client profile saved.');
      setEdit(null);
      await load();
    } catch (error) {
      setMsg(`Save failed: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    } finally {
      setBusy(false);
    }
  };



  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={() => setAddOpen(!addOpen)} className={btnGhost}>
          Account management
        </button>
        <button onClick={() => void load()} className={btnGhost}>
          Refresh
        </button>
        {msg && <span className="text-xs text-zinc-400">{msg}</span>}
      </div>

      {addOpen && (
        <div className={`${card} mb-4`}>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Customer accounts are app-managed</p>
          <p className="text-sm text-zinc-300">
            Customer sign-in belongs in the MW Fitness mobile app. This Staff HQ panel manages coaching profiles only and must not create credentials in the browser. Account creation and removal require an authorized server-side Neon Auth account-management service.
          </p>
        </div>
      )}

      <AdminTable
        rows={users ?? []}
        empty="No customers yet — create the first account in Neon Auth, then refresh."
        onEdit={(u) => {
          setEdit(u);
          setF({
            full_name: String(u.full_name ?? ''),
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
            <label className="text-[11px] text-zinc-500 uppercase mt-2">Account role</label>
            <p className="mt-1 rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-sm text-zinc-400">{String(edit.role ?? 'athlete')} · managed by the app administrator</p>
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