// AdminScreen — MWFitnessUK staff HQ. Sign-in + management for customers,
// plans, memberships, nutrition, workouts, check-ins and progress.
// Same shared Neon project as the mobile app.
import { FormEvent, useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { UsersAdmin } from './UsersAdmin';
import { PlansAdmin } from './PlansAdmin';
import { MembershipsAdmin } from './MembershipsAdmin';
import { NutritionAdmin } from './NutritionAdmin';
import { WorkoutsAdmin } from './WorkoutsAdmin';
import { CheckinsAdmin, ProgressAdmin } from './ProgressAdmin';
import { MessagesAdmin } from './MessagesAdmin';
import { LeadsAdmin } from './LeadsAdmin';
import { ClientRecordsAdmin } from './ClientRecordsAdmin';
import { VideosAdmin } from './VideosAdmin';
import { ProgrammesAdmin } from './ProgrammesAdmin';
import { PasswordRecovery } from './PasswordRecovery';
import { MemberActivityAdmin } from './MemberActivityAdmin';
import { CommunicationsAdmin } from './CommunicationsAdmin';
import { Row, btn, btnGhost, card } from './fields';
import { loadPublicPlans, PublicPlan } from '../../lib/plans';
import { adminDb, isDemoMode, setAdminDemoMode } from '../../lib/admin/adminDb';
import { resetDemoDb } from '../../lib/admin/demoDb';
import { isAuthorisedAdminEmail } from '../../lib/adminEmails';

// Merged sidebar: duplicated tabs are combined so demo and live share one layout.
// members = user list + per-member app data; plans = catalogue + memberships;
// training = programmes + workouts; checkins = check-ins + progress logs.
type Tab = 'overview' | 'members' | 'plans' | 'nutrition' | 'training' | 'videos' | 'checkins' | 'messages' | 'leads' | 'communications';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'plans', label: 'Plans & memberships' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'training', label: 'Training' },
  { id: 'videos', label: 'Videos' },
  { id: 'checkins', label: 'Check-ins & progress' },
  { id: 'messages', label: 'Messages' },
  { id: 'leads', label: 'Website leads' },
  { id: 'communications', label: 'Notifications & email' },
];

/** Map a plans row (demo store or Neon) onto the public catalogue shape. */
const toPublicPlan = (row: Row): PublicPlan => ({
  id: String(row.id),
  name: String(row.name),
  tag: String(row.tag ?? ''),
  price: Number(row.price ?? 0),
  original_price: row.original_price == null ? null : Number(row.original_price),
  badge: row.badge ?? null,
  is_popular: Boolean(row.is_popular),
  description: String(row.description ?? ''),
  features: Array.isArray(row.features) ? row.features.filter((feature: unknown): feature is string => typeof feature === 'string') : [],
  cta_text: String(row.cta_text ?? 'Get started'),
  kind: row.kind === 'pt' ? 'pt' : 'online',
});

