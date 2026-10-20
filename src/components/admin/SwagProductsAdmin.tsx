import { useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, btn, btnGhost, card, inp } from './fields';

const blank = { slug: '', name: '', description: '', category: 'apparel', price: '0', compare_at_price: '', image_url: '', product_url: '', sizes: '', stock_status: 'available', active: false, sort_order: '100' };

export function SwagProductsAdmin({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Record<string, string | boolean>>(blank);
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    if (!neon) { setError('Neon is not configured. No product data was loaded.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const { data, error: queryError } = await neon.from('swag_products').select('*').order('sort_order').order('name');
      if (queryError) throw queryError;
      setProducts((data || []) as Row[]);
    } catch (e) {
      setProducts([]);
      setError(e instanceof Error ? 'Could not load swag products: ' + e.message : 'Could not load swag products. Apply the prepared swag-products migration after review, then retry.');
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const startNew = () => { setEditing(null); setDraft({ ...blank }); setError(''); setNotice(''); };
  const startEdit = (row: Row) => {
    setEditing(row);
    setDraft({
      slug: String(row.slug || ''), name: String(row.name || ''), description: String(row.description || ''),
      category: String(row.category || 'apparel'), price: String(row.price ?? 0),
      compare_at_price: row.compare_at_price == null ? '' : String(row.compare_at_price),
      image_url: String(row.image_url || ''), product_url: String(row.product_url || ''),
      sizes: Array.isArray(row.sizes) ? row.sizes.join(', ') : '',
      stock_status: String(row.stock_status || 'available'), active: Boolean(row.active),
      sort_order: String(row.sort_order ?? 100),
    });
    setError(''); setNotice('');
  };
  const set = (key: string, value: string | boolean) => setDraft((old) => ({ ...old, [key]: value }));
  const save = async () => {
    if (!neon) { setError('Neon is not configured. Nothing was saved.'); return; }
    const slug = String(draft.slug || '').trim().toLowerCase();
    const name = String(draft.name || '').trim();
    const price = Number(draft.price);
    const compare = String(draft.compare_at_price || '').trim() ? Number(draft.compare_at_price) : null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) { setError('Use a simple URL slug such as classic-t-shirt.'); return; }
    if (!name) { setError('Product name is required.'); return; }
    if (!Number.isFinite(price) || price < 0 || (compare !== null && (!Number.isFinite(compare) || compare < 0))) { setError('Enter valid non-negative product prices.'); return; }
    for (const key of ['image_url', 'product_url']) {
      const value = String(draft[key] || '').trim();
      if (value && !/^https?:\/\/\S+$/i.test(value)) { setError(key === 'image_url' ? 'Image URL must begin with https:// or http://' : 'Product URL must begin with https:// or http://'); return; }
    }
    setBusy(true); setError(''); setNotice('');
    const payload = {
      slug, name, description: String(draft.description || '').trim(), category: String(draft.category || 'apparel'),
      price, compare_at_price: compare, image_url: String(draft.image_url || '').trim(),
      product_url: String(draft.product_url || '').trim(), sizes: String(draft.sizes || '').split(',').map((s) => s.trim()).filter(Boolean),
      stock_status: String(draft.stock_status || 'available'), active: Boolean(draft.active),
      sort_order: Number.parseInt(String(draft.sort_order || '100'), 10) || 100, updated_at: new Date().toISOString(),
    };
    try {
      const result = editing
        ? await neon.from('swag_products').update(payload).eq('id', editing.id).select('id')
        : await neon.from('swag_products').insert(payload).select('id');
      if (result.error) throw result.error;
      if (!result.data?.length) throw new Error('No row was saved. Check staff permissions and the product schema.');
      setNotice('Product saved to Neon. Public visibility is ' + (payload.active ? 'enabled' : 'disabled') + '.');
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? 'Save failed: ' + e.message : 'Product could not be saved. Your draft remains available.');
    } finally { setBusy(false); }
  };
  const toggle = async (row: Row) => {
    if (!neon) { setError('Neon is not configured.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await neon.from('swag_products').update({ active: !row.active, updated_at: new Date().toISOString() }).eq('id', row.id).select('id');
      if (result.error) throw result.error;
      if (!result.data?.length) throw new Error('Visibility was not changed; check staff permissions.');
      setNotice(String(row.name) + ' is now ' + (!row.active ? 'visible' : 'hidden') + ' on the swag page.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not change product visibility.'); }
    finally { setBusy(false); }
  };
  const remove = async (row: Row) => {
    if (!neon || !window.confirm('Permanently delete ' + String(row.name) + '?')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await neon.from('swag_products').delete().eq('id', row.id).select('id');
      if (result.error) throw result.error;
      if (!result.data?.length) throw new Error('Product was not deleted; check staff permissions.');
      setNotice('Product deleted.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Product could not be deleted.'); }
    finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <div className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-mono text-[10px] uppercase tracking-widest text-orange-300">Staff HQ · catalogue</p><h3 className="mt-1 text-xl font-semibold text-white">Swag products</h3><p className="mt-1 text-xs text-zinc-400">Manage the products displayed on the public SHWAG page. Product edits save to Neon.</p></div>
        <div className="flex gap-2"><button type="button" onClick={onBack} className={btnGhost}>Back to plans</button><button type="button" onClick={startNew} className={btn}>+ Add product</button></div>
      </div>
    </div>
    {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</p> : null}
    {notice ? <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-300">{notice}</p> : null}
    {loading ? <div className={card}>Loading products…</div> : <AdminTable rows={products.map((p) => ({ ...p, price_display: '£' + Number(p.price || 0).toFixed(2), visibility: p.active ? 'Visible' : 'Hidden', stock: String(p.stock_status || 'available').replace('_', ' ') }))} empty="No products yet. Add your first swag item after the prepared migration is applied." onEdit={startEdit} onDelete={remove} cols={[
      { key: 'name', label: 'Product' }, { key: 'price_display', label: 'Price' }, { key: 'category', label: 'Category' },
      { key: 'stock', label: 'Stock' }, { key: 'visibility', label: 'Website', render: (row) => <button type="button" disabled={busy} className={btnGhost} onClick={() => void toggle(row)}>{row.active ? 'Visible · hide' : 'Hidden · show'}</button> },
    ]} />}
    {editing !== null || String(draft.slug || '') !== '' || String(draft.name || '') !== '' ? <div className={card}>
      <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold text-white">{editing ? 'Edit product' : 'New product'}</h3><button type="button" className={btnGhost} onClick={() => { setEditing(null); setDraft({ ...blank }); }}>Cancel</button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs text-zinc-400">Name<input className={inp} value={String(draft.name || '')} onChange={(e) => set('name', e.target.value)} /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">URL slug<input className={inp} value={String(draft.slug || '')} onChange={(e) => set('slug', e.target.value)} placeholder="classic-t-shirt" /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">Price (£)<input type="number" min="0" step="0.01" className={inp} value={String(draft.price ?? '0')} onChange={(e) => set('price', e.target.value)} /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">Compare-at price (£, optional)<input type="number" min="0" step="0.01" className={inp} value={String(draft.compare_at_price || '')} onChange={(e) => set('compare_at_price', e.target.value)} /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">Category<select className={inp} value={String(draft.category || 'apparel')} onChange={(e) => set('category', e.target.value)}>{['apparel','accessories','equipment','other'].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">Availability<select className={inp} value={String(draft.stock_status || 'available')} onChange={(e) => set('stock_status', e.target.value)}>{[['available','Available'],['limited','Limited stock'],['sold_out','Sold out'],['preorder','Pre-order']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Description<textarea className={inp} rows={3} value={String(draft.description || '')} onChange={(e) => set('description', e.target.value)} /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Image URL<input className={inp} value={String(draft.image_url || '')} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Product / order URL (optional)<input className={inp} value={String(draft.product_url || '')} onChange={(e) => set('product_url', e.target.value)} placeholder="https://…" /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">Sizes / variants (comma-separated)<input className={inp} value={String(draft.sizes || '')} onChange={(e) => set('sizes', e.target.value)} placeholder="S, M, L, XL" /></label>
        <label className="grid gap-1.5 text-xs text-zinc-400">Sort order<input type="number" className={inp} value={String(draft.sort_order || '100')} onChange={(e) => set('sort_order', e.target.value)} /></label>
        <label className="flex items-center gap-2 text-xs text-zinc-300 sm:col-span-2"><input type="checkbox" checked={Boolean(draft.active)} onChange={(e) => set('active', e.target.checked)} className="accent-orange-500" /> Publish on the public swag page</label>
      </div>
      <div className="mt-4 flex gap-2"><button type="button" disabled={busy} onClick={() => void save()} className={btn}>{busy ? 'Saving…' : 'Save product'}</button><button type="button" disabled={busy} onClick={() => { setEditing(null); setDraft({ ...blank }); }} className={btnGhost}>Discard</button></div>
    </div> : null}
  </div>;
}
