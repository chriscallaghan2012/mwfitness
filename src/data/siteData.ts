import { AppFeature, Coach, ContactDetails, Faq, Offering, PricingTier, Review, ShwagProduct } from '../types';

export const IMAGES = {
  HERO: '/images/main-hero.jpg',
  PROFILE: '/images/facility-gym.jpg',
};

export const CONTACT: ContactDetails = {
  email: 'mikeptonline@gmail.com',
  instagramHandle: 'michael_whitworth85',
  instagramUrl: 'https://instagram.com/michael_whitworth85',
  facebookName: 'Michael Whitworth',
  facebookUrl: 'https://www.facebook.com/search/top?q=Michael%20Whitworth',
  location: 'Pure Gym Hazel Grove, Stockport',
  locationShort: 'Pure Gym Hazel Grove',
  sessions: 'Morning, evening & weekend sessions from September 2026',
  responseNote: 'I reply to every message personally — usually within 24 hours.',
};

/*
 * TODO (Mike): Confirm / expand your background, experience and qualifications.
 * The copy below is a friendly, honest starting point — add real detail where you like.
 */
export const COACH: Coach = {
  name: 'Michael Whitworth',
  role: 'Founder & Personal Trainer — MWFitnessUK',
  tagline: 'Real training, built around real life.',
  intro: [
    'Hi, I\'m Mike — the coach behind MWFitnessUK.',
    'I help busy people get fit, feel stronger and actually enjoy their training. I\'m based at Pure Gym Hazel Grove in Stockport, where I run 1-2-1 personal training and online coaching for people all over the UK.',
    'No complicated jargon, no fad diets, no "no pain, no gain" nonsense. Just a proper plan that fits around your job, your family and your life — and someone in your corner who genuinely wants you to succeed.',
  ],
  experience: [
    '1-2-1 personal training for beginners, returners and regular gym-goers',
    'Online coaching for clients across Stockport and the UK',
    'Practical nutrition and meal prep guidance for busy lifestyles',
    'Fat loss, building muscle, getting stronger, general health and confidence',
  ],
  qualifications: [
    'Qualified Personal Trainer',
    'Online coaching specialist',
    'Nutrition & meal prep coaching',
  ],
  location: 'Pure Gym Hazel Grove, Stockport',
  availability: 'Morning, evening & weekend sessions — designed around the 9-5, not against it.',
};

export const OFFERINGS: Offering[] = [
  {
    id: 'pt',
    title: '1-2-1 Personal Training',
    summary: 'Face-to-face sessions at Pure Gym Hazel Grove. Perfect if you want someone to coach you in person, correct your form and keep you accountable every single week.',
    bullets: ['4-session blocks to start', 'Every session tailored to you', 'Morning, evening & weekend slots'],
  },
  {
    id: 'online',
    title: 'Online Coaching',
    summary: 'A personal plan you can follow from any gym — or even at home. Ideal for shift workers, busy parents and anyone who can\'t commit to set session times.',
    bullets: ['Works around your schedule', 'Weekly check-ins & support', 'Available anywhere in the UK'],
  },
  {
    id: 'nutrition',
    title: 'Nutrition Support',
    summary: 'Simple, practical food guidance and meal prep ideas. No cutting out everything you enjoy — just a way of eating that fits your life and gets results.',
    bullets: ['Meal prep ideas that save time', 'Easy calorie & macro numbers', 'Support, not judgement'],
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    tagline: 'The perfect place to start',
    price: 120,
    originalPrice: 140,
    badge: 'Getting started',
    description: '4 x 1-2-1 personal training sessions plus nutritional advice. Ideal if you\'re new to the gym, or getting back into it after a break.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'A plan that\'s personal to you, not off the shelf',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport',
    ],
    notIncluded: [
      'Calorie-controlled meal prep ideas',
      'Calorie & macro breakdown',
      'Weekly programme for your other training days',
    ],
    cta: 'Enquire about Bronze',
  },
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Training + nutrition',
    price: 150,
    originalPrice: 180,
    badge: 'Save £30',
    description: 'Everything in Bronze, plus calorie-controlled meal prep ideas to keep your food on track all week long.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Calorie-controlled meal prep ideas',
      'A plan that\'s personal to you, not off the shelf',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport',
    ],
    notIncluded: [
      'Calorie & macro breakdown',
      'Weekly programme for your other training days',
    ],
    cta: 'Enquire about Silver',
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'Most popular',
    price: 175,
    originalPrice: 200,
    badge: 'Save £25',
    isPopular: true,
    description: 'Everything in Silver, plus your personal calorie and macro numbers — so you finally know exactly what to eat, without the guesswork.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Calorie-controlled meal prep ideas',
      'Calorie & macro breakdown for your body',
      'A plan that\'s personal to you, not off the shelf',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport',
    ],
    notIncluded: [
      'Weekly programme for your other training days',
    ],
    cta: 'Enquire about Gold',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'The full package',
    price: 200,
    originalPrice: 250,
    badge: 'Save £50',
    description: 'Everything in Gold, plus a weekly programme for your other training days. The complete MWFitnessUK coaching package.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Calorie-controlled meal prep ideas',
      'Calorie & macro breakdown for your body',
      'Weekly programme for 3-4 extra training days',
      'A plan that\'s personal to you, not off the shelf',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport',
    ],
    cta: 'Enquire about Platinum',
  },
];

export const PACKAGE_EXTRAS: string[] = [
  'Discounts available on 8-week & 12-week programmes',
  '10% off ALL SHWAG merchandise for MWFitnessUK clients',
  'Online coaching also available — message me and I\'ll build a plan around your gym',
];
export const PACKAGE_OPTIONS: string[] = [
  '1-2-1 Personal Training',
  'Online Coaching',
  'Nutrition support',
  'A free chat to decide',
];

