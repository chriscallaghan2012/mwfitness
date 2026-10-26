import React from 'react';
import { ArrowLeft, Scale } from 'lucide-react';

export const GdprRightsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to MW Fitness</button>
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#ff5500]/50 bg-[#ff5500]/10 text-[#ff5500]"><Scale className="h-6 w-6" /></div>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">MWFitnessUK · United Kingdom</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">UK GDPR &amp; data protection</h1>
        <p className="mt-2 text-sm text-zinc-500">Your rights under the UK GDPR and the Data Protection Act 2018 · Last updated: 21 October 2026</p>
      </div>
    </div>
    <div className="space-y-8 leading-7 text-zinc-300">
      <p>This notice explains your data protection rights and how they apply when you use the MW Fitness website, mobile app and coaching services. It should be read with our <a className="text-[#ff7547] underline underline-offset-4" href="/privacy">privacy policy</a> and <a className="text-[#ff7547] underline underline-offset-4" href="/cookies">cookie policy</a>.</p>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Who is responsible for your data</h2>
        <p>The data controller is Michael Whitworth, trading as MWFitnessUK (United Kingdom). For any question or request about your personal data, email <a className="text-[#ff7547] underline underline-offset-4" href="mailto:mwfitnessukonline@gmail.com">mwfitnessukonline@gmail.com</a>. We are not currently registered with the ICO as data controllers requiring a registration beyond our obligations under the Act; you can check or complain to the ICO at <a className="text-[#ff7547] underline underline-offset-4" href="https://ico.org.uk/">ico.org.uk</a>.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">What we process and why</h2>
        <p>We process only what is needed to run the coaching service:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm">
          <li><span className="text-white">Enquiries and communications</span> — name, email, phone, message content. Lawful basis: steps taken at your request before a contract, and legitimate interests in responding.</li>
          <li><span className="text-white">Accounts, memberships and coaching</span> — profile details, training plans, workouts, check-ins, nutrition logs, progress records and coach messages. Lawful basis: performance of a contract (your coaching agreement).</li>
          <li><span className="text-white">Payments</span> — handled by our payment provider when checkout is enabled; we do not store card numbers. Lawful basis: contract and legal accounting obligations.</li>
          <li><span className="text-white">Service security and abuse prevention</span> — session and access records. Lawful basis: legitimate interests in keeping the service secure.</li>
          <li><span className="text-white">Marketing messages</span> — only where you have consented or where the message is about a similar service you hold; you can opt out at any time. Lawful basis: consent or legitimate interests as permitted by the Privacy and Electronic Communications Regulations (PECR).</li>
          <li><span className="text-white">Cookies and similar technologies</span> — strictly necessary cookies are used to run the site; anything else only with your consent via the cookie banner. See the <a className="text-[#ff7547] underline underline-offset-4" href="/cookies">cookie policy</a>.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Service providers (processors)</h2>
        <p>We use carefully chosen providers to operate the service. They process data on our instructions under their own terms:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm">
          <li><span className="text-white">Neon</span> — account authentication and the shared Postgres database that stores member and coaching records (regions configured for Europe).</li>
          <li><span className="text-white">Vercel</span> — website hosting and the contact-form API.</li>
          <li><span className="text-white">Google</span> — the site loads fonts from Google Fonts (fonts.googleapis.com / fonts.gstatic.com, Google Ireland Limited). These requests can process IP addresses. If analytics or advertising (such as Google Analytics or Google Ads) is ever enabled, it will only run after you consent via the cookie banner, and this page and the cookie policy will be updated to name it.</li>
          <li><span className="text-white">Google Play / Apple</span> — distribution of the MW Fitness app; store links on this site open Google or Apple services under their own policies.</li>
          <li><span className="text-white">Stripe</span> — embedded payment checkout, when enabled. Card and security-code details are collected by Stripe inside its secure payment form and are not received or stored by MW Fitness. Checkout is not currently active until Stripe configuration and payment lifecycle checks pass.</li>
          <li><span className="text-white">Email provider</span> — enquiry notifications are delivered by email (for example Gmail/Google Workspace when configured); message content may be processed by that provider.</li>
          <li><span className="text-white">Expo / EAS</span> — build and distribution tooling for the mobile app, including push notification delivery when enabled.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Where data goes (international transfers)</h2>
        <p>Our primary database and hosting are configured for European/UK regions. Some providers may process information in other countries (including the United States). Where a transfer outside the UK occurs, we rely on the provider’s adequacy decisions, the UK International Data Transfer Agreement, or other lawful safeguards as applicable.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">How long we keep data</h2>
        <p>Enquiries are kept for up to 24 months. Member records (training, nutrition, check-ins, progress and messages) are kept while your coaching account is active and for a reasonable period afterwards for your own history and our legal/accounting duties. You can request deletion at any time via <a className="text-[#ff7547] underline underline-offset-4" href="/delete-account">account and data deletion</a>. Cookie consent choices are stored in your browser for up to 12 months, and you can change them via “Cookie settings” in the footer.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Your rights under the UK GDPR</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm">
          <li><span className="text-white">Access</span> — ask for a copy of the personal data we hold about you.</li>
          <li><span className="text-white">Rectification</span> — correct inaccurate or incomplete data.</li>
          <li><span className="text-white">Erasure</span> — request deletion (“right to be forgotten”) where we no longer need the data or consent is withdrawn.</li>
          <li><span className="text-white">Restriction</span> — ask us to limit how we use data while a dispute is resolved.</li>
          <li><span className="text-white">Portability</span> — receive data you gave us in a structured, machine-readable format where processing is consent- or contract-based and automated.</li>
          <li><span className="text-white">Objection</span> — object to processing based on legitimate interests, including any direct marketing.</li>
          <li><span className="text-white">Withdraw consent</span> — where processing is consent-based (including marketing and non-essential cookies), withdraw at any time without affecting earlier lawful processing.</li>
          <li><span className="text-white">Automated decisions</span> — we do not make solely automated decisions that produce legal or similarly significant effects about you.</li>
        </ul>
        <p className="mt-3">To exercise any right, email <a className="text-[#ff7547] underline underline-offset-4" href="mailto:mwfitnessukonline@gmail.com">mwfitnessukonline@gmail.com</a>. We may need to verify your identity, and we normally respond within one month.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Children</h2>
        <p>MW Fitness is intended for adults (18+). We do not knowingly collect data from children. Contact us if you believe a child has provided personal information.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Complaints</h2>
        <p>We would appreciate the chance to resolve any concern first — please contact us. You also have the right to complain to the UK supervisory authority, the Information Commissioner’s Office: <a className="text-[#ff7547] underline underline-offset-4" href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-white">Changes to this notice</h2>
        <p>We may update this notice as the service or the law changes. The latest version appears on this page with its updated date.</p>
      </section>

      <section className="border-t border-zinc-800 pt-6">
        <h2 className="mb-2 text-xl font-semibold text-white">Contact</h2>
        <p>Michael Whitworth · MWFitnessUK · <a className="text-[#ff7547] underline underline-offset-4" href="mailto:mwfitnessukonline@gmail.com">mwfitnessukonline@gmail.com</a></p>
        <p className="mt-3 text-sm text-zinc-500">This page is a practical plain-English summary of your rights, not legal advice or a certification of compliance. It reflects the actual services used by this site as of the date above.</p>
      </section>
    </div>
  </section>
);
