export type ScreenId = 'home' | 'packages' | 'contact' | 'app-shop';

export type ContactKind = 'enquiry' | 'book-call' | 'waitlist' | 'shwag';

export interface NavItem {
  id: ScreenId;
  label: string;
}

export interface Coach {
  name: string;
  role: string;
  tagline: string;
  intro: string[];
  experience: string[];
  qualifications: string[];
  location: string;
  availability: string;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  note?: string;
}

export interface Review {
  id: string;
  name: string;
  result: string;
  quote: string;
  packageName: string;
  date: string;
}

export interface Offering {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface AppFeature {
  id: string;
  title: string;
  description: string;
}

export interface ShwagProduct {
  id: string;
  name: string;
  price?: string;
  description: string;
  imageUrl?: string;
  link?: string;
  badge?: string;
}

export interface ContactDetails {
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookName: string;
  facebookUrl: string;
  location: string;
  locationShort: string;
  sessions: string;
  responseNote: string;
}

export interface Faq {
  q: string;
  a: string;
}