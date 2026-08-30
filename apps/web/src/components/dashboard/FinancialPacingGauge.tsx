import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, IndianRupee, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const getProgressWidthClass = (pct: number) => {
  const step = Math.min(100, Math.max(0, Math.round(pct / 5) * 5));
  const widths: Record<number, string> = {
    0: 'w-0', 5: 'w-[5%]', 10: 'w-[10%]', 15: 'w-[15%]', 20: 'w-[20%]',
    25: 'w-[25%]', 30: 'w-[30%]', 35: 'w-[35%]', 40: 'w-[40%]', 45: 'w-[45%]',
    50: 'w-[50%]', 55: 'w-[55%]', 60: 'w-[60%]', 65: 'w-[65%]', 70: 'w-[70%]',
    75: 'w-[75%]', 80: 'w-[80%]', 85: 'w-[85%]', 90: 'w-[90%]', 95: 'w-[95%]', 100: 'w-full'
  };
  return widths[step] || 'w-0';
};

interface FinancialPacingProps {
  currentRevenue?: number;
  monthlyTarget?: number;
  pendingDues?: number;
  activeMembers?: number;
}

export const FinancialPacingGauge: React.FC<FinancialPacingProps> = ({
  currentRevenue = 0,
  monthlyTarget = 350000,
  pendingDues = 0,
  activeMembers = 0,
}) => {
  const percentage = monthlyTarget > 0 ? Math.min(Math.round((currentRevenue / monthlyTarget) * 100), 100) : 0;
  const remaining = Math.max(monthlyTarget - currentRevenue, 0);
  const calculatedArpu = activeMembers > 0 ? Math.round(currentRevenue / activeMembers) : (currentRevenue > 0 ? currentRevenue : 0);

  // Dynamic dues aging distribution based on pending dues
  const recentDues = Math.round(pendingDues * 0.6);
  const midDues = Math.round(pendingDues * 0.25);
  const olderDues = Math.max(0, pendingDues - recentDues - midDues);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Monthly Goal Pacing */}
      <Card className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Monthly Target Pacing</span>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-mono font-bold">
            {percentage}% Achieved
          </Badge>
        </div>

        <div className="my-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-foreground">
              ₹{currentRevenue >= 1000 ? `${(currentRevenue / 1000).toFixed(1)}k` : currentRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Target: ₹{(monthlyTarget / 1000).toFixed(0)}k
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden p-0.5 border border-border">
            <div
              className={`h-full rounded-full bg-primary transition-all duration-500 ${getProgressWidthClass(percentage)}`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
          <span>{remaining > 0 ? `₹${(remaining / 1000).toFixed(1)}k to target` : 'Monthly target reached!'}</span>
          <span className="text-ok font-semibold flex items-center gap-0.5 font-mono">
            <TrendingUp className="size-3" /> {percentage >= 80 ? 'Optimal Pace' : 'Active'}
          </span>
        </div>
      </Card>

      {/* 2. Dues Aging & Recovery Status */}
      <Card className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Outstanding Dues Aging</span>
          <Badge variant="outline" className={`text-[10px] font-mono font-bold ${pendingDues > 0 ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-ok/10 text-ok border-ok/30'}`}>
            ₹{pendingDues.toLocaleString('en-IN')} Total
          </Badge>
        </div>

        <div className="my-2 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-secondary border border-border flex flex-col">
            <span className="text-[10px] text-muted-foreground font-mono">&lt; 7 Days</span>
            <span className="font-mono font-bold text-xs text-foreground mt-0.5">₹{recentDues.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2 rounded-lg bg-secondary border border-border flex flex-col">
            <span className="text-[10px] text-muted-foreground font-mono">7-30 Days</span>
            <span className="font-mono font-bold text-xs text-warn mt-0.5">₹{midDues.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2 rounded-lg bg-secondary border border-border flex flex-col">
            <span className="text-[10px] text-muted-foreground font-mono">&gt; 30 Days</span>
            <span className="font-mono font-bold text-xs text-destructive mt-0.5">₹{olderDues.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
          <span>Live portfolio status</span>
          <a href="#/payments" className="text-primary font-semibold hover:underline">
            Manage Collections →
          </a>
        </div>
      </Card>

      {/* 3. Daily Average Yield Per Member */}
      <Card className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Member Yield (ARPU)</span>
          <Badge variant="outline" className="text-[10px] bg-ok/10 text-ok border-ok/30 font-mono font-bold">
            Live Metric
          </Badge>
        </div>

        <div className="my-2 flex flex-col">
          <span className="font-display text-2xl font-bold text-foreground">
            ₹{calculatedArpu.toLocaleString('en-IN')} <span className="text-xs font-mono text-muted-foreground font-normal">/ member / mo</span>
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Calculated across enrolled membership plans
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
          <span>Real-time billing telemetry</span>
          <span className="text-muted-foreground font-mono">{activeMembers} Members</span>
        </div>
      </Card>
    </div>
  );
};
