import { PricingTier, Review, Testimonial } from '../types';

export const SITE = {
  brand: 'MWFitnessUK',
  byline: 'Personal training & online coaching for busy people',
  town: 'Hazel Grove, Stockport',
};

export const IMAGES = {
  HERO: '/images/main-hero.jpg',
  ABOUT: '/images/main-hero.jpg',
  CONTACT: '/images/facility-gym.jpg',
};

export const CONTACT = {
  name: 'Mike',
  email: 'mikeptonline@gmail.com',
  instagramHandle: 'michael_whitworth85',
  instagramUrl: 'https://instagram.com/michael_whitworth85',
  facebookName: 'Michael Whitworth',
  facebookUrl: 'https://www.facebook.com/search/top?q=Michael%20Whitworth',
  location: 'Pure Gym Hazel Grove, Stockport',
  locationShort: 'Pure Gym Hazel Grove',
  sessions: 'Morning, evening and weekend sessions',
};

export const ABOUT = {
  greeting: "Hi, I'm Mike.",
  intro:
    "I'm a personal trainer based at Pure Gym, Hazel Grove in Stockport. I help busy people get fit, feel stronger and build habits that actually last. No fancy jargon, no judgement — just clear guidance and support that fits around your life.",
  experience: [
    'Years of experience coaching 1-2-1 and online clients of every age and ability',
    'From complete beginners to people getting back into the gym after a long break',
    'Hands-on help with training, nutrition and staying consistent week to week',
  ],
  background:
    "I know what it's like to have a full-on week — work, family and not much spare time. That's exactly who I built MWFitnessUK around. Every plan I write is simple, realistic and made to fit around your life, not the other way round.",
  qualifications: [
    'Qualified Personal Trainer',
    'Trained in nutrition and meal planning',
    'Fully insured and first-aid qualified',
  ],
};

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Message me',
    text: "Send a quick message or book a free chat. We'll talk about your goals, your week and what's realistic for you.",
  },
  {
    step: '02',
    title: 'Get a plan that fits you',
    text: "I'll put together simple training and food guidance around your life — no one-size-fits-all, no jargon.",
  },
  {
    step: '03',
    title: 'Train with support',
    text: 'We work together — in person or online — with check-ins, tweaks and real accountability as you go.',
  },
];

