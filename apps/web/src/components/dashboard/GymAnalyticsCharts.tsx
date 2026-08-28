import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Users, CalendarCheck, Tag, Info } from 'lucide-react';

interface GymAnalyticsChartsProps {
  weeklyAttendance?: { day: string; date: string; count: number; avg: number }[];
  monthlyRevenueTrend?: { month: string; revenue: number; renewals: number; newJoins: number }[];
  planDistribution?: { name: string; memberCount: number; revenue: number }[];
}

const PIE_COLORS = ['#00C96E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

export const GymAnalyticsCharts: React.FC<GymAnalyticsChartsProps> = ({
  weeklyAttendance = [],
  monthlyRevenueTrend = [],
  planDistribution = [],
}) => {
  const hasRevenueData = monthlyRevenueTrend.some((d) => (d.revenue || 0) > 0);
  const hasAttendanceData = weeklyAttendance.some((d) => (d.count || 0) > 0);
  const hasPlanData = planDistribution.some((p) => (p.memberCount || 0) > 0);

  const totalMonthlyRevenue = monthlyRevenueTrend.length > 0
    ? monthlyRevenueTrend[monthlyRevenueTrend.length - 1]?.revenue || 0
    : 0;

  const totalWeeklyVisits = weeklyAttendance.reduce((sum, d) => sum + (d.count || 0), 0);
  const busiestDay = [...weeklyAttendance].sort((a, b) => (b.count || 0) - (a.count || 0))[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* 1. Plan Distribution / Membership Health (5 Cols) */}
      <Card className="lg:col-span-5 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <span>Plan Enrollment Distribution</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30 font-mono font-bold">
                  ACTIVE
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Active member volume across catalog packages
              </CardDescription>
            </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Tag className="size-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 flex flex-col items-center justify-center flex-1">
          {!hasPlanData ? (
            <div className="w-full h-64 flex flex-col items-center justify-center text-center p-4">
              <div className="size-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-2">
                <Tag className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">No Plan Subscriptions Yet</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                Active plans and their member distributions will be displayed here as members enroll.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col">
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      dataKey="memberCount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                              <p className="font-bold text-foreground">{data.name}</p>
                              <p className="font-mono text-primary font-semibold mt-0.5">
                                {data.memberCount} active member{data.memberCount !== 1 ? 's' : ''}
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                Total: ₹{(data.revenue || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Plan legend list */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                {planDistribution.slice(0, 4).map((plan, i) => (
                  <div key={plan.name} className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-[11px] text-foreground truncate font-medium">{plan.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-auto shrink-0">
                      {plan.memberCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Area/Bar Tabbed Performance Charts (7 Cols) */}
      <Card className="lg:col-span-7 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden">
        <Tabs defaultValue="revenue" className="w-full flex flex-col h-full">
          <CardHeader className="p-5 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <CardTitle className="font-display text-base font-bold text-foreground">
                  Performance &amp; Attendance Trends
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Real database calculations for collections and daily visits
                </CardDescription>
              </div>

              <TabsList className="bg-secondary border border-border p-0.5 h-8">
                <TabsTrigger
                  value="revenue"
                  className="text-xs px-3 py-1 font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  Collections (6 Mo)
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="text-xs px-3 py-1 font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  Visits (7 Days)
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
            {/* Tab 1: Revenue Area Chart */}
            <TabsContent value="revenue" className="mt-0 space-y-4">
              {!hasRevenueData ? (
                <div className="w-full h-56 sm:h-64 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg">
                  <TrendingUp className="size-8 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Collection History Recorded</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                    Payments recorded through front desk billing will automatically track here.
                  </p>
                </div>
              ) : (
                <div className="w-full h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                        tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-xs flex flex-col gap-1">
                                <p className="font-display font-bold text-foreground">{d.month} Collection</p>
                                <p className="font-mono font-bold text-ok text-sm">₹{d.revenue.toLocaleString('en-IN')}</p>
                                <div className="pt-1 border-t border-border flex justify-between gap-4 text-[10px] text-muted-foreground font-mono">
                                  <span>Renewals: ₹{d.renewals.toLocaleString('en-IN')}</span>
                                  <span>New: ₹{d.newJoins.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#revGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground font-medium">Latest Month:</span>
                  <strong className="font-mono text-foreground">₹{totalMonthlyRevenue.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-[11px] font-mono">
                  <span>6-Month Trend Overview</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Attendance Weekly Bar Chart */}
            <TabsContent value="attendance" className="mt-0 space-y-4">
              {!hasAttendanceData ? (
                <div className="w-full h-56 sm:h-64 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg">
                  <CalendarCheck className="size-8 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Attendance Logged in Past 7 Days</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                    Member check-ins from the fast kiosk or QR scanner will plot daily footfall here.
                  </p>
                </div>
              ) : (
                <div className="w-full h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                                <p className="font-bold text-foreground">{d.day} ({d.date})</p>
                                <p className="font-mono text-primary font-semibold mt-0.5">
                                  {d.count} Check-in{d.count !== 1 ? 's' : ''}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  30-day Daily Avg: {d.avg}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground font-medium">Busiest Day:</span>
                  <strong className="text-foreground">
                    {busiestDay && busiestDay.count > 0
                      ? `${busiestDay.day} (${busiestDay.count} visits)`
                      : 'None yet'}
                  </strong>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px]">
                  <span>Total 7-Day Visits: {totalWeeklyVisits}</span>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

    </div>
  );
};
