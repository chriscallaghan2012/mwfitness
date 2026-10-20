import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Mail, RefreshCw, Save, Send, ShieldCheck } from 'lucide-react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, btn, btnGhost, card, inp } from './fields';

type Section = 'overview' | 'templates' | 'automations' | 'history' | 'compose' | 'notifications';
type Template = Row & { id: string; template_key: string; name: string; channel: string; category: string; subject: string; preheader: string; html_body: string; text_body: string; enabled: boolean; version: number };

const sections: { id: Section; label: string; icon: typeof Bell }[] = [
  { id: 'overview', label: 'Overview', icon: Bell },
  { id: 'templates', label: 'Email templates', icon: Mail },
  { id: 'automations', label: 'Automations', icon: RefreshCw },
  { id: 'history', label: 'Delivery history', icon: ShieldCheck },
  { id: 'compose', label: 'Broadcasts & individual', icon: Send },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function CommunicationsAdmin() {
  const [section, setSection] = useState<Section>('overview');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [rules, setRules] = useState<Row[]>([]);
  const [events, setEvents] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<Partial<Template>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('email');
  const [audience, setAudience] = useState('members');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [dispatchBusy, setDispatchBusy] = useState(false);
  const [ruleBusyKey, setRuleBusyKey] = useState('');
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const load = useCallback(async () => {
    if (!neon) {
      setTemplates([]);
      setRules([]);
      setEvents([]);
      setSelectedId('');
      setDraft({});
      setError('Neon is not configured for this deployment.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setPreviewCount(null);
    try {
      const [t, r, e] = await Promise.all([
        neon.from('communication_templates').select('id,template_key,name,channel,category,subject,preheader,html_body,text_body,enabled,version,updated_at').order('name'),
        neon.from('communication_automation_rules').select('id,rule_key,name,trigger_key,channel,template_key,enabled,delay_minutes,updated_at').order('name'),
        neon.from('communication_events').select('id,source,channel,category,subject,status,created_at,completed_at').order('created_at', { ascending: false }).limit(100),
      ]);
      const failed = t.error || r.error || e.error;
      if (failed) {
        setTemplates([]);
        setRules([]);
        setEvents([]);
        setError('Communications tables are not available yet. The communications migration is prepared on the working branch but has not been applied to Neon. No notification has been sent.');
        return;
      }
      const nextTemplates = (t.data ?? []) as Template[];
      setTemplates(nextTemplates);
      setRules((r.data ?? []) as Row[]);
      setEvents((e.data ?? []) as Row[]);
      setSelectedId((current) => nextTemplates.some((item) => item.id === current) ? current : nextTemplates[0]?.id ?? '');
      setNotice('');
    } catch {
      setTemplates([]);
      setRules([]);
      setEvents([]);
      setSelectedId('');
      setDraft({});
      setError('Could not load the communications centre. Check the Neon connection and staff permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => templates.find((item) => item.id === selectedId), [templates, selectedId]);
  useEffect(() => { if (selected) setDraft({ ...selected }); }, [selected]);
  // A recipient count is valid only for the exact template that was previewed.
  useEffect(() => { setPreviewCount(null); }, [selectedId]);

  const saveTemplate = async () => {
    if (!neon || !selected || !draft.id) return;
    setSaving(true); setError(''); setNotice(''); setPreviewCount(null);
    try {
      const { data: session, error: sessionError } = await neon.auth.getSession({ query: {} });
      if (sessionError || !session?.user) throw new Error('Your staff session has expired. Sign in again.');
      const { data: savedRows, error: saveError } = await neon.from('communication_templates').update({
        name: String(draft.name ?? '').trim(),
        category: String(draft.category ?? 'service'),
        subject: String(draft.subject ?? ''),
        preheader: String(draft.preheader ?? ''),
        html_body: String(draft.html_body ?? ''),
        text_body: String(draft.text_body ?? ''),
        enabled: Boolean(draft.enabled),
        version: Number(selected.version ?? 1) + 1,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      }).eq('id', selected.id).select('id');
      if (saveError) throw saveError;
      if (!savedRows?.length) throw new Error('The template was not updated. Check your staff role and table permissions.');
      setNotice('Template saved. The version number has been incremented.');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Template could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!neon || !selected) return;
    setTestSending(true); setError(''); setNotice('');
    try {
      const { data: session, error: sessionError } = await neon.auth.getSession({ query: {} });
      if (sessionError || !session?.user) throw new Error('Your staff session has expired. Sign in again.');
      const token = await (neon.auth as typeof neon.auth & { getJWTToken?: (allowAnonymous?: boolean) => Promise<string | null> }).getJWTToken?.(false);
      if (!token) throw new Error('Could not obtain a Neon access token.');
      const response = await fetch('/api/communications-send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', templateKey: selected.template_key, confirmTest: true }),
      });
      const result = await response.json() as { ok?: boolean; recipient?: string; error?: string; note?: string; accepted?: number };
      if (!response.ok || !result.ok) throw new Error(result.error || 'Test email could not be sent.');
      setNotice(`Test email accepted for your staff inbox (${session.user.email ?? 'signed-in staff account'}). ${result.note ?? ''}`);
      await load();
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : 'Test email could not be sent.');
    } finally {
      setTestSending(false);
    }
  };

  const createTemplate = async () => {
    if (!neon) { setError('Neon is not configured.'); return; }
    const name = window.prompt('Name for the new email template', 'New email template');
    if (!name || !name.trim()) return;
    const key = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72);
    if (key.length < 2) { setError('Choose a longer template name.'); return; }
    setCreatingTemplate(true); setError(''); setNotice('');
    try {
      const { data: session, error: sessionError } = await neon.auth.getSession({ query: {} });
      if (sessionError || !session?.user) throw new Error('Your staff session has expired. Sign in again.');
      const { data, error: insertError } = await neon.from('communication_templates').insert({
        template_key: key, name: name.trim(), channel: 'email', category: 'service', subject: name.trim(),
        preheader: '', html_body: '<h1 style="color:#17191d">New email template</h1><p>Write your email content here.</p>',
        text_body: name.trim() + '\n\nWrite your email content here.', enabled: false, version: 1, updated_by: session.user.id,
      }).select('id');
      if (insertError) throw insertError;
      if (!data?.length) throw new Error('Template was not created. Check the communications migration and staff permissions.');
      await load();
      setSelectedId(String(data[0].id));
      setNotice('Draft template created and disabled. Review the content, preview it and save before enabling it.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create a template.'); }
    finally { setCreatingTemplate(false); }
  };

  const dispatchPreview = async () => {
    if (!neon || (channel === 'email' && !selected)) { setError('Select an enabled email template first.'); return; }
    if (audience === 'individual' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) { setError('Enter the email address of an existing member.'); return; }
    if (channel !== 'email' && (!subject.trim() || !message.trim())) { setError('Add a notification title and message.'); return; }
    setDispatchBusy(true); setError(''); setNotice(''); setPreviewCount(null);
    try {
      const token = await (neon.auth as typeof neon.auth & { getJWTToken?: (allowAnonymous?: boolean) => Promise<string | null> }).getJWTToken?.(false);
      if (!token) throw new Error('Could not obtain a Neon access token. Sign in again.');
      const endpoint = channel === 'email' ? '/api/communications-send' : '/api/communications-notifications';
      const payload = channel === 'email'
        ? { action: 'preview', templateKey: selected?.template_key, audience, recipientEmail: recipientEmail.trim() }
        : { action: 'preview', channel, title: subject.trim(), message: message.trim(), audience, recipientEmail: recipientEmail.trim() };
      const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; recipientCount?: number; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not preview the audience.');
      setPreviewCount(Number(result.recipientCount ?? 0));
      setNotice('Audience preview ready: ' + Number(result.recipientCount ?? 0) + ' recipient(s). Nothing has been sent.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not preview the audience.'); }
    finally { setDispatchBusy(false); }
  };

  const dispatchSend = async () => {
    if (!neon || (channel === 'email' && !selected) || previewCount === null) { setError('Preview the recipient count before sending.'); return; }
    if (previewCount < 1) { setError('There are no eligible recipients to send to.'); return; }
    if (!window.confirm('Send this ' + channel.replace('_', ' ') + ' notification to ' + previewCount + ' recipient(s)? This action cannot be recalled.')) return;
    setDispatchBusy(true); setError(''); setNotice('');
    try {
      const token = await (neon.auth as typeof neon.auth & { getJWTToken?: (allowAnonymous?: boolean) => Promise<string | null> }).getJWTToken?.(false);
      if (!token) throw new Error('Could not obtain a Neon access token. Sign in again.');
      const endpoint = channel === 'email' ? '/api/communications-send' : '/api/communications-notifications';
      const payload = channel === 'email'
        ? { action: 'send', templateKey: selected?.template_key, audience, recipientEmail: recipientEmail.trim(), confirmSend: true, confirmCount: previewCount }
        : { action: 'send', channel, title: subject.trim(), message: message.trim(), audience, recipientEmail: recipientEmail.trim(), confirmSend: true, confirmCount: previewCount };
      const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; recipientCount?: number; accepted?: number; failed?: number; noDevice?: number; error?: string; eventId?: string; note?: string };
      if (!response.ok && response.status !== 207) throw new Error(result.error || 'Notification send failed.');
      setNotice('Notification recorded (' + (result.eventId || 'event saved') + '): ' + Number(result.accepted || 0) + ' accepted, ' + Number(result.failed || 0) + ' failed, ' + Number(result.noDevice || 0) + ' without a registered device. ' + (result.note || ''));
      setPreviewCount(null);
      if (channel !== 'email') { setSubject(''); setMessage(''); }
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Notification send failed.'); }
    finally { setDispatchBusy(false); }
  };

  const toggleRule = async (rule: Row) => {
    const supported = ['website-enquiry-acknowledgement', 'consultation-confirmation', 'app-waitlist-acknowledgement'];
    if (!supported.includes(String(rule.rule_key))) { setError('This app or scheduled trigger is not wired yet, so it cannot be enabled.'); return; }
    if (!neon) { setError('Neon is not configured.'); return; }
    setRuleBusyKey(String(rule.rule_key)); setError(''); setNotice('');
    try {
      const token = await (neon.auth as typeof neon.auth & { getJWTToken?: (allowAnonymous?: boolean) => Promise<string | null> }).getJWTToken?.(false);
      if (!token) throw new Error('Could not obtain a Neon access token. Sign in again.');
      const response = await fetch('/api/communications-rules', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ ruleKey: rule.rule_key, enabled: !rule.enabled }) });
      const result = await response.json() as { ok?: boolean; error?: string; note?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not update the automation.');
      setNotice(String(rule.name) + ' ' + (!rule.enabled ? 'enabled' : 'disabled') + '. ' + (result.note || ''));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update the automation.'); }
    finally { setRuleBusyKey(''); }
  };

  const updateDraft = (key: keyof Template, value: unknown) => setDraft((current) => ({ ...current, [key]: value }));
  const count = (status: string) => events.filter((event) => event.status === status).length;
  const setField = (key: keyof Template, value: string) => updateDraft(key, value);
  const previewHtml = String(draft.html_body ?? '')
    .replace(/{{\s*name\s*}}/g, 'Alex Morgan')
    .replace(/{{\s*email\s*}}/g, 'alex@example.test')
    .replace(/{{\s*headline\s*}}/g, String(draft.name || 'Email preview'))
    .replace(/{{\s*subject\s*}}/g, String(draft.subject || 'Preview subject'))
    .replace(/{{\s*preheader\s*}}/g, String(draft.preheader || 'Preview preheader'))
    .replace(/{{\s*body\s*}}/g, 'This is sample preview text. Real recipient details are inserted when sent.')
    .replace(/{{\s*app_url\s*}}/g, 'https://mwfitnessuk.com/app')
    .replace(/{{\s*admin_url\s*}}/g, 'https://mwfitnessuk.com/admin')
    .replace(/{{\s*cta_url\s*}}/g, 'https://mwfitnessuk.com')
    .replace(/{{\s*cta_label\s*}}/g, 'Open MW Fitness')
    .replace(/{{\s*unsubscribe_url\s*}}/g, 'https://mwfitnessuk.com/unsubscribe-preview');

  return (
    <section className="space-y-5" aria-labelledby="communications-heading">
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#21170f] via-[#15171b] to-[#111216] p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-300">Staff HQ · communications</p><h2 id="communications-heading" className="mt-2 text-2xl font-semibold text-white">Notification &amp; email studio</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">One place for automated messages, member broadcasts, branded email templates and delivery history.</p></div>
          <button type="button" onClick={() => void load()} disabled={loading} className={btnGhost}><RefreshCw className="h-3.5 w-3.5" />{loading ? 'Refreshing…' : 'Refresh data'}</button>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          {sections.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => { setSection(item.id); if (item.id === 'compose') setChannel('email'); if (item.id === 'notifications') setChannel('push'); }} aria-pressed={section === item.id} className={section === item.id ? 'inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3.5 py-2.5 text-xs font-semibold text-black' : 'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3.5 py-2.5 text-xs text-zinc-300 hover:bg-white/5'}><Icon className="h-3.5 w-3.5" />{item.label}</button>; })}
        </div>
      </div>
      {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</p> : null}
      {notice ? <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-300">{notice}</p> : null}
      {loading ? <div className={card}><p className="text-sm text-zinc-400">Loading communications data…</p></div> : null}
      {!loading && section === 'overview' ? <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[{ label: 'Email templates', value: templates.length }, { label: 'Automation rules', value: rules.length }, { label: 'Queued / processing', value: count('queued') + count('processing') }, { label: 'Failed events', value: count('failed') }].map((item) => <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-[#14161a] p-4"><p className="text-xs text-zinc-500">{item.label}</p><p className="mt-2 text-3xl font-semibold text-white">{item.value}</p></div>)}
        </div>
        <div className={card}><h3 className="text-base font-semibold text-white">What this centre will control</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{[{title:'Automated notifications',body:'Review trigger rules, message content, status and recipient-level delivery outcomes.'},{title:'Manual broadcasts',body:'Prepare announcements for a selected audience, with consent checks and a final send confirmation.'},{title:'Branded email studio',body:'Edit subject, preheader, HTML and plain-text fallback, then preview the email before publishing.'},{title:'Audit & delivery history',body:'Track queued, accepted, delivered, failed, bounced and unsubscribed deliveries.'}].map((item) => <div key={item.title} className="rounded-xl border border-white/[0.07] bg-black/10 p-4"><h4 className="text-sm font-medium text-white">{item.title}</h4><p className="mt-1 text-xs leading-5 text-zinc-400">{item.body}</p></div>)}</div></div>
      </> : null}
      {!loading && section === 'templates' ? <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-white">Editable email templates</h3><p className="mt-1 text-xs text-zinc-500">Changes save to Neon and increment the template version. Saving does not send an email.</p></div><div className="flex items-center gap-2">{selected ? <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] uppercase text-orange-300">v{selected.version ?? 1}</span> : null}<button type="button" disabled={creatingTemplate} onClick={() => void createTemplate()} className={btnGhost}>{creatingTemplate ? "Creating…" : "+ New template"}</button></div></div>
        {templates.length === 0 ? <p className="mt-4 text-sm text-zinc-400">No live templates loaded. Apply the approved migration before editing templates.</p> : <div className="mt-4 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-2">{templates.map((template) => <button key={template.id} type="button" onClick={() => setSelectedId(template.id)} className={selectedId === template.id ? 'w-full rounded-xl border border-orange-500/40 bg-orange-500/[0.08] p-3 text-left' : 'w-full rounded-xl border border-white/[0.07] bg-black/10 p-3 text-left hover:border-white/20'}><span className="block text-sm font-medium text-white">{template.name}</span><span className="mt-1 block text-[10px] uppercase tracking-wider text-zinc-500">{template.category} · {template.enabled ? 'enabled' : 'disabled'}</span></button>)}</div>
          {selected ? <div className="min-w-0 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-zinc-400">Template name<input className={inp} value={String(draft.name ?? '')} onChange={(e) => setField('name', e.target.value)} /></label>
              <label className="grid gap-1.5 text-xs text-zinc-400">Category<select className={inp} value={String(draft.category ?? 'service')} onChange={(e) => setField('category', e.target.value)}>{['transactional','service','marketing','internal'].map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Subject line<input className={inp} value={String(draft.subject ?? '')} onChange={(e) => setField('subject', e.target.value)} /></label>
              <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Preheader<input className={inp} value={String(draft.preheader ?? '')} onChange={(e) => setField('preheader', e.target.value)} /></label>
              <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">HTML email body<textarea rows={10} className={inp + ' font-mono text-xs'} value={String(draft.html_body ?? '')} onChange={(e) => setField('html_body', e.target.value)} /></label>
              <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Plain-text fallback<textarea rows={5} className={inp} value={String(draft.text_body ?? '')} onChange={(e) => setField('text_body', e.target.value)} /></label>
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={Boolean(draft.enabled)} onChange={(e) => updateDraft('enabled', e.target.checked)} className="accent-orange-500" /> Template enabled for future use</label>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => void saveTemplate()} disabled={saving} className={btn}><Save className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save new version'}</button><button type="button" onClick={() => void sendTest()} disabled={testSending || saving || !selected.enabled} className={btnGhost}><Send className="h-3.5 w-3.5" />{testSending ? 'Sending test…' : 'Send test to me'}</button><button type="button" onClick={() => setDraft({ ...selected })} className={btnGhost}>Discard edits</button></div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white p-3"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HTML preview · static template only</p><iframe title="Email template preview" sandbox="" srcDoc={previewHtml} className="h-80 w-full bg-white" /></div>
          </div> : null}
        </div>}
      </div> : null}
      {!loading && section === 'automations' ? <div className={card}><div className="mb-4"><h3 className="text-base font-semibold text-white">Automation rules</h3><p className="mt-1 text-xs text-zinc-500">Website enquiry, consultation and app-waitlist acknowledgements can be enabled after the migration and Resend sender are configured. App/scheduled rules stay locked until their event handlers are implemented.</p></div><AdminTable rows={rules.map((rule) => ({ ...rule, state: rule.enabled ? 'Enabled' : 'Disabled', trigger: rule.trigger_key, template: rule.template_key }))} empty="No automation rules loaded. Apply the prepared communications migration after review." cols={[{key:'name',label:'Rule'},{key:'trigger',label:'Trigger'},{key:'channel',label:'Channel'},{key:'template',label:'Template'},{key:'state',label:'Control',render:(rule) => ['website-enquiry-acknowledgement','consultation-confirmation','app-waitlist-acknowledgement'].includes(String(rule.rule_key)) ? <button type="button" disabled={Boolean(ruleBusyKey)} onClick={() => void toggleRule(rule)} className={btnGhost}>{ruleBusyKey === rule.rule_key ? 'Saving…' : rule.enabled ? 'Enabled · disable' : 'Disabled · enable'}</button> : <span className="text-xs text-zinc-500">Locked · trigger pending</span>},{key:'delay_minutes',label:'Delay (min)'}]} /></div> : null}
      {!loading && section === 'history' ? <div className={card}><h3 className="mb-4 text-base font-semibold text-white">Notification &amp; email history</h3><AdminTable rows={events.map((event) => ({ ...event, time: event.created_at ? new Date(String(event.created_at)).toLocaleString('en-GB') : '—' }))} empty="No communication events recorded yet." cols={[{key:'time',label:'Created'},{key:'source',label:'Source'},{key:'channel',label:'Channel'},{key:'category',label:'Category'},{key:'subject',label:'Subject / message'},{key:'status',label:'Status'}]} /></div> : null}
      {!loading && (section === 'compose' || section === 'notifications') ? <div className={card}>
        <div className="mb-4"><h3 className="text-base font-semibold text-white">{section === 'notifications' ? 'Push & in-app notifications' : 'Individual email & broadcasts'}</h3><p className="mt-1 text-xs text-zinc-500">{section === 'notifications' ? 'Compose a member push or in-app notification. Preview the recipient count and confirm before sending.' : 'Send an email to one member or a reviewed audience. Preview the current recipient count before confirming.'}</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs text-zinc-400">Channel<select className={inp} value={channel} onChange={(e) => { setChannel(e.target.value); setPreviewCount(null); if (e.target.value !== 'email' && audience === 'consented-marketing') setAudience('members'); }}>{section === 'notifications' ? <><option value="push">App push notification</option><option value="in_app">In-app member inbox</option></> : <option value="email">Branded email</option>}</select></label>
          <label className="grid gap-1.5 text-xs text-zinc-400">Audience<select className={inp} value={audience} onChange={(e) => { setAudience(e.target.value); setPreviewCount(null); }}><option value="individual">One member / individual</option><option value="members">All members (max 100 for app notifications)</option>{channel === 'email' ? <option value="consented-marketing">Consented marketing subscribers only</option> : null}</select></label>
          {channel === 'email' ? <>
            <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Email template<select className={inp} value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setPreviewCount(null); }}><option value="">Choose template…</option>{templates.filter((t) => t.enabled && t.channel === 'email').map((t) => <option key={t.id} value={t.id}>{t.name} · {t.category}</option>)}</select></label>
            <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Selected template subject<input className={inp} value={String(selected?.subject || '')} readOnly /></label>
          </> : <>
            <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Notification title<input className={inp} value={subject} onChange={(e) => { setSubject(e.target.value); setPreviewCount(null); }} maxLength={180} placeholder="What do members need to know?" /></label>
            <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Message<textarea className={inp} rows={6} value={message} onChange={(e) => { setMessage(e.target.value); setPreviewCount(null); }} maxLength={2000} placeholder="Write the member notification…" /></label>
          </>}
          {audience === 'individual' ? <label className="grid gap-1.5 text-xs text-zinc-400 sm:col-span-2">Member email<input className={inp} type="email" value={recipientEmail} onChange={(e) => { setRecipientEmail(e.target.value); setPreviewCount(null); }} maxLength={254} placeholder="member@example.com" /><span className="text-[11px] text-zinc-500">For app notifications, this must match an existing member account.</span></label> : <p className="sm:col-span-2 rounded-xl border border-white/[0.07] bg-black/10 p-3 text-xs leading-5 text-zinc-400">{channel === 'email' && audience === 'consented-marketing' ? 'Only contacts with recorded active marketing consent are eligible; unsubscribed or suppressed addresses are excluded.' : 'The server recalculates and confirms the eligible member count at send time.'}</p>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" disabled={dispatchBusy || (channel === 'email' && !selected)} onClick={() => void dispatchPreview()} className={btnGhost}>{dispatchBusy ? 'Checking…' : 'Preview recipient count'}</button>
          <button type="button" disabled={dispatchBusy || previewCount === null || previewCount < 1 || (channel === 'email' && !selected)} onClick={() => void dispatchSend()} className={btn}><Send className="h-3.5 w-3.5" />{dispatchBusy ? 'Sending…' : previewCount === null ? 'Send notification' : 'Send to ' + previewCount}</button>
          {previewCount !== null ? <span className="text-xs text-orange-200">Preview: {previewCount} eligible recipient(s)</span> : null}
        </div>
        <p className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-3 text-xs leading-5 text-orange-100">Every send requires staff authorization, a fresh exact recipient-count confirmation and an audit record. Marketing email is consent-filtered. Push delivery reports recipients without registered devices; the mobile app's token registration still needs to be completed separately.</p>
      </div> : null}
    </section>
  );
}
