import React, { useState } from 'react';
import { ContactKind } from '../types';
import { CONTACT, GOAL_OPTIONS, PACKAGE_OPTIONS, TIME_OPTIONS } from '../data/siteData';
import { Send, CheckCircle2, TriangleAlert, RefreshCcw } from 'lucide-react';

interface EnquiryFormProps {
  kind: ContactKind;
  variant?: 'full' | 'compact';
  defaultInterest?: string;
  page?: string;
  heading?: string;
  intro?: string;
  submitLabel?: string;
}

const KIND_LABELS: Record<ContactKind, string> = {
  enquiry: 'Send my enquiry',
  'book-call': 'Request my free chat',
  waitlist: 'Join the waitlist',
  shwag: 'Send my order request',
};

const inputCls =
  'w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-brand-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange';

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  kind,
  variant = 'full',
  defaultInterest = '',
  page = 'Website',
  heading = 'Send a message',
  intro = '',
  submitLabel,
}) => {
  const compact = variant === 'compact';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState(defaultInterest || 'A free chat to decide');
  const [goal, setGoal] = useState(GOAL_OPTIONS[GOAL_OPTIONS.length - 1]);
  const [times, setTimes] = useState<string[]>(['Evening']);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTime = (slot: string) => {
    setTimes((prev) => (prev.includes(slot) ? prev.filter((t) => t !== slot) : [...prev, slot]));
  };

  const buildMailto = () => {
    const label = KIND_LABELS[kind];
    const subject = encodeURIComponent(`${label} — ${name}`);
    const body = encodeURIComponent(
      `Hi Mike,\n\n${label}.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n` +
      (interest && kind !== 'waitlist' ? `Interested in: ${interest}\n` : '') +
      (goal && (kind === 'enquiry' || kind === 'book-call') ? `Main goal: ${goal}\n` : '') +
      (times.length && (kind === 'enquiry' || kind === 'book-call') ? `Preferred times: ${times.join(', ')}\n` : '') +
      (message ? `\nMessage:\n${message}\n` : '')
    );
    return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, name, email, phone, interest, goal, times, message, page }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong sending your message.');

      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong sending your message.');
    }
  };

  /* ---------- Success ---------- */
  if (status === 'sent') {
    return (
      <div className="rounded-2xl bg-brand-green-soft border border-brand-green/40 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-brand-green mx-auto" />
        <h3 className="mt-4 font-display text-2xl font-bold text-brand-ink">
          {kind === 'waitlist' ? 'You\'re on the list!' : 'Message sent — thank you!'}
        </h3>
        <p className="mt-2 text-brand-body leading-relaxed">
          {kind === 'waitlist'
            ? 'I\'ll email you the moment the app is ready. One friendly email — nothing else.'
            : 'Thanks, it\'s landed straight in my inbox. I reply to every message personally, usually within 24 hours.'}
        </p>
      </div>
    );
  }

  /* ---------- Form ---------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {heading && <h3 className="font-display text-xl font-bold text-brand-ink">{heading}</h3>}
      {intro && <p className="text-sm text-brand-muted">{intro}</p>}

      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">Your name *</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Sarah" />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">Email address *</span>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@email.com" />
      </label>

      {kind !== 'waitlist' && (
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink">Phone (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="07700 900000" />
        </label>
      )}

      {kind === 'enquiry' && (
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink">What are you interested in? *</span>
          <select value={interest} onChange={(e) => setInterest(e.target.value)} className={inputCls}>
            {PACKAGE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </label>
      )}

      {(kind === 'enquiry' || kind === 'book-call') && (
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink">What's your main goal?</span>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>
            {GOAL_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </label>
      )}

      {(kind === 'enquiry' || kind === 'book-call') && (
        <div className="block">
          <span className="block text-sm font-semibold text-brand-ink mb-2">When suits you best?</span>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleTime(slot)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  times.includes(slot) ? 'bg-brand-orange text-white' : 'bg-brand-orange-soft text-brand-ink'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {(kind === 'enquiry' || kind === 'book-call' || kind === 'shwag') && (
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink">
            {kind === 'shwag' ? 'What are you after? (optional)' : 'A bit about you (optional)'}
          </span>
          <textarea
            rows={compact ? 4 : 5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputCls}
            placeholder={
              kind === 'shwag'
                ? 'Item, size, colour — anything you\u2019ve seen on the SHWAG page.'
                : 'Goals, worries, how busy life is. The more I know, the more helpful my reply will be.'
            }
          />
        </label>
      )}

      {status === 'error' && (
        <div className="rounded-xl bg-brand-orange-soft border border-brand-orange/40 p-4 text-sm text-brand-ink" role="alert">
          <p className="font-semibold flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-brand-orange shrink-0" />
            Sorry, that didn\u2019t send.
          </p>
          <p className="mt-1 text-brand-muted">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2.5 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-full"
      >
        {status === 'sending' ? 'Sending…' : (submitLabel || KIND_LABELS[kind])}
        {status === 'sending' ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
      </button>

      {status === 'error' && (
        <p className="text-xs text-brand-muted text-center">
          Still stuck? <a href={buildMailto()} className="text-brand-orange underline">Open your email app instead</a> — your details are already filled in.
        </p>
      )}
    </form>
  );
};