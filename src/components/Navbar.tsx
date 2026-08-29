import React, { useState } from 'react';
import { ScreenId, NavItem } from '../types';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Flame, 
  PhoneCall, 
  ShieldAlert, 
  Activity,
  Layers,
  Dumbbell,
  Compass,
  CreditCard,
  BookOpen,
  Warehouse,
  Calculator
} from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenConsultation: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string; code: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', code: '01', icon: Flame },
  { id: 'pt', label: '1-on-1 PT', code: '02', icon: Dumbbell },
  { id: 'online', label: 'Online', code: '03', icon: Activity },
  { id: 'methodology', label: 'Methodology', code: '04', icon: Compass },
  { id: 'packages', label: 'Packages', code: '05', icon: CreditCard },
  { id: 'programmes', label: 'Programmes', code: '06', icon: BookOpen },
  { id: 'armory', label: 'The Armory', code: '07', icon: Warehouse },
  { id: 'tools', label: 'Athlete Hub', code: '08', icon: Calculator },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenConsultation,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: ScreenId) => {
    onSelectScreen(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#262930]">
      {/* Top Industrial Status Telemetry Bar */}
      <div className="bg-[#121418] border-b border-[#1c1f26] px-4 py-1 text-xs font-mono text-[#8b929e] flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYS: ONLINE
          </span>
          <span className="text-[#3f434d]">|</span>
          <span className="text-zinc-300">HQ: PURE GYM HAZEL GROVE • STOCKPORT</span>
          <span className="text-[#3f434d] hidden sm:inline">|</span>
          <span className="text-[#ff5500] hidden sm:inline font-medium">SEPT 2026: MORNING / EVENING / WEEKEND SESSIONS</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-zinc-400">
          <span>LAT: 53.3765° N, 2.1167° W</span>
          <span className="text-[#ff5500] font-semibold">MWFITNESS v4.8</span>
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
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl md:text-3xl tracking-widest text-white leading-none font-bold">
                  MWFITNESS
                </span>
                <span className="w-1.5 h-1.5 bg-[#ff5500] rounded-sm"></span>
              </div>
              <span className="text-[10px] font-mono text-[#8b929e] tracking-widest block uppercase">
                Strength & Performance
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const isActive = currentScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-xs font-mono tracking-wider transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-white bg-[#1a1d24] border-b-2 border-[#ff5500]'
                      : 'text-[#8b929e] hover:text-white hover:bg-[#14161b]'
                  }`}
                >
                  <span className={`text-[10px] ${isActive ? 'text-[#ff5500]' : 'text-zinc-500'}`}>
                    {item.code}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="nav-consultation-btn"
              onClick={onOpenConsultation}
              className="relative group overflow-hidden bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono text-xs uppercase font-bold px-4 md:px-5 py-2.5 transition-all duration-200 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Book Consultation</span>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-black"></span>
            </button>

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
      </div>

      {/* Screen Quick Selector Strip (Visible on large screens) */}
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
            {item.code} {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0e1014] border-b border-[#262930] px-4 pt-3 pb-6 space-y-2 animate-in fade-in duration-200">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1">
            Tactical Protocols / Screens
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
                onOpenConsultation();
              }}
              className="w-full bg-[#ff5500] text-black font-mono font-bold text-center py-3 uppercase tracking-wider hover:bg-[#ff6a1f]"
            >
              Start Athletic Assessment
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
