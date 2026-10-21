import React, { useCallback, useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

/**
 * Slide-up cookie consent banner (UK GDPR / PECR).
 * Stores the visitor's choice in localStorage; nothing non-essential is loaded
 * by this site today — the categories are ready for analytics/marketing scripts
 * to be gated on `analytics` / `marketing` when they are added.
 */
export const COOKIE_CONSENT_KEY = 'mw_cookie_consent_v1';

export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  decidedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    return parsed && parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

type CategoryKey = 'analytics' | 'marketing' | 'preferences';

const CATEGORIES: { key: CategoryKey; label: string; description: string }[] = [
  { key: 'analytics', label: 'Analytics', description: 'Helps us understand how pages are used (e.g. Google Analytics) so we can improve the site. Disabled by default until configured.' },
  { key: 'marketing', label: 'Marketing', description: 'Used to measure or personalise advertising, such as Google Ads or Meta pixels. Not active on this site today.' },
  { key: 'preferences', label: 'Preferences', description: 'Remembers choices you make (for example language or region) so the site behaves the way you set it.' },
];

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [choices, setChoices] = useState<Record<CategoryKey, boolean>>({ analytics: true, marketing: true, preferences: true });
  const [hasDecision, setHasDecision] = useState(true);

  // First visit: slide the banner up after mount. Returning visitors stay hidden
  // until they reopen "Cookie settings" from the footer.
  useEffect(() => {
    const existing = readCookieConsent();
    setHasDecision(Boolean(existing));
    if (!existing) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  const openSettings = useCallback(() => {
    const existing = readCookieConsent();
    if (existing) setChoices({ analytics: existing.analytics, marketing: existing.marketing, preferences: existing.preferences });
    setCustomising(true);
    setVisible(true);
  }, []);

  // Footer "Cookie settings" button reopens the banner.
  useEffect(() => {
    const handler = () => openSettings();
    window.addEventListener('mw:open-cookie-settings', handler);
    return () => window.removeEventListener('mw:open-cookie-settings', handler);
  }, [openSettings]);

  const decide = (next: Record<CategoryKey, boolean>) => {
    const consent: CookieConsent = { version: 1, necessary: true, ...next, decidedAt: new Date().toISOString() };
    try { window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent)); } catch { /* storage may be blocked */ }
    setHasDecision(true);
    setVisible(false);
    setCustomising(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className={`fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-4 sm:pb-4 transition-transform duration-500 ease-out ${visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
    >
      <div className="mx-auto w-full max-w-4xl border border-[#ff5500]/40 bg-[#0b0c0e]/95 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,#ff5500,#ff5500_12px,#121418_12px,#121418_24px)]" />
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#ff5500]/50 bg-[#ff5500]/10 text-[#ff5500]"><Cookie className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">Your privacy</p>
              <h2 className="font-display text-2xl leading-none tracking-widest text-white">COOKIE PREFERENCES</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                We use strictly necessary cookies to run this site. With your permission we may also use analytics, marketing and preference cookies.
                You can accept all, keep only what is necessary, or choose categories. Read our{' '}
                <a href="/cookies" className="text-[#ff7547] underline underline-offset-4">cookie policy</a> and{' '}
                <a href="/gdpr" className="text-[#ff7547] underline underline-offset-4">UK GDPR notice</a>.
              </p>
            </div>
            {!hasDecision && (
              <button type="button" onClick={() => setVisible(false)} aria-label="Close and decide later" className="shrink-0 text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
            )}
          </div>

          {customising && (
            <div className="mt-4 divide-y divide-zinc-800 border border-zinc-800 bg-black/30">
              <div className="flex items-start justify-between gap-4 p-3">
                <div>
                  <p className="text-xs font-semibold text-white">Strictly necessary</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Session, security and remembering this choice. Always on — the site cannot work without them.</p>
                </div>
                <span className="mt-1 shrink-0 border border-[#ff5500]/40 bg-[#ff5500]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#ff5500]">Always on</span>
              </div>
              {CATEGORIES.map((category) => {
                const on = choices[category.key];
                return (
                  <div key={category.key} className="flex items-start justify-between gap-4 p-3">
                    <div>
                      <p className="text-xs font-semibold text-white">{category.label}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{category.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`${category.label} cookies`}
                      onClick={() => setChoices((old) => ({ ...old, [category.key]: !old[category.key] }))}
                      className={`mt-1 flex h-6 w-11 shrink-0 items-center border p-0.5 transition-colors ${on ? 'border-[#ff5500] bg-[#ff5500]/30' : 'border-zinc-700 bg-zinc-900'}`}
                    >
                      <span className={`h-4 w-4 transition-transform ${on ? 'translate-x-5 bg-[#ff5500]' : 'translate-x-0 bg-zinc-600'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Change your choice anytime via “Cookie settings” in the footer</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => decide({ analytics: false, marketing: false, preferences: false })} className="border border-zinc-700 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-zinc-300 hover:border-zinc-500 hover:text-white">Necessary only</button>
              {customising ? (
                <button type="button" onClick={() => decide(choices)} className="border border-[#ff5500]/60 bg-[#ff5500]/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#ff5500] hover:bg-[#ff5500]/20">Save my choices</button>
              ) : (
                <button type="button" onClick={() => setCustomising(true)} className="border border-zinc-700 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-zinc-300 hover:border-zinc-500 hover:text-white">Choose settings</button>
              )}
              <button type="button" onClick={() => decide({ analytics: true, marketing: true, preferences: true })} className="bg-[#ff5500] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-black hover:bg-[#ff6a1f]">Accept all</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
