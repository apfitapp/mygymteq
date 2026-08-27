import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { TrendingUp, Users, Zap, Clock, ShieldCheck } from 'lucide-react';

// Radar Chart Data: Peak Capacity & Utilization
const peakHoursData = [
  { zone: '6am - 8am (Morning Cardio)', current: 85, capacity: 100, fullMark: 100 },
  { zone: '8am - 10am (HIIT & Spin)', current: 92, capacity: 100, fullMark: 100 },
  { zone: '12pm - 2pm (Lunch Express)', current: 48, capacity: 100, fullMark: 100 },
  { zone: '4pm - 6pm (Personal Training)', current: 78, capacity: 100, fullMark: 100 },
  { zone: '6pm - 8pm (Prime Strength)', current: 96, capacity: 100, fullMark: 100 },
  { zone: '8pm - 10pm (Night Conditioning)', current: 64, capacity: 100, fullMark: 100 },
];

const radarConfig = {
  current: {
    label: 'Current Occupancy %',
    color: 'var(--accent)',
  },
  capacity: {
    label: 'Max Safe Capacity %',
    color: 'var(--muted)',
  },
} satisfies ChartConfig;

// Revenue & Collections Trend Data
const monthlyRevenueData = [
  { month: 'Sep', revenue: 145000, target: 120000, renewals: 95000, newJoins: 50000 },
  { month: 'Oct', revenue: 168000, target: 140000, renewals: 110000, newJoins: 58000 },
  { month: 'Nov', revenue: 195000, target: 160000, renewals: 125000, newJoins: 70000 },
  { month: 'Dec', revenue: 220000, target: 180000, renewals: 140000, newJoins: 80000 },
  { month: 'Jan', revenue: 278000, target: 220000, renewals: 175000, newJoins: 103000 },
  { month: 'Feb', revenue: 294000, target: 240000, renewals: 188000, newJoins: 106000 },
];

const revenueConfig = {
  revenue: {
    label: 'Total Collected (₹)',
    color: 'var(--accent)',
  },
  target: {
    label: 'Monthly Target (₹)',
    color: 'var(--ink-2)',
  },
  renewals: {
    label: 'Renewals (₹)',
    color: 'var(--ok)',
  },
  newJoins: {
    label: 'New Enrollments (₹)',
    color: 'var(--accent-strong)',
  },
} satisfies ChartConfig;

// Weekly Attendance Footfall Data
const weeklyAttendanceData = [
  { day: 'Mon', count: 184, avg: 160 },
  { day: 'Tue', count: 172, avg: 155 },
  { day: 'Wed', count: 165, avg: 150 },
  { day: 'Thu', count: 178, avg: 155 },
  { day: 'Fri', count: 192, avg: 165 },
  { day: 'Sat', count: 215, avg: 180 },
  { day: 'Sun', count: 130, avg: 120 },
];

const attendanceConfig = {
  count: {
    label: "Today's Visits",
    color: 'var(--accent)',
  },
  avg: {
    label: '30-Day Average',
    color: 'var(--muted)',
  },
} satisfies ChartConfig;

