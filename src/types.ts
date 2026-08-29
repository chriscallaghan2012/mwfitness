export type ScreenId = 
  | 'home' 
  | 'pt' 
  | 'online' 
  | 'methodology' 
  | 'packages' 
  | 'programmes' 
  | 'armory' 
  | 'tools';

export interface NavItem {
  id: ScreenId;
  label: string;
  code: string;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  credentials: string[];
  bio: string;
  specialty: string;
  availability: string;
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
  omittedFeatures?: string[];
  ctaText: string;
}

export interface Programme {
  id: string;
  title: string;
  category: 'Powerlifting' | 'Hypertrophy' | 'Conditioning' | 'Mobility';
  duration: string;
  frequency: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Elite';
  price: number;
  description: string;
  highlights: string[];
  weeklyBreakdown: {
    week: string;
    focus: string;
    sampleSession: string;
  }[];
}

export interface Testimonial {
  id: string;
  name: string;
  metric: string;
  quote: string;
  programme: string;
  avatarText: string;
}

export interface EquipmentItem {
  name: string;
  brand: string;
  spec: string;
  category: 'Barbells & Plates' | 'Racks & Platforms' | 'Conditioning' | 'Recovery';
}
