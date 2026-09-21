'use client';
//Very important to have this file be a client component, otherwise the error boundary will not work correctly.

import * as React from 'react';
import Link from 'next/link';

import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // The digest is the only handle on the server-side stack, so surface it.
    console.error('[app] unhandled error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="motif-diamond flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
      <Wordmark className="text-ink" />

      <h1 className="mt-14 text-display-sm text-ink">Something came apart at the seam</h1>

      <p className="mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-muted">
        An error on our side, not yours. Try again — and if it keeps happening, tell us and we will
        fix it.
      </p>

      {error.digest ? (
        <p className="mt-4 font-mono text-[0.68rem] text-ink-faint">Reference: {error.digest}</p>
      ) : null}

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Back to the house</Link>
        </Button>
      </div>
    </div>
  );
}
