import React, { useEffect, useState } from 'react';
import { Ticker } from '../Ticker';
import { ScreenId } from '../../types';
import { ONLINE_COACHING } from '../../data/mockData';
import { loadPublicPlans, PublicPlan } from '../../lib/plans';
import { ArrowRight, Check, CreditCard, MessageCircle, Video } from 'lucide-react';

interface OnlineCoachingScreenProps { onSelectScreen: (screen: ScreenId) => void; onCheckout: (plan: PublicPlan) => void; }

export const OnlineCoachingScreen: React.FC<OnlineCoachingScreenProps> = ({ onSelectScreen, onCheckout }) => {
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

  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    <Ticker />
    <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-[#22252e] pb-4 mb-10"><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ WHAT YOU GET ]</div><h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Coaching built around real life.</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[
        { icon: CreditCard, title: 'A plan made for you', text: 'Choose the active online plan that fits your goals, routine and level of support.' },
        { icon: Video, title: 'Regular check-ins', text: 'Review progress and keep your plan moving in the right direction.' },
        { icon: MessageCircle, title: 'Direct support', text: 'Get help with questions, updates and staying accountable.' },
      ].map(({ icon: Icon, title, text }) => <div key={title} className="bg-[#121419] border border-[#20232b] p-6"><Icon className="w-7 h-7 text-[#ff5500] mb-5" /><h3 className="font-display text-2xl text-white uppercase mb-2">{title}</h3><p className="text-sm text-zinc-400 leading-relaxed">{text}</p></div>)}</div>
    </section>
    <section id="online-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-[#22252e] pb-4 mb-10"><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ CHOOSE YOUR PLAN ]</div><h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Online coaching packages.</h2><p className="text-sm text-zinc-400 mt-3">Compare the currently active plans. Package details and prices are managed by Mike in Staff HQ; secure checkout is available directly from each plan.</p></div>
      {(() => {
        const oneOff = plans.find((plan) => plan.id === 'online-4-week-once');
        const tiers = plans.filter((plan) => plan.id !== 'online-4-week-once');
        const featureList = Array.from(new Set(plans.flatMap((plan) => plan.features)));
        const renderFeature = (plan: PublicPlan, feature: string, comparison = true) => {
          const included = plan.features.includes(feature);
          if (!included && !comparison) return null;
          return <li key={feature} className="flex min-h-0 items-start gap-2 text-sm leading-snug">
            {included ? <Check aria-label="Included" className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" /> : <span aria-label="Not included" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-zinc-500"><span aria-hidden="true" className="text-base leading-none">×</span></span>}
            <span className={included ? 'text-zinc-200' : 'text-zinc-400'}>{feature}</span>
          </li>;
        };
        const renderCard = (plan: PublicPlan, featured = false) => (
          <article key={plan.id} className={'relative flex h-full flex-col border transition-all duration-300 ' + (featured ? 'p-4 md:p-4 border-[#30313a] bg-[#121419]' : plan.is_popular ? 'p-6 md:p-7 border-[#ff5500] bg-[#151419] shadow-[0_0_24px_rgba(255,85,0,0.15)]' : 'p-6 md:p-7 border-[#20232b] bg-[#121419]')}>
            {(featured || plan.is_popular || plan.badge) && <span className="absolute right-0 top-0 bg-[#ff5500] px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-black">{featured ? 'One-off coaching' : (plan.is_popular ? 'Most popular' : plan.badge)}</span>}
            <div className={'flex flex-col justify-between gap-3 pr-2 ' + (featured ? 'md:flex-row md:items-center' : 'min-h-[6.5rem]')}>
              <div className="min-w-0"><h3 className="flex min-h-[3.25rem] items-center font-display text-xl uppercase leading-tight text-white md:text-xl">{plan.name}</h3><p className="mt-1 min-h-4 text-xs font-mono uppercase tracking-wider text-zinc-500">{plan.tag}</p></div>
              <div className={featured ? 'shrink-0 md:text-right' : 'shrink-0'}><div className="font-display text-3xl text-[#ff5500] md:text-4xl">{formatPrice(plan.price)}</div>{plan.original_price !== null && <div className="text-xs font-mono text-zinc-500 line-through">{formatPrice(plan.original_price)}</div>}</div>
            </div>
            <p className={'text-sm leading-relaxed text-zinc-400 ' + (featured ? 'mt-1 max-w-4xl leading-snug' : 'mt-4 min-h-[4.5rem]')}>{plan.description}</p>
            <ul className={'grid content-start gap-y-2.5 ' + (featured ? 'mt-2 grid-cols-1 gap-y-1 sm:grid-cols-2 sm:gap-x-6' : 'mt-5 flex-1 grid-cols-1')}>{(featured ? plan.features : featureList).map((feature) => renderFeature(plan, feature, !featured))}</ul>
            <button onClick={() => onCheckout(plan)} className="mt-auto flex w-full items-center justify-center gap-2 border border-[#ff5500] bg-[#ff5500] px-5 py-2.5 font-mono text-xs font-bold uppercase text-black transition-colors hover:bg-[#ff6a1f]">
              Book Now <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        );
        return <div className="space-y-6">
          {oneOff && <div className="grid grid-cols-1">{renderCard(oneOff, true)}</div>}
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">{tiers.map((plan) => renderCard(plan, false))}</div>
        </div>;
      })()}
      {plansLoading && <p className="text-sm text-zinc-400 mt-4">Loading current online plans…</p>}{!plansLoading && plansError && <p role="status" className="text-sm text-zinc-400 mt-4">{plansError}</p>}
    </section>

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"><div className="mw-electric-card mx-auto flex max-w-4xl flex-col items-center border border-[#2a2f3a] bg-[#121419] p-8 text-center md:p-10"><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-2">[ QUESTIONS ]</div><h2 className="font-display text-3xl text-white uppercase">Need help choosing?</h2><p className="mx-auto max-w-xl text-sm text-zinc-400 mt-2">Contact Mike if you have a question about online coaching before buying.</p><button onClick={() => onSelectScreen('contact')} className="mt-6 inline-flex items-center justify-center gap-2 border border-[#ff5500] px-6 py-3.5 font-mono font-bold text-xs uppercase text-white hover:bg-[#ff5500] hover:text-black">Contact Mike <ArrowRight className="w-4 h-4" /></button></div></section>
  </div>;
};
