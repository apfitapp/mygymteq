import React from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'ok' | 'err';
  prefix?: string;
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, { chip: string; ring: string }> = {
  default: { chip: 'bg-secondary text-foreground', ring: '' },
  accent: { chip: 'bg-primary/10 text-primary', ring: 'ring-1 ring-primary/20' },
  ok: { chip: 'bg-ok/10 text-ok', ring: 'ring-1 ring-ok/20' },
  err: { chip: 'bg-destructive/10 text-destructive', ring: 'ring-1 ring-destructive/20' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  prefix,
}) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn('card-hover-lift p-4 sm:p-5 border-border bg-card shadow-xs transition-all', styles.ring)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          {title}
        </p>
        {icon && (
          <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg shadow-2xs', styles.chip)}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {typeof value === 'number' ? (
          <AnimatedCounter value={value} prefix={prefix} />
        ) : (
          value
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </Card>
  );
};

