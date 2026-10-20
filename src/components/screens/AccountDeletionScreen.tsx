import React from 'react';
import { ArrowLeft, Mail, UserRoundX } from 'lucide-react';

export const AccountDeletionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Back to MW Fitness
    </button>
    <div className="border border-zinc-800 bg-[#111317] p-6 sm:p-10">
      <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#ff5500]/50 bg-[#ff5500]/10 text-[#ff5500]">
        <UserRoundX className="h-6 w-6" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">MWFitnessUK</p>
      <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Account and data deletion</h1>
      <p className="mt-4 leading-7 text-zinc-300">You can request deletion of your MW Fitness app account and associated personal information by emailing our team. We will verify that the request comes from the account holder before processing it.</p>
      <a href="mailto:mwfitnessukonline@gmail.com?subject=MW%20Fitness%20account%20deletion%20request" className="mt-6 inline-flex items-center gap-2 bg-[#ff5500] px-5 py-3 font-mono text-sm font-bold uppercase text-black hover:bg-[#ff7547]">
        <Mail className="h-4 w-4" /> Request account deletion
      </a>
      <div className="mt-8 space-y-4 text-sm leading-6 text-zinc-400">
        <p><strong className="text-zinc-200">Please include:</strong> the email address used for your MW Fitness account and that you are requesting account and associated data deletion. Do not send passwords.</p>
        <p>We will contact you if we need more information to verify the request. We aim to respond promptly and will explain if any information must be retained to meet legal, accounting or fraud-prevention obligations.</p>
        <p>Some records may be retained where required by law or to resolve an outstanding transaction or dispute. Information no longer needed for these purposes will be deleted or de-identified where applicable.</p>
        <p>For general information about how data is handled, read the <a className="text-[#ff7547] underline underline-offset-4" href="/privacy">MW Fitness privacy policy</a>.</p>
      </div>
    </div>
  </section>
);
