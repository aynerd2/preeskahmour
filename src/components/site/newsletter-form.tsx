'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

/**
 * Newsletter capture. Posts to /api/contact with topic "Newsletter" so signups
 * land in the same /studio inbox as everything else rather than needing a
 * separate mailing-list integration on day one.
 */
export function NewsletterForm() {
  const [email, setEmail] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter signup',
          email,
          topic: 'Newsletter',
          message: 'Requested the atelier letter from the site footer.',
        }),
      });
      if (!res.ok) throw new Error('Request failed');

      setDone(true);
      setEmail('');
      toast.success('You are on the list.', {
        description: 'Letters go out once a month, never more.',
      });
    } catch {
      toast.error('That did not go through.', {
        description: 'Try again in a moment, or email us directly.',
      });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="border border-gold/40 bg-ivory/5 px-5 py-6 text-sm leading-relaxed text-ivory/80">
        You are on the list. Look out for the next letter from the atelier.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex border-b border-ivory/25 transition-colors focus-within:border-gold">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          className="h-14 w-full bg-transparent text-[0.95rem] text-ivory placeholder:text-ivory/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex shrink-0 items-center gap-2 px-2 text-[0.7rem] uppercase tracking-[0.18em] text-gold transition-opacity disabled:opacity-40"
        >
          {pending ? 'Sending' : 'Sign up'}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <p className="mt-3 text-xs text-ivory/35">
        We will never share your address. Unsubscribe in one click.
      </p>
    </form>
  );
}