export const ONLINE_COACHING = {
  name: 'Online coaching',
  intro: 'A fully tailored training and nutrition plan you can buy online and follow wherever you train. No personal meet-ups required, just clear guidance and consistent support from Mike.',
  features: [
    '3, 4 or 5 day training programme',
    'Basic nutrition plan and healthy shopping lists',
    'Meal prep ideas for real life',
    'BMR and macronutrient breakdown',
    'Weekly Zoom call check-ins',
    'WhatsApp communication',
    'Questions and queries answered the same day',
    'Tailor-made around your needs inside and outside the gym',
    'MWFitnessUK app coming soon for easier check-ins and communication',
  ],
  plans: [
    { id: 'online-weekly', name: 'Weekly coaching', price: 149.99, description: 'Start with a complete online plan and pay in advance on a weekly basis.', badge: 'FLEXIBLE START' },
    { id: 'online-12-week', name: '12-week coaching', price: 399.99, description: 'Commit to the full transformation block and get the best value across 12 weeks.', badge: 'BEST VALUE' },
  ],
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    tag: 'Great for getting started',
    price: 120,
    originalPrice: 140,
    badge: 'NEW TO THE GYM',
    description: '4 one-to-one sessions with Mike, plus simple nutrition advice to get you going.',
    features: [
      '4 x one-to-one PT sessions',
      'Simple nutrition advice for your goals',
      'A plan tracked session by session',
      'Morning, evening & weekend slots',
      'At Pure Gym Hazel Grove, Stockport',
    ],
    ctaText: 'Choose Bronze',
  },
  {
    id: 'silver',
    name: 'Silver',
    tag: 'Training + meal ideas',
    price: 150,
    originalPrice: 180,
    badge: 'SAVE £30',
    description: 'Everything in Bronze, plus easy meal prep ideas to keep your food on track all week.',
    features: [
      'Everything in Bronze',
      'Easy, calorie-conscious meal prep ideas',
      'Food plans that fit a busy week',
      'Session-by-session support',
    ],
    ctaText: 'Choose Silver',
  },
  {
    id: 'gold',
    name: 'Gold',
    tag: 'Full nutrition worked out',
    price: 175,
    originalPrice: 200,
    badge: 'MOST POPULAR',
    isPopular: true,
    description: 'Everything in Silver, plus your calories and macros worked out for you — so you always know what to eat.',
    features: [
      'Everything in Silver',
      'Your calories worked out for you',
      'Your protein, carbs & fats made simple',
      'No guessing around food ever again',
    ],
    ctaText: 'Choose Gold',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tag: 'The complete package',
    price: 200,
    originalPrice: 250,
    badge: 'EVERYTHING INCLUDED',
    description: 'Everything in Gold, plus a weekly training plan for your other gym days. The full MWFitnessUK experience.',
    features: [
      'Everything in Gold',
      'A weekly plan for your other gym days',
      'Coaching between sessions when you need it',
      'The complete MWFitnessUK package',
    ],
    ctaText: 'Choose Platinum',
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Leah M.',
    rating: 5,
    quote:
      "I'd never really been to a gym before and felt out of my depth. Mike made everything simple and never made me feel silly. Six months on I actually look forward to my sessions.",
    packageName: 'Bronze',
    date: 'August 2026',
  },
  {
    id: 'r2',
    name: 'Daniel T.',
    rating: 5,
    quote:
      'Work and kids leave me with no spare time, but the meal prep ideas meant I stayed on track all week. Simple guidance and it works.',
    packageName: 'Gold',
    date: 'August 2026',
  },
  {
    id: 'r3',
    name: 'Sarah P.',
    rating: 5,
    quote:
      'For the first time I understood what I should actually be eating. Down over a stone and feeling stronger than ever. Genuinely can\u2019t thank Mike enough.',
    packageName: 'Gold',
    date: 'July 2026',
  },
  {
    id: 'r4',
    name: 'Jack B.',
    rating: 5,
    quote:
      'Online coaching fit around my shifts perfectly. A simple plan, easy check-ins and real results. Exactly what I needed.',
    packageName: 'Online Coaching',
    date: 'July 2026',
  },
  {
    id: 'r5',
    name: 'Emily R.',
    rating: 5,
    quote:
      'Friendly, patient and pushes me just the right amount. The food guidance keeps me on track outside the gym. Best decision I\u2019ve made for myself in years.',
    packageName: 'Silver',
    date: 'June 2026',
  },
  {
    id: 'r6',
    name: 'Mark S.',
    rating: 5,
    quote:
      'Never stuck with anything before. The 4-session block changed that — structure, accountability and results. Highly recommend.',
    packageName: 'Bronze',
    date: 'June 2026',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Leah M.',
    metric: 'Got started & stuck with it',
    quote: 'Mike made everything simple. First time I\u2019ve ever stuck to training and I love it.',
    programme: 'Bronze Package',
    avatarText: 'LM',
  },
  {
    id: '2',
    name: 'Daniel T.',
    metric: 'Fits around a busy week',
    quote: 'Meal prep ideas meant I stayed on track around work and family. Simple — and it works.',
    programme: 'Gold Package',
    avatarText: 'DT',
  },
  {
    id: '3',
    name: 'Sarah P.',
    metric: 'Down over a stone',
    quote: 'Finally understood what to eat. No jargon, just clear guidance and support.',
    programme: 'Gold Package',
    avatarText: 'SP',
  },
];
export const APP_FEATURES = [
  {
    title: 'Daily weigh-in',
    text: 'Step on the scales each morning and watch your progress build day by day.',
  },
  {
    title: 'Progress tracking',
    text: 'Photos, measurements and notes in one place, so you can see how far you\u2019ve come.',
  },
  {
    title: 'Food log',
    text: 'An easy way to log what you eat and keep your nutrition on track.',
  },
  {
    title: 'Training log',
    text: 'Your sessions recorded, your lifts tracked and your goals in sight.',
  },
];

export const SHWAG = {
  name: 'SHWAG',
  intro:
    'SHWAG is our own range of kit — gym wear and everyday gear for people who train hard and live busy lives. It\u2019s the MWFitnessUK brand you can wear.',
  meaning:
    'SHWAG stands for the attitude behind every session — Show Up, Work Hard, Achieve Growth. It\u2019s what we do every day at MWFitnessUK: turn up, put the work in and grow a little every time.',
  whyItWorks:
    'SHWAG isn\u2019t just a range of clothes — it\u2019s the mindset MWFitnessUK is built on. When you wear it, you\u2019re part of a community that shows up for themselves. Every piece is practical, comfortable and made to be worn in the gym and beyond — just like the coaching: simple, real and built to last.',
  products: [
    { name: 'Classic SHWAG T-Shirt', price: null, note: 'Prices coming soon', link: null },
    { name: 'SHWAG Hoodie', price: null, note: 'Prices coming soon', link: null },
    { name: 'SHWAG Gym Bag', price: null, note: 'Prices coming soon', link: null },
    { name: 'SHWAG Water Bottle', price: null, note: 'Prices coming soon', link: null },
  ],
};

export const FAQS = [
  {
    q: 'I\u2019m a complete beginner — is this for me?',
    a: 'Absolutely. Most of my clients started exactly where you are now. Every session is built around your level, and I\u2019ll show you exactly what to do, step by step.',
  },
  {
    q: 'Where do sessions take place?',
    a: 'In-person 1-2-1 sessions run at Pure Gym Hazel Grove, Stockport. If you prefer online coaching, I\u2019ll build your plan around whatever gym (or home) equipment you have.',
  },
  {
    q: 'What if I have a busy week?',
    a: 'That\u2019s exactly who I work with. Sessions run morning, evening and weekend, and plans are made to fit around work, kids and life — not the other way round.',
  },
  {
    q: 'Do you help with food too?',
    a: 'Yes. Every package includes nutrition guidance. The higher packages add meal prep ideas and your full calorie and macro breakdown, so you always know what to eat.',
  },
];