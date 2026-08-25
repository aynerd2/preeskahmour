'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Form field wrapper: label, optional hint, the control, and an error that is
 * announced to screen readers. Every public form uses this so error handling
 * is consistent and nothing relies on colour alone to signal a problem.
 */
export function Field({
  name,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required ? (
          <span className="ml-1 text-gold-deep" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 normal-case tracking-normal text-ink-faint">(optional)</span>
        )}
      </Label>

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-ink-faint">
          {hint}
        </p>
      ) : null}

      {/*
        Wires aria-describedby / aria-invalid onto whatever control is passed
        in, so callers do not have to remember to do it on every field.
      */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id: name,
            name,
            'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? true : undefined,
          })
        : children}

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Hidden honeypot. Positioned off-screen rather than `display: none`, because
 * some bots skip fields that are display-none but happily fill this one.
 */
export function Honeypot({ register }: { register?: Record<string, unknown> }) {
  return (
    <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="website">Leave this field empty</label>
      <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register} />
    </div>
  );
}

/** Consistent success panel shown in place of a form after submission. */
export function FormSuccess({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="motif-diamond border border-gold/40 bg-gold-wash/40 px-6 py-10 text-center sm:px-10">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[0.96rem] leading-relaxed text-ink-muted">{body}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
