import { Review, Testimonial } from '../types';

export const SITE = {
  brand: 'MWFitnessUK',
  byline: 'Online coaching for busy people',
  town: 'Online coaching • Train anywhere',
};

const WEBSITE_IMAGES = 'https://raw.githubusercontent.com/chriscallaghan2012/mwfitness/main/websiteimages';

export const IMAGES = {
  HERO: `${WEBSITE_IMAGES}/mike1.jpg`,
  ABOUT: `${WEBSITE_IMAGES}/mik3.jpg`,
  CONTACT: `${WEBSITE_IMAGES}/logoright.jpg`,
  BEFORE_AFTER: `${WEBSITE_IMAGES}/beforeandafter.jpg`,
  MORE_THAN_WORKOUT: `${WEBSITE_IMAGES}/addthisone.jpg`,
  MIKE_PORTRAIT: `${WEBSITE_IMAGES}/mike2.png`,
};

export const CONTACT = {
  name: 'Mike',
  email: 'mwfitnessukonline@gmail.com',
  instagramHandle: 'michael_whitworth85',
  instagramUrl: 'https://instagram.com/michael_whitworth85',
  shwagInstagramHandle: 'shwag-mcr26',
  shwagInstagramUrl: 'https://instagram.com/shwag-mcr26',
  facebookName: 'Michael Whitworth',
  facebookUrl: 'https://www.facebook.com/michaelwhitworth',
  location: 'Online coaching • Train anywhere',
  locationShort: 'Train anywhere',
  sessions: 'Flexible online coaching and check-ins',
};

export const ABOUT = {
  greeting: "Hi, I'm Mike.",
  intro:
    "I help busy people get fitter, feel stronger and build habits that last through online coaching. No fancy jargon, no judgement — just clear guidance and support that fits around your life.",
  experience: [
    'Online coaching for people of every age and ability',
    'Support for complete beginners and people returning to training',
    'Practical training and nutrition guidance to help you stay consistent week to week',
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
    text: 'We work together online — with check-ins, plan updates and real accountability as you go.',
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
    q: 'Where can I train with online coaching?',
    a: 'Anywhere that suits you — at your gym or at home. Your plan is built around the equipment you have and the time available to you.',
  },
  {
    q: 'What if I have a busy week?',
    a: 'That\u2019s exactly who I work with. Your online plan is designed to fit around work, family and life — not the other way round.',
  },
  {
    q: 'Do you help with food too?',
    a: 'Yes. Every package includes nutrition guidance. The higher packages add meal prep ideas and your full calorie and macro breakdown, so you always know what to eat.',
  },
];