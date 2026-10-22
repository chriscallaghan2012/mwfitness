import React from 'react';
import { X } from 'lucide-react';
import { StaffNotifications } from './StaffNotifications';

/**
 * Compact dashboard chrome for Staff HQ (/admin). The marketing site's Navbar
 * and Footer are hidden on this route; these provide the small top bar with an
 * exit control and a small link footer instead.
 */
export const AdminTopBar: React.FC = () => (
  <header className="sticky top-0 z-40 border-b border-[#20232a] bg-[#0b0c0e]/95 backdrop-blur-md">
    <div className="mx-auto flex h-14 w-full max-w-[1680px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6 xl:px-8">
      <a href="/" className="group flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center border border-[#ff5500] bg-transparent">
          <span className="font-display text-lg leading-none tracking-tighter text-[#ff5500]">MW</span>
        </span>
        <span className="font-display text-xl uppercase tracking-widest text-white transition-colors group-hover:text-[#ff5500]">
          MWFitness<span className="text-[#ff5500] transition-colors group-hover:text-white"> HQ</span>
        </span>
      </a>
      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:inline">Staff dashboard</span>
        <StaffNotifications onNavigate={(tab, profileId) => window.dispatchEvent(new CustomEvent('mwfitness:staff-notification-navigate', { detail: { tab, profileId } }))} />
        <a
          href="/"
          className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white transition-colors hover:text-[#ff5500]"
        >
          <X className="h-3.5 w-3.5" />
          Exit to site
        </a>
      </div>
    </div>
  </header>
);

export const AdminBottomBar: React.FC = () => (
  <footer className="border-t border-[#20232a] bg-[#0b0c0e]">
    <div className="mx-auto flex w-full max-w-[1680px] flex-col items-center justify-between gap-2 px-3 py-3 sm:flex-row sm:px-5 lg:px-6 xl:px-8">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        © {new Date().getFullYear()} Michael Whitworth — MWFitnessUK
      </p>
      <nav aria-label="Dashboard links" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
        <a href="/" className="text-white transition-colors hover:text-[#ff5500]">Site home</a>
        <a href="/privacy" className="text-white transition-colors hover:text-[#ff5500]">Privacy policy</a>
        <a href="/cookies" className="text-white transition-colors hover:text-[#ff5500]">Cookie policy</a>
        <a href="/gdpr" className="text-white transition-colors hover:text-[#ff5500]">UK GDPR</a>
      </nav>
    </div>
  </footer>
);
