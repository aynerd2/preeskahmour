import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[110px] w-full border border-ink/20 bg-ivory px-3.5 py-2.5 font-sans text-[0.95rem] leading-relaxed text-ink transition-colors placeholder:text-ink-faint',
      'hover:border-ink/40 focus:border-emerald focus:outline-none',
      'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
      'aria-[invalid=true]:border-destructive',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
