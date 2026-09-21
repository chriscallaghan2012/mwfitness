import React from 'react';
import { PRICING_TIERS, CONTACT } from '../../data/mockData';
import { Check, ArrowRight, CalendarClock, MapPin } from 'lucide-react';

interface PackagesScreenProps {
  onOpenBookCall: (tier?: string) => void;
}

export const PackagesScreen: React.FC<PackagesScreenProps> = ({ onOpenBookCall }) => {
  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB')}`;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/main-hero.jpg"
            alt="MWFitnessUK training floor"
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
              <span>[ 1-2-1 TRAINING • ONLINE COACHING ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              Packages that fit
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                your life.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Everything is built around you — in person at Pure Gym Hazel Grove, or online wherever you train. Start small and build up, or go all in. Prices start at £120.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-[#14161d] border border-[#262a34] px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                <CalendarClock className="w-4 h-4 text-[#ff5500]" />
                <span>{CONTACT.sessions}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#14161d] border border-[#262a34] px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                <MapPin className="w-4 h-4 text-[#ff5500]" />
                <span>{CONTACT.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ WHAT I SELL ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            FOUR SIMPLE PACKAGES.
          </h2>
          <p className="text-sm font-sans text-zinc-400 leading-relaxed mt-3">
            Not sure which level is right for you? Every package starts with a free chat — we'll point you the right way before you book anything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-[#121419] border p-6 md:p-8 flex flex-col relative ${
                tier.isPopular ? 'border-[#ff5500] shadow-[0_0_20px_rgba(255,85,0,0.15)]' : 'border-[#20232b]'
              }`}
            >
              {tier.badge && (
                <span className="absolute top-0 right-0 bg-[#ff5500] text-black font-mono text-[10px] uppercase px-3 py-1.5 font-bold">
                  {tier.badge}
                </span>
              )}

              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-4xl font-display text-[#ff5500] font-bold">{tier.name}</div>
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">{tier.tag}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl text-white font-bold">{formatPrice(tier.price)}</div>
                  {tier.originalPrice && (
                    <div className="text-xs font-mono text-zinc-500 line-through">{formatPrice(tier.originalPrice)}</div>
                  )}
                </div>
              </div>

              <p className="text-sm font-sans text-zinc-400 leading-relaxed mt-4">{tier.description}</p>

              <ul className="mt-5 space-y-2.5 text-sm font-sans text-zinc-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ff5500] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onOpenBookCall(tier.name)}
                className="mt-6 bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
              >
                <span>{tier.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. COMPARISON TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ WHAT'S INCLUDED ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            FULL BREAKDOWN.
          </h2>
        </div>

        <div className="overflow-x-auto border border-[#20232b] bg-[#121419]">
          <table className="w-full min-w-[720px] text-sm font-sans">
            <thead>
              <tr className="border-b border-[#1b1e26] bg-[#16181d]">
                <th className="p-4 text-left text-xs font-mono text-zinc-400 uppercase tracking-wider">What's included</th>
                {PRICING_TIERS.map((tier) => (
                  <th key={tier.id} className="p-4 text-center">
                    <div className="font-display text-xl text-white uppercase">{tier.name}</div>
                    <div className="text-[11px] font-mono text-[#ff5500]">{formatPrice(tier.price)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1e26]">
              <tr>
                <td className="p-4 font-medium text-white">4 x one-to-one PT sessions</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Simple nutrition advice</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Easy meal prep ideas</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Calories & macros worked out</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Weekly plan for your other gym days</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Morning, evening & weekend slots</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
{/* 4. CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative bg-gradient-to-r from-[#171920] to-[#121418] border border-[#2a2f3a] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#ff5500]"></span>
              <span>Not sure which one?</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              LET'S TALK IT THROUGH.
            </h2>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed max-w-xl">
              Book a free call and we'll find the right package for your goals, your week and your budget. No pressure, no obligation.
            </p>
          </div>

          <button
            onClick={() => onOpenBookCall()}
            className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-sm uppercase px-8 py-4 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95 shrink-0"
          >
            <span>Book a free call</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};