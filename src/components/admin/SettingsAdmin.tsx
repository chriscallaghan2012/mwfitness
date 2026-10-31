import { useEffect, useState } from 'react';
import { adminDb } from '../../lib/admin/adminDb';
import { Row, btn, btnGhost, card, inp } from './fields';

type CardioOption = { id: string; label: string; icon: string; active: boolean };

const SETTINGS_KEY = 'cardio_activity_options';
const DEFAULT_OPTIONS: CardioOption[] = [
  { id: 'Treadmill', label: 'Treadmill Run/Walk', icon: 'directions_run', active: true },
  { id: 'Outdoor Run', label: 'Outdoor Running', icon: 'directions_run', active: true },
  { id: 'Outdoor Walk', label: 'Outdoor Walking', icon: 'directions_walk', active: true },
  { id: 'Stationary Bike', label: 'Stationary Bike / Spin', icon: 'pedal_bike', active: true },
  { id: 'Road Cycling', label: 'Outdoor Cycling', icon: 'directions_bike', active: true },
  { id: 'Rowing Machine', label: 'Rowing Machine', icon: 'rowing', active: true },
  { id: 'Stair Climber', label: 'Stair Climber / Stepper', icon: 'stairs', active: true },
  { id: 'Elliptical', label: 'Elliptical Trainer', icon: 'fitness_center', active: true },
  { id: 'Swimming', label: 'Swimming Laps', icon: 'pool', active: true },
  { id: 'HIIT Session', label: 'HIIT / Circuit Cardio', icon: 'bolt', active: true },
  { id: 'Jump Rope', label: 'Jump Rope', icon: 'fitness_center', active: true },
  { id: 'Other', label: 'Other Activity', icon: 'sports', active: true },
];

function parseOptions(value: unknown): CardioOption[] {
  if (!Array.isArray(value)) return DEFAULT_OPTIONS;
  const options = value.filter((item): item is CardioOption => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Record<string, unknown>;
    return typeof row.id === 'string' && typeof row.label === 'string' && typeof row.icon === 'string';
  }).map((item) => ({ id: item.id.trim(), label: item.label.trim(), icon: item.icon.trim() || 'fitness_center', active: item.active !== false }))
    .filter((item) => item.id && item.label);
  return options.length ? options : DEFAULT_OPTIONS;
}

export function SettingsAdmin() {
  const db = adminDb();
  const [options, setOptions] = useState<CardioOption[]>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    if (!db) {
      setError('Neon is not configured. Settings can be previewed in demo mode but not saved live.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await db.from('admin_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
      if (result.error) throw result.error;
      setOptions(parseOptions(result.data?.value));
    } catch (e) {
      setError(e instanceof Error ? `Could not load settings: ${e.message}` : 'Could not load settings. Apply the admin-settings migration, then retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const updateOption = (index: number, patch: Partial<CardioOption>) => {
    setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option));
  };

  const addOption = () => {
    setOptions((current) => [...current, { id: `Custom ${current.length + 1}`, label: 'New cardio activity', icon: 'fitness_center', active: true }]);
    setNotice('New option added. Save settings when ready.');
    setError('');
  };

  const removeOption = (index: number) => {
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setNotice('Option removed from the draft. Save settings when ready.');
  };

  const save = async () => {
    if (!db) {
      setError('Neon is not configured. Nothing was saved.');
      return;
    }
    const cleaned = parseOptions(options);
    if (!cleaned.some((option) => option.active)) {
      setError('Keep at least one active cardio activity.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const payload: Row = { value: cleaned, updated_at: new Date().toISOString() };
      const updated = await db.from('admin_settings').update(payload).eq('key', SETTINGS_KEY).select('key');
      if (updated.error) throw updated.error;
      if (!updated.data?.length) {
        const inserted = await db.from('admin_settings').insert({ key: SETTINGS_KEY, ...payload }).select('key');
        if (inserted.error) throw inserted.error;
      }
      setOptions(cleaned);
      setNotice('Cardio options saved.');
    } catch (e) {
      setError(e instanceof Error ? `Save failed: ${e.message}` : 'Settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="space-y-5">
    <div className={card}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-orange-300">Staff HQ · form controls</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Settings</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Manage the cardio activity choices used by the app. Inactive choices remain stored for existing records but are hidden from new entries.</p>
    </div>
    {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</p> : null}
    {notice ? <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-300">{notice}</p> : null}
    <section className={card}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-base font-semibold text-white">Cardio dropdown options</h3><p className="mt-1 text-xs text-zinc-500">Use stable IDs so existing cardio history remains readable.</p></div>
        <div className="flex gap-2"><button type="button" className={btnGhost} onClick={addOption}>Add option</button><button type="button" disabled={busy || loading} className={btn} onClick={() => void save()}>{busy ? 'Saving...' : 'Save settings'}</button></div>
      </div>
      {loading ? <p className="text-sm text-zinc-400">Loading settings...</p> : <div className="space-y-3">
        {options.map((option, index) => <div key={`${option.id}-${index}`} className="grid gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:grid-cols-[1fr_1.5fr_1fr_auto_auto] sm:items-center">
          <input className={inp} aria-label={`Activity ${index + 1} ID`} value={option.id} onChange={(event) => updateOption(index, { id: event.target.value })} />
          <input className={inp} aria-label={`Activity ${index + 1} label`} value={option.label} onChange={(event) => updateOption(index, { label: event.target.value })} />
          <input className={inp} aria-label={`Activity ${index + 1} icon`} value={option.icon} onChange={(event) => updateOption(index, { icon: event.target.value })} />
          <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={option.active} onChange={(event) => updateOption(index, { active: event.target.checked })} className="accent-orange-500" /> Active</label>
          <button type="button" className={btnGhost} onClick={() => removeOption(index)}>Remove</button>
        </div>)}
      </div>}
    </section>
  </div>;
}
