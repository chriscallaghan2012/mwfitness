import React from 'react';
import { ArrowLeft, Cookie } from 'lucide-react';

export const CookiePolicyScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to MW Fitness</button>
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#ff5500]/50 bg-[#ff5500]/10 text-[#ff5500]"><Cookie className="h-6 w-6" /></div>
      <div><p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">MWFitnessUK</p><h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Cookie policy</h1><p className="mt-2 text-sm text-zinc-500">Last updated: 21 October 2026</p></div>
    </div>
    <div className="space-y-6 leading-7 text-zinc-300">
      <p>This page explains the cookies and similar browser storage used on the MW Fitness website, and the choices you have under UK law (the Privacy and Electronic Communications Regulations, or PECR, alongside the UK GDPR).</p>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Our cookie categories</h2>
        <p>The consent banner at the bottom of the page lets you accept everything, keep only what is necessary, or choose categories yourself:</p>
        <ul className="mt-3 list-disc space-y-3 pl-6 text-sm">
          <li><span className="text-white">Strictly necessary (always on)</span> — sign-in/session state with Neon, security, and the small piece of browser storage that remembers your cookie choice itself. These are required to provide the service you ask for and do not need consent.</li>
          <li><span className="text-white">Analytics (optional)</span> — would help us understand how pages are used (for example Google Analytics). <span className="text-white">No analytics tool is currently active on this site.</span> If one is added, it will stay blocked until you consent.</li>
          <li><span className="text-white">Marketing (optional)</span> — would be used to measure or personalise advertising (for example Google Ads or Meta pixels). <span className="text-white">No advertising tools are currently active on this site.</span></li>
          <li><span className="text-white">Preferences (optional)</span> — would remember choices such as language or region so the site behaves the way you set it.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">How you give (and change) consent</h2>
        <p>On your first visit the banner slides up from the bottom of the page. Choose <span className="text-white">Accept all</span>, <span className="text-white">Necessary only</span>, or <span className="text-white">Choose settings</span> to pick categories individually, then save. Your choice is stored in your browser (localStorage key <span className="font-mono text-xs text-white">mw_cookie_consent_v1</span>) for up to 12 months. You can change or withdraw it anytime by clicking <span className="text-white">Cookie settings</span> in the footer, which reopens the same banner. Refusing optional cookies never blocks the site.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Third-party requests and services</h2>
        <p>The site loads its fonts from <span className="text-white">Google Fonts</span> (fonts.googleapis.com / fonts.gstatic.com, Google Ireland Limited); these requests can process your IP address. Store badges open <span className="text-white">Google Play</span> and the Apple App Store, and the member account area may hand over to <span className="text-white">Stripe</span> hosted checkout when payments are enabled. Each of those is a third-party service with its own cookie and privacy terms. No other third-party embeds (video, social widgets, tag managers) are currently active — if any are added, they will be listed here and gated behind consent.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Managing cookies in your browser</h2>
        <p>You can also view, block or delete cookies through your browser settings. Blocking strictly necessary storage may prevent sign-in or other features from working. Browser controls do not replace the consent mechanism where UK law requires one, which is why the banner exists.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Learn more</h2>
        <p>See our <a className="text-[#ff7547] underline underline-offset-4" href="/privacy">privacy policy</a> for how information is used overall, and the <a className="text-[#ff7547] underline underline-offset-4" href="/gdpr">UK GDPR &amp; data protection page</a> for your full rights. Questions? Email <a className="text-[#ff7547] underline underline-offset-4" href="mailto:mwfitnessukonline@gmail.com">mwfitnessukonline@gmail.com</a>.</p>
      </section>

      <p className="text-sm text-zinc-500">This is a practical summary of how this site uses cookies, not legal advice. It is kept accurate against the live production setup — if a new tool is introduced, this page and the consent categories are updated with it.</p>
    </div>
  </section>
);