export function AdminScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedMessageClientId, setSelectedMessageClientId] = useState('');
  const [stats, setStats] = useState<{ users: number; activeUsers: number; plans: number; activePlans: number; memberships: number; activeMemberships: number; leads: number | null; newLeads: number | null } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [publicCatalogue, setPublicCatalogue] = useState<PublicPlan[] | null>(null);
  const [publicCatalogueError, setPublicCatalogueError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);

  useEffect(() => {
    if (!neon) return;
    const client = neon;
    client.auth
      .getSession({ query: {} })
      .then(async ({ data }) => {
        const user = data?.user ?? null;
        if (!user) return;
        const { data: profile, error } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
        const emailIsNamedAdmin = isAuthorisedAdminEmail(user.email);
        if (error || (profile?.role !== 'admin' && profile?.role !== 'coach') || (emailIsNamedAdmin && profile?.role !== 'admin')) {
          await client.auth.signOut({});
          return;
        }
        setEmail(user.email ?? '');
        setSignedIn(true);
        void loadStats();
      })
      .catch(() => undefined);
  }, []);

  const loadStats = async () => {
    const db = adminDb();
    if (!db) {
      setStats(null);
      setPublicCatalogue(null);
      setPublicCatalogueError('The database is not configured.');
      return;
    }
    setStatsLoading(true);
    try {
      // The exact same queries run in demo and live mode — only the data source differs.
      const [usersResult, plansResult, membershipsResult, leadsResult] = await Promise.all([
        db.from('profiles').select('id,role', { count: 'exact' }).eq('role', 'athlete'),
        db.from('plans').select('id,active', { count: 'exact' }),
        db.from('memberships').select('id,status,profile_id', { count: 'exact' }),
        db.from('website_leads').select('id,status', { count: 'exact' }),
      ]);
      if (isDemoMode()) {
        const { data: catalogueRows, error: catalogueError } = await db.from('plans').select('*').order('price');
        setPublicCatalogueError(catalogueError ? 'The demo catalogue could not be loaded.' : null);
        setPublicCatalogue(((catalogueRows ?? []) as Row[]).filter((row) => row.active).map(toPublicPlan));
      } else {
        const publicResults = await Promise.all([loadPublicPlans('pt'), loadPublicPlans('online')]);
        setPublicCatalogue(publicResults.flatMap((result) => result.plans));
        setPublicCatalogueError(publicResults.find((result) => result.error)?.error ?? null);
      }
      if (usersResult.error || plansResult.error || membershipsResult.error) {
        setError('We could not load the dashboard totals. Check staff permissions and the profiles, plans and memberships table policies, then refresh.');
        setStats(null);
        return;
      }
      const users = usersResult.data ?? [];
      const plans = plansResult.data ?? [];
      const memberships = membershipsResult.data ?? [];
      const leads = leadsResult.error ? [] : (leadsResult.data ?? []);
      const isActive = (value: unknown) => String(value ?? '').trim().toLowerCase() === 'active';
      const athleteIds = new Set(users.map((row) => String(row.id)));
      const activeMemberIds = new Set(memberships.filter((row) => isActive(row.status) && row.profile_id && athleteIds.has(String(row.profile_id))).map((row) => String(row.profile_id)));
      setStats({
        users: usersResult.count ?? users.length,
        activeUsers: activeMemberIds.size,
        plans: plansResult.count ?? plans.length,
        activePlans: plans.filter((row) => row.active === true).length,
        memberships: membershipsResult.count ?? memberships.length,
        activeMemberships: memberships.filter((row) => isActive(row.status)).length,
        leads: leadsResult.error ? null : (leadsResult.count ?? leads.length),
        newLeads: leadsResult.error ? null : leads.filter((row) => String(row.status ?? '').toLowerCase() === 'new').length,
      });
      setError(null);
    } catch {
      setError(isDemoMode() ? 'Could not reach the demo dataset. Re-open demo mode to try again.' : 'Could not reach the MW Fitness Neon backend. Live figures are unavailable until the connection is restored.');
      setStats(null);
      setPublicCatalogue(null);
      setPublicCatalogueError('Could not load the public website catalogue.');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!neon) {
      setError('Live sign-in is unavailable until the website Neon settings are configured.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await neon.auth.signIn.email({ email: email.trim(), password });
      if (error) throw error;
      const { data: profile, error: profileError } = await neon.from('profiles').select('role').eq('id', data.user!.id).maybeSingle();
      const emailIsNamedAdmin = isAuthorisedAdminEmail(data.user?.email ?? email);
      if (profileError || (profile?.role !== 'admin' && profile?.role !== 'coach') || (emailIsNamedAdmin && profile?.role !== 'admin')) {
        await neon.auth.signOut({});
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
    void neon?.auth.signOut({});
    setSignedIn(false);
    setDemoMode(false);
    setAdminDemoMode(false);
    setTab('overview');
    setStats(null);
    setPassword('');
  };

  const openDemo = () => {
    // Demo mode swaps the data source only — the staff HQ layout is identical to live.
    resetDemoDb();
    setAdminDemoMode(true);
    setDemoMode(true);
    setSignedIn(false);
    setSelectedClientId('');
    setSelectedMessageClientId('');
    setTab('overview');
    setStats(null);
    setError(null);
    void loadStats();
  };

  const exitDemo = () => {
    setAdminDemoMode(false);
    resetDemoDb();
    setDemoMode(false);
    setSelectedClientId('');
    setSelectedMessageClientId('');
    setTab('overview');
    setStats(null);
  };

  if (!signedIn && !demoMode && (forgotMode || new URLSearchParams(window.location.search).get('auth') === 'reset-password')) {
    return <PasswordRecovery onClose={() => { setForgotMode(false); setError(null); if (new URLSearchParams(window.location.search).has('auth')) window.history.replaceState({}, document.title, window.location.pathname); }} />;
  }

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
            <button type="submit" disabled={loading || !neon} className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] disabled:opacity-50 text-black font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg active:scale-[0.98]">
              {loading ? 'Signing in…' : 'Sign in to HQ'}
            </button>
          </form>
          <div className="mt-3 text-right">
            <button type="button" onClick={() => { setForgotMode(true); setError(null); }} className="text-sm text-zinc-400 underline hover:text-white">Forgot password?</button>
          </div>
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <button type="button" onClick={openDemo} className="w-full border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg">
              Preview Demo Mode (Local Sandbox)
            </button>
            <p className="text-xs text-zinc-500 text-center mt-2">Sample data only. Changes stay in this browser session and are never saved to the database.</p>
          </div>
        </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full px-3 pb-5 pt-1 sm:px-5 lg:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-[1680px]">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white">MWFitnessUK HQ</h1>
        {demoMode ? (
          <span className="rounded-md border border-amber-500/60 bg-amber-500/15 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
            DEMO MODE · Sample Data · Local Only
          </span>
        ) : (
          <span className="text-xs text-zinc-400">signed in as {email}</span>
        )}
        <button onClick={demoMode ? exitDemo : signOut} className="text-xs text-zinc-500 underline">
          {demoMode ? 'Exit demo' : 'Sign out'}
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-6">
        <aside className="min-w-0 self-start">
<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:h-full lg:flex-col lg:gap-1.5 lg:rounded-2xl lg:border lg:border-white/[0.08] lg:bg-[#131519] lg:p-3">
        <p className="hidden px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 lg:block">Workspace</p>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={
              tab === t.id
                ? 'flex w-full items-center justify-start rounded-xl bg-orange-500 px-3.5 py-3 text-left text-xs font-semibold text-black shadow-md shadow-orange-950/20 transition'
                : 'flex w-full items-center justify-start rounded-xl border border-transparent bg-white/[0.02] px-3.5 py-3 text-left text-xs font-medium text-zinc-400 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400'
            }
          >
            {t.label}
          </button>
        ))}
      </div>
        </aside>
        <div className="min-w-0 space-y-4">


      {tab === 'overview' && (
        <div className="space-y-4">
          <section className={`${card} !border-white/[0.08] !bg-[#131519]`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Business overview</p><h2 className="mt-1 text-xl font-semibold text-white">MW Fitness performance</h2><p className="mt-1 text-xs text-zinc-500">{isDemoMode() ? 'Totals from the in-memory demo dataset — sample data only.' : 'Totals from Neon database records.'}</p></div>
              <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${stats ? 'bg-emerald-400' : 'bg-amber-400'}`} /><span className="text-xs text-zinc-400">{statsLoading ? 'Refreshing…' : stats ? (isDemoMode() ? 'Demo data loaded' : 'Neon connected') : 'Data unavailable'}</span><button type="button" onClick={() => void loadStats()} disabled={statsLoading} className={btnGhost}>{statsLoading ? 'Refreshing…' : 'Refresh'}</button></div>
            </div>
            {error ? <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</p> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Sign-ups / profiles', value: stats?.users, hint: 'Profiles in Neon', tab: 'members' as Tab, icon: '＋' },
                { label: 'Active memberships', value: stats?.activeMemberships, hint: `${stats?.memberships ?? '—'} total membership records`, tab: 'plans' as Tab, icon: '●' },
                { label: 'Packages available', value: stats?.activePlans, hint: `${stats?.plans ?? '—'} total plans in Neon`, tab: 'plans' as Tab, icon: '↗' },
                { label: 'New enquiries', value: stats?.newLeads, hint: `${stats?.leads == null ? 'Lead data unavailable' : `${stats.leads} total website leads`}`, tab: 'leads' as Tab, icon: '!' },
              ].map((stat) => (
                <button key={stat.label} type="button" onClick={() => setTab(stat.tab)} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1c21] to-[#111216] p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-500/35">
                  <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-orange-500/15 bg-orange-500/[0.08] text-sm text-orange-300">{stat.icon}</span><span className="text-xs font-medium text-zinc-400">{stat.label}</span><span className="mt-3 block text-3xl font-semibold tracking-tight text-white">{statsLoading || stat.value == null ? '—' : stat.value}</span><span className="mt-2 block text-xs text-zinc-500">{stat.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Active member coverage</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" role="img" aria-label={stats && stats.users ? `${Math.round((stats.activeUsers / stats.users) * 100)} percent of live profiles with an active membership` : 'No live active-member data'}>
                      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.07]" />
                      <circle cx="50" cy="50" r="39" fill="none" stroke="#ff5500" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${stats && stats.users ? Math.min(1, stats.activeUsers / stats.users) * 245 : 0} 245`} />
                    </svg><span className="absolute text-lg font-semibold text-white">{stats && stats.users ? `${Math.round((stats.activeUsers / stats.users) * 100)}%` : '—'}</span>
                  </div>
                  <div><p className="text-sm font-medium text-white">Active members</p><p className="mt-1 text-xs leading-5 text-zinc-500">{stats ? `${stats.activeUsers} of ${stats.users} profiles linked to active memberships` : 'Waiting for profile data.'}</p><button type="button" onClick={() => setTab('members')} className="mt-3 text-xs font-semibold text-orange-300">Review members ↗</button></div>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Package readiness</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" role="img" aria-label={stats && stats.plans ? `${Math.round((stats.activePlans / stats.plans) * 100)} percent of plans active` : 'No live plan data'}>
                      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.07]" />
                      <circle cx="50" cy="50" r="39" fill="none" stroke="#ff8a3d" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${stats && stats.plans ? Math.min(1, stats.activePlans / stats.plans) * 245 : 0} 245`} />
                    </svg><span className="absolute text-lg font-semibold text-white">{stats && stats.plans ? `${Math.round((stats.activePlans / stats.plans) * 100)}%` : '—'}</span>
                  </div>
                  <div><p className="text-sm font-medium text-white">Active plans</p><p className="mt-1 text-xs leading-5 text-zinc-500">{stats ? `${stats.activePlans} of ${stats.plans} plans active` : 'Waiting for plan data.'}</p><button type="button" onClick={() => setTab('plans')} className="mt-3 text-xs font-semibold text-orange-300">Manage plans ↗</button></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">Revenue and sales are intentionally omitted until a verified transaction source is connected. Website package defaults are not counted as sales, and frontend/demo defaults are never substituted for live database records.</p>
          </section>
          <section className={`${card} !border-white/[0.08] !bg-[#131519]`}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Public frontend feed</p><h3 className="mt-1 text-lg font-semibold text-white">Published website packages</h3><p className="mt-1 text-xs text-zinc-500">Read-only view of the active package catalogue the public pricing page shows.</p></div>
              <button type="button" onClick={() => setTab('plans')} className={btnGhost}>Manage catalogue ↗</button>
            </div>
            {publicCatalogueError ? <p role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-sm text-amber-200">The public website catalogue could not be loaded: {publicCatalogueError} Prices are not being substituted with stale frontend examples.</p> : null}
            {!publicCatalogueError && publicCatalogue === null ? <p className="text-sm text-zinc-500">Loading published website packages…</p> : null}
            {!publicCatalogueError && publicCatalogue !== null && publicCatalogue.length === 0 ? <p className="rounded-xl border border-dashed border-white/[0.1] p-5 text-sm text-zinc-400">The public catalogue currently returns no active packages. Check Plans &amp; pricing before changing the published website data.</p> : null}
            {!publicCatalogueError && publicCatalogue && publicCatalogue.length > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {publicCatalogue.map((plan) => <div key={plan.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold text-white">{plan.name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">{plan.kind === 'pt' ? 'Personal training' : 'Online coaching'}{plan.tag ? ` · ${plan.tag}` : ''}</p></div><span className="shrink-0 rounded-lg border border-orange-500/20 bg-orange-500/[0.08] px-2.5 py-1.5 text-sm font-semibold text-orange-200">£{plan.price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                {plan.badge ? <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-orange-300">{plan.badge}</p> : null}
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-400">{plan.description || 'No description provided.'}</p>
                <p className="mt-3 text-[10px] uppercase tracking-wider text-emerald-300">Published · active</p>
              </div>)}
            </div> : null}
          </section>
          <section className={`${card} !border-white/[0.08] !bg-[#131519]`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Quick actions</p><h3 className="mt-1 text-lg font-semibold text-white">Run your coaching business</h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Review members', detail: 'Profiles and coaching tiers', tab: 'members' as Tab },
                { label: 'Manage plans & pricing', detail: 'Published packages and prices', tab: 'plans' as Tab },
                { label: 'Assign memberships', detail: 'Membership status and renewals', tab: 'plans' as Tab },
                { label: 'Review check-ins', detail: 'Member feedback and follow-ups', tab: 'checkins' as Tab },
                { label: 'Review progress', detail: 'Weight and progress logs', tab: 'checkins' as Tab },
                { label: 'Open website leads', detail: 'New enquiries and contact requests', tab: 'leads' as Tab },
              ].map((item) => <button key={item.label} type="button" onClick={() => setTab(item.tab)} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-black hover:bg-black/40"><span className="block text-sm font-medium text-white">{item.label} <span className="text-zinc-500">↗</span></span><span className="mt-1 block text-xs text-zinc-500">{item.detail}</span></button>)}
            </div>
          </section>
        </div>
      )}
      {/* Unified tab rendering — demo and live run the same components; only the data source differs. */}
      {tab === 'members' && !selectedClientId && (
        <div className="space-y-4">
          <UsersAdmin onOpenProfile={(profileId) => setSelectedClientId(profileId)} />
          <MemberActivityAdmin />
        </div>
      )}
      {tab === 'members' && selectedClientId && (
        <ClientRecordsAdmin
          initialUserId={selectedClientId}
          onBack={() => setSelectedClientId('')}
          onMessageMember={(profileId) => { setSelectedMessageClientId(profileId); setTab('messages'); }}
        />
      )}
      {tab === 'plans' && (
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Catalogue</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Plans &amp; pricing</h2>
          </div>
          <PlansAdmin />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Assignments</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Memberships</h2>
          </div>
          <MembershipsAdmin />
        </div>
      )}
      {tab === 'nutrition' && <NutritionAdmin />}
      {tab === 'training' && (
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Programmes</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Coaching programmes</h2>
          </div>
          <ProgrammesAdmin />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Sessions</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Workout templates &amp; schedules</h2>
          </div>
          <WorkoutsAdmin />
        </div>
      )}
      {tab === 'videos' && <VideosAdmin />}
      {tab === 'checkins' && (
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Weekly submissions</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Member check-ins</h2>
          </div>
          <CheckinsAdmin />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Weigh-ins</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Progress logs</h2>
          </div>
          <ProgressAdmin />
        </div>
      )}
      {tab === 'messages' && <MessagesAdmin initialAthleteId={selectedMessageClientId} />}
      {tab === 'leads' && <LeadsAdmin />}
      {demoMode && tab === 'communications' && (
        <section className={`${card} !rounded-2xl !border-orange-500/20 !bg-[#131519] space-y-5`}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Live tools · sign-in required</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Email &amp; notifications</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">This is a demo workspace. We do not show fake email templates or pretend sample broadcasts are real. Exit demo and sign in to access the live communications centre.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { title: 'Email template studio', detail: 'Edit subject, preheader, HTML and plain text with a rendered preview and versioning.' },
              { title: 'Individual email & broadcasts', detail: 'Select one member or an eligible audience, preview recipient counts and confirm before sending.' },
              { title: 'Notifications', detail: 'Compose push and in-app notifications with explicit delivery outcomes.' },
              { title: 'Automations', detail: 'Manage supported website acknowledgement triggers; unsupported app/scheduled triggers stay locked.' },
              { title: 'Delivery history', detail: 'Review communication events and failures rather than invented sample records.' },
            ].map((item) => <div key={item.title} className="rounded-xl border border-white/[0.07] bg-black/10 p-4"><h3 className="text-sm font-medium text-white">{item.title}</h3><p className="mt-2 text-xs leading-5 text-zinc-400">{item.detail}</p></div>)}
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
            <p className="flex-1 text-xs leading-5 text-zinc-400">Live communications data requires the reviewed communications schema and a verified sender configuration. No migration or email is triggered from demo mode.</p>
            <button type="button" onClick={exitDemo} className={btn}>Exit demo and sign in</button>
          </div>
        </section>
      )}
        </div>
      </div>
      </div>
    </div>
  );
}
