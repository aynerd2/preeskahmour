'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { Address } from '@prisma/client';

import { Field } from '@/components/forms/field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cartSubtotal, useCart } from '@/store/cart';
import { NIGERIAN_STATES } from '@/lib/constants';
import { shippingForZone, zoneForAddress } from '@/lib/pricing';
import { checkoutSchema, type CheckoutInput } from '@/lib/validators';
import { cn, formatMoney, ngnToUsdMinor } from '@/lib/utils';

type ProviderOption = {
  kind: 'PAYSTACK' | 'STRIPE';
  label: string;
  sublabel: string;
  currency: 'NGN' | 'USD';
};

export function CheckoutForm({
  providers,
  addresses,
  measurementProfiles,
  defaults,
  isSignedIn,
}: {
  providers: ProviderOption[];
  addresses: Address[];
  measurementProfiles: { id: string; name: string; source: string; isDefault: boolean }[];
  defaults: { email: string; customerName: string; phone: string };
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const clearCart = useCart((s) => s.clear);

  const [submitting, setSubmitting] = React.useState(false);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const defaultProfile =
    measurementProfiles.find((p) => p.isDefault) ?? measurementProfiles[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: defaults.email,
      customerName: defaults.customerName,
      phone: defaults.phone || defaultAddress?.phone || '',
      provider: providers[0]?.kind ?? 'PAYSTACK',
      customerNote: '',
      measurementProfileId: defaultProfile?.id,
      address: {
        fullName: defaultAddress?.fullName ?? defaults.customerName,
        phone: defaultAddress?.phone ?? defaults.phone ?? '',
        line1: defaultAddress?.line1 ?? '',
        line2: defaultAddress?.line2 ?? '',
        city: defaultAddress?.city ?? '',
        state: defaultAddress?.state ?? 'Lagos',
        country: defaultAddress?.country ?? 'Nigeria',
        postcode: defaultAddress?.postcode ?? '',
      },
      items: [],
    },
  });

  const country = watch('address.country');
  const state = watch('address.state');
  const provider = watch('provider');

  const subtotal = cartSubtotal(items);
  const zone = zoneForAddress(state ?? '', country ?? 'Nigeria');
  const shipping = shippingForZone(zone, subtotal);
  const total = subtotal + shipping;

  const isNigeria = (country ?? '').trim().toLowerCase() === 'nigeria';

  async function onSubmit(values: CheckoutInput) {
    if (items.length === 0) {
      toast.error('Your bag is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          // Ids and quantities only — the server prices the order itself.
          items: items.map((i) => ({
            kind: i.kind,
            productId: i.productId,
            customDesignId: i.customDesignId,
            quantity: i.quantity,
          })),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(body.error ?? 'Could not start that order.');

      // The bag is cleared only once the order row exists. If payment is
      // abandoned the order sits as PENDING_PAYMENT and can be revived from
      // the confirmation page or by the atelier.
      clearCart();
      window.location.href = body.redirectUrl;
    } catch (error) {
      toast.error('Checkout did not go through', {
        description:
          error instanceof Error ? error.message : 'Nothing has been charged. Try again.',
      });
      setSubmitting(false);
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="motif-diamond border border-dashed border-ink/20 px-6 py-16 text-center">
        <h2 className="font-display text-xl text-ink">There is nothing to check out</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Your bag is empty. Design something, or start from a piece in the shop.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/builder">Design your suit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Browse the shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-16"
    >
      <div className="space-y-10">
        {/* Contact */}
        <section>
          <h2 className="eyebrow mb-5">Contact</h2>

          {!isSignedIn ? (
            <p className="mb-5 border-l-2 border-gold bg-gold-wash/40 py-3 pl-4 pr-3 text-xs leading-relaxed text-ink-muted">
              Checking out as a guest is fine.{' '}
              <Link href="/login?callbackUrl=/checkout" className="link-underline text-ink">
                Sign in
              </Link>{' '}
              instead and we will keep your measurements and this order in your account.
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="customerName" label="Your name" error={errors.customerName?.message} required>
              <Input autoComplete="name" {...register('customerName')} />
            </Field>

            <Field name="email" label="Email" error={errors.email?.message} required>
              <Input type="email" autoComplete="email" {...register('email')} />
            </Field>

            <Field
              name="phone"
              label="Phone"
              hint="We use this for fitting questions, not marketing."
              error={errors.phone?.message}
              required
            >
              <Input type="tel" autoComplete="tel" {...register('phone')} />
            </Field>
          </div>
        </section>

        {/* Delivery */}
        <section>
          <h2 className="eyebrow mb-5">Delivery address</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="address.fullName"
              label="Recipient"
              error={errors.address?.fullName?.message}
              required
              className="sm:col-span-2"
            >
              <Input autoComplete="shipping name" {...register('address.fullName')} />
            </Field>

            <Field
              name="address.line1"
              label="Street address"
              error={errors.address?.line1?.message}
              required
              className="sm:col-span-2"
            >
              <Input autoComplete="shipping address-line1" {...register('address.line1')} />
            </Field>

            <Field
              name="address.line2"
              label="Apartment, floor or landmark"
              error={errors.address?.line2?.message}
              className="sm:col-span-2"
            >
              <Input autoComplete="shipping address-line2" {...register('address.line2')} />
            </Field>

            <Field name="address.city" label="City" error={errors.address?.city?.message} required>
              <Input autoComplete="shipping address-level2" {...register('address.city')} />
            </Field>

            <Field name="address.state" label="State" error={errors.address?.state?.message} required>
              {isNigeria ? (
                <select
                  className="flex h-11 w-full border border-ink/20 bg-ivory px-3.5 text-[0.95rem] text-ink transition-colors hover:border-ink/40 focus:border-emerald focus:outline-none"
                  {...register('address.state')}
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <Input autoComplete="shipping address-level1" {...register('address.state')} />
              )}
            </Field>

            <Field
              name="address.country"
              label="Country"
              error={errors.address?.country?.message}
              required
            >
              <Input autoComplete="shipping country-name" {...register('address.country')} />
            </Field>

            <Field name="address.postcode" label="Postcode" error={errors.address?.postcode?.message}>
              <Input autoComplete="shipping postal-code" {...register('address.postcode')} />
            </Field>
          </div>

          {!isNigeria ? (
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Shipping outside Nigeria is {formatMoney(shipping)} by tracked courier. Duties and
              import taxes at the destination are the recipient&rsquo;s responsibility.
            </p>
          ) : null}
        </section>

        {/* Measurements */}
        {measurementProfiles.length > 0 ? (
          <section>
            <h2 className="eyebrow mb-2">Measurements</h2>
            <p className="mb-4 max-w-xl text-xs leading-relaxed text-ink-faint">
              Custom designs already carry their own measurements. This profile is applied to any
              ready-to-wear piece in your bag.
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {measurementProfiles.map((profile) => {
                const active = watch('measurementProfileId') === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setValue('measurementProfileId', profile.id)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-center gap-3 border p-3.5 text-left transition-all',
                      active ? 'border-gold shadow-gold-ring' : 'border-ink/15 hover:border-ink/40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-gold bg-gold' : 'border-ink/30',
                      )}
                      aria-hidden
                    >
                      {active ? <Check className="h-2.5 w-2.5 text-ink" strokeWidth={4} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-ink">{profile.name}</span>
                    {profile.source === 'ESTIMATED' ? (
                      <Badge variant="terracotta">Estimated</Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Payment */}
        <section>
          <h2 className="eyebrow mb-5">Payment</h2>

          <div className="space-y-2.5">
            {providers.map((option) => {
              const active = provider === option.kind;
              return (
                <button
                  key={option.kind}
                  type="button"
                  onClick={() => setValue('provider', option.kind)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center gap-4 border p-4 text-left transition-all',
                    active ? 'border-gold shadow-gold-ring' : 'border-ink/15 hover:border-ink/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      active ? 'border-gold bg-gold' : 'border-ink/30',
                    )}
                    aria-hidden
                  >
                    {active ? <Check className="h-2.5 w-2.5 text-ink" strokeWidth={4} /> : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{option.sublabel}</span>
                  </span>

                  <span className="shrink-0 text-sm tabular-nums text-ink">
                    {option.currency === 'NGN'
                      ? formatMoney(total)
                      : `$${(ngnToUsdMinor(total) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                </button>
              );
            })}
          </div>

          {provider === 'STRIPE' ? (
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Our prices are set in naira. The dollar figure is converted at our published rate and
              is indicative — your bank&rsquo;s rate on the day decides the exact amount.
            </p>
          ) : null}
        </section>

        {/* Note */}
        <section>
          <Field
            name="customerNote"
            label="Anything we should know?"
            hint="A date you need it by, a delivery instruction, a fitting preference."
            error={errors.customerNote?.message}
          >
            <Textarea rows={3} {...register('customerNote')} />
          </Field>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-ink/12 p-6">
          <h2 className="eyebrow mb-5">Your order</h2>

          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-cream">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{item.name}</span>
                  <span className="block text-xs text-ink-faint">Qty {item.quantity}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-ink">
                  {formatMoney(item.unitPriceKobo * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <hr className="my-5 border-ink/10" />

          <dl className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-ink-muted">Subtotal</dt>
              <dd className="text-sm tabular-nums text-ink">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-ink-muted">
                Delivery
                <span className="block text-xs text-ink-faint">
                  {zone === 'LAGOS' ? 'Within Lagos' : zone === 'NIGERIA' ? 'Within Nigeria' : 'International'}
                </span>
              </dt>
              <dd className="text-sm tabular-nums text-ink">
                {shipping === 0 ? <span className="text-emerald">Complimentary</span> : formatMoney(shipping)}
              </dd>
            </div>
          </dl>

          <hr className="gold-rule my-5 border-0" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">Total</span>
            <span className="font-display text-2xl tabular-nums text-ink">
              {formatMoney(total)}
            </span>
          </div>

          <Button type="submit" full size="lg" className="mt-6" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {submitting ? 'Taking you to payment…' : 'Pay securely'}
          </Button>

          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            You will be taken to {provider === 'STRIPE' ? 'Stripe' : 'Paystack'} to pay. We never see
            or store your card details.
          </p>
        </div>

        <Link
          href="/cart"
          className="mt-5 block text-center text-xs uppercase tracking-[0.16em] text-ink-muted underline-offset-4 hover:underline"
        >
          Back to your bag
        </Link>
      </aside>
    </form>
  );
}
