import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, PhoneCall } from 'lucide-react';
import { postEnquiry } from '../lib/mail';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInterest?: string;
}

const TIMES = ['Morning', 'Afternoon', 'Evening', 'Weekend'];

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultInterest = '',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('Evening');
  const [interest, setInterest] = useState(defaultInterest);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    const result = await postEnquiry({
      kind: 'book-call',
      name,
      email,
      phone,
      interest: interest || 'Not sure yet',
      times: [time],
      message,
      page: 'book-a-call',
    });
    setSending(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleReset = () => {
    setDone(false);
    setError('');
    setSending(false);
    onClose();
  };

  const inputClass =
    'w-full bg-[#16181d] border border-[#262930] text-zinc-200 px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#ff5500] placeholder:text-zinc-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#111317] border border-[#2d323c] shadow-2xl p-6 md:p-8 my-8 text-zinc-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Corner Cut Accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-[#0b0c0e] border-b border-l border-[#2d323c] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#ff5500]"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-[#1a1d24] transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#22252c] pb-4 mb-6">
          <div className="flex items-center gap-1.5 text-[#ff5500] font-mono text-xs uppercase tracking-widest mb-1">
            <span className="w-2 h-2 bg-[#ff5500] animate-pulse"></span>
            <span>Free chat with Mike</span>
          </div>
          <h2 id="modal-headline" className="font-display text-3xl tracking-wide text-white uppercase">
            {done ? "Thanks — you're all set" : 'Book a free call'}
          </h2>
          <p className="text-sm text-zinc-400 font-sans mt-1 leading-relaxed">
            {done
              ? 'Your request has been sent. Mike will come back to you within 24 hours to arrange a time that suits you.'
              : 'Tell us a little about you and when suits. No pressure — this is just a chat about your goals.'}
          </p>
        </div>

        {/* Success */}
        {done ? (
          <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#181d19] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
                Request received
              </div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">
                Speak soon, {name.split(' ')[0] || 'there'}!
              </h3>
              <p className="text-sm font-sans text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                Mike will be in touch at <strong className="text-white">{email}</strong> within 24 hours to arrange your call. In the meantime, feel free to say hello on Instagram.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="bg-[#22252e] hover:bg-[#2d313d] text-white font-mono text-xs uppercase px-8 py-3 tracking-wider transition-colors"
            >
              Back to the website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Your name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07... — only used to arrange your call"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">What suits you?</label>
                <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
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
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Anything you want to tell Mike?</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Optional — e.g. your goals, a health condition, or just 'I want to get fitter'"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="bg-[#2a1414] border border-red-500/50 text-red-300 text-sm px-4 py-3 font-mono">
                {error}
              </div>
            )}

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <p className="text-[11px] font-mono text-zinc-500">
                We reply within 24 hours — usually much sooner.
              </p>
              <button
                type="submit"
                disabled={sending}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-7 py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95 disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send my request'}
                {!sending && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};