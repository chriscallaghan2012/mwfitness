import React from 'react';
import { ScreenId } from '../types';
import { CONTACT } from '../data/mockData';
import { ShieldCheck, MapPin, Mail, Instagram, Facebook, ExternalLink, Terminal } from 'lucide-react';

interface FooterProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenConsultation: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectScreen, onOpenConsultation }) => {
  return (
    <footer className="bg-[#0b0c0e] border-t border-[#20232a] text-zinc-400 font-sans text-xs">
      {/* Industrial Warning Stripe */}
      <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#ff5500,#ff5500_15px,#121418_15px,#121418_30px)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#16181d] border border-[#ff5500] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#ff5500] rotate-45"></div>
              </div>
              <span className="font-display text-2xl tracking-widest text-white font-bold">
                MWFITNESS
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 max-w-sm leading-relaxed">
              Relentless 1-2-1 personal training, online coaching, nutritional advice and calorie-controlled meal preparation ideas. Based at Pure Gym Hazel Grove, Stockport. Zero fluff — just results.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono pt-2">
              <span className="text-[#ff5500] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-ping"></span>
                SEPT 2026: SESSIONS NOW BOOKING
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Hub */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              Systems & Screens
            </div>
            <ul className="space-y-2 font-mono text-xs text-zinc-400">
              <li>
                <button onClick={() => onSelectScreen('home')} className="hover:text-[#ff5500] transition-colors">
                  01 // Home Protocol
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('pt')} className="hover:text-[#ff5500] transition-colors">
                  02 // 1-on-1 Personal Training
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('online')} className="hover:text-[#ff5500] transition-colors">
                  03 // Remote Coaching & App
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('methodology')} className="hover:text-[#ff5500] transition-colors">
                  04 // Periodization Methodology
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('packages')} className="hover:text-[#ff5500] transition-colors">
                  05 // Membership & Tiers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('programmes')} className="hover:text-[#ff5500] transition-colors">
                  06 // Standalone Protocols
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('armory')} className="hover:text-[#ff5500] transition-colors">
                  07 // The Armory (Facility)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectScreen('tools')} className="hover:text-[#ff5500] transition-colors">
                  08 // Athlete Performance Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Contact */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              Contact & Location
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
              <div className="pt-2 text-[11px] text-zinc-500">
                {CONTACT.sessions}. {CONTACT.note}.
              </div>
            </div>
          </div>

          {/* Col 4: Rapid Consultation */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              Intake Screening
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Take the first step toward breaking through your performance plateaus.
            </p>
            <button
              onClick={onOpenConsultation}
              className="w-full bg-[#181b22] hover:bg-[#ff5500] hover:text-black border border-[#2b303d] text-white font-mono text-xs font-bold py-2.5 px-3 uppercase tracking-wider transition-all"
            >
              Launch Assessment
            </button>
          </div>
        </div>

        {/* Bottom Legal & Telemetry */}
        <div className="border-t border-[#1c1f26] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} MICHAEL WHITWORTH — MWFITNESS PERSONAL TRAINING. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-300 transition-colors">SECURITY CLEARANCE: PUBLIC</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">DATA PRIVACY // ZERO LOG</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">BASED AT PURE GYM HAZEL GROVE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
