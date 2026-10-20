// PlansAdmin — products (PT blocks + online coaching), same catalogue as the site.
import { useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Fmt, Row, StatusPill, btn, btnGhost, card, inp } from './fields';
import { SwagProductsAdmin } from './SwagProductsAdmin';

const KINDS = ['pt', 'online'];

export function PlansAdmin() {
  const [plans, setPlans] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [f, setF] = useState<Record<string, string>>({ active: 'true' });
  const [showSwag, setShowSwag] = useState(false);

  const load = async () => {
    if (!neon) { setMsg('Neon is not configured; live pricing cannot be loaded.'); setPlans([]); return; }
    try {
      const { data, error } = await neon.from('plans').select('*').order('price');
      if (error) { setMsg(`Could not load packages and pricing: ${error.message}`); return; }
      setPlans((data ?? []) as Row[]);
    } catch {
      setMsg('Could not reach packages and pricing. Check the connection and retry.');
      setPlans([]);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  if (showSwag) return <SwagProductsAdmin onBack={() => setShowSwag(false)} />;

  const blank = () => {
    setEdit({ id: '', active: true } as Row);
    setF({ id: '', name: '', price: '', original_price: '', badge: '', kind: 'pt', cta_text: '', features: '', active: 'true' });
  };

  const save = async () => {
    if (!neon) { setMsg('Neon is not configured; no changes were saved.'); return; }
    const price = Number(f.price);
    const originalPrice = f.original_price ? Number(f.original_price) : null;
    if (!f.id?.trim() || !/^[a-z0-9][a-z0-9-]*$/.test(f.id.trim())) { setMsg('Plan ID must use lowercase letters, numbers and hyphens.'); return; }
    if (!f.name?.trim()) { setMsg('Enter a package name.'); return; }
    if (!f.price.trim() || !Number.isFinite(price) || price < 0) { setMsg('Enter a valid non-negative price.'); return; }
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) { setMsg('Original price must be a valid non-negative amount.'); return; }
    setBusy(true);
    setMsg('');
    const body: Record<string, unknown> = {
      id: f.id.trim(),
      name: f.name.trim(),
      tag: f.tag?.trim() || null,
      price,
      original_price: originalPrice,
      badge: f.badge ?? null,
      is_popular: f.is_popular === 'true',
      description: f.description ?? '',
      cta_text: f.cta_text ?? '',
      kind: f.kind ?? 'pt',
      active: f.active === 'true',
    };
    body.features = (f.features ?? '')
      .split('\n')
      .map((feature) => feature.trim())
      .filter(Boolean);
    try {
      const result = edit?.id ? await neon.from('plans').update(body).eq('id', edit.id).select('id') : await neon.from('plans').insert(body).select('id');
      if (result.error) {
        setMsg(`Save failed: ${result.error.message}`);
      } else if (!result.data?.length) {
        setMsg('Nothing was saved. The package may no longer exist or your staff permissions may not allow this change.');
      } else {
        setMsg('Package saved.');
        setEdit(null);
        await load();
      }
    } catch {
      setMsg('Could not save this package. Check the connection and retry.');
    } finally { setBusy(false); }
  };

  const remove = async (p: Row) => {
    if (!neon) { setMsg('Neon is not configured; no changes were made.'); return; }
    if (!window.confirm(`Delete plan “${String(p.name)}”? Plans assigned to memberships may be protected by database constraints; hide the plan instead if it is already in use.`)) return;
    setBusy(true); setMsg('');
    try {
      const { error } = await neon.from('plans').delete().eq('id', p.id);
      setMsg(error ? `Delete failed: ${error.message}` : 'Plan deleted.');
      if (!error) await load();
    } catch {
      setMsg('Could not delete this plan. Check the connection and retry.');
    } finally { setBusy(false); }
  };

  const toggle = async (p: Row) => {
    if (!neon) { setMsg('Neon is not configured; no changes were made.'); return; }
    setBusy(true); setMsg('');
    try {
      const result = await neon.from('plans').update({ active: !p.active }).eq('id', p.id).select('id');
      if (result.error) { setMsg(`Could not update visibility: ${result.error.message}`); return; }
      if (!result.data?.length) { setMsg('Visibility was not changed. The package may no longer exist or your staff permissions may not allow this change.'); return; }
      setMsg(`${String(p.name)} is now ${p.active ? 'hidden' : 'live'}.`);
      await load();
    } catch {
      setMsg('Could not update plan visibility. Check the connection and retry.');
    } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={blank} className={btn}>
          + New plan
        </button>
        <button type="button" onClick={() => setShowSwag(true)} className={btnGhost}>
          Manage swag products
        </button>
        <button onClick={() => void load()} className={btnGhost}>
          Refresh
        </button>
        {msg && <span className="text-xs text-zinc-400">{msg}</span>}
      </div>

      <AdminTable
        rows={plans ?? []}
        empty="No plans yet."
        onDelete={remove}
        onEdit={(p) => {
          setEdit(p);
          setF({
            id: String(p.id),
            name: String(p.name ?? ''),
            tag: String(p.tag ?? ''),
            price: String(p.price ?? ''),
            original_price: String(p.original_price ?? ''),
            badge: String(p.badge ?? ''),
            kind: String(p.kind ?? 'pt'),
            cta_text: String(p.cta_text ?? ''),
            description: String(p.description ?? ''),
            features: Array.isArray(p.features) ? p.features.map(String).join('\n') : '',
            is_popular: p.is_popular ? 'true' : 'false',
            active: p.active ? 'true' : 'false',
          });
        }}
        cols={[
          { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-orange-300">{r.id}</span> },
          { key: 'name', label: 'Name' },
          { key: 'price', label: 'Price', render: (r) => <span>£{Fmt(Number(r.price))}</span> },
          { key: 'original_price', label: 'Was', render: (r) => (r.original_price ? `£${r.original_price}` : '—') as string },
          { key: 'badge', label: 'Badge' },
          { key: 'kind', label: 'Kind', render: (r) => <span className="text-[11px] font-mono uppercase">{r.kind}</span> },
          {
            key: 'active',
            label: 'Active',
            render: (r) => (
              <button onClick={() => void toggle(r)} className={btnGhost}>
                {r.active ? 'Live' : 'Hidden'}
              </button>
            ),
          },
        ]}
      />
      {edit && (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className={`${card} w-full max-w-2xl max-h-[85vh] overflow-y-auto`}>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">{f.id ? `Edit plan — ${f.id}` : 'New plan'}</p>
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} placeholder="id (e.g. bronze)" value={f.id ?? ''} disabled={Boolean(edit && edit.id)} onChange={(e) => setF({ ...f, id: e.target.value })} />
            <input className={inp} placeholder="name" value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input className={inp} placeholder="price" value={f.price ?? ''} onChange={(e) => setF({ ...f, price: e.target.value })} />
            <input className={inp} placeholder="original price" value={f.original_price ?? ''} onChange={(e) => setF({ ...f, original_price: e.target.value })} />
            <input className={inp} placeholder="badge" value={f.badge ?? ''} onChange={(e) => setF({ ...f, badge: e.target.value })} />
            <select className={inp} value={f.kind ?? 'pt'} onChange={(e) => setF({ ...f, kind: e.target.value })}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <input className={`${inp} mt-2`} placeholder="short tag / subtitle" value={f.tag ?? ''} onChange={(e) => setF({ ...f, tag: e.target.value })} />
          <input className={`${inp} mt-2`} placeholder="description" value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input className={`${inp} mt-2`} placeholder="button text (e.g. Start coaching)" value={f.cta_text ?? ''} onChange={(e) => setF({ ...f, cta_text: e.target.value })} />
          <label className="mt-3 block text-xs text-zinc-400">
            Package features (one per line)
            <textarea
              className={inp + ' mt-1 min-h-28'}
              aria-label="Package features, one per line"
              placeholder={'4 coaching sessions\nPersonalised plan\nProgress tracking'}
              value={f.features ?? ''}
              onChange={(e) => setF({ ...f, features: e.target.value })}
            />
            <span className="mt-1 block text-[10px] text-zinc-500">Each non-empty line becomes one feature on the public package card.</span>
          </label>
          <div className="flex items-center gap-2 mt-3">
            <label className="text-[11px] text-zinc-500 uppercase">
              <input type="checkbox" checked={f.active === 'true'} onChange={(e) => setF({ ...f, active: e.target.checked ? 'true' : 'false' })} /> Active
            </label>
            <label className="text-[11px] text-zinc-500 uppercase ml-3">
              <input type="checkbox" checked={f.is_popular === 'true'} onChange={(e) => setF({ ...f, is_popular: e.target.checked ? 'true' : 'false' })} /> Popular
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button disabled={busy} onClick={save} className={btn}>
              Save plan
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