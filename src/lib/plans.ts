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

const UNAVAILABLE = 'Pricing is temporarily unavailable. Please contact Mike for current options.';

export async function loadPublicPlans(kind: PublicPlan['kind']): Promise<{ plans: PublicPlan[]; error: string | null }> {
  try {
    const response = await fetch(`/api/plans?kind=${encodeURIComponent(kind)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error('[MW Fitness] Public pricing endpoint returned status:', response.status);
      return { plans: [], error: UNAVAILABLE };
    }
    const payload = await response.json() as { plans?: unknown };
    if (!Array.isArray(payload.plans)) {
      console.error('[MW Fitness] Public pricing endpoint returned an invalid payload.');
      return { plans: [], error: UNAVAILABLE };
    }
    const plans = payload.plans.map((row) => {
      const plan = row as Partial<PublicPlan>;
      return {
        id: String(plan.id ?? ''),
        name: String(plan.name ?? ''),
        tag: String(plan.tag ?? ''),
        price: Number(plan.price ?? 0),
        original_price: plan.original_price == null ? null : Number(plan.original_price),
        badge: plan.badge ?? null,
        is_popular: Boolean(plan.is_popular),
        description: String(plan.description ?? ''),
        features: Array.isArray(plan.features) ? plan.features.filter((feature): feature is string => typeof feature === 'string') : [],
        cta_text: String(plan.cta_text ?? 'Get started'),
        kind,
      } satisfies PublicPlan;
    }).filter((plan) => plan.id && plan.name && Number.isFinite(plan.price) && plan.price >= 0);
    return { plans, error: null };
  } catch (cause) {
    console.error('[MW Fitness] Public pricing request failed:', cause instanceof Error ? cause.message : 'Unknown request error');
    return { plans: [], error: UNAVAILABLE };
  }
}
