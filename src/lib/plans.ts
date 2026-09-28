import { supabase } from './supabase';

export interface PublicPlan {
  id: string;
  name: string;
  tag: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  is_popular: boolean;
  description: string;
  features: string[];
  cta_text: string;
  kind: 'pt' | 'online';
}

export async function loadPublicPlans(kind: PublicPlan['kind']): Promise<{ plans: PublicPlan[]; error: string | null }> {
  if (!supabase) {
    return { plans: [], error: 'Pricing is temporarily unavailable. Please contact Mike for current options.' };
  }

  const { data, error } = await supabase
    .from('plans')
    .select('id,name,tag,price,original_price,badge,is_popular,description,features,cta_text,kind')
    .eq('active', true)
    .eq('kind', kind)
    .order('price');

  if (error) {
    return { plans: [], error: 'Pricing is temporarily unavailable. Please contact Mike for current options.' };
  }

  const plans = (data ?? []).map((row) => ({
    ...row,
    tag: row.tag ?? '',
    original_price: row.original_price == null ? null : Number(row.original_price),
    price: Number(row.price),
    badge: row.badge ?? null,
    is_popular: Boolean(row.is_popular),
    description: row.description ?? '',
    features: Array.isArray(row.features) ? row.features.filter((feature): feature is string => typeof feature === 'string') : [],
    cta_text: row.cta_text ?? 'Get started',
    kind,
  })) as PublicPlan[];

  return { plans, error: null };
}