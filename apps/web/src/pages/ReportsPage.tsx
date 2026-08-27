import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, IndianRupee, CalendarCheck, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { api } from '@/lib/api';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.getReports(),
  });

  const metrics = data?.metrics;
  const planBreakdown = data?.planBreakdown || [];

  const formatCurrency = (paise: number) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
  };

  return (
    <AppShell title="Reports & Insights" breadcrumb="Operations">
      {/* Header with period toggle */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Business Reports &amp; Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Track member retention, monthly collections, and package popularity
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-2 border border-border rounded-lg">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'month' ? 'This Month' : p === 'quarter' ? 'Last 3 Months' : 'This Year'}
            </button>
          ))}
        </div>
      </section>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Members"
          value={metrics?.activeMembers || 0}
          subtitle="Currently enrolled"
          variant="accent"
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(metrics?.monthlyRevenue || 0)}
          subtitle="Collected this month"
          variant="ok"
          icon={<IndianRupee className="size-4" />}
        />
        <StatCard
          title="Today's Attendance"
          value={metrics?.todayAttendance || 0}
          subtitle="Checked in today"
          variant="default"
          icon={<CalendarCheck className="size-4" />}
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(metrics?.pendingDues || 0)}
          subtitle="Outstanding balance"
          variant={(metrics?.pendingDues || 0) > 0 ? 'err' : 'default'}
          icon={<AlertCircle className="size-4" />}
        />
      </div>

      {/* Package Revenue Breakdown */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="font-display text-base">Membership Package Revenue Distribution</CardTitle>
          <CardDescription className="text-xs">
            Performance comparison of offerings across enrolled members
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-2 hover:bg-surface-2">
                <TableHead className="font-mono text-[10px] uppercase">Plan Name</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-center">Enrolled Members</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-right">Total Revenue</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-right">Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                    Calculating metrics...
                  </TableCell>
                </TableRow>
              ) : planBreakdown.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                    No active membership plan data available.
                  </TableCell>
                </TableRow>
              ) : (
                planBreakdown.map((item: any) => {
                  const totalRev = planBreakdown.reduce((sum: number, b: any) => sum + (b.revenue || 0), 0);
                  const percentage = totalRev > 0 ? Math.round(((item.revenue || 0) / totalRev) * 100) : 0;

                  return (
                    <TableRow key={item.name} className="hover:bg-secondary/40">
                      <TableCell className="font-semibold text-xs text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {item.count || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                        {formatCurrency(item.revenue || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-primary font-bold">
                        {percentage}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
};
