import React, { useState } from 'react';
import { ScreenId } from '../types';
import {
  Menu,
  X,
  ChevronRight,
  Flame,
  CreditCard,
  Dumbbell,
  Smartphone,
  Shirt,
  PhoneCall,
} from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenBookCall: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string; code: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', code: '01', icon: Flame },
  { id: 'online-coaching', label: 'Online coaching', code: '02', icon: Dumbbell },
  { id: 'packages', label: '1:1 packages', code: '03', icon: CreditCard },
  { id: 'app', label: 'The App', code: '04', icon: Smartphone },
  { id: 'shwag', label: 'SHWAG', code: '05', icon: Shirt },
  { id: 'contact', label: 'Contact', code: '06', icon: PhoneCall },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenBookCall,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: ScreenId) => {
    onSelectScreen(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#262930]">
      {/* Top Status Bar */}
      <div className="bg-[#121418] border-b border-[#1c1f26] px-4 py-1 text-xs font-mono text-[#8b929e] flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            NOW BOOKING
          </span>
          <span className="text-[#3f434d]">|</span>
          <span className="text-zinc-300">PURE GYM HAZEL GROVE • STOCKPORT</span>
          <span className="text-[#3f434d] hidden sm:inline">|</span>
          <span className="text-[#ff5500] hidden sm:inline font-medium">MORNING / EVENING / WEEKEND SESSIONS</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-zinc-400">
          <span className="text-[#ff5500] font-semibold">MWFITNESSUK</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 bg-[#16181d] border border-[#ff5500] flex items-center justify-center relative overflow-hidden group-hover:border-white transition-colors">
              <div className="w-3 h-3 bg-[#ff5500] rotate-45 group-hover:scale-125 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#ff5500]/20 pointer-events-none"></div>
            </div>
            <div>
              <div className="font-display text-2xl tracking-widest text-white font-bold uppercase leading-none">
                MWFitness<span className="text-[#ff5500]">UK</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Personal training • Stockport
              </div>
            </div>
          </button>

          {/* Desktop Nav (xl) */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                  currentScreen === item.id
                    ? 'bg-[#ff5500] text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1d24] bg-[#16181d] border border-[#262930]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={onOpenBookCall}
              className="ml-2 bg-[#ff5500] text-black font-mono font-bold text-xs uppercase px-4 py-2.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Book a call</span>
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 text-zinc-400 hover:text-white bg-[#16181d] border border-[#262930] hover:border-zinc-500 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Screen Quick Selector Strip (tablet / laptop) */}
      <div className="hidden lg:flex xl:hidden bg-[#121418] border-t border-[#1e222a] px-6 py-2 overflow-x-auto space-x-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`px-3 py-1 text-xs font-mono whitespace-nowrap transition-colors ${
              currentScreen === item.id
                ? 'bg-[#ff5500] text-black font-bold'
                : 'text-zinc-400 hover:text-white bg-[#1a1d24]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0e1014] border-b border-[#262930] px-4 pt-3 pb-6 space-y-2 animate-in fade-in duration-200">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1">
            Menu
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = currentScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-3 text-left font-mono text-sm border transition-all ${
                    isActive
                      ? 'bg-[#181b22] text-white border-[#ff5500]'
                      : 'bg-[#121419] text-zinc-400 hover:text-white border-[#1c1f26]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#ff5500] font-bold">{item.code}</span>
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#1c1f26] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookCall();
              }}
              className="w-full bg-[#ff5500] text-black font-mono font-bold text-center py-3 uppercase tracking-wider hover:bg-[#ff6a1f]"
            >
              Book a free call
            </button>
          </div>
        </div>
      )}
    </header>
  );
};