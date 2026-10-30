import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminDb, isDemoMode } from '../../lib/admin/adminDb';
import { AdminTable, Row, ShortDate, StatusPill, btnGhost, card } from './fields';

const formatMoney = (amount: unknown, currency: unknown) => {
  if (typeof amount !== 'number' || typeof currency !== 'string') return '—';
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
  } catch {
    return '—';
  }
};

export function PaymentsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (isDemoMode()) {
      setRows([]);
      setError('');
      setLoading(false);
      return;
    }
    const db = adminDb();
    if (!db) {
      setRows([]);
      setError('Neon is not configured. Payment records cannot be loaded.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await db.from('stripe_payment_records')
        .select('id,stripe_session_id,stripe_payment_intent_id,plan_id,customer_email,customer_name,amount_total,currency,payment_status,membership_status,livemode,review_reason,paid_at,created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (result.error) throw new Error(result.error.message);
      setRows((result.data ?? []) as Row[]);
    } catch {
      setRows([]);
      setError('Payment ledger could not be loaded. Apply the approved payment-ledger migration and verify platform-admin read access. No payment or membership data was changed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="space-y-4">
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Stripe</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Payment ledger</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-zinc-400">Verified paid Checkout Sessions only. This ledger does not grant coaching access automatically; every record must be securely linked to a customer account and matching membership before access is provided.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading || isDemoMode()} className={btnGhost}><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>
        {isDemoMode() && <p className="mt-4 border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200">Demo mode never reads real payment records. Switch to an authorised live platform-admin account to review the Stripe ledger.</p>}
        {!isDemoMode() && error && <p role="alert" className="mt-4 border border-red-500/30 bg-red-500/5 p-3 text-xs leading-5 text-red-200">{error}</p>}
        {!isDemoMode() && !error && !loading && <p className="mt-3 text-[11px] text-zinc-500">{rows.length} record(s) loaded; latest 200 shown.</p>}
      </div>
      {!isDemoMode() && !error && !loading && (
        <AdminTable
          rows={rows}
          empty="No verified paid checkout sessions have been recorded yet."
          searchPlaceholder="Search email, package or session reference…"
          cols={[
            { key: 'customer', label: 'Customer', render: (r) => <div><p className="text-white">{r.customer_name || 'Name not supplied'}</p><p className="mt-1 text-xs text-zinc-400">{r.customer_email || 'Email missing — manual review'}</p></div> },
            { key: 'plan_id', label: 'Package', render: (r) => <span className="break-all text-zinc-200">{r.plan_id}</span> },
            { key: 'amount_total', label: 'Paid', render: (r) => <span className="font-mono text-white">{formatMoney(r.amount_total, r.currency)}</span> },
            { key: 'mode', label: 'Mode', render: (r) => <span className={r.livemode ? 'text-orange-300' : 'text-zinc-400'}>{r.livemode ? 'Live' : 'Test'}</span> },
            { key: 'membership_status', label: 'Fulfilment', render: (r) => StatusPill(String(r.membership_status ?? 'unknown')) },
            { key: 'paid_at', label: 'Paid at', render: (r) => ShortDate(r.paid_at as string) },
            { key: 'stripe_session_id', label: 'Session reference', render: (r) => <span className="break-all font-mono text-[10px] text-zinc-400">{r.stripe_session_id}</span> },
            { key: 'review_reason', label: 'Review note', render: (r) => <span className="max-w-xs whitespace-normal text-xs text-amber-200">{r.review_reason || '—'}</span> },
          ]}
        />
      )}
      {!isDemoMode() && loading && <div className={card}><p className="text-sm text-zinc-400">Loading payment ledger…</p></div>}
    </section>
  );
}
