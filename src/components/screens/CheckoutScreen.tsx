import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { PublicPlan } from '../../lib/plans';
import { createCheckoutSession } from '../../lib/stripe';

const formatPrice = (value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function loadStripeJs(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-stripe-js]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Stripe could not load.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/dahlia/stripe.js';
    script.async = true;
    script.dataset.stripeJs = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Stripe could not load. Check your connection and try again.'));
    document.head.appendChild(script);
  });
}

export const CheckoutScreen: React.FC<{ plan: PublicPlan | null; checkoutReturn?: { sessionId: string; planId: string } | null; onSelectScreen: (screen: 'home' | 'online-coaching' | 'contact') => void }> = ({ plan, checkoutReturn, onSelectScreen }) => {
  const [paymentWarning, setPaymentWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutAttempt, setCheckoutAttempt] = useState(0);
  const [clientSecret, setClientSecret] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [mockCheckout, setMockCheckout] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [checkoutActions, setCheckoutActions] = useState<StripeCheckoutActions | null>(null);
  const [returnStatus, setReturnStatus] = useState<'checking' | 'paid' | 'pending' | 'review' | 'error' | null>(null);
  const contactMountRef = useRef<HTMLDivElement>(null);
  const paymentMountRef = useRef<HTMLDivElement>(null);
  const checkoutRequestsRef = useRef(new Map<string, ReturnType<typeof createCheckoutSession>>());

  useEffect(() => {
    if (!checkoutReturn?.sessionId) {
      setReturnStatus(null);
      return;
    }
    let cancelled = false;
    setReturnStatus('checking');
    void fetch(`/api/checkout-status?session_id=${encodeURIComponent(checkoutReturn.sessionId)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error('Payment status could not be verified.');
      if (checkoutReturn.planId && data.planId !== checkoutReturn.planId) throw new Error('Payment details do not match the selected package.');
      if (!cancelled) setReturnStatus(data.status === 'paid' ? 'paid' : data.status === 'review' ? 'review' : 'pending');
    }).catch(() => {
      if (!cancelled) setReturnStatus('error');
    });
    return () => { cancelled = true; };
  }, [checkoutReturn?.sessionId, checkoutReturn?.planId]);

  useEffect(() => {
    if (!plan || checkoutReturn?.sessionId) return;
    let cancelled = false;
    setPaymentWarning('');
    setMockCheckout(false);
    setClientSecret('');
    setStripePublishableKey('');
    setCheckoutActions(null);
    setSubmitting(true);

    let request = checkoutRequestsRef.current.get(plan.id);
    if (!request) {
      request = createCheckoutSession(plan.id);
      checkoutRequestsRef.current.set(plan.id, request);
    }

    void request.then((result) => {
      if (cancelled) return;
      if ('mode' in result && result.mode === 'mock') {
        setMockCheckout(true);
      } else if ('mode' in result && result.mode === 'stripe') {
        setStripePublishableKey(result.publishableKey);
        setClientSecret(result.clientSecret);
      } else {
        setPaymentWarning('error' in result ? result.error : 'Online payment could not be started. Please contact Mike.');
      }
    }).catch((error: unknown) => {
      if (!cancelled) setPaymentWarning(error instanceof Error ? error.message : 'We could not start secure payment. Please try again or contact Mike.');
    }).finally(() => {
      if (!cancelled) setSubmitting(false);
    });

    return () => { cancelled = true; };
  }, [plan?.id, checkoutReturn?.sessionId, checkoutAttempt]);

  useEffect(() => {
    if (!clientSecret || !contactMountRef.current || !paymentMountRef.current) return;
    let cancelled = false;
    let contactElement: StripeMountableElement | null = null;
    let paymentElement: StripeMountableElement | null = null;

    const mountCheckout = async () => {
      setStripeLoading(true);
      try {
        await loadStripeJs();
        if (!stripePublishableKey) throw new Error('Stripe is not configured for this website yet. Please contact Mike.');
        if (!window.Stripe) throw new Error('Stripe could not be initialised. Please refresh and try again.');
        const stripe = window.Stripe(stripePublishableKey);
        const checkout = stripe.initCheckoutElementsSdk({
          clientSecret,
          elementsOptions: {
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#ff5500',
                colorBackground: '#121419',
                colorText: '#f3f4f6',
                colorDanger: '#f87171',
                fontFamily: 'Hanken Grotesk, sans-serif',
                fontSizeBase: '16px',
                borderRadius: '0px',
              },
            },
          },
        });
        const actionsResult = await checkout.loadActions();
        if (actionsResult.type === 'error') throw new Error(actionsResult.error.message);
        contactElement = checkout.createContactDetailsElement();
        paymentElement = checkout.createPaymentElement({ fields: { billingDetails: { name: 'always' } } });
        if (cancelled || !contactMountRef.current || !paymentMountRef.current) return;
        contactElement.mount(contactMountRef.current);
        paymentElement.mount(paymentMountRef.current);
        setCheckoutActions(actionsResult.actions);
      } catch (error) {
        if (!cancelled) {
          setPaymentWarning(error instanceof Error ? error.message : 'Secure payment could not be loaded.');
          setClientSecret('');
        }
      } finally {
        if (!cancelled) setStripeLoading(false);
      }
    };

    void mountCheckout();
    return () => {
      cancelled = true;
      contactElement?.unmount();
      paymentElement?.unmount();
    };
  }, [clientSecret, stripePublishableKey]);

  const confirmPayment = async () => {
    if (!checkoutActions) return;
    setPaymentWarning('');
    setConfirmingPayment(true);
    try {
      const result = await checkoutActions.confirm();
      if (result.type === 'error') setPaymentWarning(result.error.message);
    } catch (error) {
      setPaymentWarning(error instanceof Error ? error.message : 'Payment could not be confirmed. Please try again.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (!plan) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border border-[#20232b] bg-[#121419] p-8 text-center">
          <h1 className="font-display text-4xl text-white uppercase tracking-tight">Checkout</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-300">No package selected. Choose a coaching package first and you will be taken straight to checkout.</p>
          <button onClick={() => onSelectScreen('online-coaching')} className="mt-6 inline-flex items-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono font-bold text-xs uppercase text-black hover:bg-[#ff6a1f]">View packages <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <button type="button" onClick={() => onSelectScreen('online-coaching')} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to packages</button>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">Secure Stripe payment</p>
        <h1 className="mt-2 font-display text-4xl text-white uppercase tracking-tight sm:text-5xl">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-300">{checkoutReturn ? 'Checking the payment result. Do not start another payment.' : mockCheckout ? 'This Preview is using a simulation; no payment will be taken.' : 'Your secure payment form loads automatically for this package.'}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-8 xl:gap-10">
        <div className="order-2 min-w-0 border border-[#20232b] bg-[#121419] p-6 sm:p-8 lg:order-1">
          {checkoutReturn ? (
            <div role="status" aria-live="polite" className="mt-5 border border-[#343943] bg-[#191c22] p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff5500]">Stripe payment return</p>
              {returnStatus === 'checking' && <p className="mt-3 text-sm text-zinc-200">Verifying your payment directly with Stripe…</p>}
              {returnStatus === 'paid' && <>
                <h2 className="mt-3 font-display text-2xl uppercase text-white">Stripe confirms payment</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200">Do not pay again. Your coaching access is not activated automatically yet because your customer account still needs to be securely linked to this purchase. Mike will need to confirm your account before access is granted.</p>
                <p className="mt-3 text-xs text-zinc-400">Reference: {checkoutReturn.sessionId.slice(-12)}</p>
              </>}
              {returnStatus === 'review' && <p className="mt-3 text-sm leading-relaxed text-amber-200">Stripe reports a payment, but the amount or currency needs manual verification. Do not pay again. Contact Mike so the payment can be checked before any access is granted.</p>}
              {returnStatus === 'pending' && <p className="mt-3 text-sm leading-relaxed text-amber-200">Stripe has not confirmed this payment yet. Do not start another payment. Refresh this page shortly or contact Mike if the status does not change.</p>}
              {returnStatus === 'error' && <p className="mt-3 text-sm leading-relaxed text-amber-200">We could not verify this payment automatically. Do not pay again. Contact Mike and provide reference {checkoutReturn.sessionId.slice(-12)} so the payment can be checked.</p>}
              <button type="button" onClick={() => onSelectScreen('contact')} className="mt-4 border border-[#454a55] px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:border-[#ff5500]">Contact Mike</button>
            </div>
          ) : <>
            <div className="flex items-center justify-between gap-4 border-b border-[#292d36] pb-3">
              <h2 className="font-display text-2xl text-white uppercase">Payment details</h2>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400"><Lock className="h-3.5 w-3.5 text-[#ff5500]" /> Stripe secure form</span>
            </div>
            <div className="mt-4 border border-[#343943] bg-[#191c22] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-200"><ShieldCheck className="h-4 w-4 text-[#ff5500]" /> {mockCheckout ? 'Preview mock checkout simulation' : 'Secure payment on MW Fitness'}</div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{mockCheckout ? 'Mock mode does not load card fields, contact Stripe, or take payment.' : 'Enter your contact and payment details directly in Stripe’s secure form below. Checkout stays on this page.'}</p>
              <ul className="mt-4 grid gap-2 text-xs leading-relaxed text-zinc-300 sm:grid-cols-2">
                <li className="flex items-start gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" /><span>Card number, expiry date and security code are entered into Stripe’s secure fields.</span></li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" /><span>MW Fitness does not receive or store your full card details or security code.</span></li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" /><span>Stripe may request your billing address and phone number to process the payment.</span></li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" /><span>Available card and wallet payment methods are displayed securely by Stripe.</span></li>
              </ul>
              {!mockCheckout && <p className="mt-4 border-t border-[#343943] pt-3 text-xs leading-relaxed text-zinc-400">This is a one-off payment for the selected coaching package, not an automatic recurring subscription.</p>}
            </div>
          </>}

          {!checkoutReturn && paymentWarning && (
            <div role="alert" className="mt-4 border border-amber-500/50 bg-amber-500/10 p-4">
              <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-300"><TriangleAlert className="h-4 w-4" /> Payment unavailable</p>
              <p className="mt-2 text-sm leading-relaxed text-amber-200/90">{paymentWarning}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">Your payment details are handled securely by Stripe and are never stored by MW Fitness. You can <button type="button" onClick={() => onSelectScreen('contact')} className="text-[#ff7547] underline underline-offset-4">contact Mike</button> for help.</p>
              {!checkoutActions && <button type="button" onClick={() => { checkoutRequestsRef.current.delete(plan.id); setCheckoutAttempt((attempt) => attempt + 1); }} className="mt-3 min-h-10 border border-amber-300/50 px-4 py-2 font-mono text-xs font-bold uppercase text-amber-200 hover:bg-amber-300/10">Try again</button>}
            </div>
          )}

          {!checkoutReturn && mockCheckout && (
            <div role="status" className="mt-6 border border-amber-500/50 bg-amber-500/10 p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">Preview mock checkout</p>
              <h3 className="mt-2 font-display text-xl uppercase text-white">No payment has been taken</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-100/90">Stripe test keys are not configured in this non-production environment, so this is a checkout simulation only. No Stripe transaction was created and no paid membership or account access has been activated.</p>
              <button type="button" onClick={() => onSelectScreen('online-coaching')} className="mt-4 border border-amber-300/50 px-4 py-2 font-mono text-xs font-bold uppercase text-amber-200 hover:bg-amber-300/10">Back to packages</button>
            </div>
          )}
          {!checkoutReturn && !mockCheckout && (
            <div className="mt-5 border border-[#343943] bg-[#191c22] p-4">
              {(submitting || stripeLoading) && <p className="mb-3 text-sm text-zinc-300">Loading secure payment fields…</p>}
              <div ref={contactMountRef} aria-label="Stripe contact details" />
              <div className="mt-4" ref={paymentMountRef} aria-label="Stripe secure payment form" />
              {checkoutActions && (
                <button type="button" onClick={() => void confirmPayment()} disabled={confirmingPayment} className="mt-5 min-h-12 w-full bg-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-black transition hover:bg-[#ff6a1f] disabled:cursor-wait disabled:opacity-60">
                  {confirmingPayment ? 'Processing securely…' : `Pay ${formatPrice(plan.price)}`}
                </button>
              )}
            </div>
          )}
          {!checkoutReturn && (!mockCheckout ? <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-300"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Card details are handled securely by Stripe</p> : <p className="mt-3 text-center text-[11px] text-amber-200">No card details collected in mock mode</p>)}
        </div>

        <aside className="order-1 min-w-0 self-start border border-[#343943] bg-[#15181e] p-6 sm:p-7 lg:order-2 lg:sticky lg:top-28">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff5500]">Order summary</p>
            <span className="border border-[#454a55] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-300">1 × package</span>
          </div>
          <h2 className="mt-3 font-display text-3xl leading-none text-white uppercase">{plan.name}</h2>
          <p className="mt-1 text-xs font-mono uppercase tracking-wider text-zinc-400">{plan.tag}</p>
          <div className="mt-4 flex items-baseline gap-3 border-b border-[#20232b] pb-4">
            <span className="font-display text-4xl leading-none text-white">{formatPrice(plan.price)}</span>
            {plan.original_price !== null && <span className="text-xs font-mono text-zinc-400 line-through">{formatPrice(plan.original_price)}</span>}
            {plan.badge && <span className="bg-[#ff5500] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">{plan.badge}</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{plan.description}</p>
          <div className="mt-5 space-y-3 border-y border-[#343943] py-4 text-xs">
            <div className="flex items-center justify-between gap-4 text-zinc-300"><span>Package subtotal</span><span className="font-mono tabular-nums text-white">{formatPrice(plan.price)}</span></div>
            <div className="flex items-center justify-between gap-4 text-zinc-300"><span>Payment frequency</span><span className="font-mono uppercase text-white">One-off</span></div>
            <div className="flex items-center justify-between gap-4 pt-1 text-sm font-bold text-white"><span>Total due today</span><span className="font-mono tabular-nums text-[#ff7547]">{formatPrice(plan.price)}</span></div>
          </div>
          <ul className="mt-5 space-y-2 text-xs text-zinc-300">
            {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" /><span>{feature}</span></li>)}
          </ul>
          <div className="mt-5 border-t border-[#343943] pt-4">
            <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-300"><Lock className="h-3.5 w-3.5 text-[#ff5500]" /> Secure payment powered by Stripe</p>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">Your payment is processed by Stripe. The amount shown above is the full one-off package price.</p>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-zinc-300">Questions first? <button type="button" onClick={() => onSelectScreen('contact')} className="text-[#ff7547] underline underline-offset-4">Contact Mike</button> before buying.</p>
        </aside>
      </div>
    </section>
  );
};
