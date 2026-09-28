// AdminScreen — MWFitnessUK staff HQ. Sign-in + management for customers,
// plans, memberships, nutrition, workouts, check-ins and progress.
// Same shared Supabase project as the mobile app.
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UsersAdmin } from './UsersAdmin';
import { PlansAdmin } from './PlansAdmin';
import { MembershipsAdmin } from './MembershipsAdmin';
import { NutritionAdmin } from './NutritionAdmin';
import { WorkoutsAdmin } from './WorkoutsAdmin';
import { CheckinsAdmin, ProgressAdmin } from './ProgressAdmin';
import { card } from './fields';

type Tab = 'overview' | 'users' | 'plans' | 'memberships' | 'nutrition' | 'workouts' | 'checkins' | 'progress';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'plans', label: 'Plans' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'checkins', label: 'Check-ins' },
  { id: 'progress', label: 'Progress' },
];

export function AdminScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<{ users: number; plans: number; memberships: number } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) return;
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
    setLoading(true);
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const { data: profile } = await supabase!.from('profiles').select('role').eq('id', data.user!.id).maybeSingle();
      const role = profile?.role as string | undefined;
      if (role !== 'admin' && role !== 'coach') {
        await supabase!.auth.signOut();
        setError('This account does not have admin access.');
        return;
      }
      setSignedIn(true);
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
    setTab('overview');
    setStats(null);
  };

  if (!signedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <p className="font-mono text-[11px] text-orange-400 uppercase tracking-wider mb-2">Staff only</p>
          <h1 className="text-3xl font-bold text-white mb-1">MWFitnessUK HQ</h1>
          <p className="text-sm text-zinc-400 mb-8">Manage users, plans, nutrition and everything else — shared with the mobile app.</p>
          <form onSubmit={(e) => { e.preventDefault(); void handleSignIn(e); }} className="space-y-4">
            <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="you@mwfitness.co.uk" className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]" />
            <input type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} placeholder="Password" className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg active:scale-[0.98]">
              {loading ? 'Signing in…' : 'Sign in to HQ'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[60vh] px-4 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">MWFitnessUK HQ</h1>
        <span className="text-xs text-zinc-400">signed in as {email}</span>
        <button onClick={signOut} className="text-xs text-zinc-500 underline">
          Sign out
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
          <Stat label="Customers" value={stats?.users} />
          <Stat label="Plans" value={stats?.plans} />
          <Stat label="Memberships" value={stats?.memberships} />
        </div>
      )}
      {tab === 'overview' && (
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
      {tab === 'users' && <UsersAdmin />}
      {tab === 'plans' && <PlansAdmin />}
      {tab === 'memberships' && <MembershipsAdmin />}
      {tab === 'nutrition' && <NutritionAdmin />}
      {tab === 'workouts' && <WorkoutsAdmin />}
      {tab === 'checkins' && <CheckinsAdmin />}
      {tab === 'progress' && <ProgressAdmin />}
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