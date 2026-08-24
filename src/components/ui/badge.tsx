import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap border px-2.5 py-1 font-sans text-[0.62rem] font-medium uppercase tracking-[0.16em]',
  {
    variants: {
      variant: {
        default: 'border-ink/15 bg-cream text-ink-muted',
        emerald: 'border-emerald/25 bg-emerald-wash text-emerald-deep',
        gold: 'border-gold/45 bg-gold-wash text-gold-deep',
        terracotta: 'border-terracotta/30 bg-terracotta-wash text-terracotta-deep',
        indigo: 'border-indigo/25 bg-indigo-wash text-indigo-deep',
        outline: 'border-ink/25 bg-transparent text-ink',
        solid: 'border-transparent bg-ink text-ivory',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
