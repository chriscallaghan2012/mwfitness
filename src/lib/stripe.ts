export async function createCheckoutSession(planId: string): Promise<{ url?: string; error?: string }> {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.url) throw new Error(data?.error || 'Checkout could not be started.');
    return { url: data.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Checkout could not be started.' };
  }
}