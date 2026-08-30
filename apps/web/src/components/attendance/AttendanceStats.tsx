import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AttendanceStatsProps {
  count: number;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ count }) => {
  return (
    <Badge
      variant="outline"
      className="text-xs font-mono font-bold bg-ok/10 text-ok border-ok/30 px-3 py-1"
    >
      <span className="size-2 rounded-full bg-ok animate-pulse mr-2" />
      {count} Checked In Today
    </Badge>
  );
};
