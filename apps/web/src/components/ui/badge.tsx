import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--accent-soft)] text-[var(--accent-strong)]',
        success: 'border-transparent bg-[var(--ok-soft)] text-[var(--ok)]',
        destructive: 'border-transparent bg-[var(--err-soft)] text-[var(--err)]',
        warning: 'border-transparent bg-[var(--warn-soft)] text-[var(--warn)]',
        info: 'border-transparent bg-[var(--info-soft)] text-[var(--info)]',
        outline: 'border-[var(--line-strong)] text-[var(--ink-2)]',
        secondary: 'border-transparent bg-[var(--surface-2)] text-[var(--ink-2)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
