import React from 'react';
import { ScreenId } from '../types';
import { CONTACT } from '../data/siteData';
import { Mail, Instagram, Facebook, MapPin } from 'lucide-react';
import { CtaButton } from './CtaButton';

interface FooterProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenContact: () => void;
}

const FOOTER_LINKS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'packages', label: 'Packages' },
  { id: 'contact', label: 'Get In Touch' },
  { id: 'app-shop', label: 'App & SHWAG' },
];

export const Footer: React.FC<FooterProps> = ({ onSelectScreen, onOpenContact }) => {
  return (
    <footer className="border-t border-brand-border bg-brand-paper text-brand-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center text-white font-display font-bold">
                MW
              </div>
              <span className="font-display text-2xl font-bold text-brand-ink tracking-tight">
                MWFitness<span className="text-brand-orange">UK</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Friendly 1-2-1 personal training and online coaching in Stockport for busy people.
              Simple guidance, real support, no jargon.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">
              {CONTACT.sessions}.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-display font-bold text-brand-ink uppercase tracking-wider mb-3">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onSelectScreen(link.id)}
                    className="text-sm text-brand-ink hover:text-brand-orange transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-display font-bold text-brand-ink uppercase tracking-wider mb-3">
              Say hello
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="text-brand-ink hover:text-brand-orange transition-colors">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-brand-orange shrink-0" />
                <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-brand-ink hover:text-brand-orange transition-colors">
                  @{CONTACT.instagramHandle}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Facebook className="w-4 h-4 text-brand-orange shrink-0" />
                <a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-brand-ink hover:text-brand-orange transition-colors">
                  {CONTACT.facebookName}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="text-brand-ink">{CONTACT.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <span>© {new Date().getFullYear()} MWFitnessUK — Michael Whitworth. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <CtaButton onOpen={onOpenContact} label="Book a free chat" />
          </div>
        </div>
      </div>
    </footer>
  );
};