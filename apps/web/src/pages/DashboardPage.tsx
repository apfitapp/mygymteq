import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/shared/PageContainer';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentCollectionsCard } from '@/components/dashboard/RecentCollectionsCard';
import { GymAnalyticsCharts } from '@/components/dashboard/GymAnalyticsCharts';
import { FinancialPacingGauge } from '@/components/dashboard/FinancialPacingGauge';
import { RetentionChurnRadar } from '@/components/dashboard/RetentionChurnRadar';
import { RenewalRecoveryCenter } from '@/components/dashboard/RenewalRecoveryCenter';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export const DashboardPage: React.FC = () => {
  const { user, gym } = useAuth();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppShell title="Operations Dashboard" breadcrumb={gym?.name || 'GymTech'}>
      <PageContainer>
        {/* Top Banner & Quick Actions */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {gym?.name || 'Fitness Studio'}
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Owner'}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{todayFormatted}</p>
          </div>

          <QuickActions />
        </section>

        {/* KPI Metric Cards */}
        {error ? (
          <div className="p-4 rounded-sm border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
            Failed to load dashboard metrics: {(error as any).message}
          </div>
        ) : (
          <DashboardStats metrics={metrics} isLoading={isLoading} />
        )}

        {/* Financial Target Pacing & Dues Breakdown */}
        <FinancialPacingGauge
          currentRevenue={(metrics?.monthlyRevenue || 0) / 100}
          pendingDues={(metrics?.pendingDues || 0) / 100}
          activeMembers={metrics?.activeMembers || 0}
        />

        {/* Visual Analytics Charts (Real Database Calculations) */}
        <GymAnalyticsCharts
          weeklyAttendance={metrics?.weeklyAttendance}
          monthlyRevenueTrend={metrics?.monthlyRevenueTrend}
          planDistribution={metrics?.planDistribution}
        />

        {/* Retention Churn Radar & WhatsApp Renewal Queue (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RetentionChurnRadar
            atRiskMembers={metrics?.atRiskMembers || []}
            gymName={gym?.name || 'GymTech'}
          />
          <RenewalRecoveryCenter
            expiringMembers={metrics?.expiringSoon || []}
            gymName={gym?.name || 'GymTech'}
          />
        </div>

        {/* Recent Collections */}
        <RecentCollectionsCard recentPayments={metrics?.recentPayments} />
      </PageContainer>
    </AppShell>
  );
};
