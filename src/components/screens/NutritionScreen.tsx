import React from 'react';
import { Ticker } from '../Ticker';
import { ScreenId } from '../../types';
import { ArrowRight, BookOpen, ClipboardList, CookingPot, Utensils, LockKeyhole, Download, Sparkles } from 'lucide-react';

interface NutritionScreenProps { onSelectScreen: (screen: ScreenId) => void; }

const DIGITAL_IDEAS = [
  { number: '01', icon: BookOpen, title: 'Nutrition Foundations', format: 'PDF GUIDE', text: 'A practical starting point for building balanced meals, understanding portions and creating habits you can actually keep.' },
  { number: '02', icon: CookingPot, title: 'Meal Prep Made Simple', format: 'RECIPE COLLECTION', text: 'Batch-cooking ideas, shopping lists and mix-and-match meals designed for busy weeks.' },
  { number: '03', icon: Utensils, title: 'High-Protein Recipe Pack', format: 'DIGITAL COOKBOOK', text: 'Straightforward breakfast, lunch, dinner and snack ideas with clear ingredients and prep steps.' },
  { number: '04', icon: ClipboardList, title: 'Habits & Progress Planner', format: 'PRINTABLE WORKBOOK', text: 'A simple weekly planner for meals, hydration, movement and consistency — without overcomplicating it.' },
];

export const NutritionScreen: React.FC<NutritionScreenProps> = ({ onSelectScreen }) => (
  <div className="page-layout">
    <section className="page-hero relative min-h-[40vh] flex items-center overflow-hidden border-b border-[#262930]">
      <div className="absolute inset-0 z-0">
        <img src="/images/main-hero.jpg" alt="MWFitnessUK training floor" className="h-full w-full object-cover object-center brightness-60 contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-8">
        <div className="w-full max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 border border-[#ff5500]/60 bg-[#16181e]/90 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#ff5500]"><Sparkles className="h-3.5 w-3.5" /> Nutrition & digital guides</div>
          <h1 className="font-display text-5xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-7xl">Make good habits<br /><span className="text-[#ff5500]">easier to keep.</span></h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">Practical nutrition guides, meal-prep systems and printable planners — built for real routines, not perfect ones. Buy once, keep your files and revisit them whenever you need.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => document.getElementById('digital-guides')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer inline-flex items-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-black">Explore digital guides <ArrowRight className="h-4 w-4" /></button>
            <button onClick={() => onSelectScreen('online-coaching')} className="cursor-pointer border border-zinc-700 bg-[#16181d] px-6 py-3.5 font-mono text-xs font-bold uppercase text-white hover:border-[#ff5500]">Explore coaching</button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-zinc-500"><span className="inline-flex items-center gap-2"><Download className="h-4 w-4 text-[#ff5500]" /> Downloadable formats</span><span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#ff5500]" /> Planned secure purchase library</span></div>

        </div>
      </div>
    </section>
    <div aria-hidden="true" className="hero-dashed-divider" />
    <Ticker />
    <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />
    <section id="digital-guides" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 md:py-20">
      <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[#22252e] pb-5 md:flex-row md:items-end">
        <div><div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ THE DIGITAL SHELF ]</div><h2 className="font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">Useful. Clear. Yours to keep.</h2></div>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-400">These are the first product concepts for the new store. They are not on sale yet; pricing, final files and secure checkout will be added before launch.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {DIGITAL_IDEAS.map(({ number, icon: Icon, title, format, text }) => <article key={number} className="mw-electric-card flex flex-col border border-[#252a34] bg-[#121419] p-6">
          <div className="mb-6 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center border border-[#ff5500]/70 bg-[#ff5500]/10 text-[#ff5500]"><Icon className="h-5 w-5" /></div><span className="font-mono text-xs text-zinc-600">{number}</span></div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#ff5500]">{format}</p><h3 className="mb-3 font-display text-2xl uppercase leading-tight text-white">{title}</h3><p className="flex-1 text-sm leading-relaxed text-zinc-400">{text}</p>
          <div className="mt-6 border-t border-[#252a34] pt-4"><span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff5500]" /> Coming soon</span></div>
        </article>)}
      </div>
    </section>
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mw-electric-card relative overflow-hidden border border-[#34303a] bg-gradient-to-br from-[#171920] to-[#101114] p-7 md:p-10">
        <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div><div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ YOUR DIGITAL LIBRARY ]</div><h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Your purchases, in one place.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">The planned member account will keep purchased downloads, order receipts and account settings together. Password reset and protected download links will be part of the secure account flow — this area will open when that system is ready.</p></div>
          <div className="border border-[#2a2f3a] bg-[#0c0d10]/70 p-5"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center border border-[#ff5500]/60 bg-[#ff5500]/10 text-[#ff5500]"><LockKeyhole className="h-5 w-5" /></div><div><p className="font-display text-xl uppercase text-white">Member library</p><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Secure access in development</p></div></div><ul className="space-y-3 text-sm text-zinc-300">{['Purchased files and re-downloads','Order history and receipts','Password reset and account recovery','Links to the MWFitnessUK app'].map((item) => <li key={item} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#ff5500]" />{item}</li>)}</ul></div>
        </div>
      </div>
    </section>
    <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mw-electric-card mx-auto flex w-full max-w-4xl flex-col items-center border border-[#2a2f3a] bg-gradient-to-b from-[#171920] to-[#121418] p-7 text-center md:p-10">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ JOIN THE WAITLIST ]</div>
        <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">BE FIRST IN</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">Leave your details and we'll email you as soon as the app goes live. No spam, just the good stuff.</p>
        <button onClick={() => onSelectScreen('app')} className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-black">Join the waitlist <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mw-electric-card mx-auto flex w-full max-w-4xl flex-col items-center border border-[#2a2f3a] bg-[#121419] p-7 text-center md:p-10">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ READY TO START? ]</div>
        <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Your next chapter starts here.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">Have a question about nutrition, coaching or which digital guide is right for you? Mike can help you choose the next step.</p>
        <button onClick={() => onSelectScreen('contact')} className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 border border-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-[#ff5500] hover:text-black">Contact Mike <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  </div>
);
