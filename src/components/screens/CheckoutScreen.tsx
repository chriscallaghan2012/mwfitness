import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { PublicPlan } from '../../lib/plans';
import { createCheckoutSession } from '../../lib/stripe';

const inputClass = 'w-full border border-[#454a55] bg-[#191c22] px-3.5 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-[#ff5500] focus:outline-none';

const formatPrice = (value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const CheckoutScreen: React.FC<{ plan: PublicPlan | null; onSelectScreen: (screen: 'home' | 'online-coaching' | 'contact') => void }> = ({ plan, onSelectScreen }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [paymentWarning, setPaymentWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setFormError('');
    setPaymentWarning('');
    if (!name.trim()) { setFormError('Enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setFormError('Enter a valid email address.'); return; }
    if (!plan) return;
    setSubmitting(true);
    try {
      const result = await createCheckoutSession(plan.id, { name: name.trim(), email: email.trim() });
      if (result.url) { window.location.assign(result.url); return; }
      // No Stripe keys (or no price for this plan yet): show the details the user
      // filled in, then explain clearly why payment cannot continue.
      setPaymentWarning(result.error || 'Payment is unavailable right now. Please contact Mike and he will help you get started.');
    } catch {
      setPaymentWarning('We could not reach the payment service. Please try again or contact Mike.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border border-[#20232b] bg-[#121419] p-8 text-center">
          <h1 className="font-display text-4xl text-white uppercase tracking-tight">Checkout</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">No package selected. Choose a coaching package first and you will be taken straight to checkout.</p>
          <button onClick={() => onSelectScreen('online-coaching')} className="mt-6 inline-flex items-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono font-bold text-xs uppercase text-black hover:bg-[#ff6a1f]">View packages <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <button type="button" onClick={() => onSelectScreen('online-coaching')} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to packages</button>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">Secure checkout</p>
        <h1 className="mt-2 font-display text-4xl text-white uppercase tracking-tight sm:text-5xl">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-300">Enter your details below to start your coaching plan.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
        {/* DETAILS FORM */}
        <div className="border border-[#20232b] bg-[#121419] p-6 sm:p-8">
          <h2 className="font-display text-2xl text-white uppercase">Your details</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 sm:col-span-2">Full name *
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Morgan" className={`${inputClass} mt-1.5`} autoComplete="name" />
            </label>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 sm:col-span-2">Email *
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={`${inputClass} mt-1.5`} autoComplete="email" />
            </label>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">Phone (optional)
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07…" className={`${inputClass} mt-1.5`} autoComplete="tel" />
            </label>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">Postcode (optional)
              <input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. M1 1AA" className={`${inputClass} mt-1.5`} autoComplete="postal-code" />
            </label>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 sm:col-span-2">Anything Mike should know? (optional)
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Goals, injuries, timeline…" className={`${inputClass} mt-1.5 resize-y`} />
            </label>
          </div>

          <h2 className="mt-8 font-display text-2xl text-white uppercase">Payment</h2>
          <div className="mt-4 border border-[#343943] bg-[#191c22] p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-200"><Lock className="w-3.5 h-3.5 text-[#ff5500]" /> Secure payment with Stripe</div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">Continue to Stripe Checkout to enter your card details securely. Your card number and security code are entered on Stripe, not on this website.</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">You can review the total and payment details on Stripe before confirming your payment.</p>
          </div>

          {formError && <p role="alert" className="mt-4 border border-red-500/40 bg-[#2a1414] px-4 py-3 text-sm text-red-300">{formError}</p>}
          {paymentWarning && (
            <div role="alert" className="mt-4 border border-amber-500/50 bg-amber-500/10 p-4">
              <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-300"><TriangleAlert className="h-4 w-4" /> Payment not configured</p>
              <p className="mt-2 text-sm leading-relaxed text-amber-200/90">{paymentWarning}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">Your details above have not been sent to any payment service. This is a configuration issue on the site, not a problem with your card. You can still <button type="button" onClick={() => onSelectScreen('contact')} className="text-[#ff7547] underline underline-offset-4">contact Mike</button> to get set up manually.</p>
            </div>
          )}

          <button type="button" onClick={() => void submit()} disabled={submitting} className="mt-6 w-full bg-[#ff5500] px-6 py-4 font-mono font-bold text-xs uppercase text-black transition hover:bg-[#ff6a1f] disabled:opacity-60">
            {submitting ? 'Checking payment service…' : `Continue to secure payment — ${formatPrice(plan.price)}`}
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-300"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> You will confirm everything on Stripe's secure page</p>
        </div>

        {/* ORDER SUMMARY */}
        <aside className="border border-[#20232b] bg-[#121419] p-6 sm:p-8 lg:sticky lg:top-36">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff5500]">Order summary</p>
          <h2 className="mt-2 font-display text-3xl text-white uppercase">{plan.name}</h2>
          <p className="mt-1 text-xs font-mono uppercase tracking-wider text-zinc-500">{plan.tag}</p>
          <div className="mt-4 flex items-baseline gap-3 border-b border-[#20232b] pb-4">
            <span className="font-display text-4xl text-white">{formatPrice(plan.price)}</span>
            {plan.original_price !== null && <span className="text-xs font-mono text-zinc-500 line-through">{formatPrice(plan.original_price)}</span>}
            {plan.badge && <span className="bg-[#ff5500] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">{plan.badge}</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">{plan.description}</p>
          <ul className="mt-5 space-y-2 text-xs text-zinc-300">
            {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" /><span>{feature}</span></li>)}
          </ul>
          <p className="mt-5 border-t border-[#20232b] pt-4 text-[11px] leading-relaxed text-zinc-500">Questions first? <button type="button" onClick={() => onSelectScreen('contact')} className="text-[#ff7547] underline underline-offset-4">Contact Mike</button> before buying.</p>
        </aside>
      </div>
    </section>
  );
};
