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
  { id: 'online-coaching', label: 'Online coaching plans' },
  { id: 'packages', label: '1:1 personal training' },
  { id: 'app', label: 'The App' },
  { id: 'contact', label: 'Contact' },
];

export const Footer: React.FC<FooterProps> = ({ onSelectScreen, onOpenBookCall }) => (
  <footer className="bg-[#0b0c0e] border-t border-[#20232a] text-zinc-400 font-sans text-xs">
    <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#ff5500,#ff5500_15px,#121418_15px,#121418_30px)]" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#16181d] border border-[#ff5500] flex items-center justify-center"><div className="w-2.5 h-2.5 bg-[#ff5500] rotate-45" /></div>
            <span className="font-display text-2xl tracking-widest text-white font-bold">MWFITNESS<span className="text-[#ff5500]">UK</span></span>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-sm leading-relaxed">Online coaching built around real life, with personal training available in Hazel Grove, Stockport.</p>
          <button onClick={() => onSelectScreen('online-coaching')} className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs py-2.5 px-4 uppercase tracking-wider">Explore online plans <span aria-hidden="true">→</span></button>
        </div>
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-white uppercase tracking-wider font-bold">Explore</h2>
          <ul className="space-y-2 font-mono text-xs">
            {NAV_LINKS.map((link) => <li key={link.id}><button onClick={() => onSelectScreen(link.id)} className="hover:text-[#ff5500] transition-colors">{link.label}</button></li>)}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-white uppercase tracking-wider font-bold">Contact</h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-[#ff5500] shrink-0 mt-0.5" /><span>{CONTACT.location}</span></div>
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={`mailto:${CONTACT.email}`} className="hover:text-[#ff5500]">{CONTACT.email}</a></div>
            <div className="flex items-center gap-2"><Instagram className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500]">@{CONTACT.instagramHandle}</a></div>
            <div className="flex items-center gap-2"><Facebook className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500]">{CONTACT.facebookName}</a></div>
          </div>
          <button onClick={onOpenBookCall} className="mt-2 inline-flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-[#ff5500]"><PhoneCall className="w-3.5 h-3.5" /> Book a free call</button>
        </div>
      </div>
      <div className="border-t border-[#1c1f26] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-zinc-500">
        <p>© {new Date().getFullYear()} Michael Whitworth — MWFitnessUK. All rights reserved.</p>
        <nav aria-label="Legal and privacy" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="/privacy" className="hover:text-[#ff5500] uppercase tracking-wider">Privacy policy</a>
          <a href="/cookies" className="hover:text-[#ff5500] uppercase tracking-wider">Cookie policy</a>
          <a href="/delete-account" className="hover:text-[#ff5500] uppercase tracking-wider">Account and data deletion</a>
        </nav>
      </div>
    </div>
  </footer>
);
