import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Menu,
  X,
  ArrowRight,
  Zap,
  Smartphone,
  Users,
  TrendingUp,
  ShieldCheck,
  Moon,
  Sun,
  Dumbbell,
  CheckCircle2,
  CalendarCheck,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/lib/auth';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickDemo = async (email: string, role: string) => {
    setIsDemoLoggingIn(true);
    try {
      await login({ email, password: email.includes('trainer') ? 'trainer123' : 'admin123' });
      if (role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      navigate('/login');
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

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
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
              <Dumbbell className="size-5" />
            </div>
            <span className="font-display font-extrabold text-lg text-foreground">
              Gym<span className="text-primary">Teq</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 font-medium text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Interactive Preview</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-lg shadow-sm gap-2">
                <a href={user.role === 'SUPER_ADMIN' ? '#/admin' : '#/dashboard'}>
                  <span>Open Workspace</span>
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild size="sm" className="text-xs h-9 font-medium">
                  <a href="#/login">Sign In</a>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-lg shadow-sm">
                  <a href="#/login">Launch App</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-border text-foreground"
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
              Interactive Preview
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1 text-muted-foreground hover:text-foreground">
              Pricing
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-xs font-mono font-semibold text-primary mb-6 shadow-xs">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>Cloudflare Edge Gym Management Platform</span>
            </div>

            {/* Headline with vibrant gradient accent */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 text-foreground">
              Elevate your gym to <br className="hidden sm:block" />
              <span className="text-gradient">Peak Performance</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Instant member onboarding, 1-tap WhatsApp fee receipts, high-speed desk QR check-ins, and automated renewal revenue. Zero servers to manage.
            </p>

            {/* Direct 1-Click Demo Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full mb-6">
              <Button
                size="lg"
                disabled={isDemoLoggingIn}
                onClick={() => handleQuickDemo('admin@ironhouse.in', 'OWNER')}
                className="h-12 px-7 text-xs sm:text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all"
              >
                <span>{isDemoLoggingIn ? 'Entering...' : '⚡ Launch Demo as Gym Owner'}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                disabled={isDemoLoggingIn}
                onClick={() => handleQuickDemo('superadmin@mygymteq.com', 'SUPER_ADMIN')}
                className="h-12 px-5 text-xs sm:text-sm font-semibold rounded-xl border-border hover:bg-secondary text-foreground"
              >
                <span>🛡️ Super Admin View</span>
              </Button>
            </div>

            {/* Quick role pills */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>Or explore:</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('staff@ironhouse.in', 'STAFF')}
                className="underline hover:text-foreground"
              >
                Front Desk
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('trainer@ironhouse.in', 'TRAINER')}
                className="underline hover:text-foreground"
              >
                Trainer Portal
              </button>
            </div>
          </div>

          {/* Interactive Live SaaS Dashboard Simulation Frame */}
          <div id="demo" className="max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-border to-border/40 border border-border shadow-2xl text-left mt-10">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-destructive/80 inline-block" />
                  <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-ok/80 inline-block" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-muted-foreground">
                  <span className="size-2 rounded-full bg-ok animate-pulse" />
                  <span>ironhouse.gymteq.in/dashboard</span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground hidden sm:block">
                  Live Edge Sync • Cloudflare D1
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
                  Track active memberships, pending renewals, contact details, emergency contacts, and plans in clean searchable profiles.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-ok/10 text-ok flex items-center justify-center mb-3">
                  <Smartphone className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Instant Attendance Desk</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Fast attendance logging via phone number, member code, or simulated QR scanner with immediate validation to stop unpaid access.
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
                  Record Cash, UPI, and Card transactions with partial payment tracking, unique receipt issuance, and automated due reconciliation.
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
                  Send welcome messages, instant digital fee receipts, and upcoming expiration reminders directly via pre-filled WhatsApp click-to-chat.
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
                  Granular roles for Owners, Managers, Front Desk Staff, and Trainers. Keep sensitive revenue figures restricted to gym leadership.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-xs">
              <CardHeader>
                <div className="size-10 rounded-lg bg-ok/10 text-ok flex items-center justify-center mb-3">
                  <Zap className="size-5" />
                </div>
                <CardTitle className="font-display text-base">Cloudflare Edge Architecture</CardTitle>
                <CardDescription className="text-xs leading-relaxed pt-1">
                  Zero server slowdowns. Cloudflare Workers and D1 database ensure sub-millisecond response times even during morning and evening rush hours.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Choose the plan that matches your facility scale. Upgrade anytime as your gym grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <Card className="h-full flex flex-col justify-between bg-card border-border shadow-xs p-6">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">Starter</h3>
                <p className="text-xs text-muted-foreground pt-1 min-h-[36px]">
                  Perfect for boutique studios and single-owner gyms.
                </p>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-foreground">₹1,499</span>
                  <span className="text-muted-foreground text-xs font-mono">/month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Up to 150 Active Members</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> 3 Staff / Trainer Accounts</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Attendance Desk Terminal</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> WhatsApp Receipts &amp; Alerts</li>
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full text-xs font-semibold h-10 mt-6">
                <a href="#/login">Get Started</a>
              </Button>
            </Card>

            {/* Professional (Highlighted) */}
            <Card className="h-full flex flex-col justify-between bg-card border-primary ring-2 ring-primary shadow-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
                Most Popular Choice
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">Professional</h3>
                <p className="text-xs text-muted-foreground pt-1 min-h-[36px]">
                  For growing fitness centers with high daily footfall.
                </p>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-primary">₹2,999</span>
                  <span className="text-muted-foreground text-xs font-mono">/month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Up to 500 Active Members</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> 10 Staff / Trainer Accounts</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Automated Expiry Reminders</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Revenue &amp; Financial Analytics</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Priority Cloudflare Edge Sync</li>
                </ul>
              </div>
              <Button asChild className="w-full text-xs font-bold h-10 mt-6 bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <a href="#/login">Launch Professional</a>
              </Button>
            </Card>

            {/* Enterprise */}
            <Card className="h-full flex flex-col justify-between bg-card border-border shadow-xs p-6">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">Enterprise</h3>
                <p className="text-xs text-muted-foreground pt-1 min-h-[36px]">
                  For multi-location gym chains and franchises.
                </p>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-foreground">₹5,999</span>
                  <span className="text-muted-foreground text-xs font-mono">/month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Unlimited Active Members</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Unlimited Staff Accounts</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Multi-Tenant Centralized Admin</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary shrink-0" /> Dedicated SLA &amp; Support</li>
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full text-xs font-semibold h-10 mt-6">
                <a href="#/login">Contact Sales</a>
              </Button>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display text-base font-bold">
            <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Dumbbell className="size-4" />
            </div>
            <span>Gym<span className="text-primary">Teq</span></span>
          </div>

          <p className="text-muted-foreground text-xs font-mono text-center">
            © 2026 GymTeq • React SPA on GitHub Pages • Cloudflare Workers + D1 Backend
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <a href="#/login" className="hover:text-foreground transition-colors">Sign In</a>
            <a href="#/dashboard" className="hover:text-foreground transition-colors">Gym Portal</a>
            <a href="#/admin" className="hover:text-foreground transition-colors">Super Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
