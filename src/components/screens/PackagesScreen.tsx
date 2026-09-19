import React from 'react';
import { PRICING_TIERS, IMAGES, CONTACT } from '../../data/mockData';
import { Check, X, ArrowRight, BadgePercent, CalendarClock } from 'lucide-react';

interface PackagesScreenProps {
  onOpenConsultation: (tier?: string) => void;
}

export const PackagesScreen: React.FC<PackagesScreenProps> = ({ onOpenConsultation }) => {
  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB')}`;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.GOLD_PACKAGE_HERO}
            alt="Gold Package Barbell Knurl"
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
              <span>[ 1-2-1 PERSONAL TRAINING • ONLINE COACHING ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              4-SESSION <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                COACHING BLOCKS.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              4 x 1-2-1 personal training sessions with nutritional advice, meal preparation ideas, BMR and macro breakdowns — based at Pure Gym Hazel Grove, Stockport. Packages start at £120.
            </p>

            {/* Promo Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-2 bg-[#14161d] border border-[#262a34] px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                <BadgePercent className="w-4 h-4 text-[#ff5500]" />
                <span>Discounts available on 8-week &amp; 12-week programmes</span>
              </div>
              <div className="flex items-center gap-2 bg-[#14161d] border border-[#262a34] px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                <BadgePercent className="w-4 h-4 text-[#ff5500]" />
                <span>10% off ALL @shwagmcr merchandise</span>
              </div>
              <div className="flex items-center gap-2 bg-[#14161d] border border-emerald-500/40 px-3.5 py-2.5 font-mono text-xs text-emerald-300">
                <CalendarClock className="w-4 h-4 text-emerald-400" />
                <span>{CONTACT.sessions}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FOUR COACHING PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => {
            const isPopular = tier.isPopular;
            const price = tier.price;
            const wasPrice = tier.originalPrice;

            return (
              <div
                key={tier.id}
                className={`relative bg-[#121419] border flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'border-[#ff5500] bg-[#151821] shadow-[0_0_30px_rgba(255,85,0,0.15)] lg:-translate-y-2'
                    : 'border-[#242833] hover:border-zinc-500'
                }`}
              >
                {/* Popular Pill */}
                {tier.badge && (
                  <div className={`absolute top-0 right-0 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 ${
                    isPopular ? 'bg-[#ff5500] text-black' : 'bg-[#222632] text-zinc-300'
                  }`}>
                    {tier.badge}
                  </div>
                )}

                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <span className="text-xs font-mono text-[#ff5500] uppercase font-bold tracking-widest block mb-1">
                      {tier.tag}
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wide">
                      {tier.name}
                    </h3>
                    <p className="text-xs font-sans text-zinc-400 mt-2 min-h-[36px]">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="border-y border-[#1f232c] py-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-5xl md:text-6xl text-white font-bold tracking-tight">
                        {formatPrice(price)}
                      </span>
                      {wasPrice && (
                        <span className="text-base font-mono text-zinc-500 line-through">
                          {formatPrice(wasPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 block mt-1 uppercase">
                      One-off block of 4 x 1-2-1 sessions
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase text-zinc-300 tracking-wider block font-bold">
                      Protocol Scope:
                    </span>
                    <ul className="space-y-2.5 text-xs font-mono text-zinc-300">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {tier.omittedFeatures && tier.omittedFeatures.length > 0 && (
                      <div className="pt-2 border-t border-[#1c1f26] space-y-2">
                        <ul className="space-y-2 text-xs font-mono text-zinc-600">
                          {tier.omittedFeatures.map((omit, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                              <span className="line-through">{omit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action CTA */}
                <div className="p-6 md:p-8 pt-0">
                  <button
                    onClick={() => onOpenConsultation(tier.name)}
                    className={`w-full py-3.5 font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-[#ff5500] hover:bg-[#ff6a1f] text-black shadow-[0_0_20px_rgba(255,85,0,0.3)]'
                        : 'bg-[#1e222b] hover:bg-[#282d38] text-white border border-[#303643]'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Availability Note */}
        <div className="mt-8 bg-[#121419] border border-[#242833] p-5 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#ff5500] shrink-0" />
            <span>{CONTACT.sessions}. Message me to check availability.</span>
          </div>
          <span className="text-zinc-400 uppercase tracking-wider">
            {CONTACT.note} → {CONTACT.email}
          </span>
        </div>
      </section>

      {/* 3. FULL COMPARISON MATRIX TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="border-b border-[#22252e] pb-4 mb-6">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ SPECIFICATION AUDIT ]
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight">
            FULL PACKAGE COMPARISON MATRIX
          </h2>
        </div>

        <div className="bg-[#121419] border border-[#242833] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-zinc-300">
            <thead>
              <tr className="border-b border-[#222631] bg-[#161820] text-zinc-400">
                <th className="p-4 font-bold uppercase">What's Included</th>
                <th className="p-4 font-bold uppercase text-center">Bronze (£120)</th>
                <th className="p-4 font-bold uppercase text-center">Silver (£150)</th>
                <th className="p-4 font-bold uppercase text-center text-[#ff5500]">Gold (£175)</th>
                <th className="p-4 font-bold uppercase text-center">Platinum (£200)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1e26]">
              <tr>
                <td className="p-4 font-medium text-white">4 x 1-2-1 Personal Training Sessions</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Nutritional Advice</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Calorie-Controlled Meal Prep Ideas</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">BMR Calculation</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Macronutrient Breakdown</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Weekly Programme (3-4 Extra Days)</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center text-zinc-600">—</td>
                <td className="p-4 text-center"><Check className="inline w-4 h-4 text-emerald-400" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Save vs Standard Rate</td>
                <td className="p-4 text-center text-white font-bold">£20</td>
                <td className="p-4 text-center text-white font-bold">£30</td>
                <td className="p-4 text-center text-[#ff5500] font-bold">£25</td>
                <td className="p-4 text-center text-white font-bold">£50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
