import React from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

export const PrivacyScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Back to MW Fitness
    </button>
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#ff5500]/50 bg-[#ff5500]/10 text-[#ff5500]">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[#ff5500]">MWFitnessUK</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Privacy policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: 18 October 2026</p>
      </div>
    </div>
    <div className="space-y-8 leading-7 text-zinc-300">
      <p>This policy explains how MWFitnessUK, operated by Michael Whitworth, handles personal information when you use the MW Fitness website, mobile app and coaching services.</p>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Information we may collect</h2><p>Depending on how you use our services, we may collect your name, email address, phone number, account and membership details, coaching enquiries, goals you choose to share, workout and training records, nutrition information, progress and check-in records, messages with your coach, and technical information needed to operate the service. If app notifications are enabled, a device or notification token may be stored to deliver them.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">How we use information</h2><p>We use information to respond to enquiries, provide and administer coaching, manage memberships and plans, personalise training support, communicate with you, maintain account security, and operate and improve our services. We do not ask you to submit medical information through the service unless it is specifically needed for coaching; please only share information you are comfortable providing.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Where information is stored</h2><p>MW Fitness uses Neon for account authentication and its shared database. Information submitted through website forms may be stored in the same MW Fitness database and email may be used to notify the team. We use service providers to host and operate the website, app and related infrastructure. Those providers process information as needed to provide their services and under their applicable terms.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Sharing and disclosure</h2><p>We do not sell your personal information. We may share it with service providers that help operate MW Fitness, where you ask us to share it, or where disclosure is required by law or necessary to protect rights, safety or the service.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Retention and security</h2><p>We keep information for as long as needed to provide the service, manage our relationship with you, resolve disputes and meet applicable legal or accounting obligations. We use access controls and service-provider security features, but no internet service can guarantee absolute security.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Your choices and rights</h2><p>Depending on your circumstances and applicable law, you may be able to request access to, correction of, or deletion of your personal information, or object to or restrict some processing. You can request account or data deletion at <a className="text-[#ff7547] underline underline-offset-4" href="/delete-account">mwfitnessuk.com/delete-account</a>. We may need to verify your identity and retain some records where the law requires it.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Children</h2><p>MW Fitness is intended for adults. Please contact us if you believe a child has provided personal information without appropriate permission.</p></section>
      <section><h2 className="mb-2 text-xl font-semibold text-white">Changes to this policy</h2><p>We may update this policy as our services change. The latest version will be published on this page with its updated date.</p></section>
      <section className="border-t border-zinc-800 pt-6"><h2 className="mb-2 text-xl font-semibold text-white">Contact</h2><p>For privacy questions or requests, contact Michael Whitworth at <a className="inline-flex items-center gap-2 text-[#ff7547] underline underline-offset-4" href="mailto:mwfitnessukonline@gmail.com"><Mail className="h-4 w-4" /> mwfitnessukonline@gmail.com</a>.</p></section>
      
    </div>
  </section>
);
