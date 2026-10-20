import React, { useEffect, useMemo, useState } from 'react';
import { Check, ArrowRight, CalendarClock, CreditCard, MessageCircle, Video } from 'lucide-react';
import { loadPublicPlans, PublicPlan } from '../../lib/plans';
import { createCheckoutSession } from '../../lib/stripe';
import { ScreenId } from '../../types';

interface PackagesScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const PackagesScreen: React.FC<PackagesScreenProps> = ({ onSelectScreen }) => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    let active = true;
    void loadPublicPlans('online').then((result) => {
      if (!active) return;
      setPlans(result.plans);
      setPlansError(result.error);
      setPlansLoading(false);
    }, (cause: unknown) => {
      if (!active) return;
      console.error('[MW Fitness] Online coaching plans failed to load:', cause);
      setPlans([]);
      setPlansError('Pricing is temporarily unavailable. Please contact Mike for current options.');
      setPlansLoading(false);
    });
    return () => { active = false; };
  }, []);

  const features = useMemo(() => Array.from(new Set(plans.flatMap((plan) => plan.features))), [plans]);
  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    setCheckoutError('');
    try {
      const result = await createCheckoutSession(planId);
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      setCheckoutError(result.error || 'Checkout is unavailable right now. Please contact Mike and he will help you get started.');
    } catch (cause) {
      console.error('[MW Fitness] Checkout request failed:', cause);
      setCheckoutError('Checkout is unavailable right now. Please contact Mike and he will help you get started.');
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <div className="page-layout">
      <section className="page-hero relative min-h-[58vh] flex items-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0">
          <img src="/images/main-hero.jpg" alt="Online coaching at MWFitnessUK" className="w-full h-full object-cover filter brightness-50 contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/75 to-transparent" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse" />
              [ ONLINE COACHING ]
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-white uppercase leading-[0.9] font-black">
              Your plan.
              <span className="block text-[#ff5500]">Your schedule.</span>
            </h1>
            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Choose the online coaching tier that fits your goals, routine and level of support. Every active package, price and included feature is managed by Mike in Staff HQ.
            </p>
            <button onClick={() => document.getElementById('online-plans')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2">
              Compare the four tiers <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ WHAT YOU GET ]</div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Coaching built around real life.</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mt-3 max-w-3xl">
            Training and nutrition support that fits around your week. The checklist below is assembled from the active online packages in Staff HQ, so Mike can maintain the offer without changing website code.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CreditCard, title: 'A plan made for you', text: 'Choose a coaching tier with training guidance matched to your goals and routine.' },
            { icon: Video, title: 'Weekly check-ins', text: 'Review progress with a weekly Zoom call and keep your plan moving in the right direction.' },
            { icon: MessageCircle, title: 'Direct support', text: 'Use WhatsApp for questions, updates and answers when you need them.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-[#121419] border border-[#20232b] p-6">
              <Icon className="w-7 h-7 text-[#ff5500] mb-5" />
              <h3 className="font-display text-2xl text-white uppercase mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        {features.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
            {features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />{feature}</li>)}
          </ul>
        )}
      </section>

      <section id="online-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ ONLINE COACHING ]</div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Bronze. Silver. Gold. Platinum.</h2>
          <p className="text-sm text-zinc-400 mt-3">Compare the active tiers below. Package names, prices, descriptions and features are sourced from Staff HQ.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-[#121419] border p-6 flex flex-col h-full ${plan.is_popular ? 'border-[#ff5500] shadow-[0_0_24px_rgba(255,85,0,0.15)]' : 'border-[#20232b]'}`}>
              {plan.badge && <span className="self-start bg-[#ff5500] text-black font-mono text-[10px] uppercase px-3 py-1.5 font-bold">{plan.badge}</span>}
              <h3 className="font-display text-3xl text-white uppercase mt-3">{plan.name}</h3>
              {plan.tag && <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">{plan.tag}</p>}
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-2"><span className="font-display text-4xl text-white">{formatPrice(plan.price)}</span><span className="text-[10px] font-mono text-zinc-500">GBP</span></div>
              {plan.original_price != null && <div className="text-xs font-mono text-zinc-500 line-through">Was {formatPrice(plan.original_price)}</div>}
              <ul className="mt-5 space-y-2.5 text-sm text-zinc-300 flex-1">
                {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" /><span>{feature}</span></li>)}
              </ul>
              <button onClick={() => void handleCheckout(plan.id)} disabled={loadingPlan !== ''} className="mt-7 bg-[#ff5500] hover:bg-[#ff6a1f] disabled:opacity-60 text-black font-mono font-bold text-xs uppercase px-4 py-3.5 flex items-center justify-center gap-2">
                {loadingPlan === plan.id ? 'Opening checkout…' : (plan.cta_text || 'Choose this plan')}
                {loadingPlan !== plan.id && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
        {plansLoading && <p className="text-sm text-zinc-400 mt-4">Loading current online packages…</p>}
        {!plansLoading && plansError && <p role="status" className="text-sm text-zinc-400 mt-4">{plansError}</p>}
        {plans.length > 0 && (
          <section className="mt-14">
            <div className="border-b border-[#22252e] pb-4 mb-8">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ PACKAGE COMPARISON ]</div>
              <h3 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight">Compare what's included.</h3>
            </div>
            <div className="overflow-x-auto border border-[#20232b] bg-[#121419]">
              <table className="w-full min-w-[680px] text-sm">
                <thead><tr className="border-b border-[#1b1e26] bg-[#16181d]">
                  <th className="p-4 text-left text-xs font-mono text-zinc-400 uppercase tracking-wider">What's included</th>
                  {plans.map((plan) => <th key={plan.id} className="p-4 text-center"><div className="font-display text-lg text-white uppercase">{plan.name}</div><div className="text-[11px] font-mono text-[#ff5500]">{formatPrice(plan.price)}</div></th>)}
                </tr></thead>
                <tbody className="divide-y divide-[#1b1e26]">
                  {features.map((feature) => <tr key={feature}><td className="p-4 font-medium text-white">{feature}</td>{plans.map((plan) => <td key={plan.id} className="p-4 text-center">{plan.features.includes(feature) ? <Check className="inline w-4 h-4 text-emerald-400" /> : <span className="text-zinc-600">—</span>}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {checkoutError && <div role="alert" className="mt-5 border border-red-500/50 bg-[#2a1414] text-red-300 px-4 py-3 text-sm font-mono">{checkoutError}</div>}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <div className="border border-[#2a2f3a] bg-[#121419] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-2">[ QUESTIONS ]</div>
            <h2 className="font-display text-3xl text-white uppercase">Want to talk it through?</h2>
            <p className="text-sm text-zinc-400 mt-2">Contact Mike if you have a question before choosing a plan.</p>
          </div>
          <button onClick={() => onSelectScreen('contact')} className="border border-[#ff5500] text-white hover:bg-[#ff5500] hover:text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2">
            Contact Mike <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
