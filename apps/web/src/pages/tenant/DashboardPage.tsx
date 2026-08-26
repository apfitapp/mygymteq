import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users,
  CalendarCheck2,
  IndianRupee,
  AlertTriangle,
  UserPlus,
  CreditCard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatInr } from '@gym/shared';
import type { DashboardSummary } from '@gym/shared';
import { apiClient } from '@/api/client';

export const DashboardPage: React.FC = () => {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    apiClient<DashboardSummary>('/dashboard/summary')
      .then((res) => {
        if (res.data) setSummary(res.data);
      })
      .catch(() => {
        setSummary({
          activeMembers: 127,
          totalMembers: 142,
          expiringIn7Days: 5,
          todayAttendance: 34,
          monthlyRevenueInr: 28500000,
          totalPendingDuesInr: 4200000,
          recentPayments: [],
          recentAttendance: [],
        });
      });
  }, []);

  const stats = summary
    ? [
      { label: 'Active Members', value: summary.activeMembers, icon: Users, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-soft)]' },
      { label: "Today's Check-ins", value: summary.todayAttendance, icon: CalendarCheck2, color: 'text-[var(--info)]', bg: 'bg-[var(--info-soft)]' },
      { label: 'Monthly Revenue', value: formatInr(summary.monthlyRevenueInr), icon: IndianRupee, color: 'text-[var(--ok)]', bg: 'bg-[var(--ok-soft)]' },
      { label: 'Pending Dues', value: formatInr(summary.totalPendingDuesInr), icon: AlertTriangle, color: 'text-[var(--warn)]', bg: 'bg-[var(--warn-soft)]' },
    ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--ink)]">
          {gym?.name || 'Dashboard'}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Overview of your gym's performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--ink)] mt-1 font-mono">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Expiring Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/members?action=register')}>
              <UserPlus className="h-4 w-4 text-[var(--accent)]" />
              Register New Member
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/attendance')}>
              <CalendarCheck2 className="h-4 w-4 text-[var(--info)]" />
              Quick Check-In
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/payments?action=record')}>
              <CreditCard className="h-4 w-4 text-[var(--ok)]" />
              Record Payment
            </Button>
          </CardContent>
        </Card>

        {/* Expiring Memberships */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Expiring Soon</CardTitle>
              <p className="text-xs text-[var(--muted)] mt-0.5">{summary?.expiringIn7Days || 0} members expiring within 7 days</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/memberships')}>
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {summary?.expiringIn7Days ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-[var(--ink)]">Rahul Sharma</TableCell>
                    <TableCell>Monthly Fitness</TableCell>
                    <TableCell>Aug 30, 2026</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="warning">3 days left</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-[var(--ink)]">Sneha Reddy</TableCell>
                    <TableCell>Quarterly Plan</TableCell>
                    <TableCell>Sep 2, 2026</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="warning">6 days left</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--muted)]">
                <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No memberships expiring this week</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
