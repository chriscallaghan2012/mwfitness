import React from 'react';
import { ContactKind } from '../../types';
import {
  APP_FEATURES,
  APP_NOTE,
  SHWAG_STORY,
  SHWAG_PRODUCTS,
  SHWAG_NOTE,
  SHWAG_ORDER_LINK,
} from '../../data/siteData';
import { SectionHeading } from '../ui';
import { CtaButton } from '../CtaButton';
import {
  Scale,
  NotebookPen,
  Dumbbell,
  Camera,
  Sparkles,
  BadgePercent,
  ExternalLink,
  Mail,
  ArrowRight,
} from 'lucide-react';

interface AppShopScreenProps {
  onOpenContact: (kind: ContactKind, interest?: string) => void;
}

const APP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'weigh-in': Scale,
  'food-log': NotebookPen,
  'training-log': Dumbbell,
  'progress-photos': Camera,
};

export const AppShopScreen: React.FC<AppShopScreenProps> = ({ onOpenContact }) => {
  return (
    <div className="space-y-20 md:space-y-28">
      {/* ================= APP COMING SOON ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Coming soon"
          title="The MWFitnessUK app — built for busy people"
          sub="A simple, fully interactive training companion. No clutter, no complicated tracking — just the tools that actually help you stay consistent."
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {APP_FEATURES.map((feature) => {
            const Icon = APP_ICONS[feature.id];
            return (
              <div key={feature.id} className="bg-white rounded-3xl border border-brand-border card-shadow p-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-orange-soft flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-ink mb-2">{feature.title}</h3>
                <p className="text-sm text-brand-body leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-brand-border card-shadow p-5 flex items-start gap-4">
          <span className="w-10 h-10 rounded-2xl bg-brand-orange-soft flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-brand-orange" />
          </span>
          <p className="text-[15px] text-brand-body leading-relaxed">{APP_NOTE}</p>
        </div>

        {/* Waitlist */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden bg-brand-orange p-8 md:p-10 text-white">
            <h3 className="font-display text-2xl font-bold">Be first to know</h3>
            <p className="mt-3 text-white/90">
              Leave your details and I'll let you know the moment the app is ready. No spam, no nonsense — one email when it launches.
            </p>
            <div className="mt-6">
              <CtaButton onOpen={() => onOpenContact('waitlist')} label="Join the waitlist" size="lg" variant="white" />
              <p className="mt-3 text-sm text-white/80">Just your name and email — it goes straight to me.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border card-shadow p-8">
            <h3 className="font-display text-xl font-bold text-brand-ink mb-4">In the meantime</h3>
            <ul className="space-y-3 text-brand-ink text-[15px]">
              <li className="flex items-start gap-3">
                <Dumbbell className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Start your 4-session block — the app will pair with your coaching plan when it's ready.</span>
              </li>
              <li className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Keep a simple note of weekly weigh-ins in the meantime — we'll get them properly tracked soon.</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Got a feature you'd love? Use the waitlist form and tell me — I'm building it and I'd love your input.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= SHWAG MERCH ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="SHWAG merch"
          title="Wear the badge, do the work"
          sub={`${SHWAG_STORY.name} (${SHWAG_STORY.handle}) is the training-wear brand we work alongside. Same attitude, same community — here's the story.`}
        />
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-white rounded-3xl border border-brand-border card-shadow p-7 h-full">
            <h3 className="font-display text-xl font-bold text-brand-ink mb-3">What is SHWAG?</h3>
            <p className="text-[15px] text-brand-body leading-relaxed">{SHWAG_STORY.whatIs}</p>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border card-shadow p-7 h-full">
            <h3 className="font-display text-xl font-bold text-brand-ink mb-3">How it works with MWFitnessUK</h3>
            <p className="text-[15px] text-brand-body leading-relaxed">{SHWAG_STORY.howItWorks}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold">
              <BadgePercent className="w-4 h-4" />
              10% off for MWFitnessUK clients
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border card-shadow p-7 h-full">
            <h3 className="font-display text-xl font-bold text-brand-ink mb-3">What we stand for</h3>
            <ul className="space-y-2.5">
              {SHWAG_STORY.standFor.map((value) => (
                <li key={value} className="flex items-center gap-3 text-brand-ink">
                  <span className="w-2 h-2 rounded-full bg-brand-orange" />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Products — real items only */}
        {SHWAG_PRODUCTS.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHWAG_PRODUCTS.map((product) => (
              <div key={product.id} className="relative bg-white rounded-3xl border border-brand-border card-shadow p-6 flex flex-col">
                {product.badge && (
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-brand-orange text-white text-[11px] font-bold uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
                <div className="w-full aspect-square rounded-2xl bg-brand-orange-soft flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-brand-orange text-2xl">SHWAG</span>
                  )}
                </div>
                <h4 className="font-display text-xl font-bold text-brand-ink mt-4">{product.name}</h4>
                <p className="text-sm text-brand-body leading-relaxed mt-1.5">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  {product.price && <span className="font-display text-2xl font-bold text-brand-ink">{product.price}</span>}
                  <button
                    onClick={() => onOpenContact('shwag', product.name)}
                    className="inline-flex items-center gap-1.5 bg-brand-orange-soft hover:bg-brand-orange hover:text-white text-brand-ink text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                  >
                    Message to order
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
<div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-brand-orange p-10 text-white flex flex-col justify-center card-shadow-hover">
              <h3 className="font-display text-3xl font-bold">SHWAG.</h3>
              <p className="mt-3 text-white/90 text-[15px] leading-relaxed">
                The full range is live on Instagram — tees, hoodies and more. Message to order and I'll sort you out personally.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <CtaButton onOpen={() => onOpenContact('shwag')} label="Message to order" variant="white" />
                <a
                  href={SHWAG_ORDER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-brand-orange/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-full border border-white/60 transition-colors"
                >
                  See it on Instagram
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-border card-shadow p-8">
              <h3 className="font-display text-xl font-bold text-brand-ink mb-4">How ordering works</h3>
              <ul className="space-y-3 text-brand-ink text-[15px]">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-orange-soft text-brand-orange font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Tell me what you're after via the button — item, size, colour.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-orange-soft text-brand-orange font-bold flex items-center justify-center shrink-0">2</span>
                  <span>I confirm the latest price and your MWFitnessUK 10% discount.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-orange-soft text-brand-orange font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Wear the badge, do the work. 💪</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-brand-muted">{SHWAG_NOTE}</p>
      </section>
    </div>
  );
};