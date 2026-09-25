import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { ONLINE_COACHING } from '../../data/mockData';
import { createCheckoutSession } from '../../lib/stripe';
import { ArrowRight, Check, CreditCard, MessageCircle, Video } from 'lucide-react';

interface OnlineCoachingScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const OnlineCoachingScreen: React.FC<OnlineCoachingScreenProps> = ({ onSelectScreen }) => {
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    setError('');
    const result = await createCheckoutSession(planId);
    if (result.url) {
      window.location.assign(result.url);
      return;
    }
    setError(result.error || 'Checkout is unavailable right now. Please contact Mike and he will help you get started.');
    setLoadingPlan('');
  };

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative min-h-[58vh] flex items-center overflow-hidden border-b border-[#262930]">
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
            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">{ONLINE_COACHING.intro}</p>
            <button onClick={() => document.getElementById('online-plans')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2">
              Choose your plan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ WHAT YOU GET ]</div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Coaching built around real life.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CreditCard, title: 'A plan made for you', text: 'Choose 3, 4 or 5 training days with nutrition guidance matched to your goals and routine.' },
            { icon: Video, title: 'Weekly check-ins', text: 'Review progress with a weekly Zoom call and keep your plan moving in the right direction.' },
            { icon: MessageCircle, title: 'Direct support', text: 'Use WhatsApp for questions, updates and same-day answers when you need them.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-[#121419] border border-[#20232b] p-6">
              <Icon className="w-7 h-7 text-[#ff5500] mb-5" />
              <h3 className="font-display text-2xl text-white uppercase mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
          {ONLINE_COACHING.features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />{feature}</li>)}
        </ul>
      </section>

      <section id="online-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ BUY ONLINE ]</div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">Pick your commitment.</h2>
          <p className="text-sm text-zinc-400 mt-3">All payments are made in advance. Stripe checkout is secure, and no personal meet-up is needed to start.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ONLINE_COACHING.plans.map((plan) => (
            <div key={plan.id} className={`bg-[#121419] border p-7 md:p-9 flex flex-col ${plan.id === 'online-12-week' ? 'border-[#ff5500] shadow-[0_0_24px_rgba(255,85,0,0.15)]' : 'border-[#20232b]'}`}>
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest">{plan.badge}</div>
              <h3 className="font-display text-3xl text-white uppercase mt-3">{plan.name}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">{plan.description}</p>
              <div className="mt-7 flex items-baseline gap-2"><span className="font-display text-5xl text-white">£{plan.price.toFixed(2)}</span><span className="text-xs font-mono text-zinc-500">GBP / paid in advance</span></div>
              <button onClick={() => handleCheckout(plan.id)} disabled={loadingPlan !== ''} className="mt-7 bg-[#ff5500] hover:bg-[#ff6a1f] disabled:opacity-60 text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center justify-center gap-2">
                {loadingPlan === plan.id ? 'Opening secure checkout...' : 'Buy this plan'}
                {loadingPlan !== plan.id && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
        {error && <div className="mt-5 border border-red-500/50 bg-[#2a1414] text-red-300 px-4 py-3 text-sm font-mono">{error}</div>}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="border border-[#2a2f3a] bg-[#121419] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div><div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-2">[ QUESTIONS ]</div><h2 className="font-display text-3xl text-white uppercase">Want to talk it through?</h2><p className="text-sm text-zinc-400 mt-2">Contact Mike if you have a question before buying.</p></div>
          <button onClick={() => onSelectScreen('contact')} className="border border-[#ff5500] text-white hover:bg-[#ff5500] hover:text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2">Contact Mike <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    </div>
  );
};