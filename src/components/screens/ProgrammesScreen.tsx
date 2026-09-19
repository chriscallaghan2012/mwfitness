import React, { useState } from 'react';
import { PROGRAMMES, IMAGES } from '../../data/mockData';
import { Programme } from '../../types';
import { BookOpen, Download, Filter, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProgrammesScreenProps {
  onSelectProgramme: (prog: Programme) => void;
}

export const ProgrammesScreen: React.FC<ProgrammesScreenProps> = ({ onSelectProgramme }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Powerlifting', 'Hypertrophy', 'Conditioning', 'Mobility'];

  const filtered = selectedCategory === 'All'
    ? PROGRAMMES
    : PROGRAMMES.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.PROGRAMMES_HERO}
            alt="Powerlifter Heavy Deadlift Lockout"
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
              <span>[ INSTANT DOWNLOAD / LIFETIME ACCESS ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              STANDALONE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                PROTOCOLS.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Prefer to train solo? Run a structured programme built around your exact goal, with discounts available on 8-week and 12-week programmes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-400">
              <span className="bg-[#121418]/90 border border-[#262930] px-3 py-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Discounts on 8-week &amp; 12-week programmes
              </span>
              <span className="bg-[#121418]/90 border border-[#262930] px-3 py-1.5 flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#ff5500]" />
                10% off @shwagmcr merch with any programme
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTER & PROGRAMMES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ THE CATALOG ]
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight">
              AVAILABLE TRAINING BLUEPRINTS
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase border whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#ff5500] text-black border-[#ff5500]'
                    : 'bg-[#14161c] text-zinc-400 border-[#252833] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((prog) => (
            <div
              key={prog.id}
              className="bg-[#121419] border border-[#222631] p-6 md:p-8 flex flex-col justify-between hover:border-[#ff5500]/60 transition-all duration-200 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 px-2 py-0.5 uppercase tracking-wider font-bold">
                    {prog.category}
                  </span>
                  <span className="text-zinc-500 font-mono">
                    DIFF: <strong className="text-zinc-300">{prog.difficulty.toUpperCase()}</strong>
                  </span>
                </div>

                <h3 className="font-display text-3xl text-white uppercase tracking-wide group-hover:text-[#ff5500] transition-colors">
                  {prog.title}
                </h3>

                <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                  {prog.description}
                </p>

                <div className="bg-[#161820] border border-[#232732] p-3.5 space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                    Curriculum Highlights:
                  </div>
                  <ul className="space-y-1 text-xs font-mono text-zinc-300">
                    {prog.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#ff5500]">›</span>
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-400">
                  <div className="p-2 bg-[#15171e] border border-[#1f232c]">
                    <span className="text-[10px] text-zinc-500 block">Duration</span>
                    <span className="text-white font-bold">{prog.duration}</span>
                  </div>
                  <div className="p-2 bg-[#15171e] border border-[#1f232c]">
                    <span className="text-[10px] text-zinc-500 block">Frequency</span>
                    <span className="text-white font-bold">{prog.frequency}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-6 mt-6 border-t border-[#1c1f26] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">One-Time Fee</span>
                  <span className="font-display text-4xl text-white font-bold">£{prog.price}</span>
                </div>

                <button
                  onClick={() => onSelectProgramme(prog)}
                  className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-5 py-3 flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,85,0,0.25)]"
                >
                  <span>View Curriculum & Buy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHAT'S IN THE DIGITAL ASSET PACK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#121419] border border-[#242833] p-8">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ INCLUDED DELIVERABLES ]
          </div>
          <h3 className="font-display text-2xl md:text-3xl text-white uppercase tracking-wide mb-6">
            WHAT YOU RECEIVE INSTANTLY UPON PURCHASE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-zinc-300">
            <div className="p-4 bg-[#161820] border border-[#20242e] space-y-2">
              <div className="font-bold text-white uppercase text-sm">
                01 // Master PDF Manual
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                40+ pages detailing warm-up protocols, warm-up jump math, deload instructions, and substitutions for home or commercial gyms.
              </p>
            </div>

            <div className="p-4 bg-[#161820] border border-[#20242e] space-y-2">
              <div className="font-bold text-white uppercase text-sm">
                02 // Dynamic Google Sheet
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Plug in your current 1RM numbers; the sheet automatically outputs your exact working weights down to 0.5kg for every training week.
              </p>
            </div>

            <div className="p-4 bg-[#161820] border border-[#20242e] space-y-2">
              <div className="font-bold text-white uppercase text-sm">
                03 // MWFITNESS App Token
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                A single-use activation code that imports the complete protocol into the MWFITNESS companion app for seamless in-gym tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
