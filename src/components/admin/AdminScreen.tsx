// AdminScreen — MWFitnessUK staff HQ. Sign-in + management for customers,
// plans, memberships, nutrition, workouts, check-ins and progress.
// Same shared Supabase project as the mobile app.
import { FormEvent, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UsersAdmin } from './UsersAdmin';
import { PlansAdmin } from './PlansAdmin';
import { MembershipsAdmin } from './MembershipsAdmin';
import { NutritionAdmin } from './NutritionAdmin';
import { WorkoutsAdmin } from './WorkoutsAdmin';
import { CheckinsAdmin, ProgressAdmin } from './ProgressAdmin';
import { MessagesAdmin } from './MessagesAdmin';
import { AdminTable, Row, btn, btnGhost, card, inp } from './fields';

type Tab = 'overview' | 'users' | 'plans' | 'memberships' | 'nutrition' | 'workouts' | 'checkins' | 'progress' | 'messages';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'plans', label: 'Plans' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'checkins', label: 'Check-ins' },
  { id: 'progress', label: 'Progress' },
  { id: 'messages', label: 'Messages' },
];

type DemoTab = Exclude<Tab, 'overview'>;

const DEMO_TABLES: Record<DemoTab, { columns: { key: string; label: string }[]; rows: Row[] }> = {
  users: {
    columns: [{ key: 'name', label: 'Customer' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'tier', label: 'Tier' }],
    rows: [
      { id: 'demo-user-1', name: 'Alex Morgan', email: 'alex@example.test', role: 'athlete', tier: 'Gold' },
      { id: 'demo-user-2', name: 'Jamie Reed', email: 'jamie@example.test', role: 'athlete', tier: 'Online' },
    ],
  },
  plans: {
    columns: [{ key: 'name', label: 'Plan' }, { key: 'price', label: 'Price' }, { key: 'kind', label: 'Type' }, { key: 'status', label: 'Status' }],
    rows: [
      { id: 'demo-plan-1', name: 'Gold Coaching', price: '£175.00', kind: 'PT', status: 'Active' },
      { id: 'demo-plan-2', name: '12-week Online', price: '£399.99', kind: 'Online', status: 'Active' },
    ],
  },
  memberships: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }, { key: 'renewal', label: 'Next renewal' }],
    rows: [{ id: 'demo-membership-1', customer: 'Alex Morgan', plan: 'Gold Coaching', status: 'Active', renewal: '12 Oct 2026' }],
  },
  nutrition: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'plan', label: 'Nutrition plan' }, { key: 'calories', label: 'Daily target' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-nutrition-1', customer: 'Alex Morgan', plan: 'Training day', calories: '2,250 kcal', status: 'Assigned' }],
  },
  workouts: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'session', label: 'Session' }, { key: 'date', label: 'Scheduled' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-workout-1', customer: 'Jamie Reed', session: 'Full body A', date: '30 Sep 2026', status: 'Planned' }],
  },
  checkins: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'date', label: 'Submitted' }, { key: 'scores', label: 'Wellbeing' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-checkin-1', customer: 'Alex Morgan', date: '27 Sep 2026', scores: 'Sleep 8 · Energy 7', status: 'Needs review' }],
  },
  progress: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'date', label: 'Recorded' }, { key: 'weight', label: 'Weight' }, { key: 'note', label: 'Note' }],
    rows: [{ id: 'demo-progress-1', customer: 'Alex Morgan', date: '27 Sep 2026', weight: '81.6 kg', note: 'Weekly check-in' }],
  },
  messages: {
    columns: [{ key: 'customer', label: 'Athlete' }, { key: 'from', label: 'From' }, { key: 'message', label: 'Message' }, { key: 'status', label: 'Push status' }],
    rows: [{ id: 'demo-message-1', customer: 'Alex Morgan', from: 'Coach', message: 'Great work staying consistent this week.', status: 'Sample only' }],
  },
};

function createDemoRows(): Record<DemoTab, Row[]> {
  return Object.fromEntries(
    Object.entries(DEMO_TABLES).map(([key, table]) => [key, table.rows.map((row) => ({ ...row }))]),
  ) as Record<DemoTab, Row[]>;
}

