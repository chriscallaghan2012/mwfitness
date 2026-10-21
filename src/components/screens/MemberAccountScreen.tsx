// MemberAccountScreen — member-facing account portal at /account.
// Separate from Staff HQ (/admin). Any registered member can sign in here to view
// their membership status and reset their password.
import React, { FormEvent, useEffect, useState } from 'react';
import { ScreenId } from '../../types';
import { neon, isNeonConfigured } from '../../lib/neon';
import { Eye, EyeOff, LogOut, Lock, CheckCircle2, AlertCircle, ChevronRight, Smartphone, RefreshCw } from 'lucide-react';

interface Props {
  onSelectScreen: (screen: ScreenId) => void;
}

type View = 'signin' | 'dashboard' | 'reset-request' | 'reset-confirm';

interface MemberProfile {
  full_name: string;
  email: string;
}

interface MemberMembership {
  id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  plan_name: string;
  plan_price: number;
  plan_kind: string;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusColor(s: string) {
  if (s === 'active' || s === 'trialing') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (s === 'past_due') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (s === 'canceled') return 'text-zinc-400 bg-zinc-700/20 border-zinc-600/30';
  return 'text-zinc-300 bg-zinc-700/20 border-zinc-600/30';
}

// ── Main component ───────────────────────────────────────────────────────────
export function MemberAccountScreen({ onSelectScreen }: Props) {
  const params = new URLSearchParams(window.location.search);
  const initialView: View =
    params.get('auth') === 'reset-password' && params.get('member') === '1'
      ? 'reset-confirm'
      : 'signin';

  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Dashboard state
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [memberships, setMemberships] = useState<MemberMembership[]>([]);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState('');

  // Reset state
  const [token, setToken] = useState(params.get('token') ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Auto-restore session on mount
  useEffect(() => {
    if (!isNeonConfigured || !neon) return;
    void neon.auth.getSession({ query: {} }).then(async ({ data }) => {
      if (!data?.user) return;
      await loadDashboard(data.user.id, data.user.email ?? '');
      setView('dashboard');
    }).catch(() => undefined);
  }, []);

  const loadDashboard = async (userId: string, userEmail: string) => {
    if (!neon) return;
    setDashLoading(true);
    setDashError('');
    setProfile({ full_name: userEmail.split('@')[0], email: userEmail });
    try {
      const [profileResult, membershipResult] = await Promise.all([
        neon.from('profiles').select('full_name,email').eq('id', userId).maybeSingle(),
        neon.from('memberships')
          .select('id,status,current_period_start,current_period_end,created_at,plans(name,price,kind)')
          .eq('profile_id', userId)
          .order('created_at', { ascending: false })
          .limit(12),
      ]);
      if (profileResult.error || membershipResult.error) {
        throw new Error('Account data could not be loaded.');
      }
      const prof = profileResult.data;
      const mems = membershipResult.data;
      setProfile({ full_name: String(prof?.full_name ?? userEmail.split('@')[0]), email: userEmail });
      const rows: MemberMembership[] = ((mems ?? []) as Record<string, any>[]).map((m) => {
        const plan = Array.isArray(m.plans) ? m.plans[0] : m.plans;
        return {
          id: String(m.id),
          status: String(m.status ?? 'active'),
          current_period_start: m.current_period_start ? String(m.current_period_start) : null,
          current_period_end: m.current_period_end ? String(m.current_period_end) : null,
          created_at: String(m.created_at ?? ''),
          plan_name: String(plan?.name ?? 'MW Fitness Plan'),
          plan_price: Number(plan?.price ?? 0),
          plan_kind: String(plan?.kind ?? 'online'),
        };
      });
      setMemberships(rows);
    } catch {
      setMemberships([]);
      setDashError('We could not load your account details. Please try again later.');
    } finally {
      setDashLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isNeonConfigured || !neon) { setError('Account portal is temporarily unavailable. Please try again later.'); return; }
    if (!email.trim() || !password) { setError('Enter your email and password to continue.'); return; }
    setLoading(true);
    try {
      const { data, error: authError } = await neon.auth.signIn.email({ email: email.trim(), password });
      if (authError) throw authError;
      if (!data?.user) throw new Error('No session returned.');
      await loadDashboard(data.user.id, data.user.email ?? email.trim());
      setView('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (neon) await neon.auth.signOut({});
    setProfile(null);
    setMemberships([]);
    setEmail('');
    setPassword('');
    setView('signin');
    window.history.replaceState({}, '', '/account');
  };

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!neon) { setError('Password reset is unavailable.'); return; }
    if (!email.trim()) { setError('Enter your account email address.'); return; }
    setLoading(true);
    try {
      const { error: resetError } = await neon.auth.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/account?auth=reset-password&member=1`,
      });
      if (resetError) throw resetError;
      setNotice('If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!neon) { setError('Password reset is unavailable.'); return; }
    if (!token.trim()) { setError('The reset token is missing. Open the link from your email.'); return; }
    if (newPassword.length < 8) { setError('Choose a password of at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: resetError } = await neon.auth.resetPassword({ newPassword, token: token.trim() });
      if (resetError) throw resetError;
      setNotice('Password updated. You can now sign in with your new password.');
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
      setView('signin');
      window.history.replaceState({}, '', '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password. Request a fresh reset link.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const field = 'w-full rounded-lg border border-zinc-700 bg-[#0e1014] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]/30 transition';
  const primaryBtn = 'w-full rounded-lg bg-[#ff5500] hover:bg-[#ff6a1f] active:scale-[0.98] px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,85,0,0.2)] transition disabled:opacity-50 disabled:pointer-events-none';
  const ghostBtn = 'w-full rounded-lg border border-zinc-700 hover:border-zinc-500 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition';

  // ── Render: sign-in ────────────────────────────────────────────────────────
  if (view === 'signin') return (
    <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <button onClick={() => onSelectScreen('home')} className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-[#ff5500] flex items-center justify-center font-bold text-lg text-white">MW</div>
            <div className="text-left">
              <p className="font-mono text-xl font-bold uppercase tracking-widest text-white">MWFitness<span className="text-[#ff5500]">UK</span></p>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Member Portal</p>
            </div>
          </button>
          <h1 className="text-2xl font-bold text-white">Sign in to your account</h1>
          <p className="text-sm text-zinc-400 mt-1">View your membership details</p>
        </div>

        {notice && <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" className={field} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={`${field} pr-11`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <div className="flex items-start gap-2 text-sm text-red-400"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}</div>}
          <button type="submit" disabled={loading} className={primaryBtn}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <div className="space-y-2">
          <button type="button" onClick={() => { setError(''); setNotice(''); setView('reset-request'); }} className={ghostBtn}>Forgot password?</button>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Not a member yet?{' '}
          <button onClick={() => onSelectScreen('online-coaching')} className="text-[#ff5500] hover:text-[#ff6a1f] font-semibold">View plans</button>
          {' '}or{' '}
          <button onClick={() => onSelectScreen('admin')} className="text-zinc-400 hover:text-white">Staff login →</button>
        </p>
      </div>
    </div>
  );

  // ── Render: password reset request ─────────────────────────────────────────
  if (view === 'reset-request') return (
    <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-orange-400">Account recovery</p>
          <h1 className="text-2xl font-bold text-white mt-1">Reset your password</h1>
          <p className="text-sm text-zinc-400 mt-1">Enter your account email and we'll send you a secure reset link.</p>
        </div>
        {notice ? (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>
        ) : dashError ? (
          <section role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
            {dashError}
          </section>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Your account email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" className={field} />
            </div>
            {error && <div className="flex items-start gap-2 text-sm text-red-400"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}</div>}
            <button type="submit" disabled={loading} className={primaryBtn}>{loading ? 'Sending…' : 'Send reset link'}</button>
          </form>
        )}
        <button type="button" onClick={() => { setError(''); setNotice(''); setView('signin'); }} className={ghostBtn}>Back to sign in</button>
      </div>
    </div>
  );

  // ── Render: password reset confirm ─────────────────────────────────────────
  if (view === 'reset-confirm') return (
    <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-orange-400">Account recovery</p>
          <h1 className="text-2xl font-bold text-white mt-1">Choose a new password</h1>
        </div>
        <form onSubmit={handleCompleteReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Reset token</label>
            <input type="text" required value={token} onChange={e => setToken(e.target.value)} placeholder="Token from your reset email" autoComplete="one-time-code" className={field} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">New password</label>
            <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" className={field} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm new password</label>
            <input type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" autoComplete="new-password" className={field} />
          </div>
          {error && <div className="flex items-start gap-2 text-sm text-red-400"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}</div>}
          {notice && <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}
          <button type="submit" disabled={loading} className={primaryBtn}>{loading ? 'Updating password…' : 'Set new password'}</button>
        </form>
        <button type="button" onClick={() => { setError(''); setNotice(''); setView('signin'); window.history.replaceState({}, '', '/account'); }} className={ghostBtn}>Back to sign in</button>
      </div>
    </div>
  );

  // ── Render: member dashboard ───────────────────────────────────────────────
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const latestMembership = memberships[0] ?? null;

  return (
    <div className="min-h-screen bg-[#0b0c0e]">
      {/* Header */}
      <div className="border-b border-[#1c1f26] bg-[#0e1014]">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onSelectScreen('home')} className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-[#ff5500] flex items-center justify-center font-bold text-sm text-white">MW</div>
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">MWFitness<span className="text-[#ff5500]">UK</span></span>
            </button>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">My Account</span>
          </div>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded transition">
            <LogOut className="w-3.5 h-3.5" />Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
        {/* Greeting */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#ff5500]">Member Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Hello, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-zinc-400">{profile?.email}</p>
        </div>

        {dashLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 text-[#ff5500] animate-spin" />
            <span className="ml-3 text-sm text-zinc-400">Loading your account…</span>
          </div>
        ) : (
          <>
            {/* Active plan card */}
            {latestMembership ? (
              <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#141619] to-[#0e1013] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff5500]">{latestMembership.status === 'active' || latestMembership.status === 'trialing' ? 'Current plan' : 'Most recent plan'}</p>
                    <h2 className="mt-1 text-xl font-bold text-white">{latestMembership.plan_name}</h2>
                    <p className="text-sm text-zinc-400 capitalize mt-0.5">{latestMembership.plan_kind === 'online' ? 'Online Coaching' : 'Personal Training'}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColor(latestMembership.status)}`}>
                    {latestMembership.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Plan price</p>
                    <p className="mt-1 text-lg font-bold text-white">£{latestMembership.plan_price.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Member since</p>
                    <p className="mt-1 text-sm font-semibold text-white">{fmtDate(latestMembership.created_at)}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Valid until</p>
                    <p className="mt-1 text-sm font-semibold text-white">{fmtDate(latestMembership.current_period_end)}</p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
                <p className="text-zinc-400 text-sm">No active plan found. Contact your coach or browse available plans.</p>
                <button onClick={() => onSelectScreen('online-coaching')} className="mt-4 inline-flex items-center gap-2 text-[#ff5500] text-sm font-semibold hover:text-[#ff6a1f]">View plans <ChevronRight className="w-4 h-4" /></button>
              </section>
            )}

            <section className="rounded-2xl border border-white/[0.08] bg-[#0e1013] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-bold text-white">Membership history</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Payment receipts are not available in this account yet.</p>
              </div>
              {memberships.length === 0 ? (
                <p className="px-6 py-5 text-sm text-zinc-400">No membership records are linked to this account.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-500">Plan</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-500">Date</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {memberships.map((m) => (
                        <tr key={m.id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">{m.plan_name}</p>
                            <p className="text-xs text-zinc-500 capitalize">{m.plan_kind === 'online' ? 'Online Coaching' : 'Personal Training'}</p>
                          </td>
                          <td className="px-6 py-4 text-zinc-300">{fmtDate(m.current_period_start || m.created_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(m.status)}`}>
                              {m.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* App download promo */}
            <section className="rounded-2xl border border-[#ff5500]/20 bg-gradient-to-r from-[#ff5500]/5 to-transparent p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-[#ff5500]" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff5500]">Full programme access</p>
                <h3 className="mt-1 text-base font-bold text-white">Get the MW Fitness app</h3>
                <p className="mt-1 text-sm text-zinc-400">Track workouts, nutrition, check-ins and progress in real time — all synced with your coach.</p>
              </div>
              <button onClick={() => onSelectScreen('app')} className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#ff5500] hover:bg-[#ff6a1f] px-4 py-2.5 text-xs font-mono font-bold uppercase text-black transition">
                Download app <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* Account actions */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0e1013] divide-y divide-white/[0.05]">
              <div className="px-6 py-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Account</p>
              </div>
              <button
                onClick={() => { setError(''); setNotice(''); setView('reset-request'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Change password</p>
                    <p className="text-xs text-zinc-500">Send a secure reset link to your email</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition" />
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400">Sign out</p>
                  <p className="text-xs text-zinc-500">End this session on this device</p>
                </div>
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
