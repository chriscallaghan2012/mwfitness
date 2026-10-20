import { useCallback, useEffect, useState } from 'react';
import { neon } from '../../lib/neon';
import { AdminTable, Row, ShortDate, StatusPill, btnGhost, card, inp } from './fields';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'];

export function LeadsAdmin() {
  const [leads, setLeads] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!neon) {
      setError('The Neon backend is not configured for this deployment.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const query = neon
        .from('website_leads')
        .select('id,kind,name,email,phone,interest,goal,message,page,status,created_at,times')
        .order('created_at', { ascending: false })
        .limit(200);
      const { data, error: queryError } = filter === 'all' ? await query : await query.eq('status', filter);
      if (queryError) {
        setError('Could not load enquiries. Check the Neon migration and staff access policy.');
        setLeads([]);
      } else {
        setError('');
        setLeads((data ?? []) as Row[]);
      }
    } catch {
      setError('Could not reach the database while loading enquiries. Please retry.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (lead: Row, status: string) => {
    if (!neon) return;
    setNotice('');
    try {
      const { error: updateError } = await neon.from('website_leads').update({ status }).eq('id', lead.id);
      if (updateError) {
        setError('Status could not be saved. Check staff permissions and try again.');
        return;
      }
      setError('');
      setNotice('Lead status saved.');
      await load();
    } catch {
      setError('Status could not be saved because the database request failed. Please retry.');
    }
  };

  const rows = (leads ?? []).map((lead) => ({
    ...lead,
    submitted: ShortDate(String(lead.created_at ?? '')),
    contact: (
      <div className="min-w-40">
        <div className="font-medium text-white">{lead.name}</div>
        <a className="text-xs text-orange-300 underline underline-offset-2" href={`mailto:${encodeURIComponent(String(lead.email ?? ''))}`}>{lead.email}</a>
        {lead.phone ? <div className="mt-1 text-xs text-zinc-400">{lead.phone}</div> : null}
      </div>
    ),
    request: (
      <div className="min-w-40 max-w-xs">
        <div className="text-zinc-200">{lead.interest || lead.kind}</div>
        {lead.message ? <p className="mt-1 whitespace-pre-wrap text-xs text-zinc-500">{lead.message}</p> : null}
      </div>
    ),
    statusControl: (
      <div className="min-w-32 space-y-2">
        {StatusPill(String(lead.status))}
        <select
          aria-label={`Update status for ${lead.name}`}
          className={inp}
          value={String(lead.status)}
          onChange={(event) => void updateStatus(lead, event.target.value)}
        >
          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
    ),
  }));

  return (
    <section className={`${card} space-y-4`} aria-labelledby="website-leads-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-orange-300">Website inbox</p>
          <h2 id="website-leads-heading" className="mt-1 text-lg font-semibold text-white">Enquiries &amp; leads</h2>
          <p className="mt-1 text-xs text-zinc-500">Contact forms, free-call requests, app waitlist and SHWAG enquiries are stored in the shared Neon database.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Filter leads by status" className={inp} value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button type="button" className={btnGhost} onClick={() => void load()} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        </div>
      </div>
      {error ? <p role="alert" className="border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</p> : null}
      {notice ? <p role="status" className="text-xs text-emerald-300">{notice}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Loading live enquiries…</p> : null}
      {!loading && !error && rows.length === 0 ? <p className="text-sm text-zinc-400">No enquiries match this filter yet. New website requests will appear here.</p> : null}
      {!loading && !error && rows.length > 0 ? (
        <AdminTable
          rows={rows}
          empty="No enquiries yet."
          cols={[
            { key: 'contact', label: 'Contact', render: (row) => row.contact },
            { key: 'kind', label: 'Type', render: (row) => <span className="font-mono text-[10px] uppercase text-zinc-400">{row.kind}</span> },
            { key: 'request', label: 'Request', render: (row) => row.request },
            { key: 'submitted', label: 'Received' },
            { key: 'statusControl', label: 'Status', render: (row) => row.statusControl },
          ]}
        />
      ) : null}
    </section>
  );
}
