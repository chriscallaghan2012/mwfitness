// NutritionAdmin — global meal templates + per-customer nutrition plans.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, StatusPill, btn, btnGhost, card, inp } from './fields';

export function NutritionAdmin() {
  const [mode, setMode] = useState<'templates' | 'plans'>('templates');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [templates, setTemplates] = useState<Row[]>([]);
  const [userId, setUserId] = useState('');
  const [assignTpl, setAssignTpl] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [f, setF] = useState<Record<string, string>>({});

  const schema = () => (mode === 'templates' ? 'nutrition_templates' : 'nutrition_plans') as 'nutrition_templates' | 'nutrition_plans';

  const loadTemplates = async () => {
    const { data, error } = await supabase!.from('nutrition_templates').select('*').order('name');
    if (!error && data) setTemplates(data as Row[]);
  };
  const loadPlans = async () => {
    if (!userId) {
      setRows([]);
      return;
    }
    const { data, error } = await supabase!.from('nutrition_plans').select('*').eq('profile_id', userId);
    if (!error && data) setRows(data as Row[]);
  };
  useEffect(() => {
    void loadTemplates();
    void supabase!.from('profiles').select('id,full_name,email').order('full_name').then((r) => {
      if (!r.error) setUsers(r.data as Row[]);
    });
  }, []);

  const saveRow = async () => {
    setBusy(true);
    setMsg('');
    let targets: Record<string, unknown> = {};
    let sections: unknown[] = [];
    try {
      targets = JSON.parse(f.targets || '{}');
      sections = JSON.parse(f.sections || '[]');
    } catch {
      setMsg('Targets / sections must be valid JSON.');
      setBusy(false);
      return;
    }
    const body: Record<string, unknown> = { name: f.name, description: f.description ?? null, targets, sections, active: f.active === 'true' };
    if (mode === 'plans') body.profile_id = userId;
    const { error } = edit && edit.id
      ? await supabase!.from(schema()).update(body).eq('id', edit.id)
      : await supabase!.from(schema()).insert(body);
    setMsg(error ? `Failed: ${error.message}` : 'Saved ✓');
    setBusy(false);
    setEdit(null);
    mode === 'templates' ? await loadTemplates() : await loadPlans();
  };

  const removeRow = async (id: string) => {
    await supabase!.from(schema()).delete().eq('id', id);
    mode === 'templates' ? await loadTemplates() : await loadPlans();
  };

  const assignTemplate = async () => {
    if (!userId || !assignTpl) return;
    setBusy(true);
    const { data: t, error: tErr } = await supabase!.from('nutrition_templates').select('*').eq('id', assignTpl).maybeSingle();
    if (tErr || !t) {
      setMsg('Template not found.');
      setBusy(false);
      return;
    }
    const { error } = await supabase!.from('nutrition_plans').insert({
      profile_id: userId,
      name: String(t.name),
      targets: t.targets,
      sections: t.sections,
      active: true,
    });
    setMsg(error ? `Failed: ${error.message}` : `Assigned “${t.name}” ✓`);
    setBusy(false);
    await loadPlans();
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['templates', 'plans'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={m === mode ? btn : btnGhost}>
            {m === 'templates' ? 'Meal templates' : 'Client plans'}
          </button>
        ))}
      </div>
      {msg && <p className="text-xs text-zinc-400 mb-2">{msg}</p>}
      {mode === 'plans' && (
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <select className={inp} value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Customer…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
          <select className={inp} value={assignTpl} onChange={(e) => setAssignTpl(e.target.value)}>
            <option value="">Template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button disabled={busy || !userId} onClick={assignTemplate} className={btn}>
            Assign
          </button>
        </div>
      )}
      <AdminTable
        rows={rows ?? []}
        empty={mode === 'templates' ? 'No templates yet — add one.' : 'Pick a customer above.'}
        onEdit={(r) => {
          setEdit(r);
          setF({
            name: String(r.name ?? ''),
            description: String(r.description ?? ''),
            targets: JSON.stringify(r.targets ?? {}, null, 1),
            sections: JSON.stringify(r.sections ?? [], null, 1),
            active: r.active ? 'true' : 'false',
          });
        }}
        cols={[
          { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { key: 'targets', label: 'Targets', render: (r) => <span className="text-zinc-400 font-mono text-[11px]">{(r.targets as Row)?.calories ?? 0} kcal · {(r.targets as Row)?.protein ?? 0}g P</span> },
          { key: 'active', label: 'Active', render: (r) => StatusPill(r.active ? 'active' : 'canceled') },
          { key: 'del', label: '', render: (r) => <button className={btnGhost} onClick={() => void removeRow(String(r.id))}>Delete</button> },
        ]}
      />
      <button
        onClick={() => {
          setEdit({ id: '', active: true } as Row);
          setF({ name: '', description: '', targets: '{"calories":2000,"protein":150,"carbs":200,"fats":60,"water_ml":3500}', sections: '[]', active: 'true' });
        }}
        className={btn}
      >
        + New {mode === 'templates' ? 'template' : 'plan'}
      </button>
      {edit && (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className={`${card} w-full max-w-md max-h-[85vh] overflow-y-auto`}>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">
            {mode === 'templates' ? 'Meal template' : 'Nutrition plan'}{f.name ? ` — ${f.name}` : ''}
          </p>
          <input className={inp} placeholder="name" value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={`${inp} mt-2`} placeholder="description" value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <textarea className={`${inp} mt-2 min-h-16`} placeholder='targets JSON {"calories":2000,"protein":150}' value={f.targets ?? '{}'} onChange={(e) => setF({ ...f, targets: e.target.value })} />
          <textarea className={`${inp} mt-2 min-h-32`} placeholder='sections JSON [{"name":"BREAKFAST","items":[{"name":"…","sub":"…","calories":0,"protein":0}]}]' value={f.sections ?? '[]'} onChange={(e) => setF({ ...f, sections: e.target.value })} />
          <label className="text-[11px] text-zinc-500 uppercase flex items-center gap-2 mt-2">
            <input type="checkbox" checked={f.active === 'true'} onChange={(e) => setF({ ...f, active: e.target.checked ? 'true' : 'false' })} />
            Active
          </label>
          <div className="flex gap-3 mt-4">
            <button disabled={busy} onClick={saveRow} className={btn}>
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