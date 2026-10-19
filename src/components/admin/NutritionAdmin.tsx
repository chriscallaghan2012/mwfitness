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
    if (!supabase) { setMsg('Neon is not configured; meal templates cannot be loaded.'); setRows([]); return; }
    try {
      const { data, error } = await supabase.from('nutrition_templates').select('*').order('name');
      if (error) { setMsg(`Could not load meal templates: ${error.message}`); return; }
      const next = (data ?? []) as Row[];
      setTemplates(next);
      if (mode === 'templates') setRows(next);
    } catch {
      setMsg('Could not reach meal templates. Check the connection and retry.');
      setRows([]);
    }
  };
  const loadPlans = async () => {
    if (!userId) {
      setRows([]);
      return;
    }
    if (!supabase) { setMsg('Neon is not configured; client nutrition plans cannot be loaded.'); setRows([]); return; }
    try {
      const { data, error } = await supabase.from('nutrition_plans').select('*').eq('profile_id', userId).order('created_at', { ascending: false });
      if (error) { setMsg(`Could not load this client's nutrition plans: ${error.message}`); setRows([]); return; }
      setRows((data ?? []) as Row[]);
    } catch {
      setMsg('Could not reach this client’s nutrition plans. Check the connection and retry.');
      setRows([]);
    }
  };
  useEffect(() => {
    void loadTemplates();
    if (!supabase) { setMsg('Neon is not configured; clients cannot be loaded.'); return; }
    void supabase.from('profiles').select('id,full_name,email').order('full_name').then((r) => {
      if (!r.error) setUsers((r.data ?? []) as Row[]);
      else setMsg(`Could not load clients: ${r.error.message}`);
    }).catch(() => setMsg('Could not reach the client service. Check the connection and retry.'));
  }, []);

  useEffect(() => {
    if (mode === 'templates') void loadTemplates();
    else void loadPlans();
  }, [mode, userId]);

  const saveRow = async () => {
    if (!supabase) { setMsg('Neon is not configured; no changes were saved.'); return; }
    setBusy(true);
    setMsg('');
    let targets: Record<string, unknown> = {};
    let sections: unknown[] = [];
    try {
      const parsedTargets: unknown = JSON.parse(f.targets || '{}');
      const parsedSections: unknown = JSON.parse(f.sections || '[]');
      if (!parsedTargets || typeof parsedTargets !== 'object' || Array.isArray(parsedTargets) || !Array.isArray(parsedSections)) {
        throw new Error('Invalid nutrition data shape.');
      }
      targets = { ...(parsedTargets as Record<string, unknown>) };
      sections = parsedSections;
      for (const key of ['calories', 'protein', 'carbs', 'fats', 'water_ml']) {
        const raw = f[key]?.trim() ?? '';
        if (!raw) {
          delete targets[key];
          continue;
        }
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0) throw new Error('Nutrition targets must be non-negative numbers.');
        targets[key] = value;
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Nutrition targets and meal sections are invalid.');
      setBusy(false);
      return;
    }
    if (!f.name?.trim()) {
      setMsg('Enter a name for this nutrition item.');
      setBusy(false);
      return;
    }
    if (mode === 'plans' && !userId) {
      setMsg('Choose a client before saving a client nutrition plan.');
      setBusy(false);
      return;
    }
    if (!targets || typeof targets !== 'object' || Array.isArray(targets) || !Array.isArray(sections)) {
      setMsg('Targets must be a JSON object and sections must be a JSON array.');
      setBusy(false);
      return;
    }
    const body: Record<string, unknown> = { name: f.name.trim(), description: f.description?.trim() || null, targets, sections, active: f.active === 'true' };
    if (mode === 'plans') body.profile_id = userId;
    try {
      const { error } = edit && edit.id
        ? await supabase.from(schema()).update(body).eq('id', edit.id)
        : await supabase.from(schema()).insert(body);
      setMsg(error ? `Failed: ${error.message}` : 'Saved ✓');
      if (!error) { setEdit(null); if (mode === 'templates') await loadTemplates(); else await loadPlans(); }
    } catch {
      setMsg('Could not save this nutrition item. Check the connection and try again.');
    } finally { setBusy(false); }
  };

  const removeRow = async (row: Row) => {
    if (!supabase) { setMsg('Neon is not configured; no changes were made.'); return; }
    if (!window.confirm(`Delete “${String(row.name)}”? This cannot be undone.`)) return;
    setBusy(true); setMsg('');
    try {
      const { error } = await supabase.from(schema()).delete().eq('id', row.id);
      setMsg(error ? `Delete failed: ${error.message}` : 'Deleted.');
      if (!error) { if (mode === 'templates') await loadTemplates(); else await loadPlans(); }
    } catch { setMsg('Could not delete this nutrition item. Check the connection and try again.'); }
    finally { setBusy(false); }
  };

  const assignTemplate = async () => {
    if (!supabase) { setMsg('Neon is not configured; no assignment was created.'); return; }
    if (!userId || !assignTpl) { setMsg('Choose a client and a meal template first.'); return; }
    setBusy(true); setMsg('');
    try {
    const { data: t, error: tErr } = await supabase.from('nutrition_templates').select('*').eq('id', assignTpl).maybeSingle();
    if (tErr || !t) {
      setMsg(tErr ? `Could not load meal template: ${tErr.message}` : 'Template not found.');
      return;
    }
    const { error } = await supabase.from('nutrition_plans').insert({
      profile_id: userId,
      name: String(t.name),
      targets: t.targets,
      sections: t.sections,
      active: true,
    });
    setMsg(error ? `Failed: ${error.message}` : `Assigned “${t.name}” ✓`);
    if (!error) await loadPlans();
    } catch { setMsg('Could not assign this template. Check the connection and try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['templates', 'plans'] as const).map((m) => (
          <button key={m} onClick={() => { setEdit(null); setMode(m); }} className={m === mode ? btn : btnGhost}>
            {m === 'templates' ? 'Meal templates' : 'Client plans'}
          </button>
        ))}
      </div>
      {msg && <p className="text-xs text-zinc-400 mb-2">{msg}</p>}
      {mode === 'plans' && (
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <select className={inp} value={userId} onChange={(e) => { setEdit(null); setUserId(e.target.value); }}>
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
            targets: JSON.stringify(r.targets ?? {}),
            calories: String((r.targets as Row)?.calories ?? ''),
            protein: String((r.targets as Row)?.protein ?? ''),
            carbs: String((r.targets as Row)?.carbs ?? ''),
            fats: String((r.targets as Row)?.fats ?? ''),
            water_ml: String((r.targets as Row)?.water_ml ?? ''),
            sections: JSON.stringify(r.sections ?? [], null, 1),
            active: r.active ? 'true' : 'false',
          });
        }}
        cols={[
          { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { key: 'targets', label: 'Targets', render: (r) => <span className="text-zinc-400 font-mono text-[11px]">{(r.targets as Row)?.calories ?? 0} kcal · {(r.targets as Row)?.protein ?? 0}g P</span> },
          { key: 'active', label: 'Active', render: (r) => StatusPill(r.active ? 'active' : 'canceled') },
          { key: 'del', label: '', render: (r) => <button disabled={busy} className={btnGhost} onClick={() => void removeRow(r)}>Delete</button> },
        ]}
      />
      <button
        onClick={() => {
          setEdit({ id: '', active: true } as Row);
          setF({ name: '', description: '', targets: '{"calories":2000,"protein":150,"carbs":200,"fats":60,"water_ml":3500}', calories: '2000', protein: '150', carbs: '200', fats: '60', water_ml: '3500', sections: '[]', active: 'true' });
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
          <p className="text-[11px] text-zinc-500 uppercase mt-3 mb-1">Daily targets</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['calories', 'Calories (kcal)'],
              ['protein', 'Protein (g)'],
              ['carbs', 'Carbs (g)'],
              ['fats', 'Fats (g)'],
              ['water_ml', 'Water (ml)'],
            ] as const).map(([key, label]) => (
              <label key={key} className="text-xs text-zinc-400">
                {label}
                <input className={`${inp} mt-1`} type="number" min="0" step="1" value={f[key] ?? ''} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
              </label>
            ))}
          </div>
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