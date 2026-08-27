import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, IndianRupee, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface FinancialPacingProps {
  currentRevenue?: number;
  monthlyTarget?: number;
  pendingDues?: number;
}

export const FinancialPacingGauge: React.FC<FinancialPacingProps> = ({
  currentRevenue = 294000,
  monthlyTarget = 350000,
  pendingDues = 18500,
}) => {
  const percentage = Math.min(Math.round((currentRevenue / monthlyTarget) * 100), 100);
  const remaining = Math.max(monthlyTarget - currentRevenue, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Monthly Goal Pacing */}
      <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase font-mono">Monthly Target Pacing</span>
          <Badge variant="outline" className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent-strong)] border-[var(--accent)]/30 font-mono font-bold">
            {percentage}% Achieved
          </Badge>
        </div>

        <div className="my-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-[var(--ink)]">
              ₹{(currentRevenue / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">
              Target: ₹{(monthlyTarget / 1000).toFixed(0)}k
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-[var(--surface-2)] overflow-hidden p-0.5 border border-[var(--line)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-2 border-t border-[var(--line)]">
          <span>₹{(remaining / 1000).toFixed(0)}k needed in 3 days</span>
          <span className="text-[var(--ok)] font-semibold flex items-center gap-0.5 font-mono">
            <TrendingUp className="size-3" /> On Track
          </span>
        </div>
      </Card>

      {/* 2. Dues Aging & Recovery Status */}
      <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase font-mono">Outstanding Dues Aging</span>
          <Badge variant="outline" className="text-[10px] bg-[var(--err-soft)] text-[var(--err)] border-[var(--err)]/30 font-mono font-bold">
            ₹{pendingDues.toLocaleString('en-IN')} Total
          </Badge>
        </div>

        <div className="my-2 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex flex-col">
            <span className="text-[10px] text-[var(--muted)] font-mono">&lt; 7 Days</span>
            <span className="font-mono font-bold text-xs text-[var(--ink)] mt-0.5">₹11.5k</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex flex-col">
            <span className="text-[10px] text-[var(--muted)] font-mono">7-30 Days</span>
            <span className="font-mono font-bold text-xs text-[var(--warn)] mt-0.5">₹5.0k</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex flex-col">
            <span className="text-[10px] text-[var(--muted)] font-mono">&gt; 30 Days</span>
            <span className="font-mono font-bold text-xs text-[var(--err)] mt-0.5">₹2.0k</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-2 border-t border-[var(--line)]">
          <span>4 members with dues</span>
          <a href="#/payments" className="text-[var(--accent-strong)] font-semibold hover:underline">
            Collect All →
          </a>
        </div>
      </Card>

      {/* 3. Daily Average Yield Per Member */}
      <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase font-mono">Avg Member ARPU</span>
          <Badge variant="outline" className="text-[10px] bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]/30 font-mono font-bold">
            +12% YoY
          </Badge>
        </div>

        <div className="my-2 flex flex-col">
          <span className="font-display text-2xl font-bold text-[var(--accent-strong)]">
            ₹1,480 <span className="text-xs font-mono text-[var(--muted)] font-normal">/ member / mo</span>
          </span>
          <p className="text-xs text-[var(--muted)] mt-1">
            Top tier plan adoption increased by 22% this quarter
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-2 border-t border-[var(--line)]">
          <span>Highest: Annual Pro (₹1,250/mo)</span>
          <span className="text-[var(--ink-2)] font-mono">82 Active</span>
        </div>
      </Card>
    </div>
  );
};
