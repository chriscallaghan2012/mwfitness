import React, { useState } from 'react';
import { SHWAG, CONTACT } from '../../data/mockData';
import { postEnquiry } from '../../lib/mail';
import { Shirt, CheckCircle, ArrowRight, Sparkles, ExternalLink, Instagram } from 'lucide-react';

interface ShwagScreenProps {
  onOpenBookCall: () => void;
}

export const ShwagScreen: React.FC<ShwagScreenProps> = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [item, setItem] = useState('Classic SHWAG T-Shirt');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    const result = await postEnquiry({
      kind: 'shwag',
      name,
      email,
      interest: item,
      message,
      page: 'shwag',
    });
    setSending(false);
    if (result.ok) setDone(true);
    else setError(result.error || 'Something went wrong. Please try again.');
  };

  const inputClass =
    'w-full bg-[#16181d] border border-[#262930] text-zinc-200 px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#ff5500] placeholder:text-zinc-600';

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0b0c0e]"></div>
          <div className="absolute inset-0 bg-dots-pattern opacity-60"></div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6 text-center mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ SHWAG ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              SHWAG.
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              {SHWAG.intro}
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHAT SHWAG STANDS FOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#121419] border border-[#20232b] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl text-white uppercase">What SHWAG stands for</div>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed">{SHWAG.meaning}</p>
          </div>

          <div className="bg-[#121419] border border-[#20232b] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <Shirt className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl text-white uppercase">SHWAG & MWFitnessUK</div>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed">{SHWAG.whyItWorks}</p>
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ THE RANGE ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            WEAR THE ATTITUDE.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SHWAG.products.map((product) => (
            <div key={product.name} className="bg-[#121419] border border-[#20232b] p-6 flex flex-col hover:border-[#ff5500]/50 transition-all duration-300">
              <div className="aspect-square bg-[#16181d] border border-[#262930] flex items-center justify-center mb-4">
                <Shirt className="w-12 h-12 text-[#ff5500]/40" />
              </div>
              <h3 className="font-display text-xl text-white uppercase tracking-wider mb-1">{product.name}</h3>
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-wider mb-3">{product.note}</div>
              <div className="mt-auto pt-2 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                <span>Link coming soon</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ORDER ENQUIRY */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#121419] border border-[#242833] p-8 md:p-10">
          {done ? (
            <div className="space-y-5 text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#181d19] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">Order request sent</div>
              <h2 className="font-display text-3xl text-white uppercase tracking-wider">
                Nice one, {name.split(' ')[0] || 'there'}!
              </h2>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed max-w-md mx-auto">
                Mike will be in touch with prices and availability for your SHWAG order.
              </p>

              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#ff5500] font-mono text-xs uppercase transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#ff5500]" />
                Follow @{CONTACT.instagramHandle} for SHWAG drops
              </a>
            </div>
          ) : (
            <>
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
                [ ORDER ENQUIRY ]
              </div>
              <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">
                GET YOUR SHWAG
              </h2>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-6">
                Interested in a piece? Drop your details and which item you're after, and we'll sort the rest.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Your name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Which item?</label>
                  <select value={item} onChange={(e) => setItem(e.target.value)} className={inputClass}>
                    {SHWAG.products.map((product) => (
                      <option key={product.name} value={product.name}>{product.name}</option>
                    ))}
                    <option value="Something else">Something else</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Anything else? (size, colour, quantity)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>

                {error && (
                  <div className="bg-[#2a1414] border border-red-500/50 text-red-300 text-sm px-4 py-3 font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-7 py-3.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95 disabled:opacity-60"
                >
                  {sending ? 'Sending...' : 'Send order enquiry'}
                  {!sending && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};