export function AdminScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<{ users: number; plans: number; memberships: number } | null>(null);
  const [demoRows, setDemoRows] = useState<Record<DemoTab, Row[]>>(createDemoRows);
  const [demoEditorOpen, setDemoEditorOpen] = useState(false);
  const [demoEditId, setDemoEditId] = useState<string | null>(null);
  const [demoDraft, setDemoDraft] = useState<Row>({});
  const [demoNotice, setDemoNotice] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const user = data.session?.user;
        if (!user) return;
        const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (error || (profile?.role !== 'admin' && profile?.role !== 'coach')) {
          await supabase.auth.signOut();
          return;
        }
        setEmail(user.email ?? '');
        setSignedIn(true);
        void loadStats();
      })
      .catch(() => undefined);
  }, []);

  const loadStats = async () => {
    const u = await supabase!.from('profiles').select('id', { count: 'exact', head: true });
    const p = await supabase!.from('plans').select('id', { count: 'exact', head: true });
    const m = await supabase!.from('memberships').select('id', { count: 'exact', head: true });
    if (u.error || p.error || m.error) {
      setError('Signed in but no admin access or tables are not ready yet.');
      await supabase!.auth.signOut();
      setSignedIn(false);
      setStats(null);
      return;
    }
    setStats({ users: u.count ?? 0, plans: p.count ?? 0, memberships: m.count ?? 0 });
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError('Live sign-in is unavailable until the website Supabase settings are configured.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user!.id).maybeSingle();
      if (profileError || (profile?.role !== 'admin' && profile?.role !== 'coach')) {
        await supabase.auth.signOut();
        setError('This account does not have admin access.');
        return;
      }
      setDemoMode(false);
      setSignedIn(true);
      setEmail(data.user?.email ?? email.trim());
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    void supabase?.auth.signOut();
    setSignedIn(false);
    setDemoMode(false);
    setTab('overview');
    setStats(null);
    setPassword('');
  };

  const openDemo = () => {
    setDemoRows(createDemoRows());
    setDemoNotice('');
    setDemoMode(true);
    setSignedIn(false);
    setTab('overview');
    setStats(null);
    setError(null);
  };

  const exitDemo = () => {
    setDemoRows(createDemoRows());
    setDemoNotice('');
    setDemoEditorOpen(false);
    setDemoMode(false);
    setTab('overview');
  };

  const openDemoEditor = (row?: Row) => {
    if (tab === 'overview') return;
    const draft: Row = {};
    for (const column of DEMO_TABLES[tab].columns) draft[column.key] = row?.[column.key] ?? '';
    setDemoDraft(draft);
    setDemoEditId(row ? String(row.id) : null);
    setDemoNotice('');
    setDemoEditorOpen(true);
  };

  const saveDemoRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!demoMode || tab === 'overview') return;
    const currentTab = tab;
    const rowId = demoEditId ?? `demo-${currentTab}-${Date.now()}`;
    const savedRow = { ...demoDraft, id: rowId };
    setDemoRows((current) => ({
      ...current,
      [currentTab]: demoEditId
        ? current[currentTab].map((row) => row.id === demoEditId ? savedRow : row)
        : [...current[currentTab], savedRow],
    }));
    setDemoNotice('Sample change applied in this demo only. Nothing was sent to the database.');
    setDemoEditorOpen(false);
  };

  const removeDemoRow = (row: Row) => {
    if (!demoMode || tab === 'overview') return;
    const currentTab = tab;
    setDemoRows((current) => ({
      ...current,
      [currentTab]: current[currentTab].filter((item) => item.id !== row.id),
    }));
    setDemoNotice('Sample row removed in this demo only. Nothing was sent to the database.');
  };

  if (!signedIn && !demoMode) {
    return (
      <div className="min-h-[70vh] w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
        <div className="w-full max-w-md">
          <p className="font-mono text-[11px] text-orange-400 uppercase tracking-wider mb-2">Staff only</p>
          <h1 className="text-3xl font-bold text-white mb-1">MWFitnessUK HQ</h1>
          <p className="text-sm text-zinc-400 mb-8">Manage users, plans, nutrition and everything else — shared with the mobile app.</p>
          <form onSubmit={(e) => { e.preventDefault(); void handleSignIn(e); }} className="space-y-4">
            <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="you@mwfitness.co.uk" className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]" />
            <input type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} placeholder="Password" className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading || !supabase} className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] disabled:opacity-50 text-black font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg active:scale-[0.98]">
              {loading ? 'Signing in…' : 'Sign in to HQ'}
            </button>
          </form>
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <button type="button" onClick={openDemo} className="w-full border border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg">
              Preview sample admin data
            </button>
            <p className="text-xs text-zinc-500 text-center mt-2">Try sample edits safely. Changes stay in this browser session and are never saved or sent.</p>
          </div>
        </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[60vh] w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">MWFitnessUK HQ</h1>
        {demoMode ? <span className="border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-[10px] font-mono font-bold uppercase text-orange-300">Demo · sample data</span> : <span className="text-xs text-zinc-400">signed in as {email}</span>}
        <button onClick={demoMode ? exitDemo : signOut} className="text-xs text-zinc-500 underline">
          {demoMode ? 'Exit demo' : 'Sign out'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? 'bg-[#ff5500] text-black font-mono font-bold text-xs uppercase px-3 py-2 rounded-lg'
                : 'border border-zinc-700 text-zinc-400 font-mono text-xs uppercase px-3 py-2 rounded-lg hover:bg-zinc-800'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Customers" value={demoMode ? 12 : stats?.users} />
          <Stat label="Plans" value={demoMode ? 7 : stats?.plans} />
          <Stat label="Memberships" value={demoMode ? 9 : stats?.memberships} />
        </div>
      )}
      {tab === 'overview' && !demoMode && (
        <div className={`${card} text-sm text-zinc-300`}>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Quick start</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Boot demo customers: <b>Users → Add demo customers</b> (creates sign-in accounts + profiles).</li>
            <li>Edit a customer's role, tier and weights: <b>Users → Edit</b>.</li>
            <li>Assign a plan: <b>Memberships</b>.</li>
            <li>Next, give the customer a diet: <b>Nutrition → Meal templates → assign</b>.</li>
            <li>Schedule sessions: <b>Workouts</b>; review check-ins: <b>Check-ins</b>; log weigh-ins: <b>Progress</b>.</li>
          </ul>
          <p className="mt-3 text-zinc-500">
            The mobile app reads all of this from the same database (sign in as the customer in Expo Go to see it live).
          </p>
        </div>
      )}
      {demoMode && tab === 'overview' && <div className={`${card} text-sm text-zinc-300`}><p className="font-mono text-[10px] uppercase text-orange-300 mb-2">Interactive sample preview</p><p>Explore and edit fictional records in each section. Changes stay in this browser session and reset when you exit demo. Live records are only changed after staff sign-in.</p></div>}
      {demoMode && tab !== 'overview' && (
        <div className={`${card} space-y-4`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase text-orange-300">{TABS.find((item) => item.id === tab)?.label} · sample records</p>
              <p className="mt-1 text-xs text-zinc-500">Edits are simulated locally and never reach Supabase.</p>
            </div>
            <button type="button" onClick={() => openDemoEditor()} className={btn}><Plus className="h-4 w-4" aria-hidden="true" /> Add sample</button>
          </div>
          <AdminTable rows={demoRows[tab]} cols={DEMO_TABLES[tab].columns} empty="No sample records." onEdit={openDemoEditor} onDelete={removeDemoRow} />
          {demoNotice ? <p role="status" className="text-xs text-orange-200">{demoNotice}</p> : null}
        </div>
      )}
      {!demoMode && tab === 'users' && <UsersAdmin />}
      {!demoMode && tab === 'plans' && <PlansAdmin />}
      {!demoMode && tab === 'memberships' && <MembershipsAdmin />}
      {!demoMode && tab === 'nutrition' && <NutritionAdmin />}
      {!demoMode && tab === 'workouts' && <WorkoutsAdmin />}
      {!demoMode && tab === 'checkins' && <CheckinsAdmin />}
      {!demoMode && tab === 'progress' && <ProgressAdmin />}
      {!demoMode && tab === 'messages' && <MessagesAdmin />}
      {demoEditorOpen && demoMode && tab !== 'overview' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDemoEditorOpen(false); }}>
          <form onSubmit={saveDemoRow} role="dialog" aria-modal="true" aria-labelledby="demo-editor-title" className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-zinc-700 bg-[#121315] p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-orange-300">Demo only · not saved</p>
                <h2 id="demo-editor-title" className="mt-1 text-lg font-semibold text-white">{demoEditId ? 'Edit sample record' : 'Add sample record'}</h2>
              </div>
              <button type="button" onClick={() => setDemoEditorOpen(false)} className={btnGhost} aria-label="Close sample editor"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {DEMO_TABLES[tab].columns.map((column) => (
                <label key={column.key} className="grid gap-1 text-xs text-zinc-400">
                  {column.label}
                  <input className={inp} value={String(demoDraft[column.key] ?? '')} onChange={(event) => setDemoDraft((draft) => ({ ...draft, [column.key]: event.target.value }))} />
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setDemoEditorOpen(false)} className={btnGhost}>Cancel</button>
              <button type="submit" className={btn}>{demoEditId ? 'Apply sample edit' : 'Add sample record'}</button>
            </div>
          </form>
        </div>
      ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-xl bg-[#16181d] border border-zinc-700 p-3">
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}