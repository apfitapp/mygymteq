import React from 'react';
import { Users, CalendarCheck, IndianRupee, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
  metrics?: {
    activeMembers?: number;
    todayAttendance?: number;
    monthlyRevenue?: number;
    pendingDues?: number;
  };
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  const monthlyRev = (metrics?.monthlyRevenue || 0) / 100;
  const pendingDues = (metrics?.pendingDues || 0) / 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <StatCard
        title="Active Members"
        value={metrics?.activeMembers || 0}
        subtitle="Currently enrolled"
        variant="accent"
        icon={<Users className="size-4" />}
      />
      <StatCard
        title="Today's Check-ins"
        value={metrics?.todayAttendance || 0}
        subtitle="Verified at desk"
        variant="ok"
        icon={<CalendarCheck className="size-4" />}
      />
      <StatCard
        title="Monthly Revenue"
        value={monthlyRev}
        prefix="₹"
        subtitle="Collected this month"
        variant="default"
        icon={<IndianRupee className="size-4" />}
      />
      <StatCard
        title="Pending Dues"
        value={pendingDues}
        prefix="₹"
        subtitle="Outstanding balance"
        variant={pendingDues > 0 ? 'err' : 'default'}
        icon={<AlertCircle className="size-4" />}
      />
    </div>
  );
};