export const GymAnalyticsCharts: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'6m' | '1y'>('6m');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* 1. Radar Chart: Floor Capacity & Peak Hour Radar (5 Cols) */}
      <Card className="lg:col-span-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="font-display text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <span>Facility Peak Hour Radar</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-[var(--accent-soft)] text-[var(--accent-strong)] border-[var(--accent)]/30 font-mono font-bold">LIVE</Badge>
              </CardTitle>
              <CardDescription className="text-xs text-[var(--muted)]">
                Real-time occupancy across major time slots
              </CardDescription>
            </div>
            <div className="size-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center shrink-0">
              <Clock className="size-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 flex flex-col items-center justify-center">
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={peakHoursData}>
                <PolarGrid stroke="var(--line-strong)" strokeDasharray="3 3" opacity={0.6} />
                <PolarAngleAxis
                  dataKey="zone"
                  tick={{ fill: 'var(--ink-2)', fontSize: 10, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: 'var(--muted)', fontSize: 9 }}
                  stroke="var(--line)"
                />
                <Radar
                  name="Max Capacity"
                  dataKey="capacity"
                  stroke="var(--line-strong)"
                  fill="var(--surface-2)"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Current Occupancy %"
                  dataKey="current"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="var(--accent)"
                  fillOpacity={0.25}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2.5 shadow-md text-xs">
                          <p className="font-bold text-[var(--ink)]">{data.zone}</p>
                          <p className="font-mono text-[var(--accent-strong)] font-semibold mt-1">
                            Occupancy: {data.current}% ({data.current >= 90 ? '🔥 High Peak' : data.current >= 65 ? '⚡ Moderate' : '✅ Open'})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-[var(--line)] text-center text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--muted)] font-mono uppercase">Peak Window</span>
              <span className="font-bold text-[var(--ink)] text-xs mt-0.5">6pm - 8pm</span>
            </div>
            <div className="flex flex-col border-x border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] font-mono uppercase">Current Util.</span>
              <span className="font-mono font-bold text-[var(--ok)] text-xs mt-0.5">74.8%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--muted)] font-mono uppercase">Trainer Ratio</span>
              <span className="font-mono font-bold text-[var(--ink)] text-xs mt-0.5">1 : 14</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Area/Bar Tabbed Performance Charts (7 Cols) */}
      <Card className="lg:col-span-7 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm flex flex-col justify-between overflow-hidden">
        <Tabs defaultValue="revenue" className="w-full flex flex-col h-full">
          <CardHeader className="p-5 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <CardTitle className="font-display text-base font-bold text-[var(--ink)]">
                  Financial & Member Growth Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-[var(--muted)]">
                  Monthly recurring collections, target pacing, and daily visits
                </CardDescription>
              </div>

              <TabsList className="bg-[var(--surface-2)] border border-[var(--line)] p-0.5 h-8">
                <TabsTrigger value="revenue" className="text-xs px-3 py-1 font-semibold data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-xs">
                  Revenue
                </TabsTrigger>
                <TabsTrigger value="attendance" className="text-xs px-3 py-1 font-semibold data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-xs">
                  Footfall
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
            {/* Tab 1: Revenue Area Chart */}
            <TabsContent value="revenue" className="mt-0 space-y-4">
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 500 }}
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
                            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 shadow-lg text-xs flex flex-col gap-1">
                              <p className="font-display font-bold text-[var(--ink)]">{d.month} Collection</p>
                              <p className="font-mono font-bold text-[var(--ok)] text-sm">₹{d.revenue.toLocaleString('en-IN')}</p>
                              <div className="pt-1 border-t border-[var(--line)] flex justify-between gap-4 text-[10px] text-[var(--muted)] font-mono">
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
                      stroke="var(--accent)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[var(--accent)]"></div>
                  <span className="text-[var(--ink-2)] font-medium">Monthly Collections:</span>
                  <strong className="font-mono text-[var(--ink)]">₹2,94,000</strong>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--ok)] font-mono font-bold">
                  <TrendingUp className="size-3.5" />
                  <span>+18.4% MoM growth</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Attendance Weekly Bar Chart */}
            <TabsContent value="attendance" className="mt-0 space-y-4">
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2.5 shadow-md text-xs">
                              <p className="font-bold text-[var(--ink)]">{d.day} Check-Ins</p>
                              <p className="font-mono text-[var(--accent-strong)] font-semibold mt-0.5">{d.count} Members</p>
                              <p className="text-[10px] text-[var(--muted)] font-mono mt-0.5">30-day Avg: {d.avg}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--accent)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[var(--accent)]"></div>
                  <span className="text-[var(--ink-2)] font-medium">Busiest Day:</span>
                  <strong className="text-[var(--ink)]">Saturday (215 check-ins)</strong>
                </div>
                <div className="flex items-center gap-1 text-[var(--muted)] font-mono text-[11px]">
                  <span>Weekly Avg: 177 / day</span>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

    </div>
  );
};
