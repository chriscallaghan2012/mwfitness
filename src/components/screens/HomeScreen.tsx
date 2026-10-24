import React, { useEffect, useState } from 'react';
import { ScreenId } from '../../types';
import { IMAGES, ABOUT, TESTIMONIALS, CONTACT } from '../../data/mockData';
import { ArrowRight, PhoneCall, Check, Star, MapPin, Award, UserCheck, GraduationCap, Smartphone, Scale, TrendingUp, Utensils, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoreBadges } from '../StoreBadges';
import { PublicPlan } from '../../lib/plans';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: (interest?: string) => void;
  onCheckout: (plan: PublicPlan) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectScreen, onOpenBookCall, onCheckout }) => {
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);
  const [activeProcessStep, setActiveProcessStep] = useState(0);

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
              <span className="brush-wrap brush-wrap--hero">BUILD A STRONGER BODY.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                DEVELOP A STRONGER MIND. BECOME THE BEST VERSION OF YOU.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Solid Hard Work Achieves Greatness. Welcome to MWFitnessUK — online personal coaching built around you, your goals and your life. Whether your goal is to lose body fat, build muscle, improve your fitness, develop healthier habits or simply feel more confident in yourself, I'm here to help you make it happen.
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
      
      </div>
    </section>
    <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />

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
            <h2 className="brush-title font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              MEET MIKE. YOUR ONLINE COACH.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">Practical online coaching for busy people who want to feel stronger, build confidence and make progress they can maintain.</p>
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

      {/* FIVE-STEP COACHING PROCESS */}
      <section id="how-it-works" className="mw-process-section w-full border-y border-[#22252e] bg-[#101115] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 max-w-4xl sm:mb-10">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">How we work</div>
            <h2 className="font-display text-4xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-5xl md:text-7xl">
              OUR 5-STEP <span className="text-[#ff5500]">COACHING PROCESS</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#a1a1aa] sm:text-base">
              From your first conversation to long-term progress, every step is designed around you and real life.
            </p>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="mw-process-list self-stretch border-t border-[#292d36]">
              {[
                { title: 'We start by understanding you.', text: "We'll establish your goals, current circumstances, training experience, lifestyle and any challenges that may affect your progress. This gives us a starting point for building your coaching plan." },
                { title: 'We build your programme.', text: "Your training and nutrition guidance will be tailored to your objectives and individual requirements. We'll focus on realistic actions that work alongside your everyday commitments." },
                { title: 'You learn as you progress.', text: "I'll help you develop a better understanding of exercise, nutrition, recovery and the habits that contribute to results. You'll know what you're working towards and why." },
                { title: 'We track, review and adjust.', text: "Progress isn't always a straight line. We'll use the information available, including relevant weight trends, training performance and feedback, to help assess your progress and make sensible adjustments where needed." },
                { title: 'We build for the long term.', text: "The ultimate goal is not simply to reach a number on the scales or complete a programme. It's to develop the knowledge, confidence and habits that help you maintain your progress and continue moving forward." },
              ].map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  className={`mw-process-step ${activeProcessStep === index ? 'is-active' : ''}`}
                  aria-expanded={activeProcessStep === index}
                  onMouseEnter={() => setActiveProcessStep(index)}
                  onFocus={() => setActiveProcessStep(index)}
                  onClick={() => setActiveProcessStep(index)}
                >
                  <span className="mw-process-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="mw-process-title">{step.title}</span>
                  <span className="mw-process-description">{step.text}</span>
                  <span className="mw-process-arrow" aria-hidden="true"><ArrowRight className="h-5 w-5" /></span>
                </button>
              ))}
            </div>
            <div className="relative min-h-[360px] overflow-hidden border border-[#252a34] bg-[#121419] sm:min-h-[520px]">
              <img src={IMAGES.HERO} alt="MWFitnessUK original hero image" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#08090b]/95 via-[#08090b]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">Your next step starts here</div>
                <h3 className="max-w-md font-display text-3xl font-black uppercase leading-tight text-white sm:text-4xl">Ready to put your plan into action?</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-300">Tell me what you want to achieve and we'll talk through the right starting point for you. No pressure, just an honest conversation.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => onOpenBookCall()} className="inline-flex cursor-pointer items-center gap-2 bg-[#ff5500] px-5 py-3.5 font-mono text-xs font-bold uppercase text-black transition-colors hover:bg-white"><PhoneCall className="h-4 w-4" /> Book a free call</button>
                  <button onClick={() => onSelectScreen('contact')} className="inline-flex cursor-pointer items-center gap-2 border border-white/40 bg-black/30 px-5 py-3.5 font-mono text-xs font-bold uppercase text-white transition-colors hover:border-[#ff5500]">Ask a question <ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FULL HOMEPAGE COACHING COPY — restored from the supplied brief */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 max-w-4xl sm:mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">[ THE MWFITNESSUK APPROACH ]</div>
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl">MORE THAN A WORKOUT. <span className="text-[#ff5500]">MORE THAN A MEAL PLAN.</span></h2>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            <p>I believe fitness should be about more than what you see in the mirror. It's about building discipline, developing confidence, improving your physical and mental well-being, and creating habits that make a positive difference to your everyday life.</p>
            <p>My approach is simple: give you the right guidance, a clear plan, consistent support and the accountability to keep moving forward.</p>
            <p>You bring the commitment. I'll help you put it to work.</p>
            <p>At MWFitnessUK, I understand that no two people are the same. We all have different starting points, responsibilities, challenges and ambitions. That's why your coaching should reflect you, rather than expecting you to fit into somebody else's programme.</p>
            <p>I'm passionate about helping people understand not just what they need to do, but why they're doing it. I want you to develop the knowledge, confidence and independence to make better decisions about your training, nutrition and lifestyle long after you've started your coaching journey.</p>
            <p>My role isn't simply to tell you what to do. It's to coach you, educate you, encourage you and help you build the tools you need to succeed.</p>
            <p className="pt-2 font-mono font-bold uppercase tracking-wide text-white">Your goals. Your journey. Your progress. My support.</p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-[#252a34] bg-[#121419] sm:min-h-[420px]">
            <img src={IMAGES.BEFORE_AFTER} alt="MWFitnessUK client progress transformation" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7"><span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">MWFitnessUK</span><p className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">Your goals. Your journey.</p></div>
          </div>
        </div>
      </section>

      <section className="w-full border-y border-[#22252e] bg-[#101115]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mb-8">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">[ HOW I COACH ]</div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">COACHING THAT <span className="text-[#ff5500]">WORKS FOR YOU.</span></h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { title: 'Personalised to you', text: 'Your coaching starts with understanding you. Your goals, current fitness, experience, daily routine, lifestyle and individual challenges all help shape your programme. We establish where you are now, where you want to be and the practical steps needed to get there.' },
              { title: 'Training with purpose', text: "Your training programme is designed around your objectives, ability and circumstances. Whether you're new to the gym or looking to take your performance to the next level, we'll focus on structured training, sound technique, progressive improvement and consistency. Every session should have a purpose. Every step forward matters." },
              { title: 'Nutrition without unnecessary complications', text: "Nutrition is a fundamental part of achieving lasting results, but it doesn't need to be confusing, restrictive or impossible to maintain. I'll help you understand how to approach calories, protein, carbohydrates, fats, meal planning and food choices in a way that supports your goals and fits your lifestyle. Where appropriate, your nutrition plan can include practical meal options, portion guidance and clear calorie and macronutrient targets. The aim is to give you structure and flexibility, not make food another source of stress." },
              { title: 'Accountability that keeps you moving', text: "Motivation comes and goes. Building habits, maintaining focus and taking consistent action are what help create progress. Coaching gives you structure and a clearer sense of direction. We'll use your progress, feedback and performance to help identify what's working, where adjustments may be needed and what your next steps should be. You don't have to get everything perfect. You need a plan you can follow and the willingness to keep improving." },
            ].map((item, index) => (
              <article key={item.title} className="mw-electric-card border border-[#252a34] bg-[#121419] p-6 sm:p-8">
                <div className="mb-4 font-mono text-xs font-bold tracking-[0.18em] text-[#ff5500]">0{index + 1} / HOW I COACH</div>
                <h3 className="mb-3 font-display text-2xl font-black uppercase leading-tight text-white sm:text-3xl">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">[ YOUR GOALS ]</div>
          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">WHAT CAN MWFITNESSUK <span className="text-[#ff5500]">HELP YOU ACHIEVE?</span></h2>
          <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">Whether you have one clear goal or several areas you'd like to improve, your coaching can be built around what matters most to you.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Fat loss', text: 'Work towards reducing body fat through a structured approach to nutrition, activity and training.' },
            { title: 'Muscle growth', text: 'Build strength and muscle with purposeful resistance training, appropriate nutrition and progressive overload.' },
            { title: 'Body recomposition', text: 'Work towards reducing body fat while building or retaining muscle.' },
            { title: 'Improved fitness and performance', text: 'Develop strength, work capacity, consistency and confidence in your training.' },
            { title: 'Better nutritional habits', text: 'Understand your food choices and develop an approach that supports your goals without relying on unnecessary restriction.' },
            { title: 'Confidence and discipline', text: 'Build routines, recognise your progress and develop the confidence that comes from keeping promises to yourself.' },
          ].map((item, index) => (
            <article key={item.title} className="mw-electric-card flex gap-4 border border-[#252a34] bg-[#121419] p-5 sm:p-6">
              <span className="font-mono text-sm font-bold text-[#ff5500]">0{index + 1}</span>
              <div><h3 className="mb-2 font-display text-xl font-bold uppercase text-white">{item.title}</h3><p className="text-sm leading-relaxed text-zinc-400">{item.text}</p></div>
            </article>
          ))}
        </div>
        <p className="mt-6 border-l-2 border-[#ff5500] pl-4 text-sm leading-relaxed text-zinc-300 sm:text-base">Whatever your starting point, your progress should be measured against your own goals, not somebody else's highlight reel.</p>
      </section>

      <section className="w-full border-y border-[#22252e] bg-[#101115]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 max-w-4xl sm:mb-10">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">[ WHY MWFITNESSUK ]</div>
            <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl"><span className="brush-wrap">WHY CHOOSE</span> <span className="text-[#ff5500]">MWFITNESSUK?</span></h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative order-2 min-h-[320px] overflow-hidden border border-[#252a34] bg-[#121419] lg:order-1 sm:min-h-[420px]">
              <img src={IMAGES.ABOUT} alt="Mike Whitworth and MWFitnessUK" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[center_25%]" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7"><span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">Coaching built around you</span><p className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">Real guidance. Real life.</p></div>
            </div>
            <div className="order-1 flex flex-col justify-center space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base lg:order-2">
              <p>Because I believe good coaching should give you more than instructions.</p>
              <p>It should give you clarity when you're unsure, structure when you need direction, accountability when motivation dips and education that helps you understand your own progress.</p>
              <p>I want you to feel that your goals matter, your questions are welcome and your individual circumstances are taken seriously.</p>
              <p>I also believe in being realistic. Results take time, and no responsible coach can guarantee a particular outcome. What I can offer is a considered approach, practical guidance and a focus on helping you make consistent progress through the actions within your control.</p>
              <p className="pt-2 font-mono font-bold uppercase tracking-wide text-white">No magic solutions. No unnecessary complications. Just purposeful coaching, hard work and a commitment to getting better.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 max-w-5xl sm:mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">[ COMMUNITY & MINDSET ]</div>
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl">FITNESS IS PERSONAL. <span className="text-[#ff5500]">PROGRESS IS POWERFUL.</span> COMMUNITY MAKES US STRONGER.</h2>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            <p>MWFitnessUK is built on the belief that positive change goes beyond the gym. Training and nutrition can help us improve physically, but the discipline, resilience and self-belief we develop can also influence how we approach work, family life, personal challenges and our ambitions.</p>
            <p>That's why the values behind MWFitnessUK connect with our sportswear brand, Shwag-MCR. Together, we want to promote a positive mindset, encourage people to take pride in their efforts and create a sense of community where people support one another, celebrate progress and strive to become better versions of themselves.</p>
            <p>Our motto says it all:</p>
            <p className="border-l-2 border-[#ff5500] pl-4 font-display text-2xl font-black uppercase text-white sm:text-3xl">SOLID HARD WORK ACHIEVES GREATNESS.</p>
            <p>That doesn't just apply to lifting weights or following a nutrition plan. It applies to the goals we set, the challenges we face and the choices we make every day.</p>
            <p>Greatness isn't reserved for a select few. It's built through effort, consistency, determination and the decision to keep going when things get difficult.</p>
            <p>You don't have to do everything alone, and you don't have to be perfect to belong.</p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-[#252a34] bg-[#121419] sm:min-h-[420px]">
            <img src={IMAGES.CONTACT} alt="MWFitnessUK brand and training environment" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7"><span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">Solid hard work</span><p className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">Achieves greatness.</p></div>
          </div>
        </div>
      </section>

      <section className="w-full border-y border-[#22252e] bg-[#101115]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 max-w-4xl sm:mb-10">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">[ YOUR JOURNEY STARTS HERE ]</div>
            <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl">YOUR JOURNEY <span className="text-[#ff5500]">STARTS HERE.</span></h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative order-2 min-h-[320px] overflow-hidden border border-[#252a34] bg-[#121419] lg:order-1 sm:min-h-[420px]">
              <img src={IMAGES.BEFORE_AFTER} alt="Fitness progress and transformation" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7"><span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff5500]">Take the first step</span><p className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">Let's build something better.</p></div>
            </div>
            <div className="order-1 flex flex-col justify-center space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base lg:order-2">
              <p>You might be starting from scratch, returning to training after time away or looking to break through a plateau. Whatever your situation, the important thing is deciding to take that first step.</p>
              <p>You don't need to have everything figured out before you begin. That's where coaching can help.</p>
              <p>We'll establish your starting point, work towards realistic goals and focus on the daily actions that move you closer to the results you want.</p>
              <p>Your journey will require commitment, but you don't have to figure out every step by yourself.</p>
              <p>If you're ready to invest in yourself, develop better habits and discover what consistent effort can achieve, I'd love to help you get started.</p>
              <h3 className="pt-2 font-display text-3xl font-black uppercase text-white">LET'S BUILD SOMETHING <span className="text-[#ff5500]">BETTER.</span></h3>
              <p className="font-mono font-bold uppercase text-white">MWFitnessUK — Solid Hard Work Achieves Greatness.</p>
              <p>Take the first step towards a stronger body, a stronger mindset and a healthier future.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => onOpenBookCall()} className="inline-flex cursor-pointer items-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-black"><PhoneCall className="h-4 w-4" /> Start your coaching journey</button>
                <button onClick={() => onSelectScreen('contact')} className="inline-flex cursor-pointer items-center gap-2 border border-[#343945] bg-[#17191f] px-6 py-3.5 font-mono text-xs font-bold uppercase text-white">Get in touch <ArrowRight className="h-4 w-4" /></button>
              </div>
              <p className="text-sm text-zinc-400">Get in touch to discuss your goals and find out how MWFitnessUK online coaching could work for you.</p>
            </div>
          </div>
        </div>
      </section>


      {/* PREMIUM ONLINE COACHING — CTA to the full packages page */}
      <section id="packages-overview" className="relative overflow-hidden border-y border-[#252a34] bg-[#101115]">
        <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern opacity-25" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mw-electric-card relative mx-auto max-w-5xl overflow-hidden border border-[#30313a] bg-gradient-to-br from-[#191b22] via-[#121419] to-[#0d0e11] p-6 sm:p-10 md:p-14">
            <div aria-hidden="true" className="absolute right-0 top-0 h-1.5 w-36 bg-[#ff5500]" />
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 border border-[#ff5500]/50 bg-[#ff5500]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#ff5500]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 bg-[#ff5500]" />
                  Personal coaching. Real-life results.
                </div>
                <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl">
                  Premium online <span className="text-[#ff5500]">coaching.</span>
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  Training and nutrition support shaped around your goals, your schedule and real life. Explore the coaching options, compare what’s included and choose the level of support that works for you.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-mono uppercase tracking-wider text-zinc-300">
                  <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ff5500]" /> A plan built around you</span>
                  <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ff5500]" /> Training & nutrition guidance</span>
                  <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ff5500]" /> Support to stay consistent</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:min-w-[220px]">
                <button onClick={() => onSelectScreen('online-coaching')} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-[#ff5500] px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#ff6a1f]">
                  View coaching packages <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => onOpenBookCall()} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-[#343945] bg-[#17191f] px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#ff5500] hover:text-[#ff5500]">
                  <PhoneCall className="h-4 w-4" /> Book a free call
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#22252e] pb-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ WHAT PEOPLE SAY ]</div>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">Real people. Real results.</h2>
            <button onClick={() => onSelectScreen('reviews')} className="cursor-pointer inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:text-[#ff5500] sm:self-auto">All reviews <ArrowRight className="h-4 w-4" /></button>
          </div>
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