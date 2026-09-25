import React from 'react';
import { ScreenId } from '../types';
import { CONTACT } from '../data/mockData';
import { MapPin, Mail, Instagram, Facebook, PhoneCall } from 'lucide-react';

interface FooterProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: () => void;
}

const NAV_LINKS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'online-coaching', label: 'Online coaching' },
  { id: 'packages', label: '1:1 packages' },
  { id: 'app', label: 'The App' },
  { id: 'shwag', label: 'SHWAG' },
  { id: 'contact', label: 'Contact' },
];

export const Footer: React.FC<FooterProps> = ({ onSelectScreen, onOpenBookCall }) => {
  return (
    <footer className="bg-[#0b0c0e] border-t border-[#20232a] text-zinc-400 font-sans text-xs">
      {/* Industrial Warning Stripe */}
      <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#ff5500,#ff5500_15px,#121418_15px,#121418_30px)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#16181d] border border-[#ff5500] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#ff5500] rotate-45"></div>
              </div>
              <span className="font-display text-2xl tracking-widest text-white font-bold">
                MWFITNESS<span className="text-[#ff5500]">UK</span>
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 max-w-sm leading-relaxed">
              Simple, friendly personal training and online coaching for busy people — based at Pure Gym Hazel Grove, Stockport. No jargon, no judgement, just results.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono pt-2">
              <span className="text-[#ff5500] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-ping"></span>
                {CONTACT.sessions}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              Explore
            </div>
            <ul className="space-y-2 font-mono text-xs text-zinc-400">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button onClick={() => onSelectScreen(link.id)} className="hover:text-[#ff5500] transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              Get in touch
            </div>
            <div className="space-y-2 text-xs font-mono text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#ff5500] shrink-0 mt-0.5" />
                <span>{CONTACT.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ff5500] shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-[#ff5500] transition-colors">
                  {CONTACT.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-[#ff5500] shrink-0" />
                <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500] transition-colors">
                  @{CONTACT.instagramHandle}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-[#ff5500] shrink-0" />
                <a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500] transition-colors">
                  {CONTACT.facebookName}
                </a>
              </div>
            </div>

            <button
              onClick={onOpenBookCall}
              className="mt-4 w-full bg-[#ff5500] hover:bg-[#ff6a1f] hover:text-black border border-[#ff5500] text-black font-mono text-xs font-bold py-2.5 px-3 uppercase tracking-wider transition-all"
            >
              <span className="flex items-center gap-2 justify-center">
                <PhoneCall className="w-3.5 h-3.5" />
                Book a free call
              </span>
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#1c1f26] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} MICHAEL WHITWORTH — MWFITNESSUK PERSONAL TRAINING. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-300 transition-colors">FULLY INSURED</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">QUALIFIED PERSONAL TRAINER</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">BASED AT PURE GYM HAZEL GROVE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};