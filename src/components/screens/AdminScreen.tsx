// AdminScreen — staff sign-in + management overview for MWFitnessUK.
// Uses the SAME Supabase project as the mobile app (shared database).
// Protected by role: only `profiles.role` in (admin, coach) can get past login.
import { FormEvent, useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type AdminStats = { users: number; plans: number; memberships: number };

export function AdminScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [configured, setConfigured] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!configured || !supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) return;
        setSignedIn(true);
        setUserEmail(data.session.user.email ?? '');
        void loadStats();
      })
      .catch(() => undefined);
  }, [configured]);

  const loadStats = async () => {
    const c = supabase as SupabaseClient;
    const usersResult = await c.from('profiles').select('id', { count: 'exact', head: true });
    const plansResult = await c.from('plans').select('id', { count: 'exact', head: true });
    const membershipsResult = await c.from('memberships').select('id', { count: 'exact', head: true });
    if (usersResult.error || plansResult.error || membershipsResult.error) {
      setError('You are signed in but do not have admin access, or the tables are not ready yet.');
      await c.auth.signOut();
      setSignedIn(false);
      setStats(null);
      return;
    }
    setStats({
      users: usersResult.count ?? 0,
      plans: plansResult.count ?? 0,
      memberships: membershipsResult.count ?? 0,
    });
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!configured || !supabase) {
        setError('Admin panel not configured yet — add the VITE_SUPABASE_* env vars on Vercel.');
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('No session returned.');

      // Role gate — same profiles table the mobile app uses.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      const role = profile?.role as string | undefined;
      if (role !== 'admin' && role !== 'coach') {
        await supabase.auth.signOut();
        setError('This account does not have admin access.');
        return;
      }
      setUserEmail(data.user.email ?? '');
      setSignedIn(true);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    void supabase?.auth.signOut();
    setSignedIn(false);
    setStats(null);
    setError(null);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <p className="font-mono text-[11px] text-orange-400 uppercase tracking-wider mb-2">Staff only</p>
        <h1 className="text-3xl font-bold text-white mb-1">MWFitnessUK HQ</h1>
        <p className="text-sm text-zinc-400 mb-8">Manage users, plans and memberships — shared with the mobile app.</p>

        {!configured && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 text-sm mb-6">
            Not configured. Add <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> on Vercel, then redeploy.
          </div>
        )}

        {!signedIn ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mwfitness.co.uk"
              className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg active:scale-[0.98]"
            >
              {loading ? 'Signing in…' : 'Sign in to HQ'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">Signed in as <span className="text-white font-medium">{userEmail}</span></p>
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Users" value={stats.users} />
                <StatCard label="Plans" value={stats.plans} />
                <StatCard label="Memberships" value={stats.memberships} />
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleSignOut}
              className="w-full border border-zinc-700 text-zinc-300 font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-lg"
            >
              Sign out
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-zinc-500 underline text-center"
            >
              Open Supabase dashboard (full tables editor)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#16181d] border border-zinc-700 p-3">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}