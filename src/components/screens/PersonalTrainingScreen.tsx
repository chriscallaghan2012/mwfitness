import React, { useState } from 'react';
import { IMAGES, COACHES } from '../../data/mockData';
import { Dumbbell, ShieldCheck, Clock, MapPin, Check, ArrowRight, UserCheck, Activity } from 'lucide-react';

interface PersonalTrainingScreenProps {
  onOpenConsultation: (tier?: string) => void;
}

export const PersonalTrainingScreen: React.FC<PersonalTrainingScreenProps> = ({ onOpenConsultation }) => {
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0].id);
  const [sessionTime, setSessionTime] = useState('07:00 AM');
  const [trialBooked, setTrialBooked] = useState(false);

  const activeCoach = COACHES.find((c) => c.id === selectedCoach) || COACHES[0];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.PT_SLED_PUSH}
            alt="1-on-1 Sled Push & Floor Coaching"
            className="w-full h-full object-cover object-center filter brightness-60 contrast-125 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ 1-ON-1 IN-PERSON COACHING ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              DIRECT 1-2-1 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                COACHING.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              1-2-1 personal training at Pure Gym Hazel Grove, Stockport. Structured coaching on every set, nutritional advice, and meal prep guidance so the effort carries on outside the gym.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => onOpenConsultation('In-Person 1-on-1 Training')}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 flex items-center gap-3 transition-transform active:scale-95"
              >
                <span>Book Floor Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 px-4 py-2 bg-[#121418]/80 border border-[#232732]">
                <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
                <span>Pure Gym Hazel Grove • Stockport</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 1-ON-1 PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ COACHING METHOD ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            WHAT'S INCLUDED
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-2">
            Structured 1-2-1 coaching matched with nutrition and meal prep guidance, based at Pure Gym Hazel Grove, Stockport.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#121419] border border-[#222630] p-6 space-y-3">
            <div className="w-10 h-10 bg-[#191c23] border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-white uppercase tracking-wide">
              1-2-1 Coached Sessions
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Private sessions on the full Pure Gym Hazel Grove floor. Every set coached, every session structured, progress tracked block to block.
            </p>
          </div>

          <div className="bg-[#121419] border border-[#222630] p-6 space-y-3">
            <div className="w-10 h-10 bg-[#191c23] border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-white uppercase tracking-wide">
              Online Coaching
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Full coaching wherever you train. Individual programmes built around your goals, equipment and schedule, with regular check-ins.
            </p>
          </div>

          <div className="bg-[#121419] border border-[#222630] p-6 space-y-3">
            <div className="w-10 h-10 bg-[#191c23] border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-white uppercase tracking-wide">
              Nutritional Advice
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Practical nutrition guidance included with every package, personalised to your goals, activity levels and lifestyle.
            </p>
          </div>

          <div className="bg-[#121419] border border-[#222630] p-6 space-y-3">
            <div className="w-10 h-10 bg-[#191c23] border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-white uppercase tracking-wide">
              Meal Prep & Macros
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Calorie-controlled meal preparation ideas, BMR calculations and macronutrient breakdowns across Silver, Gold and Platinum.
            </p>
          </div>
        </div>
      </section>

      {/* 3. COACH ROSTER & DIRECT SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ LEAD COACH ]
          </div>
          <h2 className="font-display text-4xl text-white uppercase tracking-tight">
            YOUR COACH
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-3xl">
          {COACHES.map((coach) => {
            const isSelected = selectedCoach === coach.id;
            return (
              <div
                key={coach.id}
                onClick={() => setSelectedCoach(coach.id)}
                className={`p-6 bg-[#121419] border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#ff5500] bg-[#161820] shadow-[0_0_20px_rgba(255,85,0,0.15)]' 
                    : 'border-[#222630] hover:border-zinc-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#ff5500] font-bold">{coach.role}</span>
                    {isSelected && (
                      <span className="bg-[#ff5500] text-black text-[10px] font-bold px-2 py-0.5">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl text-white uppercase tracking-wide">
                    {coach.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {coach.credentials.map((cred, idx) => (
                      <span key={idx} className="bg-[#1e222a] text-zinc-300 text-[10px] font-mono px-2 py-0.5 border border-[#2b303c]">
                        {cred}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-sans text-zinc-400 leading-relaxed mb-4">
                    {coach.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1c1f26] space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400">
                    <strong className="text-zinc-300">Specialty:</strong> {coach.specialty}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{coach.availability}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Coach Booking Bar */}
        <div className="mt-8 bg-[#15171e] border border-[#292e3a] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1f232c] border border-[#ff5500] flex items-center justify-center font-display text-xl text-white font-bold">
              {activeCoach.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-wider">
                Selected Coach
              </div>
              <div className="font-display text-2xl text-white uppercase tracking-wide">
                {activeCoach.name} — 1-2-1 SESSION BLOCKS
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenConsultation('Gold')}
            className="w-full md:w-auto bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-8 py-3.5 tracking-wider transition-all"
          >
            Book Your 1-2-1 Sessions
          </button>
        </div>
      </section>

      {/* 4. SESSION AVAILABILITY & COACHING EXTRAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#121419] border border-[#21242d] p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div>
              <span className="text-[#ff5500] uppercase tracking-wider block mb-2 font-bold">
                Session Availability
              </span>
              <ul className="space-y-1.5 text-zinc-300">
                <li>Morning sessions — from September 2026</li>
                <li>Evening sessions — from September 2026</li>
                <li>Weekend sessions — from September 2026</li>
              </ul>
            </div>

            <div>
              <span className="text-[#ff5500] uppercase tracking-wider block mb-2 font-bold">
                Package Extras
              </span>
              <ul className="space-y-1.5 text-zinc-300">
                <li>Discounted 8-week &amp; 12-week programmes</li>
                <li>10% off ALL @shwagmcr merchandise</li>
                <li>Online coaching available nationwide</li>
              </ul>
            </div>

            <div>
              <span className="text-[#ff5500] uppercase tracking-wider block mb-2 font-bold">
                How to Book
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Inbox for more details — email mikeptonline@gmail.com, Instagram @michael_whitworth85 or Facebook: Michael Whitworth. I reply within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