export const GOAL_OPTIONS: string[] = [
  'Lose weight / get leaner',
  'Build muscle / get stronger',
  'Get fitter & healthier generally',
  'Get back into the gym after a break',
  'Improve confidence & mental wellbeing',
  'Something else / not sure yet',
];

export const TIME_OPTIONS: string[] = ['Morning', 'Evening', 'Weekend', 'Flexible'];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Leah M.',
    result: '"Best fitness investment I\'ve made."',
    quote: 'Sessions are structured, tough and actually tailored to how I train. The meal prep ideas made staying on track so much easier — best fitness investment I\'ve made.',
    packageName: 'Gold',
    date: 'August 2026',
  },
  {
    id: 'r2',
    name: 'Daniel T.',
    result: 'Form fixed in week one',
    quote: 'Mike knows exactly what he\'s doing. Form improved within the first couple of sessions and the nutritional advice is practical, not preachy. Strongly recommend.',
    packageName: 'Platinum',
    date: 'August 2026',
  },
  {
    id: 'r3',
    name: 'Sarah P.',
    result: 'Nearly a stone down',
    quote: 'The calorie and macro breakdown finally made nutrition click for me. Down nearly a stone and feeling stronger than ever. Genuinely can\'t thank Mike enough.',
    packageName: 'Gold',
    date: 'July 2026',
  },
  {
    id: 'r4',
    name: 'Jack B.',
    result: 'Fits around shift work',
    quote: 'Online coaching around my shift pattern was perfect. Weekly check-ins and a programme that actually works with my lifestyle. Results speak for themselves.',
    packageName: 'Online Coaching',
    date: 'July 2026',
  },
  {
    id: 'r5',
    name: 'Emily R.',
    result: 'Never felt judged',
    quote: 'Never felt judged, always felt challenged. Every session is structured to my goals and the meal prep guidance keeps me on track outside the gym. Five stars.',
    packageName: 'Silver',
    date: 'June 2026',
  },
  {
    id: 'r6',
    name: 'Mark S.',
    result: 'Finally stuck with it',
    quote: 'As someone who\'d never stuck with a programme before, the 4-session block was exactly what I needed. Real structure, real accountability, real results.',
    packageName: 'Bronze',
    date: 'June 2026',
  },
];
export const APP_FEATURES: AppFeature[] = [
  {
    id: 'weigh-in',
    title: 'Daily weigh-in',
    description: 'Track your morning weigh-ins with simple charts that show the bigger picture — not daily wobbles.',
  },
  {
    id: 'food-log',
    title: 'Food log',
    description: 'A quick, no-fuss way to log what you eat. Log in seconds, stay consistent for weeks.',
  },
  {
    id: 'training-log',
    title: 'Training log',
    description: 'Record every session and watch your lifts go up and your goals come into view.',
  },
  {
    id: 'progress-photos',
    title: 'Progress photos',
    description: 'Snap a photo every few weeks and let the app show you changes you\'d never notice day to day.',
  },
];

export const APP_NOTE =
  'I\'m building the MWFitnessUK app myself and I\'m actually enjoying every minute of it. ' +
  'It\'s being made to be simple, friendly and fully interactive — no dead features, just the tools that actually help you. ' +
  'Join the waitlist below and you\'ll be first to know when it\'s ready.';

/*
 * SHWAG — real partnership facts.
 * TODO (Mike): when the full SHWAG story/meaning is ready, expand `whatIs` — everything here is kept factual for now.
 */
export const SHWAG_STORY = {
  name: 'SHWAG',
  handle: '@shwagmcr',
  whatIs:
    'SHWAG is the training-wear brand MWFitnessUK works alongside — the loose change in the pocket of the fitness community.',
  howItWorks:
    'MWFitnessUK clients get 10% off all SHWAG merchandise. Every bit of SHWAG gear is a badge of the work you\'re putting in — wear it with pride in the gym, or out and about.',
  standFor: ['Show up', 'Work hard', 'Be proud', 'Support each other'],
};

/*
 * Real SHWAG products go here (name, price, imageUrl, link).
 * Until Mike adds them, the shop shows the real Instagram ordering path instead of any made-up stock.
 */
export const SHWAG_PRODUCTS: ShwagProduct[] = [];

export const SHWAG_NOTE =
  'The full SHWAG range is live on Instagram — DM to order, or use the button below and I\'ll send you the latest prices.';

export const SHWAG_ORDER_LINK = 'https://instagram.com/michael_whitworth85';

export const FAQS: Faq[] = [
  {
    q: 'I haven\'t been to the gym in years. Is this for me?',
    a: 'Absolutely — that\'s exactly who I help. Every plan starts from where you are now, not where you think you should be. We build up slowly, safely and consistently.',
  },
  {
    q: 'I work full time and have a family. Will this fit around me?',
    a: 'That\'s the whole point. Sessions run morning, evening and weekends, and online coaching means you can train whenever suits you. Your plan works around your life, not the other way round.',
  },
  {
    q: 'What does a 4-session block include?',
    a: '4 x 1-2-1 personal training sessions with me at Pure Gym Hazel Grove, plus nutritional advice. Silver adds meal prep ideas, Gold adds your calorie and macro numbers, and Platinum adds a programme for your other training days.',
  },
  {
    q: 'How much does it cost?',
    a: 'Packages start at £120 for 4 sessions. Browse the Packages page for the full breakdown — or message me and we\'ll find the right fit for you.',
  },
  {
    q: 'Where do sessions take place?',
    a: 'In person at Pure Gym Hazel Grove, Stockport. Online coaching is available wherever you train — any gym, or at home.',
  },
];