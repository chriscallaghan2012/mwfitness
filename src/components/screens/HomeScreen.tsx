import React from 'react';
import { ScreenId } from '../../types';
import { IMAGES, ABOUT, PRICING_TIERS, TESTIMONIALS, HOW_IT_WORKS, CONTACT } from '../../data/mockData';
import { ArrowRight, PhoneCall, Check, Star, MapPin, Award, UserCheck, GraduationCap } from 'lucide-react';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: (interest?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectScreen, onOpenBookCall }) => {
  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? 'text-[#ff5500] fill-[#ff5500]' : 'text-zinc-600'}`} />
    ));
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
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
              Simple personal training and online coaching for busy people. No jargon, no judgement — just clear guidance, real support and results that last.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenBookCall()}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Book a free call</span>
              </button>
              <button
                onClick={() => onSelectScreen('packages')}
                className="bg-[#16181d] border border-[#2b303d] hover:border-[#ff5500] text-white font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center gap-2 transition-colors"
              >
                <span>View packages</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-6" aria-label="Jump to a section">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Jump to:</span>
              <button onClick={() => scrollToId('about-mike')} className="bg-[#16181d] border border-[#262930] hover:border-[#ff5500] text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                About Mike
              </button>
              <button onClick={() => scrollToId('how-it-works')} className="bg-[#16181d] border border-[#262930] hover:border-[#ff5500] text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                How it works
              </button>
              <button onClick={() => scrollToId('testimonials')} className="bg-[#16181d] border border-[#262930] hover:border-[#ff5500] text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                Real results
              </button>
              <button onClick={() => scrollToId('packages-overview')} className="bg-[#16181d] border border-[#262930] hover:border-[#ff5500] text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors">
                Packages
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
      </section>

      {/* 2. INDUSTRIAL TICKER TAPE BANNER */}
      <div className="w-full bg-[#ff5500] text-black font-mono font-bold text-xs uppercase py-2.5 overflow-hidden whitespace-nowrap border-y border-black">
        <div className="inline-block animate-[marquee_20s_linear_infinite]">
          <span className="mx-4">● 1-2-1 PERSONAL TRAINING</span>
          <span className="mx-4">● ONLINE COACHING</span>
          <span className="mx-4">● NUTRITIONAL ADVICE</span>
          <span className="mx-4">● CALORIE-CONTROLLED MEAL PREP IDEAS</span>
          <span className="mx-4">● BMR & MACRO BREAKDOWNS</span>
          <span className="mx-4">● PURE GYM HAZEL GROVE • STOCKPORT</span>
          <span className="mx-4">● 1-2-1 PERSONAL TRAINING</span>
          <span className="mx-4">● ONLINE COACHING</span>
          <span className="mx-4">● NUTRITIONAL ADVICE</span>
          <span className="mx-4">● CALORIE-CONTROLLED MEAL PREP IDEAS</span>
          <span className="mx-4">● BMR & MACRO BREAKDOWNS</span>
          <span className="mx-4">● PURE GYM HAZEL GROVE • STOCKPORT</span>
        </div>
      </div>

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
          </div>
          <button
            onClick={() => onOpenBookCall()}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 group"
          >
            <span>Say hello</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Intro */}
          <div className="bg-[#121419] border border-[#20232b] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-xl text-white uppercase leading-none">{ABOUT.greeting}</div>
                <div className="text-[11px] font-mono text-zinc-500">Personal Trainer • {CONTACT.locationShort}</div>
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
          <div className="bg-[#121419] border border-[#20232b] p-6">
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
          <div className="bg-[#121419] border border-[#20232b] p-6 relative hover:border-[#ff5500]/50 transition-all duration-300 group">
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

      {/* 4. WHAT'S AVAILABLE */}
      <section id="packages-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ WHAT'S AVAILABLE ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              PACKAGES THAT FIT YOUR WEEK.
            </h2>
          </div>
          <button
            onClick={() => onSelectScreen('packages')}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 group"
          >
            <span>See all packages</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-[#121419] border p-6 flex flex-col relative group transition-all duration-300 ${
                tier.isPopular ? 'border-[#ff5500] shadow-[0_0_20px_rgba(255,85,0,0.15)]' : 'border-[#20232b] hover:border-[#ff5500]/50'
              }`}
            >
              {tier.isPopular && (
                <span className="absolute top-0 right-0 bg-[#ff5500] text-black font-mono text-[10px] uppercase px-2.5 py-1 font-bold">
                  {tier.badge}
                </span>
              )}
              <div className="text-3xl font-display text-[#ff5500] font-bold mb-2">{tier.name}</div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-4">{tier.tag}</div>

              <p className="text-xs font-sans text-zinc-400 leading-relaxed mb-4">{tier.description}</p>

              <div className="mt-auto pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl text-white font-bold">£{tier.price}</span>
                  {tier.originalPrice && (
                    <span className="text-xs font-mono text-zinc-500 line-through">£{tier.originalPrice}</span>
                  )}
                </div>
                <button
                  onClick={() => onOpenBookCall(tier.name)}
                  className="mt-2 w-full bg-[#16181d] border border-[#2b303d] hover:bg-[#ff5500] hover:text-black text-white font-mono text-xs font-bold py-2.5 uppercase tracking-wider transition-all"
                >
                  {tier.ctaText}
                </button>
              </div>
            </div>
          ))}
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
            <div key={step.step} className="bg-[#121419] border border-[#20232b] p-6 relative group hover:border-[#ff5500]/50 transition-all duration-300">
              <div className="text-4xl font-display text-[#ff5500] font-bold mb-3">{step.step}</div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">{step.title}</h3>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ WHAT PEOPLE SAY ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            REAL PEOPLE. REAL RESULTS.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-[#121419] border border-[#20232b] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center font-display text-white text-sm font-bold">
                  {t.avatarText}
                </div>
                <div>
                  <div className="text-sm font-sans text-white font-medium">{t.name}</div>
                  <div className="text-[11px] font-mono text-[#ff5500] uppercase tracking-wider">{t.metric}</div>
                </div>
              </div>
              <p className="text-sm font-sans text-zinc-300 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-1.5 mt-4">
                {renderStars(5)}
                <span className="text-[11px] font-mono text-zinc-500 ml-1">{t.programme}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLOSING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative bg-gradient-to-r from-[#171920] to-[#121418] border border-[#2a2f3a] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
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
            <button
              onClick={() => onOpenBookCall()}
              className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-sm uppercase px-8 py-4 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              Book a free call
            </button>
            <button
              onClick={() => onSelectScreen('contact')}
              className="bg-[#16181d] border border-[#2b303d] hover:border-[#ff5500] text-white font-mono font-bold text-xs uppercase px-6 py-2.5 transition-colors"
            >
              Or send a message
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};