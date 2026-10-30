interface StripeEmbeddedCheckout {
  mount(target: HTMLElement | string): void;
  unmount(): void;
}

interface StripeInstance {
  createEmbeddedCheckoutPage(options: { fetchClientSecret: () => Promise<string> }): Promise<StripeEmbeddedCheckout>;
}

interface Window {
  Stripe?: (publishableKey: string) => StripeInstance;
}
