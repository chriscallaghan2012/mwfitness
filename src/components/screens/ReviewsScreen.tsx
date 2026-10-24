import React from 'react';
import { Ticker } from '../Ticker';
import { ScreenId, Review } from '../../types';
import { REVIEWS, TESTIMONIALS } from '../../data/mockData';
import { ArrowRight, Star, Quote } from 'lucide-react';

interface ReviewsScreenProps { onSelectScreen: (screen: ScreenId) => void; }

const stars = (rating: number) => Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < rating ? 'fill-[#ff5500] text-[#ff5500]' : 'text-zinc-700'}`} />);

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({ onSelectScreen }) => {
  const items: Review[] = REVIEWS;
  return <div className="page-layout">
    <section className="page-hero relative min-h-[40vh] flex items-center overflow-hidden border-b border-[#262930]">
      <div className="absolute inset-0 z-0"><img src="/images/main-hero.jpg" alt="MWFitnessUK training floor" className="h-full w-full object-cover object-center brightness-60 contrast-125" /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent" /><div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" /><div className="absolute inset-0 bg-grid-pattern opacity-40" /></div>
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-8"><div className="w-full max-w-3xl space-y-6">
        <div className="mb-5 inline-flex items-center gap-2 border border-[#ff5500]/60 bg-[#16181e]/90 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#ff5500]"><Star className="h-3.5 w-3.5" /> Member stories</div>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-7xl"><span className="brush-wrap">Progress looks</span><br /><span className="text-[#ff5500]">different on everyone.</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">Read the stories and feedback shared by people working towards stronger, healthier routines with MWFitnessUK.</p>
        <button onClick={() => onSelectScreen('online-coaching')} className="mt-7 inline-flex cursor-pointer items-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-black">Find your plan <ArrowRight className="h-4 w-4" /></button>
      </div>
      </div>
    </section>
    <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />
    <Ticker />
    <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 md:py-20">
      <div className="mb-10 border-b border-[#22252e] pb-5"><div className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ WHAT PEOPLE SAY ]</div><h2 className="font-display text-4xl uppercase tracking-tight text-white sm:text-5xl"><span className="brush-wrap">Real people.</span> <span className="text-[#ff5500]">Real progress.</span></h2></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((review) => <article key={review.id} className="mw-electric-card flex h-full flex-col border border-[#252a34] bg-[#121419] p-6 md:p-7">
          <div className="mb-5 flex items-center justify-between"><div className="flex gap-1">{stars(review.rating)}</div><Quote className="h-6 w-6 text-[#ff5500]/70" /></div>
          <p className="flex-1 text-base leading-relaxed text-zinc-200">“{review.quote}”</p>
          <div className="mt-6 border-t border-[#252a34] pt-4"><p className="font-display text-xl uppercase text-white">{review.name}</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[10px] uppercase tracking-wider text-[#ff5500]">{review.packageName}</span><span className="font-mono text-[10px] text-zinc-500">{review.date}</span></div></div>
        </article>)}
      </div>
      <div className="mw-electric-card mt-12 flex flex-col items-center gap-5 border border-[#2a2f3a] bg-[#121419] p-7 text-center md:p-9"><div className="text-center"><p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#ff5500]">[ READY TO START? ]</p><h2 className="font-display text-3xl uppercase text-white text-center"><span className="brush-wrap">Your next chapter</span> <span className="text-[#ff5500]">starts here.</span></h2><p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">Choose a plan that fits your week, or ask Mike a question before you decide.</p></div><div className="flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row"><button onClick={() => onSelectScreen('online-coaching')} className="inline-flex cursor-pointer items-center justify-center gap-2 bg-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-black">Explore online plans <ArrowRight className="h-4 w-4" /></button><button onClick={() => onSelectScreen('contact')} className="inline-flex cursor-pointer items-center justify-center gap-2 border border-[#ff5500] px-6 py-3.5 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-[#ff5500] hover:text-black">Contact Mike <ArrowRight className="h-4 w-4" /></button></div></div>
    </section>
  </div>;
};
