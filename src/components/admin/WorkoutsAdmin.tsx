// WorkoutsAdmin — shared exercise library, workout templates and member schedules.
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, List, Layout, Calendar, Activity } from 'lucide-react';
import { adminDb } from '../../lib/admin/adminDb';
import { createDemoTables } from '../../lib/admin/demoData';
import { AdminTable, Row, ShortDate, btn, btnGhost, card, inp } from './fields';

type ResultFieldDraft = { label: string; type: 'number' | 'text' | 'duration'; unit: string };

const DEFAULT_RESULT_FIELDS: ResultFieldDraft[] = [
  { label: 'Sets', type: 'number', unit: '' },
  { label: 'Reps', type: 'number', unit: '' },
  { label: 'Load', type: 'number', unit: 'kg' },
];

const WEEKDAYS = [
  { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' }, { value: 7, label: 'Sun' },
];

function fieldKey(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const prescription = (sets: string, reps: string, load: string) => ({
  ...(sets.trim() ? { sets: Number(sets) || sets.trim() } : {}),
  ...(reps.trim() ? { reps: reps.trim() } : {}),
  ...(load.trim() ? { load: Number(load) || load.trim() } : {}),
});

function snapshotFromLibrary(exercise: Row, values: { sets?: string; reps?: string; load?: string } = {}) {
  const defaults = exercise.default_prescription && typeof exercise.default_prescription === 'object' ? exercise.default_prescription : {};
  return {
    exercise_id: String(exercise.id),
    name: String(exercise.name),
    category: String(exercise.category ?? 'General'),
    coach_cues: String(exercise.coach_cues ?? ''),
    prescription: { ...defaults, ...prescription(values.sets ?? '', values.reps ?? '', values.load ?? '') },
    result_fields: Array.isArray(exercise.result_fields) ? exercise.result_fields : [],
  };
}

const importKey = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

type Tab = 'exercises' | 'templates' | 'schedules' | 'misc';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'exercises', label: 'Exercise library', icon: List },
  { id: 'templates', label: 'Workout templates', icon: Layout },
  { id: 'schedules', label: 'Member schedules', icon: Calendar },
  { id: 'misc', label: 'Cardio options', icon: Activity },
];

