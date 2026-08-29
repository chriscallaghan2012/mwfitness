import React, { useState } from 'react';
import { ScreenId, Programme } from '../../types';
import { IMAGES, PRICING_TIERS, PROGRAMMES, TESTIMONIALS, CONTACT, REVIEWS } from '../../data/mockData';
import { ArrowRight, Flame, Shield, Activity, Dumbbell, Award, ChevronRight, Check, MapPin, Mail, Instagram, Facebook, Star, StarHalf, Send, User, Phone, Calendar, CheckCircle2 } from 'lucide-react';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenConsultation: (tier?: string) => void;
  onSelectProgramme: (programme: Programme) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectScreen,
  onOpenConsultation,
  onSelectProgramme,
}) => {
  // Contact / Booking form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPackage, setFormPackage] = useState('Gold');
  const [formTime, setFormTime] = useState('Evening');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSending, setFormSending] = useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSending(true);

    const subject = encodeURIComponent(`MWFITNESS Booking Enquiry — ${formPackage} Package`);
    const body = encodeURIComponent(
      `Hi Mike,\n\nI'd like to book some sessions.\n\n` +
      `Name: ${formName}\nEmail: ${formEmail}\nPhone: ${formPhone || 'Not provided'}\n` +
      `Package: ${formPackage}\nPreferred time: ${formTime}\n\n` +
      `About me / goals:\n${formMessage}\n`
    );

    // Open the visitor's email app pre-addressed to the coach
    setTimeout(() => {
      window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
      setFormSending(false);
      setFormSubmitted(true);
    }, 400);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-[#ff5500] fill-[#ff5500]' : 'text-zinc-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        {/* Background Image with Dark Vignette Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.HERO_KETTLEBELL}
            alt="MWFITNESS Main Gym Floor"
            className="w-full h-full object-cover object-center filter brightness-60 contrast-125 animate-in fade-in duration-700"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Tech Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ PROTOCOL: HIGH-PERFORMANCE S&C ]</span>
            </div>

            {/* Massive Display Headline */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black drop-shadow-2xl">
              UNCOMPROMISING <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] via-[#ff772e] to-white">
                STRENGTH.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl font-sans text-zinc-300 font-normal leading-relaxed max-w-2xl">
              Engineered for athletes who refuse average. High-performance strength and conditioning, individual biomechanical audits, and relentless progressive overload.
            </p>

            {/* CTA Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                id="hero-start-btn"
                onClick={() => onOpenConsultation('Apex Protocol')}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 flex items-center gap-3 transition-all duration-200 shadow-[0_0_30px_rgba(255,85,0,0.4)] active:scale-95 group"
              >
                <span>COMMENCE INTAKE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-explore-tiers-btn"
                onClick={() => onSelectScreen('packages')}
                className="bg-[#14161c]/80 hover:bg-[#1a1d24] text-white border border-[#2d323c] hover:border-zinc-400 font-mono text-xs sm:text-sm uppercase tracking-wider px-6 py-4 transition-all"
              >
                EXPLORE TIERS [05]
              </button>

              <button
                id="hero-tools-btn"
                onClick={() => onSelectScreen('tools')}
                className="bg-transparent hover:bg-zinc-800/40 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider px-4 py-4 transition-colors"
              >
                CALCULATORS [08]
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Metric Strip */}
        <div className="absolute bottom-0 inset-x-0 bg-[#0b0c0e]/90 border-t border-[#1f2229] backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
            <div className="border-r border-[#1f2229] last:border-r-0">
              <div className="text-xl sm:text-2xl font-display text-white font-bold tracking-wider">4</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Coaching Packages</div>
            </div>
            <div className="border-r border-[#1f2229] last:border-r-0">
              <div className="text-xl sm:text-2xl font-display text-[#ff5500] font-bold tracking-wider">£120</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Packages From</div>
            </div>
            <div className="border-r border-[#1f2229] last:border-r-0">
              <div className="text-xl sm:text-2xl font-display text-white font-bold tracking-wider">10%</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Off @shwagmcr Merch</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-display text-emerald-400 font-bold tracking-wider">8/12</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Week Programme Discounts</div>
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

      {/* 3. CORE ARCHITECTURAL PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ THE METHODOLOGY ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              SCIENTIFIC RIGOR. ZERO SPECULATION.
            </h2>
          </div>
          <button 
            onClick={() => onSelectScreen('methodology')}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 group"
          >
            <span>Explore 4-Phase Pipeline</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 01 */}
          <div className="bg-[#121419] border border-[#20232b] p-6 relative hover:border-[#ff5500]/50 transition-all duration-300 group">
            <div className="text-3xl font-display text-[#ff5500] font-bold mb-3">01</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">
              BIOMECHANICAL AUDITING
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Every lift is scrutinized frame-by-frame. We map joint angles, bar trajectory velocity, and torso stability to eliminate sticking points and prevent structural damage.
            </p>
            <div className="mt-4 pt-4 border-t border-[#1c1f27] font-mono text-[11px] text-[#8b929e] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff5500]"></span>
              <span>Bar velocity curves & kinematics</span>
            </div>
          </div>

          {/* Pillar 02 */}
          <div className="bg-[#121419] border border-[#20232b] p-6 relative hover:border-[#ff5500]/50 transition-all duration-300 group">
            <div className="text-3xl font-display text-[#ff5500] font-bold mb-3">02</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">
              PERIODIZED OVERLOAD
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              No generic splits. We deploy block and undulating periodization that alternates accumulation, intensification, and realization phases for maximum neurological adaptation.
            </p>
            <div className="mt-4 pt-4 border-t border-[#1c1f27] font-mono text-[11px] text-[#8b929e] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff5500]"></span>
              <span>Auto-regulated RPE & velocity thresholds</span>
            </div>
          </div>

          {/* Pillar 03 */}
          <div className="bg-[#121419] border border-[#20232b] p-6 relative hover:border-[#ff5500]/50 transition-all duration-300 group">
            <div className="text-3xl font-display text-[#ff5500] font-bold mb-3">03</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">
              PERI-WORKOUT NUTRITION
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Targeted carbohydrate replenishment, systemic hydration, and protein synthesis optimization timed to match your microcycle volume demands and CNS recovery needs.
            </p>
            <div className="mt-4 pt-4 border-t border-[#1c1f27] font-mono text-[11px] text-[#8b929e] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff5500]"></span>
              <span>Dynamic macro scaling by training day</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE TWO CORE PATHWAYS (1-ON-1 PT VS REMOTE COACHING) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pathway A: Personal Training */}
          <div className="relative overflow-hidden bg-[#121419] border border-[#262a33] group">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              <img 
                src={IMAGES.PT_SLED_PUSH} 
                alt="1-on-1 Floor Personal Training" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121419] via-transparent to-transparent"></div>
              <span className="absolute top-4 left-4 bg-black/80 border border-[#ff5500] text-[#ff5500] font-mono text-[10px] uppercase tracking-wider px-2.5 py-1">
                IN-PERSON • PURE GYM HAZEL GROVE
              </span>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <h3 className="font-display text-3xl text-white uppercase tracking-wide">
                1-2-1 PERSONAL TRAINING
              </h3>
              <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                Private 4-session coaching blocks on the full Pure Gym floor. Structured programming, direct coaching on every set, and nutritional advice to match.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#1f222a]">
                <span className="text-xs font-mono text-zinc-400">From £120 • Morning, evening & weekend slots</span>
                <button
                  onClick={() => onSelectScreen('pt')}
                  className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5"
                >
                  <span>Explore PT [02]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Pathway B: Online High Performance */}
          <div className="relative overflow-hidden bg-[#121419] border border-[#262a33] group">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              <img 
                src={IMAGES.ONLINE_COACHING_GYM} 
                alt="Online Remote Coaching" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121419] via-transparent to-transparent"></div>
              <span className="absolute top-4 left-4 bg-black/80 border border-emerald-500 text-emerald-400 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1">
                REMOTE • ONLINE COACHING
              </span>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <h3 className="font-display text-3xl text-white uppercase tracking-wide">
                REMOTE ONLINE COACHING
              </h3>
              <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                Full coaching wherever you train. An individual programme built around your goals, equipment and schedule — with nutritional advice and meal prep ideas included.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#1f222a]">
                <span className="text-xs font-mono text-zinc-400">Morning, evening & weekend availability</span>
                <button
                  onClick={() => onSelectScreen('online')}
                  className="bg-[#1f232b] hover:bg-[#282d38] text-white border border-[#353b47] font-mono text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5"
                >
                  <span>Explore Online [03]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR STANDALONE BLUEPRINTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ STANDALONE PROTOCOLS ]
            </div>
            <h2 className="font-display text-4xl text-white uppercase tracking-tight">
              BATTLE-TESTED PROGRAMMES
            </h2>
          </div>
          <button
            onClick={() => onSelectScreen('programmes')}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>View All Protocols [06]</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROGRAMMES.map((prog) => (
            <div
              key={prog.id}
              className="bg-[#121419] border border-[#21242c] p-5 flex flex-col justify-between hover:border-[#ff5500]/60 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                  <span className="text-[#ff5500] font-bold">{prog.category}</span>
                  <span>{prog.duration}</span>
                </div>
                <h3 className="font-display text-xl text-white uppercase tracking-wide group-hover:text-[#ff5500] transition-colors">
                  {prog.title}
                </h3>
                <p className="text-xs font-sans text-zinc-400 mt-2 line-clamp-3">
                  {prog.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1c1f26] flex items-center justify-between">
                <span className="font-display text-2xl text-white">£{prog.price}</span>
                <button
                  onClick={() => onSelectProgramme(prog)}
                  className="bg-[#191b22] hover:bg-[#ff5500] hover:text-black text-zinc-200 font-mono text-xs px-3 py-1.5 uppercase tracking-wider transition-all"
                >
                  Blueprint
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ATHLETE VERIFICATION & PROOF */}
      <section className="bg-[#111317] border-y border-[#20232a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ VERIFIED TELEMETRY ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              ATHLETE CASE STUDIES
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-2">
              Results from powerlifters, collegiate athletes, and everyday lifters pursuing raw output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-[#15171d] border border-[#242832] p-6 flex flex-col justify-between">
                <div>
                  <div className="inline-block bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] font-mono text-xs font-bold px-2.5 py-1 mb-4">
                    {t.metric}
                  </div>
                  <p className="text-xs font-sans text-zinc-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-[#1e222a] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-white font-bold uppercase">{t.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{t.programme}</div>
                  </div>
                  <div className="w-8 h-8 bg-[#1e222b] border border-zinc-700 flex items-center justify-center font-mono text-xs text-zinc-300 font-bold">
                    {t.avatarText}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COACHING HQ / CONTACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ COACHING HQ // STOCKPORT ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              TRAIN AT PURE GYM, HAZEL GROVE
            </h2>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            {CONTACT.sessions}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Training Image */}
          <div className="relative overflow-hidden min-h-[340px] sm:min-h-[420px] group">
            <img
              src={IMAGES.FACILITY_CONTACT}
              alt="Training at Pure Gym Hazel Grove, Stockport"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 border border-[#ff5500]/60 px-4 py-3">
              <div className="font-mono text-xs text-[#ff5500] uppercase tracking-widest">
                PURE GYM HAZEL GROVE // STOCKPORT
              </div>
              <div className="font-mono text-[11px] text-zinc-300 mt-1">
                1-2-1 sessions on the full commercial floor — free weights, machines, cardio and functional zones.
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-[#121419] border border-[#262a33] p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest pb-3 border-b border-[#1f222a]">
                <span className="w-2 h-2 bg-[#ff5500]"></span>
                DIRECT CHANNELS // EMAIL & SOCIAL
              </div>

              {/* Training base */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 bg-[#181b22] border border-[#2b303d] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#ff5500]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Training Base
                  </div>
                  <div className="text-sm font-mono text-white">
                    {CONTACT.location}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 bg-[#181b22] border border-[#2b303d] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#ff5500]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Email
                  </div>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-sm font-mono text-white hover:text-[#ff5500] transition-colors"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 bg-[#181b22] border border-[#2b303d] flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-[#ff5500]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Instagram
                  </div>
                  <a
                    href={CONTACT.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-white hover:text-[#ff5500] transition-colors"
                  >
                    @{CONTACT.instagramHandle}
                  </a>
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 bg-[#181b22] border border-[#2b303d] flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-[#ff5500]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Facebook
                  </div>
                  <a
                    href={CONTACT.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-white hover:text-[#ff5500] transition-colors"
                  >
                    {CONTACT.facebookName}
                  </a>
                </div>
              </div>

              {/* Extras */}
              <div className="p-3 bg-[#171920] border border-[#222630] font-mono text-[11px] text-zinc-300 space-y-1.5">
                <div>{CONTACT.note} — 10% off ALL @shwagmcr merchandise</div>
                <div>Discounts available on 8-week &amp; 12-week programmes</div>
              </div>
            </div>

            <button
              onClick={() => onOpenConsultation('Gold')}
              className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-sm uppercase tracking-wider px-6 py-4 flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(255,85,0,0.35)] active:scale-95"
            >
              <span>Book Your 1-2-1 Sessions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. CLIENT REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ CLIENT REVIEWS ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              WHAT MY CLIENTS SAY
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl text-[#ff5500] font-bold">5.0</span>
            <span className="text-xs font-mono text-zinc-300">
              <span className="flex items-center gap-0.5 mb-1">{renderStars(5)}</span>
              <span className="text-zinc-500">Based on {REVIEWS.length}+ happy clients</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.id} className="bg-[#121419] border border-[#222630] p-6 flex flex-col justify-between hover:border-[#ff5500]/50 transition-colors">
              <div>
                <div className="flex items-center gap-1 mb-3">{renderStars(r.rating)}</div>
                <p className="text-xs font-sans text-zinc-300 italic leading-relaxed mb-5">
                  &ldquo;{r.quote}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-[#1e222a] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-white font-bold uppercase">{r.name}</div>
                  <div className="text-[10px] font-mono text-[#ff5500] uppercase">{r.packageName} &bull; {r.date}</div>
                </div>
                <div className="w-8 h-8 bg-[#1e222b] border border-zinc-700 flex items-center justify-center font-mono text-xs text-zinc-300 font-bold">
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONTACT & BOOKING FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ BOOKING & CONTACT ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            BOOK YOUR 4-SESSION BLOCK
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Booking Form */}
          <div className="lg:col-span-7">
            {formSubmitted ? (
              <div className="bg-[#121419] border border-emerald-500/40 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[#16221a] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-3xl text-white uppercase tracking-wide">
                  ENQUIRY READY TO SEND
                </h3>
                <p className="text-xs font-mono text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Your email app should have opened pre-addressed to{' '}
                  <a href={`mailto:${CONTACT.email}`} className="text-[#ff5500] font-semibold">{CONTACT.email}</a> or DM @{CONTACT.instagramHandle}.
                </p>
                <button
                  onClick={() => { setFormSubmitted(false); setFormName(''); setFormEmail(''); setFormPhone(''); setFormMessage(''); }}
                  className="bg-[#1f232b] hover:bg-[#282d38] text-white font-mono text-xs uppercase px-6 py-3 tracking-wider transition-colors"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="bg-[#121419] border border-[#242833] p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bk-name" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#ff5500] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="bk-name"
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Alex Henderson"
                        className="w-full bg-[#171920] border border-[#2a2e38] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bk-email" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#ff5500] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="bk-email"
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-[#171920] border border-[#2a2e38] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="bk-phone" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#ff5500] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="bk-phone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+44 7000 000000"
                      className="w-full bg-[#171920] border border-[#2a2e38] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bk-package" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                      Package
                    </label>
                    <select
                      id="bk-package"
                      value={formPackage}
                      onChange={(e) => setFormPackage(e.target.value)}
                      className="w-full bg-[#171920] border border-[#2a2e38] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                    >
                      <option value="Bronze">Bronze — £120</option>
                      <option value="Silver">Silver — £150</option>
                      <option value="Gold">Gold — £175</option>
                      <option value="Platinum">Platinum — £200</option>
                      <option value="Online Coaching">Online Coaching</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bk-time" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#ff5500] absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        id="bk-time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full bg-[#171920] border border-[#2a2e38] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Weekend">Weekend</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="bk-message" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                    Goals & Message
                  </label>
                  <textarea
                    id="bk-message"
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="e.g. Looking to lose weight, build strength and sort my nutrition over 8-12 weeks."
                    className="w-full bg-[#171920] border border-[#2a2e38] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formSending}
                  className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-4 flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(255,85,0,0.35)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{formSending ? 'Opening Email App...' : 'Send Booking Enquiry'}</span>
                  <Send className="w-4 h-4" />
                </button>
                <p className="text-[11px] font-mono text-zinc-500 text-center">
                  Submitting opens your email app pre-addressed to {CONTACT.email} — no data is stored on this site.
                </p>
              </form>
            )}
          </div>
          {/* Booking Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#121419] border border-[#242833] p-6">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-3">
                PACKAGES AT A GLANCE
              </div>
              <ul className="space-y-2.5 text-xs font-mono text-zinc-300">
                {PRICING_TIERS.map((t) => (
                  <li key={t.id} className="flex items-center justify-between border-b border-[#1e222a] pb-2 last:border-0">
                    <span className="text-white uppercase">{t.name}</span>
                    <span className="text-[#ff5500] font-bold">£{t.price}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400 uppercase">Online Coaching</span>
                  <span className="text-emerald-400 font-bold">Message to book</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#121419] border border-[#242833] p-6">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-3">
                SESSION AVAILABILITY
              </div>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                {CONTACT.sessions}. Sessions run 1-2-1 at {CONTACT.locationShort}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-[#1a1d24] border border-[#2b303d] text-zinc-300 text-[11px] font-mono px-3 py-1.5">Morning</span>
                <span className="bg-[#1a1d24] border border-[#2b303d] text-zinc-300 text-[11px] font-mono px-3 py-1.5">Evening</span>
                <span className="bg-[#1a1d24] border border-[#2b303d] text-zinc-300 text-[11px] font-mono px-3 py-1.5">Weekend</span>
              </div>
            </div>

            <div className="bg-[#121419] border border-[#242833] p-6">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-3">
                DIRECT CONTACT
              </div>
              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-[#ff5500] transition-colors">{CONTACT.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500] transition-colors">@{CONTACT.instagramHandle}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500] transition-colors">{CONTACT.facebookName}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* 10. PRE-FOOTER INTAKE CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative bg-gradient-to-r from-[#171920] to-[#121418] border border-[#2a2f3a] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#ff5500]"></span>
              <span>Booking Now for September 2026</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl text-white uppercase tracking-tight">
              READY TO START YOUR 1-2-1 COACHING?
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Stop guessing your sets, reps, and nutrition. Book a 4-session coaching block with nutritional advice and meal preparation ideas at Pure Gym Hazel Grove.
            </p>
          </div>

          <button
            onClick={() => onOpenConsultation('Gold')}
            className="shrink-0 bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-sm uppercase tracking-wider px-8 py-4 flex items-center gap-3 transition-all shadow-[0_0_25px_rgba(255,85,0,0.35)] active:scale-95"
          >
            <span>Book Your Sessions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
