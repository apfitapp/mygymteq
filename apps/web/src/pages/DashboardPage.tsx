import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  CalendarCheck,
  IndianRupee,
  AlertCircle,
  Plus,
  CreditCard,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

  const formatCurrency = (paise: number) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
  };

  return (
    <AppShell title="Operations Dashboard" breadcrumb={gym?.name || 'Iron House Fitness'}>
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

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9">
            <a href="#/members/new">
              <Plus className="mr-1.5 size-4" /> Add Member
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="font-medium text-xs h-9">
            <a href="#/payments">
              <CreditCard className="mr-1.5 size-4" /> Collect Payment
            </a>
          </Button>
        </div>
      </section>

      {/* KPI Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-sm border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          Failed to load dashboard metrics: {(error as any).message}
        </div>
      ) : (
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
            value={formatCurrency(metrics?.monthlyRevenue || 0)}
            subtitle="Collected this month"
            variant="default"
            icon={<IndianRupee className="size-4" />}
          />
          <StatCard
            title="Pending Dues"
            value={formatCurrency(metrics?.pendingDues || 0)}
            subtitle="Outstanding balance"
            variant={(metrics?.pendingDues || 0) > 0 ? 'err' : 'default'}
            icon={<AlertCircle className="size-4" />}
          />
        </div>
      )}
      {/* Financial Target Pacing & Dues Breakdown */}
      <FinancialPacingGauge
        currentRevenue={(metrics?.monthlyRevenue || 0) / 100}
        pendingDues={(metrics?.pendingDues || 0) / 100}
      />

      {/* Visual Analytics & Radar Charts */}
      <GymAnalyticsCharts />

      {/* Retention Churn Radar & WhatsApp Renewal Queue (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetentionChurnRadar />
        <RenewalRecoveryCenter />
      </div>

      {/* Two Columns: Expiring Memberships & Recent Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Memberships */}
        <Card className="glass-card shadow-xs rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <div>
              <CardTitle className="font-display text-base">Expiring Memberships</CardTitle>
              <CardDescription className="text-xs">Upcoming renewals within next 7 days</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {metrics?.expiringSoon?.length || 0} Members
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {!metrics?.expiringSoon || metrics.expiringSoon.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground px-4">
                No memberships approaching expiry in the next 7 days.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {metrics.expiringSoon.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/40 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {m.first_name} {m.last_name || ''}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {m.plan_name} • Exp: {new Date(m.end_date * 1000).toLocaleDateString('en-IN')}
                      </span>
                      {m.due_amount > 0 && (
                        <span className="text-[10px] font-mono text-destructive font-semibold">
                          Pending Due: {formatCurrency(m.due_amount)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {m.whatsapp_url && (
                        <Button asChild size="sm" variant="outline" className="h-8 px-2.5 text-xs text-[#25D366] hover:text-[#20BA5A] border-[#25D366]/30">
                          <a href={m.whatsapp_url} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="size-3.5 mr-1 fill-current" /> WhatsApp
                          </a>
                        </Button>
                      )}
                      <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs">
                        <a href={`#/members/${m.id}/renew`}>
                          Renew
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Collections */}
        <Card className="glass-card shadow-xs rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <div>
              <CardTitle className="font-display text-base">Recent Collections</CardTitle>
              <CardDescription className="text-xs">Latest recorded transactions</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7">
              <a href="#/payments">View All</a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {!metrics?.recentPayments || metrics.recentPayments.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground px-4">
                No recent payment transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {metrics.recentPayments.slice(0, 6).map((p: any) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/40 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {p.first_name} {p.last_name || ''}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                          {p.payment_mode}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {p.receipt_number} • {new Date(p.payment_date * 1000).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-bold text-foreground">
                        {formatCurrency(p.amount)}
                      </span>
                      {p.whatsapp_url && (
                        <Button asChild size="icon" variant="ghost" className="size-8 text-[#25D366] hover:bg-[#25D366]/10" title="Share WhatsApp Receipt">
                          <a href={p.whatsapp_url} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="size-4 fill-current" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};
