import type { PaymentProviderKind } from '@prisma/client';

import { PaystackProvider } from './paystack';
import { StripeProvider } from './stripe';
import type { PaymentProvider } from './types';

export * from './types';

const paystack = new PaystackProvider();
const stripe = new StripeProvider();

export function getProvider(kind: PaymentProviderKind): PaymentProvider {
  return kind === 'STRIPE' ? stripe : paystack;
}

/**
 * Which rails can actually take money right now. Checkout renders only these,
 * and says so rather than presenting a button that will fail.
 */
export function availableProviders() {
  return ([
    {
      kind: 'PAYSTACK' as const,
      label: 'Card, bank transfer or USSD',
      sublabel: 'Paid in naira through Paystack',
      currency: 'NGN' as const,
      configured: paystack.isConfigured(),
    },
    {
      kind: 'STRIPE' as const,
      label: 'International card',
      sublabel: 'Charged in US dollars through Stripe',
      currency: 'USD' as const,
      configured: stripe.isConfigured(),
    },
  ]).filter((p) => p.configured);
}

export function anyProviderConfigured() {
  return availableProviders().length > 0;
}
