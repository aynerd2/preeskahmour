import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * House button. Sharp corners, wide letter-spacing, uppercase — the language
 * of a garment label rather than a SaaS dashboard. Gold is reserved for the
 * focus ring and the `gold` variant; it is never a default fill.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-editorial disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-emerald text-ivory hover:bg-emerald-deep active:translate-y-px shadow-[0_1px_0_0_rgba(20,17,15,0.06)]',
        gold: 'bg-gold text-ink hover:bg-gold-deep hover:text-ivory active:translate-y-px',
        ink: 'bg-ink text-ivory hover:bg-ink-soft active:translate-y-px',
        outline:
          'border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-ivory',
        'outline-light':
          'border border-ivory/45 bg-transparent text-ivory hover:border-ivory hover:bg-ivory hover:text-ink',
        ghost: 'bg-transparent text-ink hover:bg-cream',
        link: 'h-auto p-0 text-ink underline-offset-4 hover:text-emerald hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-6',
        lg: 'h-14 px-9 text-[0.78rem] tracking-[0.18em]',
        icon: 'h-10 w-10 px-0',
      },
      full: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', full: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, full }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
