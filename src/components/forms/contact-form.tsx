'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Field, FormSuccess, Honeypot } from './field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_TOPICS, contactSchema, type ContactInput } from '@/lib/validators';

export function ContactForm() {
  const searchParams = useSearchParams();
  // /contact?topic=Sizing pre-selects the reason, so links from the
  // measurement guide and fabric pages land people in the right conversation.
  const topicParam = searchParams.get('topic');
  const initialTopic = (CONTACT_TOPICS as readonly string[]).includes(topicParam ?? '')
    ? (topicParam as ContactInput['topic'])
    : 'General';

  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: initialTopic, name: '', email: '', phone: '', message: '' },
  });

  async function onSubmit(values: ContactInput) {
    try {
      const res = await fetch('/api/contact', {
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
        description:
          error instanceof Error ? error.message : 'Try again, or email us directly.',
      });
    }
  }

  if (sent) {
    return (
      <FormSuccess
        title="Message received"
        body="Someone in the atelier will reply within one working day. If it is urgent, WhatsApp is faster."
      >
        <Button variant="outline" onClick={() => setSent(false)}>
          Send another
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-6">
      <Honeypot register={register('website')} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label="Your name" error={errors.name?.message} required>
          <Input autoComplete="name" {...register('name')} />
        </Field>

        <Field name="email" label="Email" error={errors.email?.message} required>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="phone" label="Phone or WhatsApp" error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" placeholder="0801 234 5678" {...register('phone')} />
        </Field>

        <Field name="topic" label="What is it about?" error={errors.topic?.message} required>
          <select
            className="flex h-11 w-full border border-ink/20 bg-ivory px-3.5 text-[0.95rem] text-ink transition-colors hover:border-ink/40 focus:border-emerald focus:outline-none"
            {...register('topic')}
          >
            {CONTACT_TOPICS.filter((t) => t !== 'Newsletter').map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field name="message" label="Message" error={errors.message?.message} required>
        <Textarea rows={6} {...register('message')} />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>

      <p className="text-xs leading-relaxed text-ink-faint">
        We use your details only to reply to this message. Nothing is shared with anyone else.
      </p>
    </form>
  );
}
