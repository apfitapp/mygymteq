import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Check,
  ArrowRight,
  Shield,
  CreditCard,
  CalendarCheck,
  CheckCircle2,
  Lock,
  Download,
  Percent,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const FeatureShowcase: React.FC = () => {
  return (
    <div id="features" className="divide-y divide-border/50">
      {/* 1. Deep Dive: Owner Master Control & Analytics */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
              <Users className="size-3 mr-1.5 inline" />
              <span>OWNER COMMAND CENTER</span>
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Real-time intelligence for your entire gym
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
              Say goodbye to scattered registers, Excel sheets, and missed membership expirations. GymTech gives owners a unified command view of revenue, trainer commissions, and daily footfall.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Real-Time Revenue & Dues', desc: 'Instant visibility on collections, outstanding balances, and renewals.' },
                { title: 'Role-Based Access Control', desc: 'Lock financial figures and reports from front-desk staff and trainers.' },
                { title: 'One-Click Excel Reports', desc: 'Export full accountant-ready payment, attendance, and member data in seconds.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button asChild className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs h-10 px-5 shadow-sm hover:bg-primary/90">
                <a href="#/login">Open Owner Console</a>
              </Button>
              <span className="text-xs font-mono text-muted-foreground">GST invoice ready</span>
            </div>
          </div>

          {/* Interactive UI Mockup: Analytics Card */}
          <div className="relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  IH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Monthly Financial Pacing</h4>
                  <p className="text-[10px] font-mono text-muted-foreground">Target: ₹3,50,000 &bull; 13% Achieved</p>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                Live Metric
              </Badge>
            </div>

            {/* Pacing Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-foreground">₹45,000 Collected</span>
                <span className="text-muted-foreground">₹3,05,000 remaining</span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[13%]" />
              </div>
            </div>

            {/* Churn Radar & At-Risk Strip */}
            <div className="p-3 rounded-lg bg-secondary/50 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Silent Dropouts &amp; Churn Radar</p>
                  <p className="text-[10px] text-muted-foreground">2 members absent &gt; 7 days</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[11px] font-medium border-border">
                Send Nudge
              </Button>
            </div>

            {/* Average Revenue Per User (ARPU) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Member Yield (ARPU)</span>
                <p className="text-lg font-display font-bold text-foreground mt-0.5">₹317 / mo</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Data Export</span>
                <p className="text-xs font-semibold text-primary mt-1 flex items-center gap-1">
                  <Download className="size-3" /> CSV &bull; Excel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Deep Dive: Payments & Dues Collection Desk */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Interactive UI Mockup: Payment Transaction Card */}
          <div className="relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl flex flex-col gap-4 order-2 lg:order-1">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Fee Collection</span>
                <h4 className="text-xs font-bold text-foreground mt-0.5">Quick Payment &bull; Tax Invoice</h4>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
                Paid &bull; Verified
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Member:</span>
                <span className="font-semibold text-foreground">Rahul Sharma (MEM-1001)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Selected Package:</span>
                <span className="font-semibold text-foreground">Annual Strength Pro (12 Mos)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Payment Mode:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm font-mono text-[10px] bg-primary/10 text-primary font-bold">
                  UPI &bull; UPI9847291039
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border pt-2">
                <span className="font-bold text-foreground">Total Collected:</span>
                <span className="text-base font-display font-bold text-primary">₹18,000</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 border border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Percent className="size-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Trainer Commission Auto-Allocated</span>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">₹3,600 (20%)</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
              <TrendingUp className="size-3 mr-1.5 inline" />
              <span>PAYMENTS &amp; COMMISSIONS</span>
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Zero lost revenue with automated dues tracking
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
              Never lose track of who paid and who owes money. Collect partial advances, generate tax-compliant GST receipts, and split trainer personal-training commissions with total accuracy.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Multi-Payment Recording', desc: 'Accept Cash, UPI, Cards, or split modes without manual tallying.' },
                { title: 'Partial Dues Management', desc: 'Record token advances and track outstanding balances with automated reminders.' },
                { title: 'Trainer Commission Split', desc: 'Allocate packages to coaches and track trainer session payouts effortlessly.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button asChild className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs h-10 px-5 shadow-sm hover:bg-primary/90">
                <a href="#/login">Explore Billing Tools</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Dive: Automated WhatsApp Notifications */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
              <MessageSquare className="size-3 mr-1.5 inline" />
              <span>WHATSAPP INTEGRATION</span>
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Instant receipts and expiry follow-ups on WhatsApp
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
              Stop paying expensive third-party messaging API fees. GymTech uses smart pre-filled click-to-chat links so front desks can dispatch official payment receipts and membership renewals in a single tap.
            </p>

            <div className="space-y-3.5">
              {[
                { title: '1-Click Digital Fee Receipts', desc: 'Pre-formatted receipt messages with transaction amount and plan validity.' },
                { title: 'Automatic Expiry Follow-Ups', desc: 'Friendly reminder messages for members whose packages are ending soon.' },
                { title: 'Zero API Integration Cost', desc: 'Uses direct WhatsApp click-to-chat — no setup delays, zero monthly message fees.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button asChild className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs h-10 px-5 shadow-sm hover:bg-primary/90">
                <a href="#/login">Try WhatsApp Feature</a>
              </Button>
            </div>
          </div>

          {/* Interactive UI Mockup: WhatsApp Receipt Chat Bubble */}
          <div className="relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="size-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Iron House Fitness WhatsApp Bot</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Official Fee Dispatch &bull; Automated</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-primary font-semibold">Online</span>
            </div>

            {/* Chat Bubble Mockup */}
            <div className="p-4 rounded-xl bg-secondary/70 border border-border flex flex-col gap-2 font-mono text-xs text-foreground">
              <p className="font-bold text-primary font-sans text-sm">
                Official Payment Receipt &bull; Iron House Fitness
              </p>
              <p className="text-[11px] text-muted-foreground">
                Dear Rahul Sharma,<br />
                We have received your payment of <strong>₹18,000</strong> for <strong>Annual Strength Pro</strong>.
              </p>
              <div className="h-px bg-border my-1" />
              <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                <span>Receipt #: RCP-2026-0001</span>
                <span>Mode: UPI</span>
                <span>Valid Till: 28/07/2027</span>
                <span>Status: Confirmed</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
              <span>Delivery Time: &lt; 1 sec</span>
              <span className="text-primary font-semibold">Delivered to +91 98765 43210</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
