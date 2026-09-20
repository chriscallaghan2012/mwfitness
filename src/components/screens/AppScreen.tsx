import React, { useState } from 'react';
import { APP_FEATURES } from '../../data/mockData';
import { postEnquiry } from '../../lib/mail';
import { Smartphone, CheckCircle, ArrowRight, Scale, TrendingUp, Utensils, Dumbbell } from 'lucide-react';

const FEATURE_ICONS = [Scale, TrendingUp, Utensils, Dumbbell];

export const AppScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    const result = await postEnquiry({
      kind: 'waitlist',
      name,
      email,
      interest: 'The App',
      page: 'app-waitlist',
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
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6 text-center mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ COMING SOON ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              The MWFitnessUK
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                app.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              Everything you need to stay on track, in one place. Weigh-ins, progress, food and training — all simple, all in your pocket. It's being built right now.
            </p>

            <div className="inline-flex items-center gap-2 bg-[#14161d] border border-emerald-500/40 px-3.5 py-2.5 font-mono text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Currently in development — join the waitlist to be first in
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10 text-center">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ WHAT'S INSIDE ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            EVERYTHING IN ONE PLACE.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {APP_FEATURES.map((feature, i) => {
            const Icon = FEATURE_ICONS[i] || Smartphone;
            return (
              <div key={feature.title} className="bg-[#121419] border border-[#20232b] p-6 hover:border-[#ff5500]/50 transition-all duration-300">
                <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500] mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">{feature.title}</h3>
                <p className="text-sm font-sans text-zinc-400 leading-relaxed">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. WAITLIST */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#121419] border border-[#242833] p-8 md:p-10">
          {done ? (
            <div className="space-y-5 text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#181d19] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">You're on the list</div>
              <h2 className="font-display text-3xl text-white uppercase tracking-wider">
                Thanks, {name.split(' ')[0] || 'there'}!
              </h2>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed max-w-md mx-auto">
                We'll let you know the moment the app is ready to download. Watch this space.
              </p>
            </div>
          ) : (
            <>
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
                [ JOIN THE WAITLIST ]
              </div>
              <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">
                BE FIRST IN
              </h2>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-6">
                Leave your details and we'll email you as soon as the app goes live. No spam, just the good stuff.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Your name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className={inputClass} />
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
                  {sending ? 'Adding you...' : 'Join the waitlist'}
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