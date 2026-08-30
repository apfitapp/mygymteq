import React from 'react';
import {
  Activity,
  Users,
  CreditCard,
  QrCode,
  CalendarCheck,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge';
import { AnimatedCounter } from '../shared/AnimatedCounter';

export const LiveDemoMockup: React.FC = () => {
  return (
    <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
          <Activity className="size-3 text-primary mr-1.5 inline" />
          <span>LIVE CONSOLE PREVIEW</span>
        </Badge>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          Designed for High-Velocity Gym Operations
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Everything your front desk, trainers, and management need in a single, ultra-responsive command view.
        </p>
      </div>

      <div className="rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-border via-border/50 to-border/20 border border-border shadow-2xl relative">
        <Card className="rounded-xl border border-border overflow-hidden bg-card p-0 gap-0 shadow-sm">
          {/* Mockup Window Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/80 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-400/80 inline-block" />
              <span className="size-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="size-3 rounded-full bg-emerald-400/80 inline-block" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-muted-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>ironhouse.gymtech.app/dashboard</span>
            </div>
            <div className="text-[11px] font-mono text-primary hidden sm:flex items-center gap-1.5 font-semibold">
              <Activity className="size-3 text-primary animate-pulse" />
              <span>Live Engine Synced</span>
            </div>
          </div>

          {/* Mockup Dashboard Content */}
          <CardContent className="p-4 sm:p-6 bg-background flex flex-col gap-6">
            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <Card className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Active Members
                  </span>
                  <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="size-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    <AnimatedCounter value={142} />
                  </span>
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-0.5">
                    <ArrowUpRight className="size-2.5" /> +18%
                  </span>
                </div>
              </Card>

              <Card className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Today's Check-Ins
                  </span>
                  <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <CalendarCheck className="size-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    <AnimatedCounter value={28} />
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    verified
                  </span>
                </div>
              </Card>

              <Card className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Monthly Collections
                  </span>
                  <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <CreditCard className="size-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    <AnimatedCounter value={45000} prefix="₹" />
                  </span>
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm font-semibold">
                    96% Paid
                  </span>
                </div>
              </Card>

              <Card className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Pending Dues
                  </span>
                  <div className="size-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                    <TrendingUp className="size-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-destructive">
                    <AnimatedCounter value={1500} prefix="₹" />
                  </span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-sm font-semibold">
                    1 Pending
                  </span>
                </div>
              </Card>
            </div>

            {/* Split Feed: Live Attendance Stream + Instant WhatsApp Dispatch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-display">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    Live Kiosk Verification
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">Door Kiosk 1</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60 border border-border">
                  <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                    RS
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">Rahul Sharma (MEM-1001)</p>
                    <p className="text-[10px] font-mono text-muted-foreground">Annual Pro &bull; Valid till Nov 2026</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    <CheckCircle2 className="size-3" /> PASS
                  </span>
                </div>
              </Card>

              <Card className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-display">
                    <MessageSquare className="size-3 text-primary" />
                    Automated Fee Receipts
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">WhatsApp API</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/60 border border-border flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">Receipt #RCP-2026-0001</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">₹7,000 received via UPI &bull; Dispatched</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 rounded-md">
                    Delivered
                  </span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
