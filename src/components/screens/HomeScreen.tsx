import React, { useEffect, useState } from 'react';
import { ScreenId } from '../../types';
import { IMAGES, ABOUT, TESTIMONIALS, HOW_IT_WORKS, CONTACT } from '../../data/mockData';
import { ArrowRight, PhoneCall, Check, Star, MapPin, Award, UserCheck, GraduationCap, Smartphone, Scale, TrendingUp, Utensils, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoreBadges } from '../StoreBadges';
import { loadPublicPlans, PublicPlan } from '../../lib/plans';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: (interest?: string) => void;
  onCheckout: (plan: PublicPlan) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectScreen, onOpenBookCall, onCheckout }) => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);

  useEffect(() => {
    let active = true;
    void loadPublicPlans('online').then((result) => {
      if (!active) return;
      setPlans(result.plans);
      setPlansError(result.error);
      setPlansLoading(false);
    }, (cause: unknown) => {
      if (!active) return;
      console.error('[MW Fitness] Home pricing request failed:', cause);
      setPlans([]);
      setPlansError('Pricing is temporarily unavailable. Please contact Mike for current options.');
      setPlansLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (reviewsPaused || TESTIMONIALS.length < 2) return;
    const timer = window.setInterval(() => setReviewIndex((index) => (index + 1) % TESTIMONIALS.length), 5000);
    return () => window.clearInterval(timer);
  }, [reviewsPaused]);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const orderedTestimonials = [...TESTIMONIALS.slice(reviewIndex), ...TESTIMONIALS.slice(0, reviewIndex)];

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? 'text-[#ff5500] fill-[#ff5500]' : 'text-zinc-600'}`} />
    ));
  };

  return (
    <div className="page-layout">
      {/* 1. HERO */}
      <section className="page-hero relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.HERO}
            alt="MWFitnessUK training floor"
            className="w-full h-full object-cover object-center filter brightness-60 contrast-125 animate-in fade-in duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-8">
          <div className="w-full max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>Welcome to MWFitnessUK</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              Fitness that fits
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                your life.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Online coaching built around your goals and routine. No jargon, no judgement — just clear training and nutrition guidance, real support and progress that lasts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button onClick={() => onOpenBookCall()}
                className="cursor-pointer bg-[#ff5500] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Book a free call</span>
              </button>
              <button onClick={() => onSelectScreen('online-coaching')}
                className="cursor-pointer bg-[#16181d] border border-[#2b303d] text-white font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center gap-2 transition-colors"
              >
                <span>Explore online plans</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-6" aria-label="Jump to a section">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Jump to:</span>
              <button onClick={() => scrollToId('about-mike')} className="cursor-pointer bg-[#16181d] border border-[#262930] text-zinc-300 text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                About Mike
              </button>
              <button onClick={() => scrollToId('how-it-works')} className="cursor-pointer bg-[#16181d] border border-[#262930] text-zinc-300 text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                How it works
              </button>
              <button onClick={() => scrollToId('testimonials')} className="cursor-pointer bg-[#16181d] border border-[#262930] text-zinc-300 text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                Real results
              </button>
              <button onClick={() => scrollToId('packages-overview')} className="cursor-pointer bg-[#16181d] border border-[#262930] text-zinc-300 text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                Online coaching
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff5500]" /> {CONTACT.location}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400"></span> {CONTACT.sessions}
              </span>
            </div>
          </div>
        <div aria-hidden="true" className="industrial-stripe absolute bottom-0 left-0 z-20" />
      
      </div>
    </section>
    <div aria-hidden="true" className="hero-dashed-divider" />

      {/* 2. INDUSTRIAL TICKER TAPE BANNER */}
      <div style={{ marginTop: 0 }} className="home-ticker w-full bg-[#ff5500] text-black font-mono font-bold text-xs uppercase py-2.5 overflow-hidden whitespace-nowrap border-y border-black">
        <div className="inline-block animate-[marquee_20s_linear_infinite]">
          <span className="mx-4">● ONLINE COACHING</span>
          <span className="mx-4">● ONLINE COACHING</span>
          <span className="mx-4">● NUTRITIONAL ADVICE</span>
          <span className="mx-4">● CALORIE-CONTROLLED MEAL PREP IDEAS</span>
          <span className="mx-4">● BMR & MACRO BREAKDOWNS</span>
          <span className="mx-4">● COACHING BUILT AROUND YOU</span>
          <span className="mx-4">● ONLINE COACHING</span>
          <span className="mx-4">● ONLINE COACHING</span>
          <span className="mx-4">● NUTRITIONAL ADVICE</span>
          <span className="mx-4">● CALORIE-CONTROLLED MEAL PREP IDEAS</span>
          <span className="mx-4">● BMR & MACRO BREAKDOWNS</span>
          <span className="mx-4">● TRAIN ANYWHERE WITH ONLINE SUPPORT</span>
        </div>
      </div>

      <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />

      {/* 3. ABOUT MIKE */}
      <section id="about-mike" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="w-full min-w-0">
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ ABOUT MIKE ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              MEET MIKE. YOUR ONLINE COACH.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">I’m Mike, and I help busy people build strength, confidence and healthier routines through practical online coaching. Your plan is shaped around your goals, your schedule and real life — with clear training and nutrition guidance, plus support to help you stay consistent.</p>
            <div aria-hidden="true" className="mt-5 w-full border-b border-dashed border-[#454954]" />
          </div>
          <button onClick={() => onOpenBookCall()}
            className="cursor-pointer text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 group"
          >
            <span>Say hello</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Intro */}
          <div className="mw-electric-card h-full bg-[#121419] border border-[#20232b] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-xl text-white uppercase leading-none">{ABOUT.greeting}</div>
                <div className="text-[11px] font-mono text-zinc-500">Online Coach • Train anywhere</div>
              </div>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed">{ABOUT.intro}</p>

            <ul className="mt-5 space-y-2.5 text-sm font-sans text-zinc-300">
              {ABOUT.experience.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Background */}
          <div className="mw-electric-card bg-[#121419] border border-[#20232b] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-display text-xl text-white uppercase">My background</div>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed">{ABOUT.background}</p>

            <div className="mt-5 pt-4 border-t border-[#1c1f27]">
              <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-3">Why people train with me</div>
              <ul className="space-y-2 text-sm font-sans text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500]" /> Plans built around work & family life
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500]" /> No pressure, no judgement, ever
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500]" /> Honest advice that's easy to follow
                </li>
              </ul>
            </div>
          </div>
{/* Qualifications */}
          <div className="mw-electric-card bg-[#121419] border border-[#20232b] p-6 relative group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="font-display text-xl text-white uppercase">My qualifications</div>
            </div>
            <ul className="space-y-2 text-sm font-sans text-zinc-300">
              {ABOUT.qualifications.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[#1c1f27] font-mono text-[11px] text-[#8b929e] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff5500]"></span>
              <span>Qualified • Insured • Stockport</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ HOW IT WORKS ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            THREE SIMPLE STEPS.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="mw-electric-card bg-[#121419] border border-[#20232b] p-6 relative group">
              <div className="text-4xl font-display text-[#ff5500] font-bold mb-3">{step.step}</div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">{step.title}</h3>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ONLINE COACHING PACKAGES — live catalogue */}
      <section id="packages-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">[ CHOOSE YOUR PLAN ]</div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">PACKAGES THAT FIT YOUR WEEK.</h2>
            <p className="text-sm text-zinc-400 mt-3 max-w-2xl">The same online coaching packages, live prices and key benefits you'll find on our Online Coaching page.</p>
          </div>
          <button onClick={() => onSelectScreen('online-coaching')} className="cursor-pointer text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 group shrink-0">
            <span>Compare all plan details</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {(() => {
          const oneOff = plans.find((plan) => plan.id === 'online-4-week-once');
          const tiers = plans.filter((plan) => plan.id !== 'online-4-week-once');
          const featureList = Array.from(new Set(plans.flatMap((plan) => plan.features)));
          const renderFeature = (plan: PublicPlan, feature: string, comparison = true) => {
            const included = plan.features.includes(feature);
            if (!included && !comparison) return null;
            return <li key={feature} className="flex min-h-9 items-start gap-2.5 text-sm leading-relaxed">
              {included ? <Check aria-label="Included" className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" /> : <span aria-label="Not included" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-zinc-500"><span aria-hidden="true" className="text-base leading-none">×</span></span>}
              <span className={included ? 'text-zinc-200' : 'text-zinc-400'}>{feature}</span>
            </li>;
          };
          const renderCard = (plan: PublicPlan, featured = false) => (
            <article key={plan.id} className={'mw-electric-card relative flex h-full flex-col border transition-all duration-300 ' + (featured ? 'p-5 md:p-5 border-[#30313a] bg-[#121419]' : plan.is_popular ? 'p-6 md:p-7 border-[#ff5500] bg-[#151419] shadow-[0_0_24px_rgba(255,85,0,0.15)]' : 'p-6 md:p-7 border-[#20232b] bg-[#121419]')}>
              {(featured || plan.is_popular || plan.badge) && <span className="absolute right-0 top-0 bg-[#ff5500] px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-black">{featured ? 'One-off coaching' : (plan.is_popular ? 'Most popular' : plan.badge)}</span>}
              <div className={'flex flex-col justify-between gap-3 pr-2 ' + (featured ? 'md:flex-row md:items-center' : 'min-h-[6.5rem]')}>
                <div className="min-w-0">
                  <h3 className="flex min-h-[3.25rem] items-center font-display text-xl uppercase leading-tight text-white md:text-xl">{plan.name}</h3>
                  <p className="mt-1 min-h-4 text-xs font-mono uppercase tracking-wider text-zinc-500">{plan.tag}</p>
                </div>
                <div className={featured ? 'shrink-0 md:text-right' : 'shrink-0'}>
                  <div className="font-display text-3xl text-[#ff5500] md:text-4xl">£{plan.price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  {plan.original_price !== null && <div className="text-xs font-mono text-zinc-500 line-through">£{plan.original_price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                </div>
              </div>
              <p className={'text-sm leading-relaxed text-zinc-400 ' + (featured ? 'mt-2 max-w-4xl' : 'mt-4 min-h-[4.5rem]')}>{plan.description}</p>
              <ul className={'grid content-start gap-y-2.5 ' + (featured ? 'mt-3 grid-cols-1 sm:grid-cols-2 sm:gap-x-8' : 'mt-5 flex-1 grid-cols-1')}>{(featured ? plan.features : featureList).map((feature) => renderFeature(plan, feature, !featured))}</ul>
              <button onClick={() => onCheckout(plan)} className="mt-auto flex w-full items-center justify-center gap-2 border border-[#ff5500] bg-[#ff5500] px-5 py-3.5 font-mono text-xs font-bold uppercase text-black transition-colors hover:bg-[#ff6a1f]">
                Book Now <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          );
          return <div className="space-y-6">
            {oneOff && <div className="grid grid-cols-1">{renderCard(oneOff, true)}</div>}
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">{tiers.map((plan) => renderCard(plan, false))}</div>
          </div>;
        })()}
        {plansLoading && <p className="mt-4 text-sm text-zinc-400">Loading current online plans…</p>}
        {!plansLoading && plansError && <p role="status" className="mt-4 text-sm text-zinc-400">{plansError}</p>}
      </section>
      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#22252e] pb-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ WHAT PEOPLE SAY ]</div>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">Real people. Real results.</h2>
            <button onClick={() => onSelectScreen('reviews')} className="cursor-pointer inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:text-[#ff5500] sm:self-auto">All reviews <ArrowRight className="h-4 w-4" /></button>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">Mike believes fitness should fit around real life. His online coaching focuses on practical training, straightforward nutrition and consistent support — helping people build confidence, find a routine that works for them and make progress they can maintain.</p>
        </div>
        <div onMouseEnter={() => setReviewsPaused(true)} onMouseLeave={() => setReviewsPaused(false)} onFocus={() => setReviewsPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setReviewsPaused(false); }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {orderedTestimonials.slice(0, 3).map((t) => <article key={t.id} className="mw-electric-card min-w-0 border border-[#252a34] bg-[#121419]/70 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex gap-1">{renderStars(5)}</div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Member review</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">“{t.quote}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-[#252a34] pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#ff5500]/70 bg-[#ff5500]/10 font-display text-xs font-bold text-white">{t.avatarText}</div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base uppercase text-white">{t.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#ff5500]">{t.metric}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">{t.programme}</p>
                </div>
              </div>
            </article>)}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">{TESTIMONIALS.map((t, index) => <button key={t.id} aria-label={`Show review set starting at review ${index + 1}`} aria-current={reviewIndex === index ? 'true' : undefined} onClick={() => setReviewIndex(index)} className={`h-1.5 cursor-pointer rounded-full transition-all ${reviewIndex === index ? 'w-8 bg-[#ff5500]' : 'w-3 bg-zinc-700 hover:bg-zinc-500'}`} />)}</div>
            <div className="flex gap-2"><button aria-label="Previous reviews" onClick={() => setReviewIndex((index) => (index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="cursor-pointer border border-[#353a45] p-2 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-white"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next reviews" onClick={() => setReviewIndex((index) => (index + 1) % TESTIMONIALS.length)} className="cursor-pointer border border-[#353a45] p-2 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-white"><ChevronRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>


      {/* THE APP */}
      <section className="home-app-section relative overflow-hidden border-y border-[#22252e] bg-[#101115]">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 md:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="space-y-5 pt-2 lg:pt-8">
            <div className="inline-flex items-center gap-2 border border-[#ff5500]/50 bg-[#ff5500]/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#ff5500]"><Smartphone className="h-4 w-4" /> Your training, in your pocket</div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">The MWFitnessUK<br /><span className="text-[#ff5500]">app is on the way.</span></h2>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">A clearer way to keep your training, nutrition and progress together. The app is being developed to make consistency easier between check-ins — with the important details in one place, wherever you train.</p>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {['Daily weigh-ins and progress history','Food logging and nutrition habits','Training sessions and lift tracking','Progress photos, measurements and coach check-ins'].map((item) => <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" />{item}</li>)}
            </ul>
            <button onClick={() => onSelectScreen('app')} className="cursor-pointer inline-flex items-center gap-2 border border-[#ff5500] px-5 py-3 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-[#ff5500] hover:text-black">Explore the app <ArrowRight className="h-4 w-4" /></button>
            <div className="ml-0 w-full max-w-[360px] space-y-2 pt-1">
              <StoreBadges leftAlign />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Scale, title: 'Daily weigh-ins', text: 'Spot trends over time instead of focusing on one number.' },
              { icon: TrendingUp, title: 'Progress tracking', text: 'Keep measurements, photos and milestones together.' },
              { icon: Utensils, title: 'Food & nutrition', text: 'Log meals and build awareness of everyday habits.' },
              { icon: Dumbbell, title: 'Training log', text: 'Keep workouts and performance moving forward.' },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="mw-electric-card border border-[#252a34] bg-[#15171d]/90 p-5 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center border border-[#ff5500]/70 bg-[#ff5500]/10 text-[#ff5500]"><Icon className="h-5 w-5" /></div><h3 className="mb-2 font-display text-xl uppercase text-white">{title}</h3><p className="text-sm leading-relaxed text-zinc-400">{text}</p>
            </div>)}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 md:pb-20 lg:px-8">
        <div className="mw-electric-card relative mx-auto flex w-full max-w-4xl flex-col items-center overflow-hidden border border-[#2a2f3a] bg-gradient-to-b from-[#171920] to-[#121418] px-5 py-8 text-center sm:px-8 md:py-10">
          <div className="relative w-full max-w-2xl space-y-3">
            <div aria-hidden="true" className="mb-5 w-full border-t border-dashed border-[#454954]" />
            <div className="inline-flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-[#ff5500]">
              <span className="h-2 w-2 bg-[#ff5500]"></span>
              <span>Ready when you are</span>
            </div>
            <h2 className="font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">
              LET'S GET STARTED.
            </h2>
            <p className="mx-auto max-w-xl text-sm font-sans leading-relaxed text-zinc-300">
              One quick chat is all it takes. We'll talk about where you are, where you want to be and the simplest way to get there. No commitment, no pressure.
            </p>
            <div aria-hidden="true" className="pt-1 w-full border-b border-dashed border-[#454954]" />
          </div>
          <div className="relative mt-6 flex w-full max-w-sm flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
            <button onClick={() => onOpenBookCall()}
              className="flex w-full max-w-[220px] cursor-pointer items-center justify-center gap-2 bg-[#ff5500] px-5 py-3 font-mono text-xs font-bold uppercase text-black shadow-[0_0_20px_rgba(255,85,0,0.25)] transition-colors active:scale-95"
            >
              <PhoneCall className="h-4 w-4" />
              Book a free call
            </button>
            <button onClick={() => onSelectScreen('contact')}
              className="w-full max-w-[220px] cursor-pointer border border-[#2b303d] bg-[#16181d] px-5 py-3 font-mono text-[11px] font-bold uppercase text-white transition-colors hover:border-[#ff5500]"
            >
              Or send a message
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};