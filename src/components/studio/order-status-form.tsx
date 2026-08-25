'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { OrderStatus } from '@prisma/client';

import { Fieldset } from './studio-ui';
import { ORDER_STATUS_OPTIONS } from './field-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateOrder } from '@/app/studio/actions';

/**
 * Moves an order through the atelier. Whatever is set here is what the
 * customer sees on their own order page, so the stage names are written for
 * them, not for internal shorthand.
 */
export function OrderStatusForm({
  id,
  status,
  atelierNotes,
  trackingUrl,
}: {
  id: string;
  status: OrderStatus;
  atelierNotes: string;
  trackingUrl: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [values, setValues] = React.useState({ status, atelierNotes, trackingUrl });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);

    const result = await updateOrder({ id, ...values });
    setPending(false);

    if (result.ok) {
      toast.success('Order updated');
      router.refresh();
    } else {
      toast.error('Could not update that', { description: result.error });
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Fieldset
        legend="Atelier"
        hint="The stage is visible to the customer. Notes are internal and never shown to them."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="status">Stage</Label>
            <select
              id="status"
              value={values.status}
              onChange={(e) =>
                setValues((v) => ({ ...v, status: e.target.value as OrderStatus }))
              }
              className="mt-2 flex h-11 w-full border border-ink/20 bg-ivory px-3.5 text-[0.95rem] text-ink transition-colors hover:border-ink/40 focus:border-emerald focus:outline-none"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="trackingUrl">Tracking link</Label>
            <Input
              id="trackingUrl"
              value={values.trackingUrl}
              placeholder="https://…"
              onChange={(e) => setValues((v) => ({ ...v, trackingUrl: e.target.value }))}
              className="mt-2"
            />
            <p className="mt-1.5 text-xs text-ink-faint">
              Shown as a button on the customer&rsquo;s order once set.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="atelierNotes">Internal notes</Label>
          <Textarea
            id="atelierNotes"
            rows={4}
            value={values.atelierNotes}
            placeholder="Cloth cut 14/08. Right shoulder dropped 1cm per profile note."
            onChange={(e) => setValues((v) => ({ ...v, atelierNotes: e.target.value }))}
            className="mt-2"
          />
        </div>

        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pending ? 'Saving…' : 'Update order'}
        </Button>
      </Fieldset>
    </form>
  );
}
