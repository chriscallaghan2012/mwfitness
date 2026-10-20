import React from 'react';
import { ArrowLeft, Cookie } from 'lucide-react';

export const CookiePolicyScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to MW Fitness</button>
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#ff5500]/50 bg-[#ff5500]/10 text-[#ff5500]"><Cookie className="h-6 w-6" /></div>
      <div><p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">MWFitnessUK</p><h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Cookie policy</h1><p className="mt-2 text-sm text-zinc-500">Last updated: 19 October 2026</p></div>
    </div>
    <div className="space-y-6 leading-7 text-zinc-300">
      <p>This page explains the use of cookies and similar browser storage on the MW Fitness website.</p>
      <section><h2 className="mb-2 text-xl font-semibold text-white">What the site uses</h2><p>The site may use strictly necessary browser storage to support core functions, such as maintaining an authentication/session state or remembering a choice you make. These functions are required to provide the service you request.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Analytics and advertising</h2><p>This policy does not assume that analytics or advertising cookies are active. The site owner should confirm the live production scripts, embedded content, checkout provider and hosting configuration before publication. Any non-essential cookies or similar technologies must be disclosed accurately and, where required by UK law, blocked until the visitor gives valid consent.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Managing cookies</h2><p>You can control or delete cookies through your browser settings. Blocking strictly necessary storage may prevent sign-in, checkout or other site features from working correctly. Browser controls do not replace a consent mechanism where one is legally required.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Third-party services</h2><p>Authentication, payment checkout, hosting and other connected providers may process technical data according to their own configurations and policies. Their actual cookies and storage must be checked against the production setup and reflected here before the site uses them.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Contact</h2><p>For questions about privacy or cookies, contact <a className="text-[#ff7547] underline underline-offset-4" href="mailto:mwfitnessukonline@gmail.com">mwfitnessukonline@gmail.com</a>. For details about personal information, read the <a className="text-[#ff7547] underline underline-offset-4" href="/privacy">privacy policy</a>.</p></section>
      <p className="text-sm text-zinc-500">This is a practical draft, not legal advice or a certification of compliance. The site owner must verify actual production cookies, third-party embeds and processing before treating this policy as final.</p>
    </div>
  </section>
);
