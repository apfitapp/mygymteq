import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'ok' | 'err';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}) => {
  const borderClass =
    variant === 'err'
      ? 'border-destructive/40'
      : variant === 'ok'
      ? 'border-ok/30'
      : variant === 'accent'
      ? 'border-primary/30'
      : 'border-border';

  return (
    <Card className={`shadow-xs ${borderClass}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardDescription className="text-[11px] font-mono font-bold uppercase tracking-wider">
          {title}
        </CardDescription>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
