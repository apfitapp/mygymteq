import React from 'react';
import { Badge } from './badge';

interface GymStatusBadgeProps {
  status: string;
  size?: 'default' | 'sm';
}

export const GymStatusBadge: React.FC<GymStatusBadgeProps> = ({ status }) => {
  const s = (status || 'ACTIVE').toUpperCase();

  if (s === 'ACTIVE') {
    return (
      <Badge className="bg-ok/10 text-ok border-ok/20 hover:bg-ok/20">
        <span className="size-1.5 rounded-full bg-ok mr-1.5"></span>
        Active
      </Badge>
    );
  }

  if (s === 'EXPIRED') {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
        <span className="size-1.5 rounded-full bg-destructive mr-1.5"></span>
        Expired
      </Badge>
    );
  }

  if (s === 'SUSPENDED') {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
        <span className="size-1.5 rounded-full bg-destructive mr-1.5"></span>
        Suspended
      </Badge>
    );
  }

  if (s === 'FROZEN') {
    return (
      <Badge className="bg-muted-background text-muted-foreground border-border hover:bg-secondary">
        Frozen
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      {status}
    </Badge>
  );
};
