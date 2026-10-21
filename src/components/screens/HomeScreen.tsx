import React, { useEffect, useState } from 'react';
import { ScreenId } from '../../types';
import { IMAGES, ABOUT, TESTIMONIALS, HOW_IT_WORKS, CONTACT, APP_FEATURES } from '../../data/mockData';
import { ArrowRight, PhoneCall, Check, Star, MapPin, Award, UserCheck, GraduationCap, Smartphone, Scale, TrendingUp, Utensils, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoreBadges } from '../StoreBadges';
import { loadPublicPlans, PublicPlan } from '../../lib/plans';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: (interest?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectScreen, onOpenBookCall }) => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);

  useEffect(() => {
    let active = true;
    void loadPublicPlans('online').then((result) => {
      if (!active) return;
      setPlans(result.plans.slice(0, 3));
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6">
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

            <div className="pt-2 space-y-2"><p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MWFitnessUK app — coming soon</p><StoreBadges /></div>

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
        </div>
        <div aria-hidden="true" className="industrial-stripe absolute bottom-0 left-0 z-20" />
      </section>

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
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ ABOUT MIKE ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              TRAINING MADE SIMPLE.
            </h2>
            <div aria-hidden="true" className="industrial-stripe industrial-stripe--marker" />
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

      {/* 4. ONLINE COACHING PACKAGES — keep the homepage aligned with the live coaching catalogue */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <article key={plan.id} className={'mw-electric-card bg-[#121419] border p-6 md:p-7 flex flex-col relative transition-all duration-300 ' + (plan.is_popular ? 'border-[#ff5500] shadow-[0_0_24px_rgba(255,85,0,0.15)]' : 'border-[#20232b]')}>
              {plan.badge && <span className="absolute top-0 right-0 bg-[#ff5500] text-black font-mono text-[10px] uppercase px-3 py-1.5 font-bold">{plan.badge}</span>}
              <div className="flex items-start justify-between gap-4">
                <div><h3 className="font-display text-3xl text-white uppercase">{plan.name}</h3><p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">{plan.tag}</p></div>
                <div className="text-right shrink-0">
                  <div className="font-display text-3xl text-white">£{plan.price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  {plan.original_price !== null && <div className="text-xs font-mono text-zinc-500 line-through">£{plan.original_price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mt-4">{plan.description}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
                {plan.features.slice(0, 3).map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" /><span>{feature}</span></li>)}
              </ul>
              <button onClick={() => onSelectScreen('online-coaching')} className="cursor-pointer mt-7 bg-[#ff5500] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center justify-center gap-2 transition-all">
                View plan &amp; checkout <ArrowRight className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
        {plansLoading && <p className="text-sm text-zinc-400 mt-4">Loading current online plans…</p>}
        {!plansLoading && plansError && <p role="status" className="text-sm text-zinc-400 mt-4">{plansError}</p>}
      </section>
      {/* 4. ONLINE COACHING SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mw-electric-card relative overflow-hidden border border-[#ff5500]/60 bg-[#171920] p-8 md:p-12">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[#ff5500]/10 skew-x-[-18deg] translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest">[ TRAIN ANYWHERE ]</div>
            <h2 className="font-display text-4xl sm:text-6xl text-white uppercase tracking-tight">Online coaching. No meet-ups required.</h2>
            <p className="text-sm sm:text-base font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Get a plan built around your life, your equipment and your goals, with weekly check-ins and direct support from Mike.
            </p>
            <button onClick={() => onSelectScreen('online-coaching')}
              className="cursor-pointer bg-[#ff5500] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
            >
              Explore online coaching
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 text-center">
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

      {/* 6. THE APP */}
      <section className="relative overflow-hidden border-y border-[#22252e] bg-[#101115]">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#ff5500]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 border border-[#ff5500]/50 bg-[#ff5500]/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#ff5500]"><Smartphone className="h-4 w-4" /> Your training, in your pocket</div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">The MWFitnessUK<br /><span className="text-[#ff5500]">app is on the way.</span></h2>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">A clearer way to keep your training, nutrition and progress together. The app is being developed to make consistency easier between check-ins — with the important details in one place, wherever you train.</p>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {['Daily weigh-ins and progress history','Food logging and nutrition habits','Training sessions and lift tracking','Progress photos, measurements and coach check-ins'].map((item) => <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]" />{item}</li>)}
            </ul>
            <div className="pt-2"><p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Store listings will be linked once published</p><StoreBadges /></div>
            <button onClick={() => onSelectScreen('app')} className="cursor-pointer inline-flex items-center gap-2 border border-[#ff5500] px-5 py-3 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-[#ff5500] hover:text-black">Explore the app <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Scale, title: 'Daily weigh-ins', text: 'Spot trends over time instead of focusing on one number.' },
              { icon: TrendingUp, title: 'Progress tracking', text: 'Keep measurements, photos and milestones together.' },
              { icon: Utensils, title: 'Food & nutrition', text: 'Log meals and build awareness of everyday habits.' },
              { icon: Dumbbell, title: 'Training log', text: 'Keep workouts and performance moving forward.' },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="mw-electric-card border border-[#252a34] bg-[#15171d]/90 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#ff5500]/60 bg-[#ff5500]/10 text-[#ff5500]"><Icon className="h-5 w-5" /></div><h3 className="mb-2 font-display text-xl uppercase text-white">{title}</h3><p className="text-sm leading-relaxed text-zinc-400">{text}</p>
            </div>)}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section id="testimonials" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#22252e] pb-5 sm:flex-row sm:items-end">
          <div><div className="mb-1 font-mono text-xs uppercase tracking-widest text-[#ff5500">[ WHAT PEOPLE SAY ]</div><h2 className="font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">Real people. Real results.</h2><p className="mt-3 max-w-xl text-sm text-zinc-400">Stories from people building stronger routines with support that fits around real life.</p></div>
          <button onClick={() => onSelectScreen('reviews')} className="cursor-pointer inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:text-[#ff5500] sm:self-auto">All reviews <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="mw-electric-card overflow-hidden border border-[#252a34] bg-[#121419] p-6 sm:p-9" onMouseEnter={() => setReviewsPaused(true)} onMouseLeave={() => setReviewsPaused(false)} onFocus={() => setReviewsPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setReviewsPaused(false); }}>
          <div className="mb-6 flex items-center justify-between"><div className="flex gap-1.5">{renderStars(5)}</div><span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Member stories · auto-moving</span></div>
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none" style={{ transform: `translateX(-${reviewIndex * 100}%)` }}>
              {TESTIMONIALS.map((t) => <article key={t.id} className="w-full min-w-full shrink-0 px-1">
                <div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center border border-[#ff5500] bg-[#ff5500]/10 font-display text-sm font-bold text-white">{t.avatarText}</div><div><p className="font-display text-xl uppercase text-white">{t.name}</p><p className="font-mono text-[10px] uppercase tracking-wider text-[#ff5500]">{t.metric}</p></div></div>
                <p className="max-w-4xl text-lg leading-relaxed text-zinc-200 sm:text-2xl">“{t.quote}”</p><p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{t.programme}</p>
              </article>)}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-[#252a34] pt-5">
            <div className="flex items-center gap-2">{TESTIMONIALS.map((t, index) => <button key={t.id} aria-label={`Show review ${index + 1}`} aria-current={reviewIndex === index ? 'true' : undefined} onClick={() => setReviewIndex(index)} className={`h-1.5 cursor-pointer rounded-full transition-all ${reviewIndex === index ? 'w-8 bg-[#ff5500]' : 'w-3 bg-zinc-700 hover:bg-zinc-500'}`} />)}</div>
            <div className="flex gap-2"><button aria-label="Previous review" onClick={() => setReviewIndex((index) => (index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="cursor-pointer border border-[#353a45] p-2 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-white"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next review" onClick={() => setReviewIndex((index) => (index + 1) % TESTIMONIALS.length)} className="cursor-pointer border border-[#353a45] p-2 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-white"><ChevronRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>

      {/* 8. CLOSING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mw-electric-card relative bg-gradient-to-r from-[#171920] to-[#121418] border border-[#2a2f3a] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#ff5500]"></span>
              <span>Ready when you are</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              LET'S GET STARTED.
            </h2>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed max-w-xl">
              One quick chat is all it takes. We'll talk about where you are, where you want to be and the simplest way to get there. No commitment, no pressure.
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <button onClick={() => onOpenBookCall()}
              className="cursor-pointer bg-[#ff5500] text-black font-mono font-bold text-sm uppercase px-8 py-4 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              Book a free call
            </button>
            <button onClick={() => onSelectScreen('contact')}
              className="cursor-pointer bg-[#16181d] border border-[#2b303d] text-white font-mono font-bold text-xs uppercase px-6 py-2.5 transition-colors"
            >
              Or send a message
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};