import React, { useState } from 'react';
import { Programme } from '../types';
import { X, Check, ShoppingBag, Download, Calendar, Dumbbell, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProgrammeModalProps {
  programme: Programme | null;
  onClose: () => void;
}

export const ProgrammeModal: React.FC<ProgrammeModalProps> = ({ programme, onClose }) => {
  const [purchased, setPurchased] = useState(false);
  const [email, setEmail] = useState('');

  if (!programme) return null;

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setPurchased(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#121419] border border-[#2d323c] shadow-2xl p-6 md:p-8 my-8 text-zinc-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-[#1a1d24] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!purchased ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-mono">
                <span className="bg-[#ff5500]/20 text-[#ff5500] border border-[#ff5500]/40 px-2 py-0.5 uppercase tracking-wider">
                  {programme.category}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400 uppercase">{programme.duration}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400 uppercase">{programme.frequency}</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl tracking-wide text-white uppercase mt-1">
                {programme.title}
              </h2>
              <p className="text-sm font-sans text-zinc-300 mt-2 leading-relaxed">
                {programme.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-[#171920] border border-[#232732] p-4">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-wider mb-2.5">
                Core Architectural Pillars
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                {programme.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#ff5500] font-bold">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weekly Breakdown Table */}
            <div>
              <div className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-3">
                Curriculum & Microcycle Progression
              </div>
              <div className="space-y-2">
                {programme.weeklyBreakdown.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-[#16181e] border border-[#22252e] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#ff5500] font-bold min-w-[90px]">{item.week}</span>
                      <span className="text-white font-medium bg-[#20242e] px-2 py-0.5 border border-[#2b303e]">
                        {item.focus}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px] truncate sm:max-w-xs">
                      {item.sampleSession}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Instant Checkout */}
            <form onSubmit={handlePurchase} className="border-t border-[#232732] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">One-Time Lifetime License</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl text-white font-bold">£{programme.price}</span>
                  <span className="text-xs font-mono text-emerald-400 uppercase">Instant PDF + App Key</span>
                </div>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#171920] border border-[#2a2e38] px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] w-full sm:w-60"
                />
                <button
                  type="submit"
                  id="checkout-programme-btn"
                  className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-5 py-2.5 whitespace-nowrap transition-transform active:scale-95 flex items-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Get Protocol</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Purchased Success State */
          <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#16221a] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
                License Authorized
              </span>
              <h3 className="font-display text-3xl text-white uppercase mt-1">
                Access Dispatched to {email}
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-2 max-w-md mx-auto">
                Your download link and MWFITNESS Companion App activation token have been sent.
              </p>
            </div>

            <div className="p-4 bg-[#16181f] border border-[#262b36] max-w-md mx-auto text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Asset:</span>
                <span className="text-white">{programme.title} (PDF + Sheets)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">App License:</span>
                <span className="text-[#ff5500]">MW-PRO-{Math.floor(10000 + Math.random() * 90000)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  setPurchased(false);
                  onClose();
                }}
                className="bg-[#ff5500] text-black font-mono text-xs font-bold uppercase px-6 py-2.5"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
