import { useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, btn, inp } from './fields';

export function MessagesAdmin() {
  const [athletes, setAthletes] = useState<Row[]>([]);
  const [messages, setMessages] = useState<Row[]>([]);
  const [recipient, setRecipient] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!neon) return;
    const [profilesResult, messagesResult] = await Promise.all([
      neon.from('profiles').select('id,full_name,email').eq('role', 'athlete').order('full_name'),
      neon.from('coach_messages').select('id,athlete_profile_id,sender_profile_id,body,delivery_status,created_at').order('created_at', { ascending: false }).limit(100),
    ]);
    if (profilesResult.error || messagesResult.error) {
      setError(profilesResult.error?.message ?? messagesResult.error?.message ?? 'Could not load messages.');
      return;
    }
    setAthletes((profilesResult.data ?? []) as Row[]);
    setMessages((messagesResult.data ?? []) as Row[]);
    setError('');
  };

  useEffect(() => { void load(); }, []);

  const send = async () => {
    if (!neon || !body.trim()) return;
    const athleteIds = recipient === 'all' ? athletes.map((athlete) => String(athlete.id)) : recipient ? [recipient] : [];
    if (!athleteIds.length) {
      setError('Choose an athlete or all athletes.');
      return;
    }
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const { data: sessionData, error: sessionError } = await neon.auth.getSession({ query: {} });
      if (sessionError || !sessionData?.user) throw new Error('Your staff session has expired. Sign in again.');
      const { data, error: insertError } = await neon
        .from('coach_messages')
        .insert(athleteIds.map((athlete_profile_id) => ({
          athlete_profile_id,
          sender_profile_id: sessionData.user.id,
          body: body.trim(),
        })))
        .select('id');
      if (insertError) throw insertError;
      if (!data?.length || data.length !== athleteIds.length) {
        throw new Error('The message was not saved for every selected recipient. Refresh the message list before trying again.');
      }

      setBody('');
      await load();
      try {
        const accessToken = await (neon.auth as typeof neon.auth & { getJWTToken?: (allowAnonymous?: boolean) => Promise<string | null> }).getJWTToken?.(false);
        if (!accessToken) throw new Error('Could not obtain a Neon access token for push delivery.');
        const response = await fetch('/api/send-push', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: (data ?? []).map((message) => message.id) }),
        });
        const result = await response.json() as { accepted?: number; failed?: number; noDevice?: number; error?: string };
        if (!response.ok || result.failed) throw new Error(result.error || 'Some push notifications could not be sent.');
        setStatus(result.noDevice ? `Message saved. ${result.noDevice} recipient(s) have no registered device.` : `Message saved. Push accepted for ${result.accepted ?? 0} recipient(s).`);
      } catch (pushError) {
        setStatus(pushError instanceof Error ? `Message saved; push unavailable: ${pushError.message}` : 'Message saved; push delivery is unavailable.');
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Message could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  const athleteNames = new Map(athletes.map((athlete) => [String(athlete.id), String(athlete.full_name ?? athlete.email ?? 'Athlete')]));
  const rows = messages.map((message) => ({
    ...message,
    athlete: athleteNames.get(String(message.athlete_profile_id)) ?? 'Athlete',
    sender: message.sender_profile_id === message.athlete_profile_id ? 'Athlete' : 'Coach',
    sent: new Date(String(message.created_at)).toLocaleString('en-GB'),
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#16181d] border border-zinc-700 p-4 space-y-3">
        <p className="font-mono text-[10px] text-zinc-400 uppercase">New coach message</p>
        <select className={inp} value={recipient} onChange={(event) => setRecipient(event.target.value)}>
          <option value="">Choose recipient…</option>
          <option value="all">All athletes</option>
          {athletes.map((athlete) => <option key={athlete.id} value={athlete.id}>{athlete.full_name ?? athlete.email}</option>)}
        </select>
        <textarea className={`${inp} min-h-24`} maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message for the athlete app inbox" />
        <div className="flex flex-wrap items-center gap-3">
          <button className={btn} disabled={busy || !body.trim()} onClick={() => void send()}>{busy ? 'Sending…' : 'Send message'}</button>
          <span className="text-xs text-zinc-500">{body.length}/2000</span>
          {status ? <span role="status" className="text-xs text-green-300">{status}</span> : null}
          {error ? <span role="alert" className="text-xs text-red-300">{error}</span> : null}
        </div>
      </div>
      <AdminTable
        rows={rows}
        empty="No coach messages yet."
        cols={[
          { key: 'athlete', label: 'Athlete' },
          { key: 'sender', label: 'From' },
          { key: 'body', label: 'Message', render: (row) => <span className="whitespace-pre-wrap">{row.body}</span> },
          { key: 'sent', label: 'Sent' },
          { key: 'delivery_status', label: 'Push status' },
        ]}
      />
    </div>
  );
}