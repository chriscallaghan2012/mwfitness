export type CheckoutStartResult =
  | { mode: 'stripe'; clientSecret: string; publishableKey: string }
  | { mode: 'mock' }
  | { error: string };

export async function createCheckoutSession(planId: string, customer?: { name?: string; email?: string }): Promise<CheckoutStartResult> {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, customerName: customer?.name, customerEmail: customer?.email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || 'Checkout could not be started.');
    if (data?.mode === 'mock') return { mode: 'mock' };
    if (data?.mode === 'stripe' && typeof data.clientSecret === 'string' && typeof data.publishableKey === 'string') {
      return { mode: 'stripe', clientSecret: data.clientSecret, publishableKey: data.publishableKey };
    }
    throw new Error(data?.error || 'Checkout returned an invalid response.');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Checkout could not be started.' };
  }
}
