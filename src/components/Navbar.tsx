import React, { useState } from 'react';
import { ScreenId } from '../types';
import { Menu, X } from 'lucide-react';
import { CtaButton } from './CtaButton';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenContact: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'packages', label: 'Packages' },
  { id: 'contact', label: 'Get In Touch' },
  { id: 'app-shop', label: 'App & SHWAG' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onSelectScreen, onOpenContact }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: ScreenId) => {
    onSelectScreen(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-paper/95 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="MWFitnessUK Home"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white font-display font-bold">
              MW
            </div>
            <div className="text-left leading-tight">
              <span className="block font-display text-xl font-bold text-brand-ink tracking-tight">
                MWFitness<span className="text-brand-orange">UK</span>
              </span>
              <span className="block text-[11px] text-brand-muted">Stockport &amp; online</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  currentScreen === item.id
                    ? 'bg-brand-orange-soft text-brand-ink'
                    : 'text-brand-ink hover:bg-brand-orange-soft'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:block">
              <CtaButton onOpen={onOpenContact} label="Book a free chat" />
            </div>

            {/* Mobile toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-full text-brand-ink border border-brand-border hover:bg-brand-orange-soft"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-brand-border px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                currentScreen === item.id
                  ? 'bg-brand-orange-soft text-brand-ink'
                  : 'text-brand-ink hover:bg-brand-orange-soft'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenContact();
            }}
            className="w-full block text-center bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3 rounded-xl"
          >
            Book a free chat
          </button>
        </div>
      )}
    </header>
  );
};