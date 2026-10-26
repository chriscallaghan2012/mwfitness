interface StripeEmbeddedCheckout {
  mount(target: HTMLElement | string): void;
  unmount(): void;
}

interface StripeInstance {
  initEmbeddedCheckout(options: { clientSecret: string }): Promise<StripeEmbeddedCheckout>;
}

interface Window {
  Stripe?: (publishableKey: string) => StripeInstance;
}
