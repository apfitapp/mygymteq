import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 5,
  className = '',
}) => {
  return (
    <div className={`w-full p-4 space-y-3 shimmer-effect ${className}`}>
      <div className="flex gap-4 pb-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 flex-1 rounded-sm" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`cell-${r}-${c}`} className="h-4 flex-1 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface CardGridSkeletonProps {
  count?: number;
  className?: string;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 3,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-36 p-5 flex flex-col justify-between border-border bg-secondary/30 shimmer-effect">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3 rounded-sm" />
            <Skeleton className="h-6 w-2/3 rounded-sm" />
          </div>
          <Skeleton className="h-3 w-1/2 rounded-sm" />
        </Card>
      ))}
    </div>
  );
};
