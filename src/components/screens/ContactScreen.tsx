import React, { useState } from 'react';
import { CONTACT } from '../../data/mockData';
import { postEnquiry } from '../../lib/mail';
import { MapPin, Mail, Instagram, Facebook, PhoneCall, CheckCircle, ArrowRight, Clock } from 'lucide-react';

interface ContactScreenProps {
  onOpenBookCall: () => void;
}

const TIMES = ['Morning', 'Afternoon', 'Evening', 'Weekend'];

export const ContactScreen: React.FC<ContactScreenProps> = ({ onOpenBookCall }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('Not sure yet');
  const [time, setTime] = useState('Evening');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    const result = await postEnquiry({
      kind: 'enquiry',
      name,
      email,
      phone,
      interest,
      times: [time],
      message,
      page: 'contact',
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
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/facility-gym.jpg"
            alt="Pure Gym Hazel Grove"
            className="w-full h-full object-cover object-center filter brightness-60 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ GET IN TOUCH ]</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl tracking-tight text-white uppercase leading-[0.9] font-black">
              Let's talk.
            </h1>
            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Questions, bookings or just want to say hello? Send a message and Mike will get back to you within 24 hours — usually much sooner.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CONTACT DETAILS + FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#121419] border border-[#242833] p-6">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-4">
                DIRECT CONTACT
              </div>
              <div className="space-y-3 text-sm font-sans text-zinc-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <span>{CONTACT.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <span>{CONTACT.sessions}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-[#ff5500] transition-colors">{CONTACT.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500] transition-colors">@{CONTACT.instagramHandle}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Facebook className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5500] transition-colors">{CONTACT.facebookName}</a>
                </div>
              </div>
            </div>

            <div className="bg-[#121419] border border-[#242833] p-6">
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-3">
                PREFER TO TALK?
              </div>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-4">
                Book a free, no-pressure call to chat about your goals and find the right plan for you.
              </p>
              <button
                onClick={onOpenBookCall}
                className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                Book a free call
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-[#121419] border border-[#242833] p-6 md:p-8">
            {done ? (
              <div className="space-y-6 text-center py-10 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-[#181d19] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
                    Message sent
                  </div>
                  <h2 className="font-display text-3xl text-white uppercase tracking-wider">
                    Thanks, {name.split(' ')[0] || 'there'}!
                  </h2>
                  <p className="text-sm font-sans text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                    Your message is on its way to Mike. He'll reply to <strong className="text-white">{email}</strong> within 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
                  [ SEND A MESSAGE ]
                </div>
                <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-6">
                  GET IN TOUCH
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Phone (optional)</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07... — only used to arrange your call" className={inputClass} />
                  </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Interested in</label>
                      <select value={interest} onChange={(e) => setInterest(e.target.value)} className={inputClass}>
                        <option value="Not sure yet">Not sure yet</option>
                        <option value="1-2-1 Personal Training">1-2-1 Personal Training</option>
                        <option value="Online Coaching">Online Coaching</option>
                        <option value="The App">The App</option>
                        <option value="SHWAG merch">SHWAG merch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Best time for you</label>
                      <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Your message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="Tell Mike about your goals, your week, or anything you'd like to know..."
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
                    className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-7 py-3.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95 disabled:opacity-60"
                  >
                    {sending ? 'Sending...' : 'Send message'}
                    {!sending && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};