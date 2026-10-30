interface StripeMountableElement {
  mount(target: HTMLElement | string): void;
  unmount(): void;
}

interface StripeCheckoutActions {
  confirm(options?: { redirect?: 'always' | 'if_required' }): Promise<
    | { type: 'success'; session: unknown }
    | { type: 'error'; error: { message: string } }
  >;
}

interface StripeCheckoutElements {
  loadActions(): Promise<
    | { type: 'success'; actions: StripeCheckoutActions }
    | { type: 'error'; error: { message: string } }
  >;
  createContactDetailsElement(): StripeMountableElement;
  createPaymentElement(options?: {
    fields?: {
      billingDetails?: {
        name?: 'auto' | 'never' | 'always';
        email?: 'auto' | 'never' | 'always';
        phone?: 'auto' | 'never' | 'always';
      };
    };
  }): StripeMountableElement;
}

interface StripeInstance {
  initCheckoutElementsSdk(options: {
    clientSecret: string;
    elementsOptions: {
      appearance: {
        theme: 'night';
        variables: Record<string, string>;
      };
    };
  }): StripeCheckoutElements;
}

interface Window {
  Stripe?: (publishableKey: string) => StripeInstance;
}
