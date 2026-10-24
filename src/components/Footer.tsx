import React from 'react';
import { ScreenId } from '../types';
import { CONTACT } from '../data/mockData';
import { MapPin, Mail, Instagram, Facebook, PhoneCall } from 'lucide-react';
import { StoreBadges } from './StoreBadges';

interface FooterProps {
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: () => void;
}

const NAV_LINKS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'online-coaching', label: 'Online coaching plans' },
  { id: 'nutrition', label: 'Nutrition & digital guides' },
  { id: 'app', label: 'The App' },
  { id: 'reviews', label: 'Reviews & testimonials' },
  { id: 'contact', label: 'Contact' },
  { id: 'account', label: 'Member account' },
];

export const Footer: React.FC<FooterProps> = ({ onSelectScreen, onOpenBookCall }) => (
  <footer className="bg-[#0b0c0e] border-t border-[#20232a] text-zinc-400 font-sans text-xs">
    <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#ff5500,#ff5500_15px,#121418_15px,#121418_30px)]" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_auto] gap-8 mb-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-transparent border border-[#ff5500] flex items-center justify-center"><span aria-hidden="true" className="font-display text-xl leading-none tracking-tighter text-[#ff5500]">MW</span></div>
            <span className="font-display text-2xl tracking-widest text-white font-bold">MWFITNESS<span className="text-[#ff5500]">UK</span></span>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-sm leading-relaxed">Online coaching built around real life, with training and nutrition support wherever you train.</p>
          <button onClick={() => onSelectScreen('online-coaching')} className="text-white hover:text-[#ff5500] font-mono font-bold text-xs py-2.5 px-4 uppercase tracking-wider transition-colors">Explore online coaching <span aria-hidden="true">→</span></button>
          
        </div>
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-white uppercase tracking-wider font-bold">Explore</h2>
          <ul className="space-y-2 font-mono text-xs">
            {NAV_LINKS.map((link) => <li key={link.id}><button onClick={() => onSelectScreen(link.id)} className="text-white hover:text-[#ff5500] transition-colors">{link.label}</button></li>)}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-white uppercase tracking-wider font-bold">Contact</h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-[#ff5500] shrink-0 mt-0.5" /><span>{CONTACT.location}</span></div>
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={`mailto:${CONTACT.email}`} className="text-white hover:text-[#ff5500] transition-colors">{CONTACT.email}</a></div>
            <div className="flex items-center gap-2"><Instagram className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff5500] transition-colors">@{CONTACT.instagramHandle}</a></div>
            <div className="flex items-center gap-2"><Instagram className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={CONTACT.shwagInstagramUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff5500] transition-colors">@{CONTACT.shwagInstagramHandle} <span className="text-zinc-500">(SHWAG)</span></a></div>
            <div className="flex items-center gap-2"><Facebook className="w-3.5 h-3.5 text-[#ff5500] shrink-0" /><a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff5500] transition-colors">{CONTACT.facebookName}</a></div>
          </div>
          <button onClick={onOpenBookCall} className="mt-2 inline-flex items-center gap-2 text-xs font-mono text-white hover:text-[#ff5500] transition-colors"><PhoneCall className="w-3.5 h-3.5" /> Book a free call</button>
        </div>
        <div className="space-y-3 lg:text-right">
          <h2 className="font-mono text-xs text-white uppercase tracking-wider font-bold">Get the app</h2>
          <p className="max-w-xs text-xs leading-relaxed text-zinc-500 lg:ml-auto">App listings will link directly here when published.</p>
          <div className="flex justify-start lg:justify-end"><StoreBadges compact /></div>
        </div>
      </div>
      <div className="border-t border-[#1c1f26] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-zinc-500">
        <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Michael Whitworth — MWFitnessUK. All rights reserved.</p>
          <a href="https://christopherjcallaghan.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">Web design &amp; development by Christopher J Callaghan</a>
        </div>
        <nav aria-label="Legal and privacy" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="/privacy" className="text-white hover:text-[#ff5500] uppercase tracking-wider transition-colors">Privacy policy</a>
          <a href="/cookies" className="text-white hover:text-[#ff5500] uppercase tracking-wider transition-colors">Cookie policy</a>
          <a href="/gdpr" className="text-white hover:text-[#ff5500] uppercase tracking-wider transition-colors">UK GDPR</a>
          <a href="/delete-account" className="text-white hover:text-[#ff5500] uppercase tracking-wider transition-colors">Account and data deletion</a>
          <button type="button" onClick={() => window.dispatchEvent(new Event('mw:open-cookie-settings'))} className="text-white hover:text-[#ff5500] uppercase tracking-wider transition-colors">Cookie settings</button>
        </nav>
      </div>
    </div>
  </footer>
);
