// NutritionAdmin — global meal templates + per-customer nutrition plans.
import { useEffect, useRef, useState } from 'react';
import { adminDb } from '../../lib/admin/adminDb';
import { AdminTable, Row, StatusPill, btn, btnGhost, card, inp } from './fields';
import { MealSectionsEditor } from './MealSectionsEditor';

export function NutritionAdmin() {
  const db = adminDb();
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
  const planLoadRequest = useRef(0);

  const schema = () => (mode === 'templates' ? 'nutrition_templates' : 'nutrition_plans') as 'nutrition_templates' | 'nutrition_plans';

  const loadTemplates = async () => {
    if (!db) { setMsg('Neon is not configured; meal templates cannot be loaded.'); setRows([]); return; }
    try {
      const { data, error } = await db.from('nutrition_templates').select('*').order('name');
      if (error) { setMsg(`Could not load meal templates: ${error.message}`); setRows([]); return; }
      const next = (data ?? []) as Row[];
      setTemplates(next);
      if (mode === 'templates') setRows(next);
    } catch {
      setMsg('Could not reach meal templates. Check the connection and retry.');
      setRows([]);
    }
  };
  const loadPlans = async () => {
    const requestId = ++planLoadRequest.current;
    if (!userId) {
      setRows([]);
      return;
    }
    if (!db) { setMsg('Neon is not configured; client nutrition plans cannot be loaded.'); setRows([]); return; }
    // Clear the previous customer's data immediately while the new query runs.
    setRows([]);
    try {
      const { data, error } = await db.from('nutrition_plans').select('*').eq('profile_id', userId).order('created_at', { ascending: false });
      if (requestId !== planLoadRequest.current) return;
      if (error) { setMsg(`Could not load this client's nutrition plans: ${error.message}`); setRows([]); return; }
      setRows((data ?? []) as Row[]);
    } catch {
      if (requestId !== planLoadRequest.current) return;
      setMsg('Could not reach this client’s nutrition plans. Check the connection and retry.');
      setRows([]);
    }
  };
  useEffect(() => {
    if (!db) { setMsg('Neon is not configured; clients cannot be loaded.'); return; }
    void db.from('profiles').select('id,full_name,email').order('full_name').then((r) => {
      if (!r.error) setUsers((r.data ?? []) as Row[]);
      else setMsg(`Could not load clients: ${r.error.message}`);
    }, () => setMsg('Could not reach the client service. Check the connection and retry.'));
  }, []);

  useEffect(() => {
    if (mode === 'templates') {
      // Invalidate any client-plan request still in flight after changing tabs.
      planLoadRequest.current += 1;
      void loadTemplates();
    } else {
      void loadPlans();
    }
  }, [mode, userId]);

  const saveRow = async () => {
    if (!db) { setMsg('Neon is not configured; no changes were saved.'); return; }
    setBusy(true);
    setMsg('');
    let targets: Record<string, unknown> = {};
    let sections: unknown[] = [];
    try {
      const parsedTargets: unknown = JSON.parse(f.targets || '{}');
      const parsedSections: unknown = JSON.parse(f.sections || '[]');
      if (!parsedTargets || typeof parsedTargets !== 'object' || Array.isArray(parsedTargets) || !Array.isArray(parsedSections)) {
        throw new Error('Targets must be a JSON object and meal sections must be a JSON array.');
      }
      targets = { ...(parsedTargets as Record<string, unknown>) };
      sections = parsedSections;
      // Guided fields override only the standard nutrition targets. Any other
      // metadata already stored in targets is preserved when saving.
      for (const key of ['calories', 'protein', 'carbs', 'fats', 'water_ml']) {
        const raw = f[key]?.trim() ?? '';
        if (!raw) {
          delete targets[key];
          continue;
        }
        const number = Number(raw);
        if (!Number.isFinite(number) || number < 0) throw new Error('Nutrition targets must be non-negative numbers.');
        targets[key] = number;
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
    const body: Record<string, unknown> = { name: f.name.trim(), description: f.description?.trim() || null, targets, sections, active: f.active === 'true', day_type: f.day_type === 'non_training' ? 'non_training' : 'training' };
    if (mode === 'plans') body.profile_id = userId;
    try {
      const result = edit && edit.id
        ? await db.from(schema()).update(body).eq('id', edit.id).select('id')
        : await db.from(schema()).insert(body).select('id');
      if (result.error) {
        setMsg(`Failed: ${result.error.message}`);
      } else if (!result.data?.length) {
        setMsg('Nothing was saved. The record may no longer exist or your staff permissions may not allow this change.');
      } else {
        setMsg('Saved ✓');
        setEdit(null);
        if (mode === 'templates') await loadTemplates(); else await loadPlans();
      }
    } catch {
      setMsg('Could not save this nutrition item. Check the connection and try again.');
    } finally { setBusy(false); }
  };

  const removeRow = async (row: Row) => {
    if (!db) { setMsg('Neon is not configured; no changes were made.'); return; }
    setBusy(true); setMsg('');
    try {
      const result = await db.from(schema()).delete().eq('id', row.id).select('id');
      if (result.error) {
        setMsg(`Delete failed: ${result.error.message}`);
        return;
      }
      if (!result.data?.length) {
        setMsg('The nutrition item was not deleted. It may already be gone or your staff permissions may not allow this change.');
        return;
      }
      setMsg('Deleted.');
      if (mode === 'templates') await loadTemplates(); else await loadPlans();
    } catch { setMsg('Could not delete this nutrition item. Check the connection and try again.'); }
    finally { setBusy(false); }
  };

  const assignTemplate = async () => {
    if (!db) { setMsg('Neon is not configured; no assignment was created.'); return; }
    if (!userId || !assignTpl) { setMsg('Choose a client and a meal template first.'); return; }
    setBusy(true); setMsg('');
    try {
    const { data: t, error: tErr } = await db.from('nutrition_templates').select('*').eq('id', assignTpl).maybeSingle();
    if (tErr || !t) {
      setMsg(tErr ? `Could not load meal template: ${tErr.message}` : 'Template not found.');
      return;
    }
    const { data: assignedRows, error } = await db.from('nutrition_plans').insert({
      profile_id: userId,
      name: String(t.name),
      targets: t.targets,
      sections: t.sections,
      day_type: t.day_type ?? 'training',
      active: true,
    }).select('id');
    if (error) { setMsg(`Failed: ${error.message}`); return; }
    if (!assignedRows?.length) { setMsg('The nutrition template was not assigned. Check staff permissions and retry.'); return; }
    setMsg(`Assigned “${t.name}” ✓`);
    await loadPlans();
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
        <div className="mb-4 grid grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_auto]">
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
            day_type: String(r.day_type ?? 'training'),
          });
        }}
        cols={[
          { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { key: 'day_type', label: 'Day type', render: (r) => <span className="text-zinc-400 text-xs">{r.day_type === 'non_training' ? 'Non-training' : 'Training'}</span> },
          { key: 'targets', label: 'Targets', render: (r) => <span className="text-zinc-400 font-mono text-[11px]">{(r.targets as Row)?.calories ?? 0} kcal · {(r.targets as Row)?.protein ?? 0}g P</span> },
          { key: 'active', label: 'Active', render: (r) => StatusPill(r.active ? 'active' : 'canceled') },
          { key: 'del', label: '', render: (r) => <button disabled={busy} className={btnGhost} onClick={() => void removeRow(r)}>Delete</button> },
        ]}
      />
      <button
        onClick={() => {
          setEdit({ id: '', active: true } as Row);
          setF({ name: '', description: '', targets: '{"calories":2000,"protein":150,"carbs":200,"fats":60,"water_ml":3500}', calories: '2000', protein: '150', carbs: '200', fats: '60', water_ml: '3500', sections: '[]', active: 'true', day_type: 'training' });
        }}
        className={btn}
      >
        + New {mode === 'templates' ? 'template' : 'plan'}
      </button>
      {edit && (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className={`${card} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">
            {mode === 'templates' ? 'Meal template' : 'Nutrition plan'}{f.name ? ` — ${f.name}` : ''}
          </p>
          <input className={inp} placeholder="name" value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={`${inp} mt-2`} placeholder="description" value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <select className={`${inp} mt-2`} value={f.day_type ?? 'training'} onChange={(e) => setF({ ...f, day_type: e.target.value })} aria-label="Plan day type">
            <option value="training">Training day</option>
            <option value="non_training">Non-training day</option>
          </select>
          <p className="mb-1 mt-3 text-[11px] uppercase text-zinc-500">Daily targets</p>
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
                <input type="number" min="0" step="1" className={inp + ' mt-1'} value={f[key] ?? ''} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
              </label>
            ))}
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-zinc-500">Advanced target metadata (JSON)</summary>
            <textarea className={inp + ' mt-2 min-h-24 font-mono text-xs'} aria-label="Advanced nutrition target metadata" value={f.targets ?? '{}'} onChange={(e) => setF({ ...f, targets: e.target.value })} />
            <p className="mt-1 text-[10px] text-zinc-500">Unknown target fields are preserved when the guided fields are saved.</p>
          </details>
          <p className="mb-1 mt-4 text-[11px] uppercase text-zinc-500">Meal plan</p>
          <MealSectionsEditor value={f.sections ?? '[]'} onChange={(value) => setF({ ...f, sections: value })} />
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