export function WorkoutsAdmin() {
  const db = adminDb();
  const [activeTab, setActiveTab] = useState<Tab>('exercises');
  const [exercises, setExercises] = useState<Row[]>([]);
  const [templates, setTemplates] = useState<Row[]>([]);
  const [templateItems, setTemplateItems] = useState<Row[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [sessions, setSessions] = useState<Row[] | null>(null);
  const [schedules, setSchedules] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [userId, setUserId] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [exerciseEdit, setExerciseEdit] = useState<Row | null>(null);
  const [exerciseFields, setExerciseFields] = useState<ResultFieldDraft[]>(DEFAULT_RESULT_FIELDS.map((field) => ({ ...field })));
  const [exerciseForm, setExerciseForm] = useState<Record<string, string>>({ name: '', category: '', description: '', coach_cues: '', sets: '3', reps: '8-10', load: '' });
  const [templateEdit, setTemplateEdit] = useState<Row | null>(null);
  const [templateForm, setTemplateForm] = useState<Record<string, string>>({ name: '', description: '', days_per_week: '', plan_id: '' });
  const [templateExerciseForm, setTemplateExerciseForm] = useState({ exercise_id: '', day_number: '1', sets: '', reps: '', load: '' });
  const [sessionForm, setSessionForm] = useState({ mode: 'single', template_id: '', scheduled_on: '', day_number: '1', starts_on: '', ends_on: '', weekdays: [] as number[], extraExerciseIds: [] as string[] });
  const [sessionEdit, setSessionEdit] = useState<Row | null>(null);
  const [scheduleEdit, setScheduleEdit] = useState<Row | null>(null);
  const [sessionEditDate, setSessionEditDate] = useState('');
  const [sessionEditExercises, setSessionEditExercises] = useState<Row[]>([]);
  const [miscSettings, setMiscSettings] = useState<Record<string, any> | null>(null);
  const [miscEdit, setMiscEdit] = useState(false);
  const requestId = useRef(0);

  const load = async () => {
    if (!db) { setMessage('Neon is not configured; live workouts cannot be loaded.'); return; }
    try {
      const [exerciseResult, templateResult, userResult, planResult, itemResult, settingsResult] = await Promise.all([
        db.from('workout_exercises').select('*').order('sort_order').order('name'),
        db.from('workout_templates').select('*, plans(name)').order('name'),
        db.from('profiles').select('id,full_name,role').order('full_name'),
        db.from('plans').select('id,name').order('name'),
        db.from('workout_template_exercises').select('*').order('day_number').order('sort_order'),
        db.from('admin_settings').select('key,value').eq('key', 'cardio_activity_options').maybeSingle(),
      ]);
      if (exerciseResult.error) setMessage(`Exercise library unavailable: ${exerciseResult.error.message}`);
      else setExercises((exerciseResult.data ?? []) as Row[]);
      if (templateResult.error) setMessage(`Could not load workout templates: ${templateResult.error.message}`);
      else setTemplates((templateResult.data ?? []) as Row[]);
      if (userResult.error) setMessage(`Could not load customers: ${userResult.error.message}`);
      else setUsers((userResult.data ?? []) as Row[]);
      if (!planResult.error) setPlans((planResult.data ?? []) as Row[]);
      if (!itemResult.error) setTemplateItems((itemResult.data ?? []) as Row[]);
      if (settingsResult.error) setMessage(`Could not load misc settings: ${settingsResult.error.message}`);
      else setMiscSettings(settingsResult.data?.value ?? null);
    } catch (error) {
      setMessage(`Could not load workout setup: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  const loadMemberData = async (profileId: string) => {
    const currentRequest = ++requestId.current;
    if (!profileId || !db) { setSessions(null); setSchedules([]); return; }
    setSessions([]);
    try {
      const [sessionResult, scheduleResult] = await Promise.all([
        db.from('workout_sessions').select('*, workout_templates(name)').eq('profile_id', profileId).order('scheduled_on'),
        db.from('workout_schedules').select('*, workout_templates(name)').eq('profile_id', profileId).order('starts_on'),
      ]);
      if (currentRequest !== requestId.current) return;
      if (sessionResult.error) { setMessage(`Could not load sessions: ${sessionResult.error.message}`); setSessions([]); }
      else setSessions((sessionResult.data ?? []) as Row[]);
      if (scheduleResult.error) setMessage(`Could not load weekly schedules: ${scheduleResult.error.message}`);
      else setSchedules((scheduleResult.data ?? []) as Row[]);
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setSessions([]);
      setMessage(`Could not load member training: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveExercise = async () => {
    if (!db) { setMessage('Neon is not configured; no exercise was saved.'); return; }
    if (!exerciseForm.name.trim()) { setMessage('Enter an exercise name.'); return; }
    const fields = exerciseFields.map((field) => ({
      key: fieldKey(field.label),
      label: field.label.trim(),
      type: field.type,
      ...(field.unit.trim() && field.type !== 'text' ? { unit: field.unit.trim() } : {}),
    }));
    if (!fields.length || fields.some((field) => !field.key || !field.label)) { setMessage('Add a name for every result field.'); return; }
    if (new Set(fields.map((field) => field.key)).size !== fields.length) { setMessage('Each result field needs a unique name.'); return; }
    setBusy(true); setMessage('');
    try {
      const payload = {
        name: exerciseForm.name.trim(), category: exerciseForm.category.trim() || 'General',
        description: exerciseForm.description.trim(), coach_cues: exerciseForm.coach_cues.trim(),
        result_fields: fields,
        default_prescription: prescription(exerciseForm.sets, exerciseForm.reps, exerciseForm.load),
        active: true,
      };
      const result = exerciseEdit?.id
        ? await db.from('workout_exercises').update(payload).eq('id', exerciseEdit.id).select('id')
        : await db.from('workout_exercises').insert(payload).select('id');
      if (result.error) { setMessage(`Exercise save failed: ${result.error.message}`); return; }
      if (!result.data?.length) { setMessage('Exercise was not saved. Check staff permissions and retry.'); return; }
      setExerciseEdit(null);
      setExerciseFields(DEFAULT_RESULT_FIELDS.map((field) => ({ ...field })));
      setExerciseForm({ name: '', category: '', description: '', coach_cues: '', sets: '3', reps: '8-10', load: '' });
      setMessage('Exercise saved.');
      await load();
    } catch (error) { setMessage(`Could not save exercise: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const editExercise = (row: Row) => {
    setExerciseEdit(row);
    setExerciseForm({
      name: String(row.name ?? ''), category: String(row.category ?? ''), description: String(row.description ?? ''), coach_cues: String(row.coach_cues ?? ''),
      sets: String(row.default_prescription?.sets ?? ''), reps: String(row.default_prescription?.reps ?? ''), load: String(row.default_prescription?.load ?? ''),
    });
    setExerciseFields((Array.isArray(row.result_fields) ? row.result_fields : []).map((field: Row) => ({
      label: String(field.label ?? ''),
      type: ['number', 'text', 'duration'].includes(String(field.type)) ? field.type : 'number',
      unit: String(field.unit ?? ''),
    })));
  };

  const deleteExercise = async (row: Row) => {
    if (!db) return;
    setBusy(true); setMessage('');
    try {
      const result = await db.from('workout_exercises').delete().eq('id', row.id).select('id');
      if (result.error) { setMessage(`Exercise delete failed: ${result.error.message}`); return; }
      setMessage('Exercise deleted. Existing prescriptions keep their saved exercise name.');
      await load();
    } catch (error) { setMessage(`Could not delete exercise: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const saveTemplate = async () => {
    if (!db) { setMessage('Neon is not configured; no template was saved.'); return; }
    if (!templateForm.name.trim()) { setMessage('Enter a workout template name.'); return; }
    const days = Number(templateForm.days_per_week || 0);
    if (days && (!Number.isInteger(days) || days < 1 || days > 7)) { setMessage('Days per week must be between 1 and 7.'); return; }
    setBusy(true); setMessage('');
    try {
      const payload = { name: templateForm.name.trim(), description: templateForm.description.trim(), days_per_week: days || null, plan_id: templateForm.plan_id || null };
      const result = templateEdit?.id
        ? await db.from('workout_templates').update(payload).eq('id', templateEdit.id).select('id')
        : await db.from('workout_templates').insert(payload).select('id');
      if (result.error) { setMessage(`Template save failed: ${result.error.message}`); return; }
      setTemplateEdit(null); setTemplateForm({ name: '', description: '', days_per_week: '', plan_id: '' });
      setMessage('Workout template saved.');
      await load();
    } catch (error) { setMessage(`Could not save template: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const editTemplate = (row: Row) => {
    setTemplateEdit(row); setActiveTemplateId(String(row.id));
    setTemplateForm({ name: String(row.name ?? ''), description: String(row.description ?? ''), days_per_week: String(row.days_per_week ?? ''), plan_id: String(row.plan_id ?? '') });
  };

  const deleteTemplate = async (row: Row) => {
    if (!db) return;
    setBusy(true); setMessage('');
    try {
      const result = await db.from('workout_templates').delete().eq('id', row.id).select('id');
      if (result.error) { setMessage(`Template delete failed: ${result.error.message}`); return; }
      setMessage('Workout template deleted.');
      await load();
    } catch (error) { setMessage(`Could not delete template: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const addTemplateExercise = async () => {
    if (!db || !activeTemplateId || !templateExerciseForm.exercise_id) { setMessage('Choose a template and exercise first.'); return; }
    const exercise = exercises.find((item) => String(item.id) === templateExerciseForm.exercise_id);
    if (!exercise) return;
    const day = Number(templateExerciseForm.day_number);
    if (!Number.isInteger(day) || day < 1 || day > 7) { setMessage('Template day must be between 1 and 7.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await db.from('workout_template_exercises').insert({
        template_id: activeTemplateId, exercise_id: exercise.id, exercise_name: exercise.name, day_number: day,
        sort_order: templateItems.filter((item) => String(item.template_id) === activeTemplateId && Number(item.day_number) === day).length * 10 + 10,
        prescription: { ...exercise.default_prescription, ...prescription(templateExerciseForm.sets, templateExerciseForm.reps, templateExerciseForm.load) },
        result_fields: exercise.result_fields,
      }).select('id');
      if (result.error) { setMessage(`Could not add exercise to template: ${result.error.message}`); return; }
      setTemplateExerciseForm({ ...templateExerciseForm, exercise_id: '', sets: '', reps: '', load: '' });
      setMessage('Exercise added to template.');
      await load();
    } catch (error) { setMessage(`Could not add template exercise: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const deleteTemplateExercise = async (row: Row) => {
    if (!db) return;
    const result = await db.from('workout_template_exercises').delete().eq('id', row.id).select('id');
    if (result.error) { setMessage(`Could not remove exercise: ${result.error.message}`); return; }
    setMessage('Template exercise removed.'); await load();
  };

  const importDemoLibrary = async () => {
    if (!db) { setMessage('Neon is not configured; no demo library was imported.'); return; }
    setBusy(true); setMessage('Preparing demo exercise import...');
    try {
      const demo = createDemoTables();
      const exerciseIdMap = new Map<string, string>();
      let createdExercises = 0;
      let skippedExercises = 0;
      for (const source of demo.workout_exercises ?? []) {
        const existing = exercises.find((row) => importKey(row.name) === importKey(source.name));
        if (existing) {
          exerciseIdMap.set(String(source.id), String(existing.id));
          skippedExercises += 1;
          continue;
        }
        const result = await db.from('workout_exercises').insert({
          name: source.name, category: source.category, description: source.description, coach_cues: source.coach_cues,
          result_fields: source.result_fields, default_prescription: source.default_prescription, sort_order: source.sort_order, active: true,
        }).select('id');
        if (result.error || !result.data?.[0]?.id) throw new Error(result.error?.message ?? `Could not import exercise ${source.name}.`);
        exerciseIdMap.set(String(source.id), String(result.data[0].id));
        createdExercises += 1;
      }

      const liveTemplates = [...templates];
      const liveItems = [...templateItems];
      let createdTemplates = 0;
      let createdItems = 0;
      let skippedTemplates = 0;
      for (const sourceTemplate of demo.workout_templates ?? []) {
        const existing = liveTemplates.find((row) => importKey(row.name) === importKey(sourceTemplate.name));
        let templateId = existing ? String(existing.id) : '';
        if (existing) skippedTemplates += 1;
        else {
          const result = await db.from('workout_templates').insert({ name: sourceTemplate.name, description: sourceTemplate.description, days_per_week: sourceTemplate.days_per_week ?? null, plan_id: sourceTemplate.plan_id ?? null }).select('id');
          if (result.error || !result.data?.[0]?.id) throw new Error(result.error?.message ?? `Could not import template ${sourceTemplate.name}.`);
          templateId = String(result.data[0].id);
          liveTemplates.push({ ...sourceTemplate, id: templateId });
          createdTemplates += 1;
        }
        for (const item of (demo.workout_template_exercises ?? []).filter((candidate) => String(candidate.template_id) === String(sourceTemplate.id))) {
          const exerciseId = exerciseIdMap.get(String(item.exercise_id));
          if (!exerciseId) continue;
          const duplicate = liveItems.some((candidate) => String(candidate.template_id) === templateId && Number(candidate.day_number) === Number(item.day_number) && importKey(candidate.exercise_name) === importKey(item.exercise_name));
          if (duplicate) continue;
          const result = await db.from('workout_template_exercises').insert({
            template_id: templateId, exercise_id: exerciseId, exercise_name: item.exercise_name, day_number: item.day_number,
            sort_order: item.sort_order, prescription: item.prescription, result_fields: item.result_fields,
          }).select('id');
          if (result.error) throw new Error(result.error.message);
          liveItems.push({ ...item, template_id: templateId, exercise_id: exerciseId });
          createdItems += 1;
        }
      }
      setMessage(`Demo import complete: ${createdExercises} exercises created, ${skippedExercises} already present; ${createdTemplates} templates created, ${skippedTemplates} already present; ${createdItems} template exercises added.`);
      await load();
    } catch (error) {
      setMessage(`Demo import stopped safely: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    } finally { setBusy(false); }
  };

  const templateSnapshot = (templateId: string, dayNumber: number) => templateItems
    .filter((item) => String(item.template_id) === templateId && Number(item.day_number) === dayNumber)
    .sort((left, right) => Number(left.sort_order) - Number(right.sort_order))
    .map((item) => ({ exercise_id: item.exercise_id, name: item.exercise_name, prescription: item.prescription ?? {}, result_fields: item.result_fields ?? [] }));

  const assign = async () => {
    if (!db || !userId || !sessionForm.template_id) { setMessage('Choose a customer and workout template first.'); return; }
    setBusy(true); setMessage('');
    try {
      if (sessionForm.mode === 'single') {
        if (!sessionForm.scheduled_on) { setMessage('Choose the session date.'); return; }
        const dayNumber = Number(sessionForm.day_number);
        if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) { setMessage('Template day must be between 1 and 7.'); return; }
        const custom = sessionForm.extraExerciseIds.map((id) => exercises.find((item) => String(item.id) === id)).filter(Boolean).map((item) => snapshotFromLibrary(item as Row));
        const result = await db.from('workout_sessions').insert({
          profile_id: userId, template_id: sessionForm.template_id, scheduled_on: sessionForm.scheduled_on,
          status: 'planned', exercises: [...templateSnapshot(sessionForm.template_id, dayNumber), ...custom], performance: {},
        }).select('id');
        if (result.error) { setMessage(`Could not schedule session: ${result.error.message}`); return; }
        setMessage('Workout session scheduled.');
      } else {
        if (!sessionForm.starts_on || !sessionForm.weekdays.length) { setMessage('Choose a start date and at least one weekday.'); return; }
        if (sessionForm.ends_on && sessionForm.ends_on < sessionForm.starts_on) { setMessage('The end date must be on or after the start date.'); return; }
        const payload = {
          profile_id: userId, template_id: sessionForm.template_id, weekdays: [...sessionForm.weekdays].sort((a, b) => a - b),
          starts_on: sessionForm.starts_on, ends_on: sessionForm.ends_on || null, active: true,
        };
        const result = scheduleEdit?.id
          ? await db.from('workout_schedules').update(payload).eq('id', scheduleEdit.id).select('id')
          : await db.from('workout_schedules').insert(payload).select('id');
        if (result.error) { setMessage(`Could not assign weekly workout: ${result.error.message}`); return; }
        setScheduleEdit(null);
        setMessage(scheduleEdit ? 'Weekly workout schedule updated.' : 'Weekly workout schedule assigned.');
      }
      setSessionForm({ mode: 'single', template_id: '', scheduled_on: '', day_number: '1', starts_on: '', ends_on: '', weekdays: [], extraExerciseIds: [] });
      await loadMemberData(userId);
    } catch (error) { setMessage(`Could not schedule workout: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const openSessionEdit = (row: Row) => {
    setSessionEdit(row); setSessionEditDate(String(row.scheduled_on ?? '').slice(0, 10));
    const saved = Array.isArray(row.exercises) ? row.exercises : [];
    setSessionEditExercises(saved.map((item: Row) => ({ ...item, prescription: item.prescription ?? {}, result_fields: item.result_fields ?? [] })));
  };

  const addEditExercise = (exerciseId: string) => {
    const exercise = exercises.find((item) => String(item.id) === exerciseId);
    if (!exercise || sessionEditExercises.some((item) => String(item.exercise_id) === exerciseId)) return;
    setSessionEditExercises((items) => [...items, snapshotFromLibrary(exercise)]);
  };

  const updateEditPrescription = (index: number, key: string, value: string) => {
    setSessionEditExercises((items) => items.map((item, itemIndex) => itemIndex === index
      ? { ...item, prescription: { ...item.prescription, [key]: value } }
      : item));
  };

  const saveSessionEdit = async () => {
    if (!db || !sessionEdit) return;
    if (!sessionEditDate) { setMessage('Choose the session date.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await db.from('workout_sessions').update({ scheduled_on: sessionEditDate, exercises: sessionEditExercises }).eq('id', sessionEdit.id).select('id');
      if (result.error) { setMessage(`Session update failed: ${result.error.message}`); return; }
      if (!result.data?.length) { setMessage('Session was not updated. Check staff permissions and refresh.'); return; }
      setSessionEdit(null); setMessage('Session updated.'); await loadMemberData(userId);
    } catch (error) { setMessage(`Could not update session: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const deleteSession = async (row: Row) => {
    if (!db) return;
    const result = await db.from('workout_sessions').delete().eq('id', row.id).select('id');
    if (result.error) { setMessage(`Session delete failed: ${result.error.message}`); return; }
    setMessage('Workout session deleted.'); await loadMemberData(userId);
  };

  const deleteSchedule = async (row: Row) => {
    if (!db) return;
    const result = await db.from('workout_schedules').delete().eq('id', row.id).select('id');
    if (result.error) { setMessage(`Schedule delete failed: ${result.error.message}`); return; }
    setMessage('Weekly schedule removed.'); await loadMemberData(userId);
  };

  const editSchedule = (row: Row) => {
    setScheduleEdit(row);
    setSessionForm({
      mode: 'weekly', template_id: String(row.template_id), scheduled_on: '', day_number: '1',
      starts_on: String(row.starts_on ?? '').slice(0, 10), ends_on: String(row.ends_on ?? '').slice(0, 10),
      weekdays: (Array.isArray(row.weekdays) ? row.weekdays : []).map(Number), extraExerciseIds: [],
    });
  };

  const saveMiscSettings = async () => {
    if (!db) { setMessage('Neon is not configured; no changes were saved.'); return; }
    if (!miscSettings) { setMessage('No settings loaded to save.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await db.from('admin_settings').upsert({
        key: 'cardio_activity_options',
        value: miscSettings,
        updated_at: new Date().toISOString(),
      });
      if (result.error) { setMessage(`Could not save misc settings: ${result.error.message}`); return; }
      setMiscEdit(false);
      setMessage('Miscellaneous settings saved.');
      await load();
    } catch (error) { setMessage(`Could not save misc settings: ${error instanceof Error ? error.message : 'Unexpected error'}`); }
    finally { setBusy(false); }
  };

  const activeTemplateItems = templateItems.filter((item) => String(item.template_id) === activeTemplateId);
  const selectedTemplate = templates.find((item) => String(item.id) === sessionForm.template_id);
  const customExercises = exercises.filter((exercise) => sessionForm.extraExerciseIds.includes(String(exercise.id)));

  const tabCount = {
    exercises: exercises.length,
    templates: templates.length,
    schedules: schedules.length + (sessions ? sessions.length : 0),
    misc: miscSettings ? (Array.isArray(miscSettings) ? miscSettings.length : 0) : 0,
  };

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <section className={card}>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium rounded-xl border transition
                ${activeTab === tab.id
                  ? 'border-orange-500 bg-orange-500/10 text-white shadow-sm shadow-orange-950/20'
                  : 'border-white/[0.1] bg-white/[0.025] text-zinc-400 hover:border-white/[0.18] hover:text-white'}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tabCount[tab.id] > 0 && <span className="ml-1 text-[10px] opacity-70">[{tabCount[tab.id]}]</span>}
            </button>
          ))}
        </div>
        {message && (
          <div className="mt-3 px-4 py-2 rounded-xl border border-orange-500/20 bg-orange-500/[0.04] text-[11px] text-orange-300">
            {message}
          </div>
        )}
      </section>

      {/* ── TAB: EXERCISES ── */}
      {activeTab === 'exercises' && (
        <section className={card}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-mono uppercase text-orange-300">Exercise library</p>
            <button type="button" className={btnGhost} disabled={busy} onClick={() => void importDemoLibrary()}>Import demo exercises</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
          <input className={inp} placeholder="Exercise name" value={exerciseForm.name} onChange={(event) => setExerciseForm({ ...exerciseForm, name: event.target.value })} />
          <input className={inp} placeholder="Category" value={exerciseForm.category} onChange={(event) => setExerciseForm({ ...exerciseForm, category: event.target.value })} />
          <input className={inp} placeholder="Description" value={exerciseForm.description} onChange={(event) => setExerciseForm({ ...exerciseForm, description: event.target.value })} />
          <input className={inp} placeholder="Coach cues" value={exerciseForm.coach_cues} onChange={(event) => setExerciseForm({ ...exerciseForm, coach_cues: event.target.value })} />
        </div>
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/10 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-xs font-semibold text-white">What should members record?</p><p className="mt-1 text-[11px] text-zinc-500">Add the result fields that fit this exercise. Units are optional.</p></div>
            <button type="button" className={btnGhost} onClick={() => setExerciseFields((fields) => [...fields, { label: '', type: 'number', unit: '' }])}><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add field</button>
          </div>
          <div className="space-y-2">
            {exerciseFields.map((field, index) => <div key={`${index}-${field.label}`} className="grid items-end gap-2 rounded-lg border border-white/[0.06] bg-white/[0.015] p-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(120px,0.8fr)_minmax(90px,0.6fr)_auto]">
              <label className="text-[10px] uppercase text-zinc-500">Field name<input className={`${inp} mt-1`} placeholder="e.g. Reps, Time, Distance" aria-label={`Result field ${index + 1} name`} value={field.label} onChange={(event) => setExerciseFields((fields) => fields.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} /></label>
              <label className="text-[10px] uppercase text-zinc-500">Answer type<select className={`${inp} mt-1`} aria-label={`Result field ${index + 1} type`} value={field.type} onChange={(event) => setExerciseFields((fields) => fields.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as ResultFieldDraft['type'], unit: event.target.value === 'text' ? '' : item.unit } : item))}><option value="number">Number</option><option value="duration">Time</option><option value="text">Text</option></select></label>
              <label className="text-[10px] uppercase text-zinc-500">Unit<input className={`${inp} mt-1`} placeholder="kg, min" aria-label={`Result field ${index + 1} unit`} disabled={field.type === 'text'} value={field.unit} onChange={(event) => setExerciseFields((fields) => fields.map((item, itemIndex) => itemIndex === index ? { ...item, unit: event.target.value } : item))} /></label>
              <button type="button" className={`${btnGhost} h-11 px-3`} aria-label={`Remove result field ${index + 1}`} title="Remove result field" onClick={() => setExerciseFields((fields) => fields.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
            </div>)}
            {!exerciseFields.length ? <p className="py-2 text-xs text-zinc-500">No result fields. Add at least one before saving.</p> : null}
          </div>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input className={inp} placeholder="Default sets" value={exerciseForm.sets} onChange={(event) => setExerciseForm({ ...exerciseForm, sets: event.target.value })} />
          <input className={inp} placeholder="Default reps / duration" value={exerciseForm.reps} onChange={(event) => setExerciseForm({ ...exerciseForm, reps: event.target.value })} />
          <input className={inp} placeholder="Default load" value={exerciseForm.load} onChange={(event) => setExerciseForm({ ...exerciseForm, load: event.target.value })} />
          <button type="button" className={btn} disabled={busy} onClick={() => void saveExercise()}>{exerciseEdit ? 'Save exercise' : 'Add exercise'}</button>
        </div>
        {exerciseEdit ? <button type="button" className={`${btnGhost} mt-2`} onClick={() => { setExerciseEdit(null); setExerciseFields(DEFAULT_RESULT_FIELDS.map((field) => ({ ...field }))); setExerciseForm({ name: '', category: '', description: '', coach_cues: '', sets: '3', reps: '8-10', load: '' }); }}>Cancel edit</button> : null}
        <AdminTable rows={exercises} empty="The shared exercise library is ready for its first entry." onEdit={editExercise} onDelete={(row) => void deleteExercise(row)} cols={[
          { key: 'name', label: 'Exercise', render: (row) => <div><p className="font-medium text-white">{row.name}</p><p className="mt-1 text-xs text-zinc-500">{row.category} · {(row.result_fields ?? []).map((field: Row) => field.label).join(', ')}</p></div> },
          { key: 'default_prescription', label: 'Default', render: (row) => Object.entries(row.default_prescription ?? {}).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || '—' },
          { key: 'active', label: 'Availability', render: (row) => row.active ? 'Active' : 'Archived' },
        ]} />
      </section>
      )}

      {/* ── TAB: TEMPLATES ── */}
      {activeTab === 'templates' && (
        <section className={card}>
          <p className="mb-3 text-[10px] font-mono uppercase text-orange-300">Reusable workout templates</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={inp} placeholder="Template name" value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} />
          <input className={inp} placeholder="Description" value={templateForm.description} onChange={(event) => setTemplateForm({ ...templateForm, description: event.target.value })} />
          <input className={inp} type="number" min="1" max="7" placeholder="Days per week" value={templateForm.days_per_week} onChange={(event) => setTemplateForm({ ...templateForm, days_per_week: event.target.value })} />
        </div>
        <select className={`${inp} mt-2`} value={templateForm.plan_id} onChange={(event) => setTemplateForm({ ...templateForm, plan_id: event.target.value })}>
          <option value="">Any plan…</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
        </select>
        <div className="mt-2 flex flex-wrap gap-2"><button type="button" className={btn} disabled={busy} onClick={() => void saveTemplate()}>{templateEdit ? 'Save template' : 'Add template'}</button>{templateEdit ? <button type="button" className={btnGhost} onClick={() => { setTemplateEdit(null); setTemplateForm({ name: '', description: '', days_per_week: '', plan_id: '' }); }}>Cancel</button> : null}</div>
        <AdminTable rows={templates} empty="Create a reusable weekly workout template." onEdit={editTemplate} onDelete={(row) => void deleteTemplate(row)} cols={[
          { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-white">{row.name}</span> },
          { key: 'description', label: 'Description', render: (row) => <span className="text-zinc-400">{row.description}</span> },
          { key: 'days_per_week', label: 'Days' },
        ]} />
        <div className="mt-4 border-t border-white/[0.08] pt-4">
          <p className="mb-2 text-xs font-semibold text-white">Template exercises</p>
          <div className="grid gap-2 sm:grid-cols-[1.4fr_0.5fr_0.7fr_0.7fr_0.7fr_auto]">
            <select className={inp} value={activeTemplateId} onChange={(event) => { setActiveTemplateId(event.target.value); setTemplateEdit(null); }}><option value="">Choose template…</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
            <input className={inp} type="number" min="1" max="7" aria-label="Template day" value={templateExerciseForm.day_number} onChange={(event) => setTemplateExerciseForm({ ...templateExerciseForm, day_number: event.target.value })} />
            <select className={`${inp} sm:col-span-2`} value={templateExerciseForm.exercise_id} onChange={(event) => setTemplateExerciseForm({ ...templateExerciseForm, exercise_id: event.target.value })}><option value="">Exercise…</option>{exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select>
            <input className={inp} aria-label="Prescription sets" placeholder="Sets" value={templateExerciseForm.sets} onChange={(event) => setTemplateExerciseForm({ ...templateExerciseForm, sets: event.target.value })} />
            <input className={inp} aria-label="Prescription reps" placeholder="Reps" value={templateExerciseForm.reps} onChange={(event) => setTemplateExerciseForm({ ...templateExerciseForm, reps: event.target.value })} />
            <input className={inp} aria-label="Prescription load" placeholder="Load" value={templateExerciseForm.load} onChange={(event) => setTemplateExerciseForm({ ...templateExerciseForm, load: event.target.value })} />
            <button type="button" className={btn} disabled={busy || !activeTemplateId} onClick={() => void addTemplateExercise()}>Add to day</button>
          </div>
          <AdminTable rows={activeTemplateItems} empty="Choose a template and add its prescribed exercises." onDelete={(row) => void deleteTemplateExercise(row)} cols={[
            { key: 'day_number', label: 'Day' }, { key: 'exercise_name', label: 'Exercise' },
            { key: 'prescription', label: 'Prescription', render: (row) => Object.entries(row.prescription ?? {}).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || '—' },
          ]} />
        </div>
      </section>
      )}

      {/* ── TAB: SCHEDULES ── */}
      {activeTab === 'schedules' && (
        <section className={card}>
          <p className="mb-3 text-[10px] font-mono uppercase text-orange-300">Assign training</p>
        <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr]">
          <select className={inp} value={userId} onChange={(event) => { setUserId(event.target.value); void loadMemberData(event.target.value); }}><option value="">Customer…</option>{users.filter((user) => user.role !== 'coach' && user.role !== 'admin').map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select>
          <select className={inp} value={sessionForm.template_id} onChange={(event) => setSessionForm({ ...sessionForm, template_id: event.target.value })}><option value="">Workout template…</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
          <select className={inp} value={sessionForm.mode} onChange={(event) => setSessionForm({ ...sessionForm, mode: event.target.value })}><option value="single">One day</option><option value="weekly">Weekly weekdays</option></select>
        </div>
        {sessionForm.mode === 'single' ? <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr]">
          <label className="text-xs text-zinc-400">Session date<input type="date" className={`${inp} mt-1`} value={sessionForm.scheduled_on} onChange={(event) => setSessionForm({ ...sessionForm, scheduled_on: event.target.value })} /></label>
          <label className="text-xs text-zinc-400">Template day<input type="number" min="1" max="7" className={`${inp} mt-1`} value={sessionForm.day_number} onChange={(event) => setSessionForm({ ...sessionForm, day_number: event.target.value })} /></label>
          <div className="text-xs text-zinc-400">Additional exercises for this day<div className="mt-1 flex flex-wrap gap-x-3 gap-y-2">{exercises.map((exercise) => <label key={exercise.id} className="flex items-center gap-1.5"><input type="checkbox" checked={sessionForm.extraExerciseIds.includes(String(exercise.id))} onChange={(event) => setSessionForm({ ...sessionForm, extraExerciseIds: event.target.checked ? [...sessionForm.extraExerciseIds, String(exercise.id)] : sessionForm.extraExerciseIds.filter((id) => id !== String(exercise.id)) })} />{exercise.name}</label>)}</div></div>
        </div> : <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-zinc-400">Starts on<input type="date" className={`${inp} mt-1`} value={sessionForm.starts_on} onChange={(event) => setSessionForm({ ...sessionForm, starts_on: event.target.value })} /></label>
          <label className="text-xs text-zinc-400">Ends on (optional)<input type="date" className={`${inp} mt-1`} value={sessionForm.ends_on} onChange={(event) => setSessionForm({ ...sessionForm, ends_on: event.target.value })} /></label>
          <div className="sm:col-span-2"><p className="mb-2 text-xs text-zinc-400">Repeat on</p><div className="flex flex-wrap gap-2">{WEEKDAYS.map((day) => <label key={day.value} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-200"><input type="checkbox" checked={sessionForm.weekdays.includes(day.value)} onChange={(event) => setSessionForm({ ...sessionForm, weekdays: event.target.checked ? [...sessionForm.weekdays, day.value] : sessionForm.weekdays.filter((value) => value !== day.value) })} />{day.label}</label>)}</div></div>
        </div>}
        {sessionForm.template_id ? <p className="mt-2 text-xs text-zinc-500">{selectedTemplate?.name}: {templateItems.filter((item) => String(item.template_id) === sessionForm.template_id).length} prescribed exercise(s). One-day assignments can include extra exercises from the library.</p> : null}
        <button type="button" className={`${btn} mt-3`} disabled={busy} onClick={() => void assign()}>{sessionForm.mode === 'single' ? 'Schedule session' : 'Assign weekly schedule'}</button>
        {scheduleEdit ? <button type="button" className={`${btnGhost} ml-2 mt-3`} onClick={() => { setScheduleEdit(null); setSessionForm({ mode: 'single', template_id: '', scheduled_on: '', day_number: '1', starts_on: '', ends_on: '', weekdays: [], extraExerciseIds: [] }); }}>Cancel schedule edit</button> : null}

        {message ? <p role="status" className="mt-3 text-xs text-orange-200">{message}</p> : null}
        <div className="mt-4 border-t border-white/[0.08] pt-4">
          <p className="mb-2 text-xs font-semibold text-white">Weekly assignments</p>
          <AdminTable rows={schedules} empty={userId ? 'No weekly schedules assigned.' : 'Choose a customer to review their schedule.'} onEdit={editSchedule} onDelete={(row) => void deleteSchedule(row)} cols={[
            { key: 'template', label: 'Workout', render: (row) => <span className="text-white">{row.workout_templates?.name ?? templates.find((template) => String(template.id) === String(row.template_id))?.name ?? 'Workout'}</span> },
            { key: 'weekdays', label: 'Weekdays', render: (row) => (Array.isArray(row.weekdays) ? row.weekdays : []).map((value: number) => WEEKDAYS.find((day) => day.value === Number(value))?.label).filter(Boolean).join(', ') },
            { key: 'starts_on', label: 'Starts', render: (row) => ShortDate(row.starts_on) },
            { key: 'ends_on', label: 'Ends', render: (row) => row.ends_on ? ShortDate(row.ends_on) : 'Ongoing' },
          ]} />
          <p className="mb-2 mt-4 text-xs font-semibold text-white">Scheduled sessions and member results</p>
          <AdminTable rows={sessions ?? []} empty={userId ? 'No dated sessions or completed results yet.' : 'Choose a customer to see their sessions.'} onEdit={openSessionEdit} onDelete={(row) => void deleteSession(row)} cols={[
            { key: 'workout', label: 'Workout', render: (row) => <div><p className="font-medium text-white">{row.workout_templates?.name ?? templates.find((template) => String(template.id) === String(row.template_id))?.name ?? 'Workout session'}</p><p className="mt-1 text-xs text-zinc-500">{Array.isArray(row.exercises) ? `${row.exercises.length} exercise(s)` : 'Legacy session'}</p></div> },
            { key: 'scheduled_on', label: 'Date', render: (row) => ShortDate(row.scheduled_on) },
            { key: 'status', label: 'Status' },
            { key: 'completed_on', label: 'Completed', render: (row) => ShortDate(row.completed_on) },
            { key: 'performance', label: 'Results', render: (row) => {
              const results = Array.isArray(row.performance?.exercises) ? row.performance.exercises : [];
              return results.length ? results.map((item: Row) => `${item.name}: ${Object.entries(item.values ?? {}).map(([key, value]) => `${key} ${String(value)}`).join(', ')}`).join(' · ') : String(row.notes?.member_notes ?? '—');
            } },
          ]} />
        </div>
      </section>
      )}

      {/* ── TAB: MISCELLANEOUS ── */}
      {activeTab === 'misc' && (
        <section className={card}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-mono uppercase text-orange-300">Training settings</p>
            <p className="text-[11px] text-zinc-500">Manage the activities available in the member Cardio dropdown. These options are shared across the app.</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-white">Cardio dropdown options</p>
              <p className="text-[11px] text-zinc-500 mb-3">These appear as dropdown choices in the member Cardio screen. Edit labels, toggle active status, or add new activities.</p>
              {miscEdit ? (
                <div className="space-y-2">
                  {Array.isArray(miscSettings) ? miscSettings.map((item, index) => (
                    <div key={String(item.id ?? index)} className="grid gap-2 sm:grid-cols-[1fr_0.3fr_0.2fr_auto] items-center p-2 rounded-lg border border-white/[0.06] bg-white/[0.015]">
                      <input className={inp} placeholder="Activity name" defaultValue={String(item.label ?? '')} onChange={(e) => {
                        const next = [...miscSettings];
                        next[index] = { ...next[index], label: e.target.value };
                        setMiscSettings(next);
                      }} />
                      <input className={inp} placeholder="Icon" defaultValue={String(item.icon ?? '')} onChange={(e) => {
                        const next = [...miscSettings];
                        next[index] = { ...next[index], icon: e.target.value };
                        setMiscSettings(next);
                      }} />
                      <label className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <input type="checkbox" defaultChecked={Boolean(item.active)} onChange={(e) => {
                          const next = [...miscSettings];
                          next[index] = { ...next[index], active: e.target.checked };
                          setMiscSettings(next);
                        }} />
                        Active
                      </label>
                      <button type="button" className={btnGhost} onClick={() => {
                        const next = [...miscSettings];
                        next.splice(index, 1);
                        setMiscSettings(next);
                      }}>Remove</button>
                    </div>
                  )) : <p className="text-[11px] text-zinc-500">No cardio activities configured.</p>}
                  <button type="button" className={btnGhost} onClick={() => {
                    const next = [...(Array.isArray(miscSettings) ? miscSettings : [])];
                    next.push({ id: `custom-${Date.now()}`, label: 'New Activity', icon: 'sports', active: true });
                    setMiscSettings(next);
                  }}>+ Add activity</button>
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={busy} onClick={() => void saveMiscSettings()} className={btn}>{busy ? 'Saving…' : 'Save cardio options'}</button>
                    <button type="button" onClick={() => { setMiscEdit(false); void load(); }} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.08] bg-black/10 p-4">
                  {Array.isArray(miscSettings) && miscSettings.length > 0 ? (
                    <div className="space-y-2">
                      {miscSettings.map((item) => (
                        <div key={String(item.id ?? item.label)} className="flex items-center justify-between gap-3 p-2 rounded-lg border border-white/[0.06] bg-white/[0.015]">
                          <span className="text-sm text-white">{String(item.label ?? 'Activity')}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${item.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500">No cardio activities configured yet.</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setMiscEdit(true)} className={btn}>Edit cardio options</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {sessionEdit ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSessionEdit(null); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="session-edit-title" className={`${card} max-h-[90vh] w-full max-w-2xl overflow-y-auto`}>
          <h3 id="session-edit-title" className="text-base font-semibold text-white">Edit scheduled workout</h3>
          <label className="mt-3 block text-xs text-zinc-400">Session date<input type="date" className={`${inp} mt-1`} value={sessionEditDate} onChange={(event) => setSessionEditDate(event.target.value)} /></label>
          <div className="mt-4 flex flex-wrap gap-2"><select className={`${inp} max-w-sm`} value="" onChange={(event) => addEditExercise(event.target.value)}><option value="">Add an exercise…</option>{exercises.filter((exercise) => !sessionEditExercises.some((item) => String(item.exercise_id) === String(exercise.id))).map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select></div>
          <div className="mt-3 space-y-2">{sessionEditExercises.map((item, index) => <div key={`${item.exercise_id ?? item.name}-${index}`} className="rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-white">{item.name}</p><button type="button" className={btnGhost} onClick={() => setSessionEditExercises((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>
            <div className="mt-2 grid grid-cols-3 gap-2">{['sets', 'reps', 'load'].map((key) => <label key={key} className="text-[10px] uppercase text-zinc-500">{key}<input className={`${inp} mt-1`} value={String(item.prescription?.[key] ?? '')} onChange={(event) => updateEditPrescription(index, key, event.target.value)} /></label>)}</div>
          </div>)}</div>
          <div className="mt-5 flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setSessionEdit(null)}>Cancel</button><button type="button" className={btn} disabled={busy} onClick={() => void saveSessionEdit()}>Save session</button></div>
        </div>
      </div> : null}
    </div>
  );
}
