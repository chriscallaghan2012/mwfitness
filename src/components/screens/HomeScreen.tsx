import React from 'react';
import { ContactKind, ScreenId } from '../../types';
import { IMAGES, COACH, OFFERINGS, PRICING_TIERS, REVIEWS, CONTACT } from '../../data/siteData';
import { SectionHeading, Stars } from '../ui';
import { CtaButton } from '../CtaButton';
import {
  ArrowRight,
  Check,
  Dumbbell,
  Laptop,
  Salad,
  MapPin,
  Quote,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenContact: (kind: ContactKind, interest?: string) => void;
}

const OFFERING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pt: Dumbbell,
  online: Laptop,
  nutrition: Salad,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectScreen, onOpenContact }) => {
  const formatPrice = (value: number) => `£${value.toLocaleString('en-GB')}`;

  return (
    <div className="space-y-20 md:space-y-28">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Welcome to MWFitnessUK
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-brand-ink tracking-tight leading-tight">
              Real training,
              <span className="text-brand-orange"> built around real life.</span>
            </h1>

            <p className="text-lg md:text-xl text-brand-body leading-relaxed">
              Hi, I'm Mike. I help busy people — the 9-5ers, the parents, the people who
              "haven't got time" — get fit, feel stronger and actually enjoy it.
              No jargon. No fad diets. Just a plan that fits your life.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                id="hero-packages-btn"
                onClick={() => onSelectScreen('packages')}
                className="inline-flex items-center gap-2.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-7 py-3.5 rounded-full transition-colors"
              >
                See the packages
                <ArrowRight className="w-4 h-4" />
              </button>
              <CtaButton onOpen={() => onOpenContact('book-call')} label="Book a free chat" size="lg" variant="outline" />
            </div>

            <ul className="flex flex-wrap gap-x-2 gap-y-3 items-center text-sm text-brand-muted">
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-green" /> 1-2-1 PT</li>
              <li className="text-brand-muted">·</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-green" /> Online coaching</li>
              <li className="text-brand-muted">·</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-green" /> Nutrition support</li>
            </ul>
          </div>

          {/* Photo */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden card-shadow">
              <img
                src={IMAGES.HERO}
                alt="Mike training with a kettlebell at Pure Gym Hazel Grove"
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl border border-brand-border card-shadow px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-brand-orange-soft flex items-center justify-center text-brand-orange font-display font-bold">4</div>
                <div>
                  <div className="font-display text-lg font-bold text-brand-ink leading-none">Simple packages</div>
                  <div className="text-xs text-brand-muted">starting at £120</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT'S AVAILABLE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What I offer"
          title="Something for everyone — whatever your starting point"
          sub="Whether you want me by your side in the gym, a plan you can follow on your own, or help getting your food right — there's a simple way to work together."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {OFFERINGS.map((offering) => {
            const Icon = OFFERING_ICONS[offering.id];
            return (
              <div key={offering.id} className="bg-white rounded-3xl border border-brand-border card-shadow-hover p-8 hover:-translate-y-1 transition-transform duration-200">
                <div className="w-14 h-14 rounded-2xl bg-brand-orange-soft flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-brand-orange" />
                </div>
                <h3 className="font-display text-2xl font-bold text-brand-ink tracking-tight mb-3">{offering.title}</h3>
                <p className="text-brand-body leading-relaxed text-[15px]">{offering.summary}</p>
                <ul className="mt-5 space-y-2 text-sm text-brand-ink">
                  {offering.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-brand-green shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-brand-border card-shadow px-6 py-4">
          <div className="flex items-center gap-3 text-brand-ink">
            <MapPin className="w-5 h-5 text-brand-orange shrink-0" />
            <span className="text-[15px]">Sessions run at {CONTACT.location} — plus online coaching anywhere in the UK.</span>
          </div>
          <button
            onClick={() => onSelectScreen('packages')}
            className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange-dark font-semibold shrink-0"
          >
            See all packages <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ================= ABOUT MIKE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden card-shadow">
            <img
              src={IMAGES.PROFILE}
              alt="Mike on the gym floor at Pure Gym Hazel Grove"
              className="w-full aspect-square object-cover"
            />
          </div>

          <div>
            <SectionHeading
              eyebrow="My background"
              title={`Hi, I'm ${COACH.name.split(' ')[0]}`}
            />
            <div className="mt-6 space-y-4 text-brand-body leading-relaxed">
              {COACH.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="bg-brand-orange-soft/60 rounded-2xl p-5">
                <h4 className="font-display font-bold text-brand-ink mb-3">My experience</h4>
                <ul className="space-y-2 text-sm text-brand-ink">
                  {COACH.experience.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-brand-green-soft rounded-2xl p-5">
                <h4 className="font-display font-bold text-brand-ink mb-3">My qualifications</h4>
                <ul className="space-y-2 text-sm text-brand-ink">
                  {COACH.qualifications.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PACKAGES AT A GLANCE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Packages"
          title="Simple, upfront pricing. No surprises."
          sub="Every package is a block of 4 x 1-2-1 personal training sessions — with more included as you go up. Full breakdown on the Packages page."
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-3xl border p-6 flex flex-col card-shadow ${
                tier.isPopular ? 'border-brand-orange ring-2 ring-brand-orange/30' : 'border-brand-border'
              }`}
            >
              {tier.isPopular && (
                <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-brand-orange text-white text-[11px] font-bold uppercase tracking-wider">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold text-brand-ink">{tier.name}</h3>
              <p className="text-sm text-brand-muted mt-1">{tier.tagline}</p>
              <div className="mt-4">
                <span className="font-display text-4xl font-bold text-brand-ink">{formatPrice(tier.price)}</span>
                {tier.originalPrice && (
                  <span className="text-brand-muted line-through ml-2">{formatPrice(tier.originalPrice)}</span>
                )}
                <p className="text-xs text-brand-muted mt-1">Block of 4 x 1-2-1 sessions</p>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-brand-ink">
                {tier.features.slice(0, 3).map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <a
                href="#packages"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-brand-orange-soft hover:bg-brand-orange hover:text-white text-brand-ink font-semibold text-sm px-4 py-2.5 rounded-full transition-colors w-full"
              >
                See package
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onSelectScreen('packages')}
            className="inline-flex items-center gap-2.5 text-brand-orange hover:text-brand-orange-dark font-semibold"
          >
            See the full package breakdown and what's included
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials & feedback"
          title="What people say about training with me"
          sub="I'm proud of every single one of these. Real clients, real results, real feedback."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <figure key={review.id} className="bg-white rounded-3xl border border-brand-border card-shadow p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-brand-orange-soft flex items-center justify-center font-display font-bold text-brand-orange shrink-0">
                  {review.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <figcaption className="font-semibold text-brand-ink text-[15px]">{review.name}</figcaption>
                  <div className="flex items-center gap-1.5">
                    <Stars rating={5} />
                    <span className="text-xs text-brand-muted">· {review.packageName}</span>
                  </div>
                </div>
              </div>
              <Quote className="w-5 h-5 text-brand-orange mb-2" />
              <blockquote className="text-brand-body leading-relaxed text-[15px] flex-1">
                {review.quote}
              </blockquote>
              <footer className="mt-3 text-sm font-semibold text-brand-ink">{review.result}</footer>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= BOOK A CHAT CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-orange p-10 md:p-14 text-white text-center card-shadow-hover">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/10 pointer-events-none"></div>
          <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none"></div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Let's have a chat — it's free
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            {CONTACT.sessions} — mornings, evenings or weekends. Tell me a bit about you, and we'll work out the best way forward. No pressure, no hard sell.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <CtaButton onOpen={() => onOpenContact('book-call')} label="Send me a message" size="lg" variant="white" />
            <button
              onClick={() => onSelectScreen('contact')}
              className="inline-flex items-center gap-2.5 bg-brand-orange/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-full border border-white/60 transition-colors"
            >
              Go to the contact page
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};