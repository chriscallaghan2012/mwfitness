import React from 'react';

const TICKER_ITEMS = [
  'ONLINE COACHING',
  'NUTRITIONAL ADVICE',
  'CALORIE-CONTROLLED MEAL PREP IDEAS',
  'BMR & MACRO BREAKDOWNS',
  'COACHING BUILT AROUND YOU',
  'TRAIN ANYWHERE WITH ONLINE SUPPORT',
];

export const Ticker: React.FC = () => (
  <div aria-label="MW Fitness services" className="home-ticker w-full overflow-hidden whitespace-nowrap border-y border-black bg-[#ff5500] py-2.5 font-mono text-xs font-bold uppercase text-black">
    <div className="inline-flex min-w-max animate-[marquee_24s_linear_infinite]" aria-hidden="true">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => <span key={index} className="mx-4">● {item}</span>)}
    </div>
  </div>
);
