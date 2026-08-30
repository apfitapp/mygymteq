import React from 'react';
import { IndianRupee, CreditCard, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';

interface PaymentStatsProps {
  summary: {
    monthlyRevenue?: number;
    todayRevenue?: number;
    pendingDues?: number;
  };
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Monthly Collections"
        value={formatCurrency(summary.monthlyRevenue || 0)}
        subtitle="This calendar month"
        variant="ok"
        icon={<IndianRupee className="size-4" />}
      />
      <StatCard
        title="Today's Collections"
        value={formatCurrency(summary.todayRevenue || 0)}
        subtitle="Collected today"
        variant="accent"
        icon={<CreditCard className="size-4" />}
      />
      <StatCard
        title="Pending Dues"
        value={formatCurrency(summary.pendingDues || 0)}
        subtitle="Total member dues"
        variant={(summary.pendingDues || 0) > 0 ? 'err' : 'default'}
        icon={<AlertCircle className="size-4" />}
      />
    </div>
  );
};
