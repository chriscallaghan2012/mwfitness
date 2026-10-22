import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCheck, MessageCircle, RefreshCw, Search, Send, UserRound } from 'lucide-react';
import { neon } from '../../lib/neon';
import { adminDb, isDemoMode } from '../../lib/admin/adminDb';
import { Row } from './fields';

const READ_KEY = 'mwfitness-staff-read-messages';
const timeLabel = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};
const initials = (value: string) => value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'M';

export function MessagesAdmin({ initialAthleteId = '' }: { initialAthleteId?: string }) {
  const db = adminDb();
  const [athletes, setAthletes] = useState<Row[]>([]);
  const [messages, setMessages] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState(initialAthleteId);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [readIds, setReadIds] = useState<string[]>(() => {
    try { return JSON.parse(window.localStorage.getItem(READ_KEY) || '[]') as string[]; } catch { return []; }
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { window.localStorage.setItem(READ_KEY, JSON.stringify(readIds)); } catch { /* storage can be unavailable */ }
  }, [readIds]);

  const load = useCallback(async (quiet = false) => {
    if (!db) { setError('Messaging is unavailable because the data service is not configured.'); setLoading(false); return; }
    if (!quiet) setLoading(true);
    try {
      if (!isDemoMode()) {
        // Demo mode has no staff session; live mode must confirm the staff sign-in first.
        const sessionResult = await neon?.auth.getSession({ query: {} });
        if (sessionResult?.error || !sessionResult?.data?.user) throw new Error('Your staff session has expired. Sign in again.');
      }
      const results = await Promise.all([
        db.from('profiles').select('id,full_name,email').eq('role', 'athlete').order('full_name'),
        db.from('coach_messages').select('id,athlete_profile_id,sender_profile_id,body,delivery_status,created_at').order('created_at', { ascending: true }).limit(500),
      ]);
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      const nextAthletes = (results[0].data || []) as Row[];
      const nextMessages = (results[1].data || []) as Row[];
      setAthletes(nextAthletes);
      setMessages(nextMessages);
      setSelectedId((current) => current || String(nextMessages[nextMessages.length - 1]?.athlete_profile_id || nextAthletes[0]?.id || ''));
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load conversations.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { void load(true); }, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (initialAthleteId) setSelectedId(initialAthleteId);
  }, [initialAthleteId]);

  const threads = useMemo(() => athletes.map((athlete) => {
    const id = String(athlete.id);
    const threadMessages = messages.filter((message) => String(message.athlete_profile_id) === id);
    const last = threadMessages[threadMessages.length - 1];
    const unread = threadMessages.filter((message) => String(message.sender_profile_id) === id && !readIds.includes(String(message.id))).length;
    return { athlete, id, last, unread };
  }).filter((thread) => (String(thread.athlete.full_name || '') + ' ' + String(thread.athlete.email || '')).toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.last?.created_at || 0).getTime() - new Date(a.last?.created_at || 0).getTime()), [athletes, messages, readIds, search]);

  const activeAthlete = athletes.find((athlete) => String(athlete.id) === selectedId);
  const activeMessages = useMemo(() => messages.filter((message) => String(message.athlete_profile_id) === selectedId), [messages, selectedId]);
  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread, 0);

  useEffect(() => {
    const incoming = activeMessages.filter((message) => String(message.sender_profile_id) === selectedId).map((message) => String(message.id));
    if (incoming.length) setReadIds((current) => Array.from(new Set(current.concat(incoming))));
  }, [activeMessages, selectedId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [activeMessages.length, selectedId]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!db || !body || !selectedId || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const sessionResult = isDemoMode() ? null : await neon?.auth.getSession({ query: {} });
      const senderId = isDemoMode() ? 'demo-staff' : String(sessionResult?.data?.user?.id ?? '');
      if (!senderId) throw new Error('Your staff session has expired. Sign in again.');
      const result = await db.from('coach_messages')
        .insert({ athlete_profile_id: selectedId, sender_profile_id: senderId, body })
        .select('id')
        .single();
      if (result.error) throw result.error;

      let deliveryNotice = 'Reply sent';
      if (!isDemoMode() && result.data?.id) {
        try {
          const tokenResult = await neon?.auth.getSession({ query: {} });
          const accessToken = tokenResult?.data?.session?.access_token;
          if (!accessToken) {
            deliveryNotice = 'Reply sent; push delivery could not be confirmed';
          } else {
            const response = await fetch('/api/send-push', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messageIds: [result.data.id] }),
            });
            const delivery = await response.json().catch(() => ({}));
            if (!response.ok) deliveryNotice = 'Reply sent; push delivery could not be confirmed';
            else if (Number(delivery.accepted) > 0) deliveryNotice = 'Reply sent; push notification accepted by Expo';
            else if (Number(delivery.noDevice) > 0) deliveryNotice = 'Reply sent; member has no registered device';
            else deliveryNotice = 'Reply sent; push notification was not accepted';
          }
        } catch {
          deliveryNotice = 'Reply sent; push delivery could not be confirmed';
        }
      }
      setDraft('');
      setNotice(deliveryNotice);
      await load(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Your reply could not be sent.'); }
    finally { setBusy(false); }
  };

  const name = String(activeAthlete?.full_name || activeAthlete?.email || 'Choose a member');
  const inputStyle = 'w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/10';

  return <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#111316] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-gradient-to-r from-[#1a1715] via-[#151619] to-[#111316] px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/25 bg-orange-500/10 text-orange-300"><MessageCircle size={21} /></div><div><h2 className="text-lg font-semibold tracking-tight text-white">Member messages</h2><p className="mt-0.5 text-xs text-zinc-500">Private coach conversations · checks for new messages every 15 seconds</p></div></div>
      <div className="flex items-center gap-2"><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">{athletes.length} members</span>{totalUnread > 0 && <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-300">{totalUnread} unread</span>}<button type="button" onClick={() => void load()} aria-label="Refresh messages" title="Refresh messages" className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-orange-400/40 hover:text-white"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button></div>
    </header>
    <div className="grid min-h-[620px] grid-cols-1 md:h-[calc(100vh-300px)] md:min-h-[520px] md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-b border-white/[0.07] bg-[#0e1012] md:overflow-hidden md:border-b-0 md:border-r">
        <div className="border-b border-white/[0.06] p-4"><label className="relative block"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members…" aria-label="Search conversations" className={inputStyle + ' py-2.5 pl-9'} /></label><p className="mb-1 mt-4 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Inbox</p></div>
        <div className="max-h-[290px] flex-1 overflow-y-auto md:max-h-none md:min-h-0">{loading && athletes.length === 0 && <p className="px-5 py-8 text-sm text-zinc-500">Loading conversations…</p>}{!loading && threads.length === 0 && <p className="px-5 py-8 text-sm text-zinc-500">No members found.</p>}
          {threads.map(({ athlete, id, last, unread }) => { const memberName = String(athlete.full_name || athlete.email || 'Member'); return <button key={id} type="button" onClick={() => { setSelectedId(id); setNotice(''); }} className={'flex w-full cursor-pointer items-center gap-3 border-b border-white/[0.04] px-4 py-3.5 text-left transition ' + (id === selectedId ? 'bg-orange-500/[0.09] shadow-[inset_3px_0_0_#ff6a1a]' : 'hover:bg-white/[0.035]')}>
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300">{initials(memberName)}<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0e1012] bg-emerald-400" /></span>
            <span className="min-w-0 flex-1"><span className={'block truncate text-sm ' + (unread ? 'font-semibold text-white' : 'font-medium text-zinc-300')}>{memberName}</span><span className="mt-1 block truncate text-xs text-zinc-600">{last ? (String(last.sender_profile_id) === id ? '' : 'You: ') + String(last.body || '') : 'Start a conversation'}</span></span>
            <span className="flex shrink-0 flex-col items-end gap-1.5"><span className="text-[10px] text-zinc-600">{timeLabel(last?.created_at || '')}</span>{unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-black">{unread}</span>}</span>
          </button>; })}</div>
      </aside>
      <div className="flex min-h-[520px] min-w-0 flex-col bg-[radial-gradient(ellipse_at_top_right,rgba(255,106,26,0.055),transparent_45%)] md:min-h-0">
        {activeAthlete ? <>
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/10 text-xs font-semibold text-orange-200">{initials(name)}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-white">{name}</h3><p className="mt-1 truncate text-xs text-zinc-500">{String(activeAthlete.email || 'Member conversation')} · Private chat</p></div><span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[10px] text-emerald-300 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Conversation</span></div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">{activeMessages.length === 0 && <div className="flex min-h-[330px] flex-col items-center justify-center text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/[0.07] text-orange-300"><MessageCircle size={24} /></div><h4 className="text-sm font-medium text-white">Start the conversation</h4><p className="mt-2 max-w-xs text-xs leading-5 text-zinc-500">Send a message to {name.split(' ')[0]}. Replies and previous messages will appear here.</p></div>}
            {activeMessages.map((message) => { const isStaff = String(message.sender_profile_id) !== selectedId; return <div key={String(message.id)} className={'flex ' + (isStaff ? 'justify-end' : 'justify-start')}><div className={'flex max-w-[88%] flex-col sm:max-w-[76%] ' + (isStaff ? 'items-end' : 'items-start')}><span className="mb-1.5 px-1 text-[10px] text-zinc-600">{isStaff ? 'You' : name.split(' ')[0]} · {timeLabel(message.created_at || '')}</span><div className={'rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ' + (isStaff ? 'rounded-br-md border border-orange-400/20 bg-gradient-to-br from-orange-500 to-orange-600 text-[#17100b] shadow-orange-950/10' : 'rounded-bl-md border border-white/[0.08] bg-[#202226] text-zinc-100')}><p className="whitespace-pre-wrap break-words">{String(message.body || '')}</p></div>{isStaff && <span className="mt-1.5 flex items-center gap-1 px-1 text-[10px] text-zinc-600"><CheckCheck size={12} className="text-orange-300/80" /> {String(message.delivery_status || 'sent') === 'read' ? 'Read' : 'Sent'}</span>}</div></div>; })}<div ref={bottomRef} /></div>
          <form onSubmit={send} className="border-t border-white/[0.07] bg-[#111316]/90 p-4 sm:px-6 sm:py-5">{error && <p role="alert" className="mb-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-300">{error}</p>}{notice && !error && <p role="status" className="mb-3 text-xs text-emerald-300">{notice}</p>}<div className="flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-[#0c0e10] p-2 transition focus-within:border-orange-400/40"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={'Message ' + name.split(' ')[0] + '…'} rows={2} className="max-h-36 min-h-[48px] flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-zinc-600" aria-label="Write a message" /><button type="submit" disabled={busy || !draft.trim()} className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-xs font-bold text-black shadow-[0_4px_20px_rgba(255,106,26,0.15)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"><Send size={14} /><span className="hidden sm:inline">{busy ? 'Sending…' : 'Send'}</span></button></div><p className="mt-2 px-1 text-[10px] text-zinc-600">Enter to send · Shift + Enter for a new line</p></form>
        </> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><UserRound size={30} className="mb-3 text-zinc-600" /><h3 className="text-sm font-medium text-white">Choose a member</h3><p className="mt-2 text-xs text-zinc-500">Select a member from the inbox to read and reply.</p></div>}
      </div>
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-[#0e1012] px-5 py-3 text-[10px] text-zinc-600"><span>Messages are saved to the member conversation history.</span><span>Auto-refresh every 15 seconds</span></footer>
  </section>;
}
