export type ScreenId = 'home' | 'packages' | 'app' | 'shwag' | 'contact';

export interface NavItem {
  id: ScreenId;
  label: string;
  code: string;
}

export interface PricingTier {
  id: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: string[];
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  metric: string;
  quote: string;
  programme: string;
  avatarText: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  quote: string;
  packageName: string;
  date: string;
}

