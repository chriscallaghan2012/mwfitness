import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminTable, Row, btn, btnGhost, card, inp } from './fields';

const EMPTY: Record<string, string> = { title: '', description: '', category: 'Technique', video_url: '', thumbnail_url: '', duration_seconds: '', level: 'All levels', active: 'true' };

export function VideosAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [edit, setEdit] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(!supabase);

  const load = async () => {
    if (!supabase) { setSchemaMissing(true); setRows([]); setMessage('Neon is not configured for this website environment.'); return; }
    try {
    const { data, error } = await supabase.from('coaching_videos').select('*').order('created_at', { ascending: false });
    if (error) {
      setRows([]);
      setSchemaMissing(/does not exist|not found|schema cache|could not find/i.test(error.message));
      setMessage(/does not exist|not found|schema cache|could not find/i.test(error.message)
        ? 'Video library schema is not installed yet. This section is scaffolded; apply the documented coaching-content migration before using live CRUD.'
        : `Could not load videos: ${error.message}`);
      return;
    }
    setSchemaMissing(false);
    setRows((data ?? []) as Row[]);
    setMessage('');
    } catch {
      setRows([]);
      setMessage('Could not reach the video library. Check the connection and retry.');
    }
  };
  useEffect(() => { void load(); }, []);

  const openNew = () => { setEdit({} as Row); setForm({ ...EMPTY }); };
  const openEdit = (row: Row) => {
    setEdit(row);
    setForm({ title: String(row.title ?? ''), description: String(row.description ?? ''), category: String(row.category ?? 'Technique'), video_url: String(row.video_url ?? ''), thumbnail_url: String(row.thumbnail_url ?? ''), duration_seconds: String(row.duration_seconds ?? ''), level: String(row.level ?? 'All levels'), active: row.active ? 'true' : 'false' });
  };
  const save = async () => {
    if (!supabase) { setMessage('Live database access is not configured; no changes were saved.'); return; }
    if (!form.title.trim() || !form.video_url.trim()) { setMessage('A title and video URL are required.'); return; }
    try { new URL(form.video_url); } catch { setMessage('Enter a valid video URL.'); return; }
    if (form.thumbnail_url.trim()) { try { new URL(form.thumbnail_url); } catch { setMessage('Thumbnail must be a valid URL.'); return; } }
    setBusy(true); setMessage('');
    const body = { title: form.title.trim(), description: form.description.trim() || null, category: form.category.trim() || 'General', video_url: form.video_url.trim(), thumbnail_url: form.thumbnail_url.trim() || null, duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : null, level: form.level.trim() || 'All levels', active: form.active === 'true' };
    const result = edit?.id ? await supabase!.from('coaching_videos').update(body).eq('id', edit.id) : await supabase!.from('coaching_videos').insert(body);
    setBusy(false);
    if (result.error) { setMessage(`Save failed: ${result.error.message}`); return; }
    setEdit(null); setMessage('Video saved.'); await load();
  };
  const remove = async (row: Row) => {
    if (!supabase) { setMessage('Live database access is not configured; no changes were made.'); return; }
    if (!window.confirm(`Delete “${String(row.title)}” from the video library?`)) return;
    const { error } = await supabase!.from('coaching_videos').delete().eq('id', row.id);
    if (error) setMessage(`Delete failed: ${error.message}`); else { setMessage('Video deleted.'); await load(); }
  };
  const toggle = async (row: Row) => {
    if (!supabase) { setMessage('Live database access is not configured; no changes were made.'); return; }
    const { error } = await supabase!.from('coaching_videos').update({ active: !row.active }).eq('id', row.id);
    if (error) setMessage(`Update failed: ${error.message}`); else await load();
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase text-orange-300">Coaching content</p><h2 className="mt-1 text-lg font-semibold text-white">Video library</h2><p className="mt-1 max-w-2xl text-sm text-zinc-400">Prepare exercise demos, technique explainers and coaching videos for the future app library. This does not change the app's current dummy content.</p></div><button className={btn} onClick={openNew} disabled={schemaMissing}>+ Add video</button></div>
        {message && <p role="status" className="mt-4 rounded-lg border border-zinc-800 bg-black/20 p-3 text-xs text-orange-200">{message}</p>}
      </div>
      <AdminTable rows={rows ?? []} empty={schemaMissing ? 'Live video storage is awaiting its migration.' : 'No videos added yet.'} onEdit={openEdit} onDelete={remove} cols={[
        { key: 'title', label: 'Video', render: (r) => <div><p className="font-medium text-white">{String(r.title)}</p><p className="text-xs text-zinc-500">{String(r.category ?? 'General')} · {String(r.level ?? 'All levels')}</p></div> },
        { key: 'duration_seconds', label: 'Duration', render: (r) => r.duration_seconds ? `${Math.floor(Number(r.duration_seconds) / 60)}:${String(Number(r.duration_seconds) % 60).padStart(2, '0')}` : '—' },
        { key: 'video_url', label: 'Source', render: (r) => <a className="max-w-48 truncate text-orange-300 underline" href={String(r.video_url)} target="_blank" rel="noreferrer">Open video</a> },
        { key: 'active', label: 'App visibility', render: (r) => <button className={btnGhost} onClick={() => void toggle(r)}>{r.active ? 'Visible' : 'Hidden'}</button> },
      ]} />
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEdit(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="video-editor-title" className={`${card} max-h-[90vh] w-full max-w-xl overflow-y-auto`}>
            <h3 id="video-editor-title" className="mb-4 text-lg font-semibold text-white">{edit.id ? 'Edit video' : 'Add video'}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-400">Title<input className={`${inp} mt-1`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label className="text-xs text-zinc-400">Category<input className={`${inp} mt-1`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
              <label className="text-xs text-zinc-400 sm:col-span-2">Video URL<input className={`${inp} mt-1`} type="url" placeholder="https://…" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></label>
              <label className="text-xs text-zinc-400 sm:col-span-2">Thumbnail URL (optional)<input className={`${inp} mt-1`} type="url" placeholder="https://…" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></label>
              <label className="text-xs text-zinc-400 sm:col-span-2">Description<textarea className={`${inp} mt-1 min-h-20`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label className="text-xs text-zinc-400">Duration (seconds)<input className={`${inp} mt-1`} type="number" min="1" value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })} /></label>
              <label className="text-xs text-zinc-400">Level<input className={`${inp} mt-1`} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={form.active === 'true'} onChange={(e) => setForm({ ...form, active: e.target.checked ? 'true' : 'false' })} /> Visible to app clients when app integration is enabled</label>
            <div className="mt-5 flex justify-end gap-2"><button className={btnGhost} onClick={() => setEdit(null)}>Cancel</button><button className={btn} disabled={busy || schemaMissing} onClick={() => void save()}>{busy ? 'Saving…' : 'Save video'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
