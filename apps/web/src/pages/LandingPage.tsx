import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Menu,
  X,
  ArrowRight,
  Smartphone,
  Users,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Trophy,
  QrCode,
  FileText,
  Pause,
  FileSpreadsheet,
  HeartHandshake,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/lib/auth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Navigation Header */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-card/90 backdrop-blur-md py-3 border-b border-border shadow-xs'
            : 'bg-background/80 backdrop-blur-md py-4 border-b border-border/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="#/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="GymTech" className="h-9 w-auto rounded-xs shadow-md shadow-primary/15" />
            <span className="font-display font-extrabold text-lg text-foreground">
              Gym<span className="text-primary">Tech</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 font-medium text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Preview</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xs shadow-sm gap-2">
                <a href={user.role === 'SUPER_ADMIN' ? '#/admin' : '#/dashboard'}>
                  <span>Open Workspace</span>
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild size="sm" className="text-xs h-9 font-medium rounded-xs">
                  <a href="#/login">Sign In</a>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xs shadow-sm">
                  <a href="#/login">Launch App</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xs border border-border text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-4 flex flex-col gap-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1 text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1 text-muted-foreground hover:text-foreground">
              Preview
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1 text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1 text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <div className="h-px bg-border my-1" />
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-center text-xs">
                <a href="#/login">Sign In</a>
              </Button>
              <Button asChild size="sm" className="w-full justify-center bg-primary text-primary-foreground font-bold text-xs">
                <a href="#/login">Launch Platform</a>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-28 pb-16 flex flex-col">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6 pb-12 relative">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs border border-primary/30 bg-primary/10 text-xs font-mono font-semibold text-primary mb-6 shadow-xs">
              <span className="size-2 rounded-xs bg-primary animate-pulse" />
              <span>All-in-One Gym Management for India</span>
            </div>

            {/* Headline with vibrant gradient accent */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 text-foreground">
              Elevate your gym to <br className="hidden sm:block" />
              <span className="text-gradient">Peak Performance</span>
            </h1>

            {/* Subtitle — friendly, plain language */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              GymTech keeps your members, memberships, payments, and attendance in one simple place —
              so your front desk spends less time on paperwork and more time with people.
            </p>

            {/* Production SaaS Call-to-Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-6">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-xs sm:text-sm font-bold rounded-xs bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all"
              >
                <a href="#/login">
                  <span>Sign In to Console</span>
                  <ArrowRight className="size-4 ml-2" />
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 text-xs sm:text-sm font-semibold rounded-xs border-border hover:bg-secondary text-foreground"
              >
                <a href="#features">
                  <span>Explore Features</span>
                </a>
              </Button>
            </div>

            {/* Honest reassurance — every claim is a real product fact */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-secondary text-foreground text-[11px]">
                <Check className="size-3 text-primary" /> Free data migration
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-secondary text-foreground text-[11px]">
                <Check className="size-3 text-primary" /> Works on phone &amp; desktop
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-secondary text-foreground text-[11px]">
                <Check className="size-3 text-primary" /> GST-ready billing
              </span>
            </div>
          </div>

          {/* Interactive Live SaaS Dashboard Simulation Frame */}
          <div id="demo" className="max-w-5xl mx-auto rounded-sm p-2 bg-gradient-to-b from-border to-border/40 border border-border shadow-2xl text-left mt-10">
            <div className="rounded-xs bg-card border border-border overflow-hidden">
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-destructive/80 inline-block" />
                  <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-ok/80 inline-block" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-muted-foreground">
                  <span className="size-2 rounded-full bg-ok animate-pulse" />
                  <span>ironhouse.gymtech.app/dashboard</span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground hidden sm:block">
                  Live Sync • Always On
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="p-4 sm:p-6 bg-background flex flex-col gap-5">
                {/* Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
                      Active Members
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xl sm:text-2xl font-display font-bold text-foreground">142</span>
                      <span className="text-[10px] font-mono text-ok bg-ok/10 px-1.5 py-0.5 rounded font-bold">+18% MoM</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
                      Today's Check-Ins
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xl sm:text-2xl font-display font-bold text-foreground">28</span>
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">Morning Rush</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
                      Monthly Revenue
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xl sm:text-2xl font-display font-bold text-foreground">₹45,000</span>
                      <span className="text-[10px] font-mono text-ok bg-ok/10 px-1.5 py-0.5 rounded font-bold">96% Collected</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
                      Pending Dues
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xl sm:text-2xl font-display font-bold text-destructive">₹1,500</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">1 Due</span>
                    </div>
                  </div>
                </div>

                {/* Sub-grid: Live Activity & Kiosk Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real-time Check-In Simulation */}
                  <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-ok animate-ping" />
                        Live Attendance Verification
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">Kiosk Desk</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-ok/10 border border-ok/20">
                      <div className="size-8 rounded-lg bg-ok text-white flex items-center justify-center font-bold text-xs">
                        RS
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">Rahul Sharma (MEM-1001)</p>
                        <p className="text-[10px] font-mono text-muted-foreground">Quarterly Strength • Valid till 28/11/2026</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-ok uppercase px-2 py-0.5 rounded bg-ok/20">
                        PASS
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap WhatsApp Receipt Simulation */}
                  <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#25D366]" />
                        1-Click WhatsApp Receipt Sharing
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">Instant wa.me</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/25 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-foreground truncate">Receipt #RCP-2026-0001</p>
                        <p className="text-[10px] text-muted-foreground truncate">₹7,000 received via UPI for Half-Yearly Plan</p>
                      </div>
                      <Button asChild size="sm" className="h-7 text-xs bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-2.5">
                        <a href="#/login">Share Link</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why GymTech — Benefits (owner outcomes, not features) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/50">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-2">Why GymTech</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Stop running your gym on registers and scattered apps
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              One system for memberships, collections, attendance, and trainers — with less manual work every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Front-desk work becomes faster',
                desc: 'Registrations, check-ins, plan renewals, and dues follow-ups happen from one screen — not across notebooks and personal WhatsApp.',
              },
              {
                n: '02',
                title: 'Clear day-to-day visibility',
                desc: 'Members, payments, attendance, and expiring plans update in real time, so decisions stop depending on guesswork.',
              },
              {
                n: '03',
                title: 'Revenue stays on track',
                desc: 'Pending dues are always visible, expiry reminders go out on WhatsApp in one tap, and every rupee is receipted.',
              },
            ].map((b) => (
              <div key={b.n} className="relative p-6 rounded-xl border border-border bg-card shadow-xs">
                <span className="font-display text-4xl font-extrabold text-primary/20 absolute top-4 right-5">{b.n}</span>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 pr-10">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* One Platform — Three Workspaces */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/50">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-2">One Platform · Every Role</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Built for owners, staff, trainers &amp; members
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Everyone sees exactly what they need — nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-2">Owner / Manager</span>
                <CardTitle className="font-display text-base">Run the gym without spreadsheets</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Full control of every member, plan, payment, and staff account from one dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {['Revenue & dues at a glance', 'Members, plans & renewals', 'Payments & GST receipts', 'Staff roles & permissions', 'Reports & Excel export'].map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> {f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-2">Trainer</span>
                <CardTitle className="font-display text-base">A focused desk for trainers</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Trainers handle check-ins and PT clients without touching billing or revenue.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {['Attendance check-in desk', 'PT package collections', 'Commission tracking', 'Member lookup', 'Own dashboard view'].map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> {f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-2">Member</span>
                <CardTitle className="font-display text-base">Self-service member portal</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Members check their own plan, payments, and attendance — no front-desk queue.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {['Digital membership card + QR', 'Plan & expiry visibility', 'Payment & receipt history', 'Attendance history', 'Freeze status visibility'].map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> {f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Everything required to run a high-margin gym
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Automate member check-in, fee collections, and renewal reminders so you can focus on training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Users className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Smart Member Directory</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Complete profiles with plan, payment and attendance history, emergency contacts, and instant search — plus one-click Excel migration of your existing member list.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-ok/10 text-ok flex items-center justify-center mb-3">
                  <QrCode className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Instant Attendance Desk</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Phone number, member code, or QR check-in with automatic plan validation — expired and frozen members are stopped at the door.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <TrendingUp className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Fee Collections &amp; Dues</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Record Cash, UPI, and Card with partial-payment tracking, unique receipt numbers, and outstanding dues that are impossible to miss.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mb-3">
                  <Sparkles className="size-5" />
                </div>
                <CardTitle className="font-display text-base">1-Tap WhatsApp Alerts</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Welcome messages, digital fee receipts, and expiry reminders via pre-filled WhatsApp click-to-chat — no API fees, no setup.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-warn/10 text-warn flex items-center justify-center mb-3">
                  <Trophy className="size-5" />
                </div>
                <CardTitle className="font-display text-base">PT Collections &amp; Commissions</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Sell personal-training packages, and track each trainer's commission automatically with pending/paid settlement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Pause className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Freeze / Pause Memberships</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Pause a member's plan when they travel or get injured. Remaining days are preserved exactly and restored on resume.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-ok/10 text-ok flex items-center justify-center mb-3">
                  <FileText className="size-5" />
                </div>
                <CardTitle className="font-display text-base">GST-Ready Invoices</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Every payment produces a printable tax invoice with your gym's GSTIN and CGST/SGST breakup — billing compliance without extra effort.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <FileSpreadsheet className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Reports &amp; Excel Export</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Revenue, payments, dues, attendance, and expiring memberships — exportable to Excel in one click for your accountant.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <ShieldCheck className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Role-Based Access Control</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Granular roles for Owners, Managers, Front-Desk Staff, and Trainers. Keep revenue figures restricted to leadership.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Pricing for every gym size
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Simple member-based pricing. Every plan includes the full owner dashboard, attendance desk, and member portal.
            </p>

            {/* Monthly / Yearly toggle */}
            <div className="inline-flex items-center gap-1 mt-6 p-1 bg-surface-2 border border-border rounded-lg">
              <button
                type="button"
                onClick={() => setBillingYearly(false)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${!billingYearly ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingYearly(true)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${billingYearly ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Yearly <span className="text-primary font-bold ml-0.5">Save 17%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <Card className="h-full flex flex-col justify-between bg-card border-border shadow-xs p-6">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">For small gyms</p>
                <h3 className="text-xl font-display font-bold text-foreground mt-1">Starter</h3>
                <p className="text-xs text-muted-foreground pt-1 min-h-[36px]">
                  Perfect for boutique studios and single-owner gyms.
                </p>
                <div className="my-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-bold text-foreground">
                      ₹{(billingYearly ? 9999 : 999).toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">/{billingYearly ? 'year' : 'month'}</span>
                  </div>
                  {billingYearly && <p className="text-[11px] text-ok font-mono mt-0.5">≈ ₹833/month billed yearly</p>}
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Up to 100 active members</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> 3 staff / trainer accounts</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Owner dashboard &amp; member portal</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> QR &amp; manual attendance</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Payments, invoices &amp; dues</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> WhatsApp receipts &amp; reminders</li>
                </ul>
              </div>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full text-xs font-semibold h-10">
                  <a href="#/login">Get Started</a>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">GST extra where applicable</p>
              </div>
            </Card>

            {/* Professional (Highlighted) */}
            <Card className="h-full flex flex-col justify-between bg-card border-primary ring-2 ring-primary shadow-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
                Recommended
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">For growing gyms</p>
                <h3 className="text-xl font-display font-bold text-foreground mt-1">Professional</h3>
                <p className="text-xs text-muted-foreground pt-1 min-h-[36px]">
                  For growing fitness centers with high daily footfall.
                </p>
                <div className="my-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-bold text-primary">
                      ₹{(billingYearly ? 19999 : 1999).toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">/{billingYearly ? 'year' : 'month'}</span>
                  </div>
                  {billingYearly && <p className="text-[11px] text-ok font-mono mt-0.5">≈ ₹1,667/month billed yearly</p>}
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Everything in Starter</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Up to 500 active members</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> 10 staff / trainer accounts</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> PT collections &amp; commissions</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Advanced reports &amp; Excel export</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Priority support</li>
                </ul>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full text-xs font-bold h-10 bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <a href="#/login">Get Started</a>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">GST extra where applicable</p>
              </div>
            </Card>

            {/* Enterprise */}
            <Card className="h-full flex flex-col justify-between bg-card border-border shadow-xs p-6">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">For chains &amp; franchises</p>
                <h3 className="text-xl font-display font-bold text-foreground mt-1">Enterprise</h3>
                <p className="text-xs text-muted-foreground pt-1 min-h-[36px]">
                  For multi-location gym chains and franchises.
                </p>
                <div className="my-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-bold text-foreground">
                      ₹{(billingYearly ? 39999 : 3999).toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">/{billingYearly ? 'year' : 'month'}</span>
                  </div>
                  {billingYearly && <p className="text-[11px] text-ok font-mono mt-0.5">≈ ₹3,333/month billed yearly</p>}
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Everything in Professional</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Unlimited members &amp; staff</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Multi-branch ready</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Dedicated onboarding &amp; SLA</li>
                </ul>
              </div>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full text-xs font-semibold h-10">
                  <a href="#/login">Contact Sales</a>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">Custom terms available</p>
              </div>
            </Card>
          </div>

          {/* Launch offer strip */}
          <div className="max-w-3xl mx-auto mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Launch Offer</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">Free onboarding + free data migration from your current system</p>
              <p className="text-xs text-muted-foreground">17% off when you choose yearly billing</p>
            </div>
            <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9 shrink-0">
              <a href="#/login">Claim Offer</a>
            </Button>
          </div>
        </section>

        {/* What you can do today — genuine product capabilities, not fake reviews */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/50">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-2">From Day One</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              What you can do with GymTech today
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              No waiting, no add-ons — every plan includes the full toolkit below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Users, text: 'Add members & assign plans in under a minute' },
              { icon: IndianRupee, text: 'Collect fees and hand over a GST receipt instantly' },
              { icon: QrCode, text: 'Check members in with a phone number or QR' },
              { icon: Sparkles, text: 'Send WhatsApp receipts & renewal reminders in one tap' },
              { icon: Pause, text: 'Pause a membership when someone travels' },
              { icon: Trophy, text: 'Track trainer PT collections & commissions' },
              { icon: FileSpreadsheet, text: 'Export revenue, dues & attendance to Excel' },
              { icon: HeartHandshake, text: 'Give members their own self-service portal' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <item.icon className="size-4" />
                </div>
                <p className="text-xs text-foreground leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section with shadcn Accordion */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50 w-full">
          <div className="text-center mb-10">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Common Questions
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="glass-card p-6 rounded-sm shadow-xs">
            <Accordion defaultExpandedKeys={["faq-1"]}>
              <AccordionItem id="faq-1">
                <AccordionTrigger>What are the primary login portals in GymTech?</AccordionTrigger>
                <AccordionContent>
                  GymTech features a clean two-tier architecture: <strong>Gym Login</strong> for gym owners/administrators to manage their members, packages, attendance, and revenue; and <strong>Super Admin</strong> for platform administration and onboarding new gym tenants.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="faq-2">
                <AccordionTrigger>How does the automated WhatsApp receipt feature work?</AccordionTrigger>
                <AccordionContent>
                  When a payment or membership renewal is logged, GymTech generates an instant pre-filled WhatsApp link with the member's receipt number, plan details, and transaction amount, allowing front desks to send official receipts with one tap.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="faq-3">
                <AccordionTrigger>How is tenant data secured between different gyms?</AccordionTrigger>
                <AccordionContent>
                  Every gym's data is strictly isolated at the database level with tenant-scoped queries enforced on the server. A gym owner can never access another facility's members, payments, or reports.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="faq-4">
                <AccordionTrigger>Can I customize membership packages and renewal cycles?</AccordionTrigger>
                <AccordionContent>
                  Yes! You can configure custom packages (Monthly, Quarterly, Half-Yearly, Annual), set custom admission fees, and record partial or full dues with flexible payment modes (UPI, Cash, Card, Net Banking).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="faq-5">
                <AccordionTrigger>Can a member pause their membership?</AccordionTrigger>
                <AccordionContent>
                  Yes. Owners and managers can freeze any active membership when a member travels or is injured. The remaining days are preserved exactly and the expiry date extends automatically when the membership is resumed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="faq-6">
                <AccordionTrigger>Do you support GST billing?</AccordionTrigger>
                <AccordionContent>
                  Every payment generates a printable tax invoice with your gym's GSTIN, taxable value, and CGST/SGST breakup. Reports export to Excel for your accountant in one click.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA — honest, friendly, no fake stats */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/50 w-full">
          <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-8 sm:p-12 text-center overflow-hidden">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-3">Ready when you are</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Bring your gym's paperwork<br className="hidden sm:block" /> into one simple place
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-7 leading-relaxed">
              Move your members from registers and spreadsheets into GymTech — we'll migrate your existing list for free and get your front desk running on day one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-8 text-xs sm:text-sm font-bold rounded-xs bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <a href="#/login">
                  <span>Open the Console</span>
                  <ArrowRight className="size-4 ml-2" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-xs sm:text-sm font-semibold rounded-xs border-border">
                <a href="#pricing">See Pricing</a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[11px] text-muted-foreground font-mono">
              <span className="inline-flex items-center gap-1"><Check className="size-3 text-primary" /> Free onboarding</span>
              <span className="inline-flex items-center gap-1"><Check className="size-3 text-primary" /> Free data migration</span>
              <span className="inline-flex items-center gap-1"><Check className="size-3 text-primary" /> Cancel anytime</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-display text-base font-bold">
                <img src="/logo.png" alt="GymTech" className="h-7 w-auto rounded-sm shadow-xs" />
                <span>Gym<span className="text-primary">Tech</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All-in-one gym management for Indian gyms — members, memberships, payments, attendance, staff, and reports in one clean platform.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Product</p>
              <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#demo" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Live Preview</a>
              <a href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Portals</p>
              <a href="#/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Gym Console</a>
              <a href="#/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Member Portal</a>
              <a href="#/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Super Admin</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Contact</p>
              <a href="mailto:hello@gymtech.app" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">hello@gymtech.app</a>
              <p className="text-xs text-muted-foreground">Made for Indian gyms</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
            <p className="text-muted-foreground text-xs font-mono text-center">
              © 2026 GymTech • gymtech.app
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <a href="#/login" className="hover:text-foreground transition-colors">Sign In</a>
              <a href="#/dashboard" className="hover:text-foreground transition-colors">Gym Portal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
