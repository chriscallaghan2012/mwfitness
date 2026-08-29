import React, { useState } from 'react';
import { IMAGES, EQUIPMENT_LIST } from '../../data/mockData';
import { Warehouse, Dumbbell, Shield, MapPin, Check, Sparkles, ArrowRight } from 'lucide-react';

interface ArmoryScreenProps {
  onOpenConsultation: () => void;
}

export const ArmoryScreen: React.FC<ArmoryScreenProps> = ({ onOpenConsultation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Barbells & Plates', 'Racks & Platforms', 'Conditioning', 'Recovery'];

  const filteredEquipment = selectedCategory === 'All'
    ? EQUIPMENT_LIST
    : EQUIPMENT_LIST.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.BARBELL_PLATES_ARMORY}
            alt="Calibrated Barbell Plates Rack"
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
              <span>[ TRAINING GROUNDS // STOCKPORT ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              PURE GYM <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                HAZEL GROVE.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              1-2-1 sessions on the full Pure Gym Hazel Grove floor — free weights, machines, cardio and functional zones. All the equipment you need to run an honest, effective programme.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onOpenConsultation}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 flex items-center gap-3 transition-transform active:scale-95"
              >
                <span>Book Your 1-2-1 Sessions</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs font-mono text-zinc-400 px-4 py-2 bg-[#121418]/80 border border-[#232732]">
                Morning, Evening & Weekend Slots
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EQUIPMENT INVENTORY & CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ FLOOR INVENTORY ]
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight">
              TRAINING FLOOR INVENTORY
            </h2>
          </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEquipment.map((eq, i) => (
            <div
              key={i}
              className="bg-[#121419] border border-[#22252e] p-5 space-y-3 hover:border-[#ff5500]/50 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#ff5500] font-bold">{eq.brand}</span>
                <span className="text-zinc-500 text-[10px] uppercase">{eq.category}</span>
              </div>
              <h3 className="font-display text-xl text-white uppercase tracking-wide">
                {eq.name}
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed border-t border-[#1c1f26] pt-3">
                {eq.spec}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PLATFORM RULES & ATHLETE CODE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#121419] border border-[#252934] p-8 md:p-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ TRAINING STANDARDS ]
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight mb-6">
            THE TRAINING CODE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-zinc-300">
            <div className="p-4 bg-[#161820] border border-[#20242e] space-y-2">
              <span className="text-[#ff5500] font-bold text-sm block">01 // RE-RACK YOUR WEIGHTS</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Always re-rack dumbbells and plates after use and leave every station exactly how you found it. It keeps the floor safe and clear for everyone.
              </p>
            </div>

            <div className="p-4 bg-[#161820] border border-[#20242e] space-y-2">
              <span className="text-[#ff5500] font-bold text-sm block">02 // WIPE DOWN EQUIPMENT</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Clean machines, benches and handles after every session using the gym spray and blue roll available throughout the floor.
              </p>
            </div>

            <div className="p-4 bg-[#161820] border border-[#20242e] space-y-2">
              <span className="text-[#ff5500] font-bold text-sm block">03 // RESPECT THE FLOOR</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Follow Pure Gym's code of conduct, keep music through headphones and look after one another. Good sessions happen in a good environment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
