import { FormEvent, useState } from 'react';
import { neon } from '../../lib/neon';

type Props = { onClose: () => void };

const STAFF_ADMIN_EMAILS = new Set(['instantonlinesuccess@gmail.com', 'mwfitnessukonline@gmail.com']);

export function PasswordRecovery({ onClose }: Props) {
  const params = new URLSearchParams(window.location.search);
  const [resetMode, setResetMode] = useState(params.get('auth') === 'reset-password');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!neon) { setError('Password reset is unavailable because Neon Auth is not configured.'); return; }
    if (!STAFF_ADMIN_EMAILS.has(email.trim().toLowerCase())) { setNotice('If an authorised staff account exists for that email, a reset link can be requested from the configured Neon Auth flow.'); return; }
    setLoading(true);
    try {
      const { error: requestError } = await neon.auth.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/?auth=reset-password`,
      });
      if (requestError) throw requestError;
      setNotice('If an account exists for that email, a reset link has been requested. Check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not request a reset link. Please try again.');
    } finally { setLoading(false); }
  };

  const completeReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!neon) { setError('Password reset is unavailable because Neon Auth is not configured.'); return; }
    if (!token.trim()) { setError('The reset link is missing its token. Request a fresh link and open it from your email.'); return; }
    if (password.length < 8) { setError('Choose a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: resetError } = await neon.auth.resetPassword({ newPassword: password, token: token.trim() });
      if (resetError) throw resetError;
      setNotice('Password updated. You can now sign in with your new password.');
      setResetMode(false);
      setPassword('');
      setConfirmPassword('');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the password. Request a fresh reset link and try again.');
    } finally { setLoading(false); }
  };

  const field = 'w-full rounded-lg border border-zinc-700 bg-[#121315] px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]';
  const button = 'w-full rounded-lg bg-[#ff5500] px-4 py-3 font-mono text-xs font-bold uppercase text-black hover:bg-[#ff6a1f] disabled:opacity-50';

  return (
    <div className="min-h-[70vh] w-full px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-orange-400">Staff account recovery</p>
        <h1 className="mb-2 text-3xl font-bold text-white">{resetMode ? 'Choose a new password' : 'Reset your password'}</h1>
        <p className="mb-6 text-sm text-zinc-400">{resetMode ? 'Use the secure reset link sent by Neon Auth.' : 'Enter your staff email to request a secure reset link.'}</p>
        <form onSubmit={(event) => { event.preventDefault(); void (resetMode ? completeReset(event) : requestReset(event)); }} className="space-y-4">
          <input type="email" required={!resetMode} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Staff email address" autoComplete="email" className={field} />
          {resetMode ? <>
            <input type="text" required value={token} onChange={(event) => setToken(event.target.value)} placeholder="Reset token from the email link" autoComplete="one-time-code" className={field} />
            <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" className={field} />
            <input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" className={field} />
          </> : null}
          {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}
          {notice ? <p role="status" className="text-sm text-emerald-300">{notice}</p> : null}
          <button type="submit" disabled={loading || !neon} className={button}>{loading ? 'Please wait…' : resetMode ? 'Set new password' : 'Email reset link'}</button>
        </form>
        <button type="button" onClick={onClose} className="mt-4 text-sm text-zinc-400 underline">Back to staff sign in</button>
      </div>
    </div>
  );
}
