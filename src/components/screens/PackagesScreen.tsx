import React from 'react';
import { ContactKind, ScreenId } from '../../types';
import { PRICING_TIERS, FAQS, CONTACT } from '../../data/siteData';
import { SectionHeading } from '../ui';
import { CtaButton } from '../CtaButton';
import { Check, X, ArrowRight, CalendarClock, BadgePercent, Sparkles } from 'lucide-react';

interface PackagesScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenContact: (kind: ContactKind, interest?: string) => void;
}

export const PackagesScreen: React.FC<PackagesScreenProps> = ({ onSelectScreen, onOpenContact }) => {
  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB')}`;

  return (
    <div className="space-y-20 md:space-y-28">
      {/* ================= HEADER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionHeading
          eyebrow="Packages"
          title="Everything I offer, in plain English"
          sub="Four simple packages. Every one is a block of 4 x 1-2-1 personal training sessions — the difference is what comes with them. Prices include everything listed. No hidden extras."
        />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-border card-shadow text-sm text-brand-ink">
            <BadgePercent className="w-4 h-4 text-brand-orange" />
            8-week &amp; 12-week programmes available at a discount
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-border card-shadow text-sm text-brand-ink">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            10% off SHWAG merchandise
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-border card-shadow text-sm text-brand-ink">
            <CalendarClock className="w-4 h-4 text-brand-orange" />
            {CONTACT.sessions}
          </span>
        </div>
      </section>

      {/* ================= PACKAGE CARDS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-3xl border flex flex-col card-shadow ${
                tier.isPopular ? 'border-brand-orange ring-2 ring-brand-orange/30' : 'border-brand-border'
              }`}
            >
              {tier.badge && (
                <span className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  tier.isPopular ? 'bg-brand-orange text-white' : 'bg-brand-orange-soft text-brand-orange'
                }`}>
                  {tier.badge}
                </span>
              )}

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-display text-3xl font-bold text-brand-ink">{tier.name}</h3>
                  <p className="text-sm text-brand-muted mt-1">{tier.tagline}</p>
                </div>

                <div className="border-t border-brand-border pt-4">
                  <span className="font-display text-5xl font-bold text-brand-ink">{formatPrice(tier.price)}</span>
                  {tier.originalPrice && (
                    <span className="text-brand-muted line-through ml-2 text-lg">{formatPrice(tier.originalPrice)}</span>
                  )}
                  <p className="text-xs text-brand-muted mt-1.5">One-off block of 4 x 1-2-1 sessions</p>
                </div>

                <p className="text-[15px] text-brand-body leading-relaxed">{tier.description}</p>
              </div>

              <div className="p-6 space-y-4">
                <h4 className="text-sm font-display font-bold text-brand-ink uppercase tracking-wider">What's included</h4>
                <ul className="space-y-2 text-sm text-brand-ink">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {tier.notIncluded && tier.notIncluded.length > 0 && (
                  <>
                    <h4 className="text-sm font-display font-bold text-brand-muted uppercase tracking-wider">Not included</h4>
                    <ul className="space-y-2 text-sm text-brand-muted">
                      {tier.notIncluded.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onOpenContact('enquiry', tier.name)}
                  className={`w-full inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-full transition-colors ${
                    tier.isPopular
                      ? 'bg-brand-orange hover:bg-brand-orange-dark text-white'
                      : 'bg-brand-orange-soft hover:bg-brand-orange hover:text-white text-brand-ink'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
                {tier.note && <p className="text-xs text-brand-muted mt-2 text-center">{tier.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FULL COMPARISON TABLE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Full breakdown"
          title="Compare every package side by side"
          sub="The quickest way to see exactly what changes as you move up. Everything below is included in the price you see above."
        />

        <div className="mt-10 overflow-x-auto rounded-3xl border border-brand-border bg-white card-shadow">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="bg-brand-orange-soft/60 text-brand-ink">
                <th className="p-4 font-semibold">What's included</th>
                <th className="p-4 font-semibold text-center">Bronze <span className="text-sm text-brand-muted">£120</span></th>
                <th className="p-4 font-semibold text-center">Silver <span className="text-sm text-brand-muted">£150</span></th>
                <th className="p-4 font-semibold text-center text-brand-orange">Gold <span className="text-sm text-brand-muted">£175</span></th>
                <th className="p-4 font-semibold text-center">Platinum <span className="text-sm text-brand-muted">£200</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              <tr>
                <td className="p-4 font-medium text-brand-ink">4 x 1-2-1 personal training sessions</td>
                {PRICING_TIERS.map((t) => (
                  <td key={t.id} className="p-4 text-center"><Check className="w-5 h-5 text-brand-green" /></td>
                ))}
              </tr>
              {[
                'Nutritional advice tailored to your goals',
                'Calorie-controlled meal prep ideas',
                'Calorie & macro numbers for your body',
                'Weekly programme for 3-4 extra days',
              ].map((rowLabel) => (
                <tr key={rowLabel}>
                  <td className="p-4 font-medium text-brand-ink">{rowLabel}</td>
                  {PRICING_TIERS.map((t) => (
                    <td key={t.id} className="p-4 text-center">
                      {t.features.some((f) => f.includes(rowLabel.slice(0, 16))) || rowLabel === 'Nutritional advice tailored to your goals'
                        ? <Check className="w-5 h-5 text-brand-green" />
                        : <span className="text-brand-muted">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 font-medium text-brand-ink">Save vs standard rate</td>
                {PRICING_TIERS.map((t) => (
                  <td key={t.id} className="p-4 text-center text-brand-green font-semibold">
                    {t.originalPrice ? `£${(t.originalPrice - t.price).toLocaleString('en-GB')}` : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-brand-border card-shadow p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-[15px]">
          <div className="flex items-center gap-3 text-brand-ink">
            <BadgePercent className="w-5 h-5 text-brand-orange shrink-0" />
            <span>Discounted 8-week &amp; 12-week programmes also available — ask me for details.</span>
          </div>
          <button
            onClick={() => onOpenContact('enquiry', '8 / 12-week programme')}
            className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange-dark font-semibold shrink-0"
          >
            Ask about longer programmes <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Good to know"
          title="Frequently asked questions"
        />
        <div className="mt-8 space-y-4">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group bg-white rounded-2xl border border-brand-border card-shadow p-5">
              <summary className="flex items-center justify-between gap-3 cursor-pointer font-semibold text-brand-ink text-[15px] list-none">
                {faq.q}
                <span className="w-6 h-6 rounded-full bg-brand-orange-soft text-brand-orange font-bold flex items-center justify-center shrink-0">
                  +
                </span>
              </summary>
              <p className="mt-3 text-brand-body leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-orange p-10 md:p-14 text-white text-center card-shadow-hover">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/10 pointer-events-none"></div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Not sure which package is right for you?
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            That's exactly what the free chat is for. Tell me about your goals and your life, and I'll recommend the right starting point — no pressure at all.
          </p>
          <CtaButton onOpen={() => onOpenContact('book-call')} label="Get in touch" size="lg" variant="white" className="mt-7" />
        </div>
      </section>
    </div>
  );
};