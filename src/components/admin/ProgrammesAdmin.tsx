import { useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

const EMPTY = { name: '', description: '', duration_weeks: '12', days_per_week: '4', level: 'All levels', active: 'true' };

export function ProgrammesAdmin() {
  const [programmes, setProgrammes] = useState<Row[]>([]);
  const [clients, setClients] = useState<Row[]>([]);
  const [assignments, setAssignments] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Row | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [clientId, setClientId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); });
  const [busy, setBusy] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(!neon);
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!neon) { setSchemaMissing(true); setMessage('Neon is not configured for this website environment.'); return; }
    try {
    const [programResult, clientResult, assignmentResult] = await Promise.all([
      neon.from('coaching_programmes').select('*').order('created_at', { ascending: false }),
      neon.from('profiles').select('id,full_name,email').eq('role', 'athlete').order('full_name'),
      neon.from('coaching_programme_assignments').select('*, profiles(full_name,email), coaching_programmes(name)').order('created_at', { ascending: false }),
    ]);
    const missing = [programResult, assignmentResult].some((r) => r.error && /does not exist|not found|schema cache|could not find/i.test(r.error.message));
    if (missing) {
      setSchemaMissing(true);
      setMessage('Programme tables are not installed yet. Apply the reviewed 0012_coaching_programmes.sql migration before enabling live programme management.');
      setProgrammes([]);
      setAssignments([]);
    } else if (programResult.error || assignmentResult.error) {
      setMessage(`Could not load programmes: ${programResult.error?.message ?? assignmentResult.error?.message}`);
    } else {
      setSchemaMissing(false);
      setMessage('');
      setProgrammes((programResult.data ?? []) as Row[]);
      setAssignments((assignmentResult.data ?? []) as Row[]);
    }
    if (clientResult.error) {
      setMessage((current) => current || 'Could not load client list. Check staff permissions and the profiles table.');
      setClients([]);
    } else {
      setClients((clientResult.data ?? []) as Row[]);
    }
    } catch {
      setMessage('Could not reach the coaching programme service. Check the connection and retry.');
      setProgrammes([]);
      setAssignments([]);
      setClients([]);
    }
  };

  useEffect(() => { void load(); }, []);

  const openNew = () => { setEdit({} as Row); setForm({ ...EMPTY }); };
  const openEdit = (row: Row) => {
    setEdit(row);
    setForm({ name: String(row.name ?? ''), description: String(row.description ?? ''), duration_weeks: String(row.duration_weeks ?? 12), days_per_week: String(row.days_per_week ?? 4), level: String(row.level ?? 'All levels'), active: row.active ? 'true' : 'false' });
  };

  const save = async () => {
    if (!neon) { setMessage('Live database access is not configured; no changes were saved.'); return; }
    const weeks = Number(form.duration_weeks);
    const days = Number(form.days_per_week);
    if (!form.name.trim()) { setMessage('Enter a programme name.'); return; }
    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 104) { setMessage('Programme duration must be between 1 and 104 weeks.'); return; }
    if (!Number.isInteger(days) || days < 1 || days > 7) { setMessage('Training days per week must be between 1 and 7.'); return; }
    setBusy(true); setMessage('');
    const payload = { name: form.name.trim(), description: form.description.trim() || null, duration_weeks: weeks, days_per_week: days, level: form.level.trim() || 'All levels', active: form.active === 'true' };
    try {
      const result = edit?.id
        ? await neon.from('coaching_programmes').update(payload).eq('id', edit.id).select('id')
        : await neon.from('coaching_programmes').insert(payload).select('id');
      if (result.error) { setMessage('Save failed: ' + result.error.message); return; }
      if (!result.data?.length) { setMessage('Nothing was saved. Check that the programme still exists and staff permissions allow this change.'); return; }
      setEdit(null); setMessage('Programme saved.'); await load();
    } catch (error) {
      setMessage('Could not save programme: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    } finally { setBusy(false); }
  };

  const remove = async (row: Row) => {
    if (!neon) { setMessage('Live database access is not configured; no changes were made.'); return; }
    if (!window.confirm('Delete programme "' + String(row.name) + '"? Assigned clients may prevent deletion; deactivate it instead if in use.')) return;
    setBusy(true); setMessage('');
    try {
      const result = await neon.from('coaching_programmes').delete().eq('id', row.id).select('id');
      if (result.error) { setMessage('Delete failed: ' + result.error.message); return; }
      if (!result.data?.length) { setMessage('The programme was not deleted. It may already be gone or staff permissions may not allow this change.'); return; }
      setMessage('Programme deleted.'); await load();
    } catch (error) {
      setMessage('Could not delete programme: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    } finally { setBusy(false); }
  };

  const assign = async () => {
    if (!neon) { setMessage('Live database access is not configured; no assignment was created.'); return; }
    if (!clientId || !programmeId || !startDate) { setMessage('Choose a client, programme and start date.'); return; }
    if (!dueDate) { setMessage('Choose the date this plan must be completed by.'); return; }
    if (dueDate < startDate) { setMessage('The completion date must be on or after the start date.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await neon.from('coaching_programme_assignments').insert({ profile_id: clientId, programme_id: programmeId, starts_on: startDate, due_on: dueDate, status: 'active' }).select('id');
      if (result.error) { setMessage('Assignment failed: ' + result.error.message); return; }
      if (!result.data?.length) { setMessage('The assignment was not saved. Check the client, programme and staff permissions.'); return; }
      setMessage('Programme assigned to client.'); await load();
    } catch (error) {
      setMessage('Could not assign programme: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    } finally { setBusy(false); }
  };

  const finish = async (row: Row) => {
    if (!neon) { setMessage('Live database access is not configured; no assignment was changed.'); return; }
    const status = row.status === 'completed' ? 'active' : 'completed';
    setBusy(true); setMessage('');
    try {
      const result = await neon.from('coaching_programme_assignments').update({ status }).eq('id', row.id).select('id');
      if (result.error) { setMessage('Could not update assignment: ' + result.error.message); return; }
      if (!result.data?.length) { setMessage('Assignment was not updated. Check staff permissions and refresh the list.'); return; }
      setMessage('Assignment marked ' + status + '.'); await load();
    } catch (error) {
      setMessage('Could not update assignment: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    } finally { setBusy(false); }
  };

  const toggleVisibility = async (row: Row) => {
    if (!neon) { setMessage('Live database access is not configured; no changes were made.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await neon.from('coaching_programmes').update({ active: !row.active }).eq('id', row.id).select('id');
      if (result.error) { setMessage('Visibility update failed: ' + result.error.message); return; }
      if (!result.data?.length) { setMessage('Visibility was not changed. Refresh the list and check staff permissions.'); return; }
      setMessage('Programme visibility updated.'); await load();
    } catch (error) {
      setMessage('Could not update programme visibility: ' + (error instanceof Error ? error.message : 'Unexpected error'));
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="font-mono text-[10px] uppercase text-orange-300">Online coaching</p><h2 className="mt-1 text-lg font-semibold text-white">Programme builder</h2><p className="mt-1 max-w-2xl text-sm text-zinc-400">Create a time-bound training programme and assign it to a client with a completion date (usually a week). Members see the assignment, its deadline and their workout / check-in / nutrition progress in the app. Requires the prepared 0012_coaching_programmes.sql migration (mobile repo) to be applied to the intended Neon branch first.</p></div>
          <button className={btn} onClick={openNew} disabled={schemaMissing}>+ New programme</button>
        </div>
        {message && <p role="status" className="mt-4 rounded-lg border border-zinc-800 bg-black/20 p-3 text-xs text-orange-200">{message}</p>}
      </div>
      <AdminTable rows={programmes} empty={schemaMissing ? 'Programme storage is awaiting its migration.' : 'No programmes yet.'} onEdit={openEdit} onDelete={remove} cols={[
        { key: 'name', label: 'Programme', render: (r) => <div><p className="font-medium text-white">{String(r.name)}</p><p className="text-xs text-zinc-500">{String(r.level ?? 'All levels')}</p></div> },
        { key: 'duration_weeks', label: 'Duration', render: (r) => `${String(r.duration_weeks)} weeks` },
        { key: 'days_per_week', label: 'Training', render: (r) => `${String(r.days_per_week)} days/week` },
        { key: 'active', label: 'Status', render: (r) => <button className={btnGhost} disabled={busy || schemaMissing} onClick={() => void toggleVisibility(r)}>{r.active ? 'Live' : 'Hidden'}</button> },
      ]} />
      <div className={card}>
        <h3 className="font-semibold text-white">Assign programme</h3>
        <p className="mb-3 mt-1 text-sm text-zinc-400">Choose a client, an active programme, and the start and completion dates. Members work through their assigned workouts, check-ins and nutrition by the completion date — usually a week.</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="text-xs text-zinc-400">Client
            <select className={`${inp} mt-1`} value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Choose client…</option>{clients.map((c) => <option key={String(c.id)} value={String(c.id)}>{String(c.full_name ?? c.email ?? 'Client')}</option>)}</select>
          </label>
          <label className="text-xs text-zinc-400">Programme
            <select className={`${inp} mt-1`} value={programmeId} onChange={(e) => setProgrammeId(e.target.value)}><option value="">Choose programme…</option>{programmes.filter((p) => p.active).map((p) => <option key={String(p.id)} value={String(p.id)}>{String(p.name)}</option>)}</select>
          </label>
          <label className="text-xs text-zinc-400">Starts<input className={`${inp} mt-1`} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label className="text-xs text-zinc-400">Complete by<input className={`${inp} mt-1`} type="date" min={startDate} value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
        </div>
        <button className={`${btn} mt-3`} disabled={busy || schemaMissing} onClick={() => void assign()}>Assign to client</button>
      </div>
      <div className={card}>
        <h3 className="mb-3 font-semibold text-white">Client programme assignments</h3>
        <AdminTable rows={assignments} empty="No programme assignments yet." cols={[
          { key: 'client', label: 'Client', render: (r) => String(r.profiles?.full_name ?? r.profiles?.email ?? r.profile_id) },
          { key: 'programme', label: 'Programme', render: (r) => String(r.coaching_programmes?.name ?? r.programme_id) },
          { key: 'starts_on', label: 'Starts', render: (r) => ShortDate(String(r.starts_on ?? '')) },
          { key: 'due_on', label: 'Complete by', render: (r) => (r.due_on ? ShortDate(String(r.due_on)) : '—') },
          { key: 'status', label: 'Status', render: (r) => <button className={btnGhost} disabled={busy} onClick={() => void finish(r)}>{String(r.status)}</button> },
        ]} />
      </div>
      {edit && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEdit(null); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="programme-editor-title" className={`${card} max-h-[90vh] w-full max-w-xl overflow-y-auto`}>
          <h3 id="programme-editor-title" className="mb-4 text-lg font-semibold text-white">{edit.id ? 'Edit programme' : 'New programme'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-zinc-400 sm:col-span-2">Name<input className={`${inp} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="text-xs text-zinc-400 sm:col-span-2">Description<textarea className={`${inp} mt-1 min-h-20`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="text-xs text-zinc-400">Duration (weeks)<input className={`${inp} mt-1`} type="number" min="1" max="104" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })} /></label>
            <label className="text-xs text-zinc-400">Days per week<input className={`${inp} mt-1`} type="number" min="1" max="7" value={form.days_per_week} onChange={(e) => setForm({ ...form, days_per_week: e.target.value })} /></label>
            <label className="text-xs text-zinc-400 sm:col-span-2">Level<input className={`${inp} mt-1`} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={form.active === 'true'} onChange={(e) => setForm({ ...form, active: e.target.checked ? 'true' : 'false' })} /> Available for assignment</label>
          <div className="mt-5 flex justify-end gap-2"><button className={btnGhost} onClick={() => setEdit(null)}>Cancel</button><button className={btn} disabled={busy || schemaMissing} onClick={() => void save()}>{busy ? 'Saving…' : 'Save programme'}</button></div>
        </div>
      </div>}
    </div>
  );
}
