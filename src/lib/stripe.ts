export async function createCheckoutSession(planId: string, customer?: { name?: string; email?: string }): Promise<{ clientSecret?: string; error?: string }> {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, customerName: customer?.name, customerEmail: customer?.email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.clientSecret) throw new Error(data?.error || 'Checkout could not be started.');
    return { clientSecret: data.clientSecret };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Checkout could not be started.' };
  }
}