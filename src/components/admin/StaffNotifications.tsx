import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, ExternalLink, X } from 'lucide-react';
import { adminDb, isDemoMode } from '../../lib/admin/adminDb';

type SourceTab = 'members' | 'activity' | 'nutrition' | 'training' | 'checkins' | 'messages';
type StaffNotification = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  profileId: string;
  tab: SourceTab;
};
type Member = { id: string; full_name: string | null; email: string | null };

const READ_KEY = 'mwfitness-staff-notifications-read-v1';
const DISMISSED_KEY = 'mwfitness-staff-notifications-dismissed-v1';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function readStored(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

function memberName(member: Member | undefined, id: string) {
  return member?.full_name || member?.email || `Member ${id.slice(0, 8)}`;
}

export function StaffNotifications({ onNavigate }: {
  onNavigate: (tab: SourceTab, profileId: string) => void;
}) {
  const db = adminDb();
  const [items, setItems] = useState<StaffNotification[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [readIds, setReadIds] = useState<string[]>(readStored(READ_KEY));
  const [dismissedIds, setDismissedIds] = useState<string[]>(readStored(DISMISSED_KEY));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try { window.localStorage.setItem(READ_KEY, JSON.stringify(readIds)); } catch { /* storage can be unavailable */ }
  }, [readIds]);
  useEffect(() => {
    try { window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedIds)); } catch { /* storage can be unavailable */ }
  }, [dismissedIds]);

  const refresh = useCallback(async () => {
    if (!db) { setError('Notifications are unavailable because the data connection is not configured.'); return; }
    setLoading(true);
    try {
      const results = await Promise.all([
        db.from('profiles').select('id,full_name,email').eq('role', 'athlete').limit(500),
        db.from('checkins').select('id,profile_id,created_at,checkin_date,status').order('created_at', { ascending: false }).limit(100),
        db.from('progress_logs').select('id,profile_id,created_at,recorded_on,weight').order('created_at', { ascending: false }).limit(100),
        db.from('nutrition_logs').select('id,profile_id,created_at,logged_on,calories').order('created_at', { ascending: false }).limit(100),
        db.from('nutrition_daily_logs').select('id,profile_id,updated_at,log_date,completed_day').order('updated_at', { ascending: false }).limit(100),
        db.from('progress_photos').select('id,profile_id,created_at,recorded_on,caption').order('created_at', { ascending: false }).limit(100),
        db.from('workout_sessions').select('id,profile_id,created_at,completed_on,status,workout_templates(name)').order('created_at', { ascending: false }).limit(100),
        db.from('cardio_logs').select('id,profile_id,completed_at,activity,duration_minutes').order('completed_at', { ascending: false }).limit(100),
        db.from('coach_messages').select('id,athlete_profile_id,sender_profile_id,created_at,body').order('created_at', { ascending: false }).limit(100),
      ]);
      const memberResult = results[0];
      if (memberResult.error) throw memberResult.error;
      const nextMembers = (memberResult.data || []) as Member[];
      const memberById = new Map(nextMembers.map((member) => [member.id, member]));
      const cutoff = Date.now() - SEVEN_DAYS;
      const next: StaffNotification[] = [];
      const add = (result: any, kind: string, profileField: string, timeField: string, tab: SourceTab, detailFor: (row: any) => string, prefix: string, only?: (row: any) => boolean) => {
        if (result?.error || !Array.isArray(result?.data)) return;
        for (const row of result.data) {
          if (only && !only(row)) continue;
          const profileId = String(row[profileField] || '');
          const createdAt = String(row[timeField] || '');
          if (!profileId || !createdAt || !Number.isFinite(new Date(createdAt).getTime()) || new Date(createdAt).getTime() < cutoff) continue;
          const rowId = String(row.id ?? `${profileId}-${createdAt}`);
          next.push({
            id: `${prefix}:${rowId}`,
            title: kind,
            detail: `${memberName(memberById.get(profileId), profileId)} · ${detailFor(row)}`,
            createdAt,
            profileId,
            tab,
          });
        }
      };
      add(results[1], 'Check-in submitted', 'profile_id', 'created_at', 'checkins', (row) => String(row.status || 'Awaiting review'), 'checkin');
      add(results[2], 'Progress update submitted', 'profile_id', 'created_at', 'checkins', (row) => row.weight == null ? 'Progress log' : `Weight ${row.weight} kg`, 'progress');
      add(results[3], 'Nutrition log submitted', 'profile_id', 'created_at', 'nutrition', (row) => row.calories == null ? 'Nutrition log' : `${row.calories} kcal logged`, 'nutrition');
      add(results[4], 'Nutrition updated', 'profile_id', 'updated_at', 'nutrition', (row) => row.completed_day ? 'Daily nutrition marked complete' : 'Meal progress updated', 'nutrition-day');
      add(results[5], 'Progress photo submitted', 'profile_id', 'created_at', 'members', (row) => String(row.caption || 'New progress photo'), 'photo');
      add(results[6], 'Workout submitted', 'profile_id', 'created_at', 'training', (row) => {
        const template = Array.isArray(row.workout_templates) ? row.workout_templates[0]?.name : row.workout_templates?.name;
        return String(template || row.status || 'Workout session');
      }, 'workout', (row) => ['completed', 'submitted', 'complete'].includes(String(row.status || '').toLowerCase()));
      add(results[7], 'Cardio submitted', 'profile_id', 'completed_at', 'activity', (row) => `${row.activity || 'Cardio'} · ${row.duration_minutes || 0} min`, 'cardio');
      add(results[8], 'Member message received', 'athlete_profile_id', 'created_at', 'messages', (row) => String(row.body || 'New message').slice(0, 100), 'message', (row) => String(row.sender_profile_id) === String(row.athlete_profile_id));
      setMembers(nextMembers);
      setItems(next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setError('');
    } catch {
      setError('Could not load member submissions. Check Staff HQ access and the latest data policies.');
    } finally { setLoading(false); }
  }, [db]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const visibleItems = useMemo(() => items.filter((item) => !dismissedIds.includes(item.id)), [items, dismissedIds]);
  const unreadCount = visibleItems.filter((item) => !readIds.includes(item.id)).length;

  const openItem = (item: StaffNotification) => {
    setReadIds((current) => current.includes(item.id) ? current : [...current, item.id]);
    setOpen(false);
    onNavigate(item.tab, item.profileId);
  };
  const clearAll = () => setReadIds((current) => Array.from(new Set(current.concat(visibleItems.map((item) => item.id)))));
  const dismiss = (id: string) => {
    setDismissedIds((current) => current.includes(id) ? current : [...current, id]);
    setReadIds((current) => current.includes(id) ? current : [...current, id]);
  };

  return <div className="relative z-40">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} aria-expanded={open} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2b2d33] bg-[#15171b] text-zinc-400 transition-colors hover:border-[#ff5500]/70 hover:bg-[#ff5500]/10 hover:text-[#ff6a1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5500]">
      <Bell size={17} />
      {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-black">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {open && <div className="absolute right-0 top-11 z-50 w-[min(88vw,340px)] overflow-hidden rounded-xl border border-[#303239] bg-[#111316] shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between gap-2 border-b border-[#26282e] px-3 py-2.5">
        <div><h3 className="text-sm font-semibold text-white">Member submissions</h3><p className="mt-0.5 text-[11px] text-zinc-500">Last 7 days · {unreadCount} unread</p></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={clearAll} disabled={!unreadCount} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-[#ff5500]/10 hover:text-[#ff6a1f] disabled:opacity-40"><Check size={13} /> Clear all</button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-[#22252b] hover:text-[#ff6a1f]"><X size={15} /></button>
        </div>
      </div>
      {error && <p role="status" className="border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200">{error}</p>}
      <div className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain">
        {loading && visibleItems.length === 0 ? <p className="px-4 py-8 text-center text-xs text-zinc-500">Loading submissions…</p> :
          visibleItems.length === 0 ? <p className="px-4 py-8 text-center text-xs text-zinc-500">{isDemoMode() ? 'No sample submissions in the last 7 days.' : 'No member submissions in the last 7 days.'}</p> :
          visibleItems.map((item) => <div key={item.id} className={'group flex gap-2 border-b border-[#24262c] px-3 py-2 transition-colors hover:bg-[#1b1d22] ' + (readIds.includes(item.id) ? 'bg-transparent' : 'bg-[#ff5500]/[0.035] hover:bg-[#ff5500]/[0.07]')}>
            <button type="button" onClick={() => openItem(item)} className="min-w-0 flex-1 text-left">
              <span className="flex items-start gap-2"><span className={'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ' + (readIds.includes(item.id) ? 'bg-zinc-700' : 'bg-orange-400')} /><span className="min-w-0"><span className="block text-xs font-semibold text-zinc-100">{item.title}</span><span className="mt-1 block break-words text-[11px] leading-4 text-zinc-400">{item.detail}</span><span className="mt-1.5 block text-[10px] text-zinc-600">{new Date(item.createdAt).toLocaleString('en-GB')}</span></span><ExternalLink size={13} className="mt-1 shrink-0 text-zinc-600" /></span>
            </button>
            <button type="button" onClick={() => dismiss(item.id)} aria-label={`Dismiss ${item.title}`} title="Dismiss notification" className="h-7 w-7 shrink-0 rounded-md text-zinc-600 opacity-70 transition-colors hover:bg-[#ff5500]/15 hover:text-[#ff6a1f] focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><X size={14} /></button>
          </div>)
        }
      </div>
      <div className="flex items-center justify-between border-t border-[#26282e] px-3 py-2"><span className="text-[10px] text-zinc-600">Refreshes every 30 seconds</span><button type="button" onClick={() => void refresh()} disabled={loading} className="rounded-md px-2 py-1 text-[11px] text-[#ff6a1f] transition-colors hover:bg-[#ff5500]/10 hover:text-[#ff8a50] disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    </div>}
  </div>;
}
