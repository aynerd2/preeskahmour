'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Page heading with an optional primary action. */
export function StudioHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  back?: { label: string; href: string };
}) {
  return (
    <header className="mb-8">
      {back ? (
        <Link
          href={back.href}
          className="mb-4 inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {back.label}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
          ) : null}
        </div>

        {action ? (
          <Button asChild className="shrink-0">
            <Link href={action.href}>
              <Plus className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}

/** Simple responsive table. Collapses to stacked cards below `sm`. */
export function StudioTable<T extends { id: string }>({
  rows,
  columns,
  href,
  empty,
}: {
  rows: T[];
  columns: {
    key: string;
    header: string;
    render: (row: T) => React.ReactNode;
    className?: string;
    /** Hidden on small screens where space is tight. */
    hideOnMobile?: boolean;
  }[];
  href?: (row: T) => string;
  empty: { title: string; body?: string; action?: React.ReactNode };
}) {
  if (rows.length === 0) {
    return (
      <div className="motif-diamond border border-dashed border-ink/20 px-6 py-14 text-center">
        <h2 className="font-display text-lg text-ink">{empty.title}</h2>
        {empty.body ? (
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            {empty.body}
          </p>
        ) : null}
        {empty.action ? <div className="mt-5">{empty.action}</div> : null}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-ink/12 bg-background">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b border-ink/12">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink-faint',
                  column.hideOnMobile && 'hidden md:table-cell',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-ink/8">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-cream/40">
              {columns.map((column, i) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 align-middle',
                    column.hideOnMobile && 'hidden md:table-cell',
                    column.className,
                  )}
                >
                  {/* Only the first cell is the row link, so action buttons
                      in later cells stay clickable. */}
                  {href && i === 0 ? (
                    <Link href={href(row)} className="block hover:text-emerald">
                      {column.render(row)}
                    </Link>
                  ) : (
                    column.render(row)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Delete with a confirmation step. Never deletes on a single click. */
export function DeleteButton({
  onDelete,
  label,
  description,
  redirectTo,
  variant = 'icon',
}: {
  onDelete: () => Promise<{ ok: true } | { ok: false; error: string }>;
  label: string;
  description?: string;
  redirectTo?: string;
  variant?: 'icon' | 'button';
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function run() {
    setPending(true);
    try {
      const result = await onDelete();
      if (result.ok) {
        toast.success('Deleted');
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error('Could not delete that', { description: result.error });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center text-ink-faint transition-colors hover:text-destructive"
          aria-label={`Delete ${label}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {label}?</DialogTitle>
            <DialogDescription>
              {description ?? 'This cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={run} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Small status pill used across orders and the inbox. */
export function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info';
}) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em]',
        tone === 'neutral' && 'border-ink/15 bg-cream text-ink-muted',
        tone === 'good' && 'border-emerald/25 bg-emerald-wash text-emerald-deep',
        tone === 'warn' && 'border-gold/45 bg-gold-wash text-gold-deep',
        tone === 'bad' && 'border-terracotta/30 bg-terracotta-wash text-terracotta-deep',
        tone === 'info' && 'border-indigo/25 bg-indigo-wash text-indigo-deep',
      )}
    >
      {children}
    </span>
  );
}

/** Sticky save bar at the bottom of every editor. */
export function FormActions({
  pending,
  onCancel,
  saveLabel = 'Save',
  extra,
}: {
  pending: boolean;
  onCancel: () => void;
  saveLabel?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-10 flex items-center gap-3 border-t border-ink/12 bg-ivory-deep/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {extra}
      <Button type="submit" disabled={pending} className="ml-auto min-w-[9rem]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? 'Saving…' : saveLabel}
      </Button>
    </div>
  );
}

export function Fieldset({
  legend,
  hint,
  children,
  className,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn('border border-ink/12 bg-background p-5 sm:p-6', className)}>
      <legend className="bg-background px-2 text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
        {legend}
      </legend>
      {hint ? <p className="mb-5 text-xs leading-relaxed text-ink-faint">{hint}</p> : null}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}
