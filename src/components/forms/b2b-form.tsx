'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Field, FormSuccess, Honeypot } from './field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GARMENT_TYPES, b2bSchema, type B2BInput } from '@/lib/validators';

export function B2BForm() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<B2BInput>({
    resolver: zodResolver(b2bSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      industry: '',
      garmentTypes: [],
      neededBy: '',
      budgetNote: '',
      message: '',
    },
  });

  const garmentTypes = watch('garmentTypes') ?? [];

  function toggleGarment(value: (typeof GARMENT_TYPES)[number]) {
    const next = garmentTypes.includes(value)
      ? garmentTypes.filter((g) => g !== value)
      : [...garmentTypes, value];
    setValue('garmentTypes', next, { shouldValidate: true });
  }

  async function onSubmit(values: B2BInput) {
    try {
      const res = await fetch('/api/b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Request failed');
      }

      setSent(true);
      reset();
    } catch (error) {
      toast.error('That did not send.', {
        description: error instanceof Error ? error.message : 'Try again in a moment.',
      });
    }
  }

  if (sent) {
    return (
      <FormSuccess
        title="Enquiry received"
        body="Our corporate desk will come back to you within one working day with next steps and an indicative quote. For anything time-critical, call the number in the footer."
      >
        <Button variant="outline" onClick={() => setSent(false)}>
          Send another enquiry
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-6">
      <Honeypot register={register('website')} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="companyName" label="Organisation" error={errors.companyName?.message} required>
          <Input autoComplete="organization" {...register('companyName')} />
        </Field>

        <Field name="industry" label="Industry" error={errors.industry?.message}>
          <Input placeholder="Legal, hospitality, banking…" {...register('industry')} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="contactName" label="Your name" error={errors.contactName?.message} required>
          <Input autoComplete="name" {...register('contactName')} />
        </Field>

        <Field name="email" label="Work email" error={errors.email?.message} required>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="phone" label="Phone" error={errors.phone?.message} required>
          <Input type="tel" autoComplete="tel" {...register('phone')} />
        </Field>

        <Field
          name="headcount"
          label="How many people?"
          hint="Our corporate desk starts at six pieces."
          error={errors.headcount?.message}
        >
          <Input type="number" min={6} inputMode="numeric" {...register('headcount')} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-3 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
          Which cuts are you thinking about?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {GARMENT_TYPES.map((type) => {
            const id = `garment-${type.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <div key={type} className="flex items-center gap-3">
                <Checkbox
                  id={id}
                  checked={garmentTypes.includes(type)}
                  onCheckedChange={() => toggleGarment(type)}
                />
                <label htmlFor={id} className="cursor-pointer text-sm text-ink-muted">
                  {type}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="neededBy"
          label="Needed by"
          hint="Lead time is four to eight weeks depending on volume."
          error={errors.neededBy?.message}
        >
          <Input type="date" {...register('neededBy')} />
        </Field>

        <Field
          name="budgetNote"
          label="Budget or procurement notes"
          error={errors.budgetNote?.message}
        >
          <Input placeholder="Approved to ₦3.5m, needs a proforma" {...register('budgetNote')} />
        </Field>
      </div>

      <Field
        name="message"
        label="Tell us about the order"
        hint="What the tailoring is for, whether you have a cloth in mind, and where your people are based."
        error={errors.message?.message}
        required
      >
        <Textarea rows={6} {...register('message')} />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send enquiry'}
      </Button>

      <p className="text-xs leading-relaxed text-ink-faint">
        We use these details only to prepare your quote. Nothing is shared with anyone else.
      </p>
    </form>
  );
}
