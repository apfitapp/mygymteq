import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, IndianRupee, CalendarCheck, AlertCircle, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

const COLORS = ['#00C96E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

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

  const totalRev = planBreakdown.reduce((sum: number, b: any) => sum + (b.revenue || 0), 0);

  const chartData = planBreakdown.map((item: any, i: number) => ({
    name: item.name,
    revenue: (item.revenue || 0) / 100,
    count: item.count || 0,
    fill: COLORS[i % COLORS.length],
  }));

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

      {/* Visual Revenue Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart of Plan Revenue (7 Cols) */}
        <Card className="lg:col-span-7 border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="font-display text-base">Revenue by Membership Plan</CardTitle>
            <CardDescription className="text-xs">
              Comparing collections generated across different offerings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            {chartData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                No revenue distribution data
              </div>
            ) : (
              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted)', fontSize: 10 }}
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                              <p className="font-bold text-foreground">{d.name}</p>
                              <p className="font-mono text-primary font-bold mt-1">₹{d.revenue.toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{d.count} Members Enrolled</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Enrollment Share Pie Chart (5 Cols) */}
        <Card className="lg:col-span-5 border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="font-display text-base">Enrollment Distribution</CardTitle>
            <CardDescription className="text-xs">
              Member count share per package
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-3 flex flex-col items-center justify-center">
            {chartData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                No member distribution data
              </div>
            ) : (
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-card p-2 shadow-md text-xs">
                              <p className="font-bold text-foreground">{d.name}</p>
                              <p className="font-mono text-xs">{d.count} Members</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="w-full pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
              {chartData.slice(0, 4).map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 min-w-0">
                  <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }}></div>
                  <span className="text-[11px] text-muted-foreground truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Revenue Breakdown Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="font-display text-base">Package Performance Ledger</CardTitle>
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
