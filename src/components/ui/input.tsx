import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full border border-ink/20 bg-ivory px-3.5 py-2 font-sans text-[0.95rem] text-ink transition-colors placeholder:text-ink-faint',
        'hover:border-ink/40 focus:border-emerald focus:outline-none focus:ring-0',
        'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
        'aria-[invalid=true]:border-destructive',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
