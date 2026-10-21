import React, { useEffect, useState } from 'react';
import { ScreenId } from '../../types';
import { ONLINE_COACHING } from '../../data/mockData';
import { createCheckoutSession } from '../../lib/stripe';
import { loadPublicPlans, PublicPlan } from '../../lib/plans';
import { ArrowRight, Check, CreditCard, MessageCircle, Video } from 'lucide-react';

interface OnlineCoachingScreenProps { onSelectScreen: (screen: ScreenId) => void; }

export const OnlineCoachingScreen: React.FC<OnlineCoachingScreenProps> = ({ onSelectScreen }) => {
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadPublicPlans('online').then((result) => {
      if (!active) return;
      setPlans(result.plans); setPlansError(result.error); setPlansLoading(false);
    }, (cause: unknown) => {
      if (!active) return;
      console.error('[MW Fitness] Online coaching pricing request failed:', cause);
      setPlans([]); setPlansError('Pricing is temporarily unavailable. Please contact Mike for current options.'); setPlansLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId); setError('');
    try {
      const result = await createCheckoutSession(planId);
      if (result.url) { window.location.assign(result.url); return; }
      setError(result.error || 'Checkout is unavailable right now. Please contact Mike and he will help you get started.');
    } catch (cause) {
      console.error('[MW Fitness] Checkout request failed:', cause);
      setError('Checkout is unavailable right now. Please contact Mike and he will help you get started.');
    } finally { setLoadingPlan(''); }
  };

  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const comparisonFeatures = Array.from(new Set(plans.flatMap((plan) => plan.features)));

  return <div className="page-layout">
    <section className="page-hero relative min-h-[40vh] flex items-center overflow-hidden border-b border-[#262930]">
      <div className="absolute inset-0"><img src="/images/main-hero.jpg" alt="MWFitnessUK training floor" className="h-full w-full object-cover object-center brightness-60 contrast-125" /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent" /><div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" /><div className="absolute inset-0 bg-grid-pattern opacity-40" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full"><div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse" />[ ONLINE COACHING ]</div>
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-white uppercase leading-[0.9] font-black">Your plan.<span className="block text-[#ff5500]">Your schedule.</span></h1>
        <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">{ONLINE_COACHING.intro}</p>
        <button onClick={() => document.getElementById('online-plans')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2">Explore coaching plans <ArrowRight className="w-4 h-4" /></button>
      </div></div>
    </section>
    <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-[#22252e] pb-4 mb-10"><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ WHAT YOU GET ]</div><h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Coaching built around real life.</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[
        { icon: CreditCard, title: 'A plan made for you', text: 'Choose the active online plan that fits your goals, routine and level of support.' },
        { icon: Video, title: 'Regular check-ins', text: 'Review progress and keep your plan moving in the right direction.' },
        { icon: MessageCircle, title: 'Direct support', text: 'Get help with questions, updates and staying accountable.' },
      ].map(({ icon: Icon, title, text }) => <div key={title} className="bg-[#121419] border border-[#20232b] p-6"><Icon className="w-7 h-7 text-[#ff5500] mb-5" /><h3 className="font-display text-2xl text-white uppercase mb-2">{title}</h3><p className="text-sm text-zinc-400 leading-relaxed">{text}</p></div>)}</div>
      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">{ONLINE_COACHING.features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />{feature}</li>)}</ul>
    </section>
    <section id="online-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-[#22252e] pb-4 mb-10"><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ CHOOSE YOUR PLAN ]</div><h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Online coaching packages.</h2><p className="text-sm text-zinc-400 mt-3">Compare the currently active plans. Package details and prices are managed by Mike in Staff HQ; secure checkout is available directly from each plan.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{plans.map((plan) => <div key={plan.id} className={`bg-[#121419] border p-6 md:p-8 flex flex-col relative ${plan.is_popular ? 'border-[#ff5500] shadow-[0_0_24px_rgba(255,85,0,0.15)]' : 'border-[#20232b]'}`}>
        {plan.badge && <span className="absolute top-0 right-0 bg-[#ff5500] text-black font-mono text-[10px] uppercase px-3 py-1.5 font-bold">{plan.badge}</span>}
        <div className="flex items-baseline justify-between gap-4"><div><h3 className="font-display text-3xl text-white uppercase">{plan.name}</h3><p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">{plan.tag}</p></div><div className="text-right"><div className="font-display text-4xl text-white">{formatPrice(plan.price)}</div>{plan.original_price !== null && <div className="text-xs font-mono text-zinc-500 line-through">{formatPrice(plan.original_price)}</div>}</div></div>
        <p className="text-sm text-zinc-400 leading-relaxed mt-4">{plan.description}</p><ul className="mt-5 space-y-2.5 text-sm text-zinc-300">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" /><span>{feature}</span></li>)}</ul>
        <button onClick={() => handleCheckout(plan.id)} disabled={loadingPlan !== ''} className="mt-7 bg-[#ff5500] hover:bg-[#ff6a1f] disabled:opacity-60 text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center justify-center gap-2">{loadingPlan === plan.id ? 'Opening secure checkout…' : (plan.cta_text || 'Buy this plan')}{loadingPlan !== plan.id && <ArrowRight className="w-4 h-4" />}</button>
      </div>)}</div>
      {plansLoading && <p className="text-sm text-zinc-400 mt-4">Loading current online plans…</p>}{!plansLoading && plansError && <p role="status" className="text-sm text-zinc-400 mt-4">{plansError}</p>}{error && <div role="alert" className="mt-5 border border-red-500/50 bg-[#2a1414] text-red-300 px-4 py-3 text-sm font-mono">{error}</div>}
    </section>
    {plans.length > 0 && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="border-b border-[#22252e] pb-4 mb-8"><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ WHAT'S INCLUDED ]</div><h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Compare your options.</h2></div><div className="overflow-x-auto border border-[#20232b] bg-[#121419]"><table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b border-[#1b1e26] bg-[#16181d]"><th className="p-4 text-left text-xs font-mono text-zinc-400 uppercase tracking-wider">What's included</th>{plans.map((plan) => <th key={plan.id} className="p-4 text-center"><div className="font-display text-xl text-white uppercase">{plan.name}</div><div className="text-[11px] font-mono text-[#ff5500]">{formatPrice(plan.price)}</div></th>)}</tr></thead><tbody className="divide-y divide-[#1b1e26]">{comparisonFeatures.map((feature) => <tr key={feature}><td className="p-4 font-medium text-white">{feature}</td>{plans.map((plan) => <td key={plan.id} className="p-4 text-center">{plan.features.includes(feature) ? <Check className="inline w-4 h-4 text-emerald-400" /> : <span className="text-zinc-600">—</span>}</td>)}</tr>)}</tbody></table></div></section>}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"><div className="border border-[#2a2f3a] bg-[#121419] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"><div><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-2">[ QUESTIONS ]</div><h2 className="font-display text-3xl text-white uppercase">Need help choosing?</h2><p className="text-sm text-zinc-400 mt-2">Contact Mike if you have a question about online coaching before buying.</p></div><button onClick={() => onSelectScreen('contact')} className="border border-[#ff5500] text-white hover:bg-[#ff5500] hover:text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2">Contact Mike <ArrowRight className="w-4 h-4" /></button></div></section>
  </div>;
};
