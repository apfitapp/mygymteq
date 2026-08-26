import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dumbbell,
  Sparkles,
  Users,
  CreditCard,
  MessageCircle,
  Building2,
  CheckCircle2,
  Sun,
  Moon,
  ArrowRight,
  Clock,
  QrCode,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--accent)] selection:text-[var(--accent-on)]">
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--surface)]/80 border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-on)] shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-[var(--ink)]">
              MyGymTeq
            </span>
            <Badge variant="default" className="text-[10px] hidden sm:inline-flex">
              India Edition
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink-2)]">
            <a href="#features" className="hover:text-[var(--ink)] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[var(--ink)] transition-colors">Pricing</a>
            <a href="#qr-checkin" className="hover:text-[var(--ink)] transition-colors">QR Check-In</a>
            <a href="#faq" className="hover:text-[var(--ink)] transition-colors">Why Cloudflare</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex gap-1.5">
              Live Demo <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-strong)]">
            <Sparkles className="h-3.5 w-3.5" />
            Zero WhatsApp SMS Costs · Edge-Speed Cloudflare Architecture
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-[var(--ink)] leading-[1.1]">
            The Modern Operating System for <br className="hidden sm:block" />
            <span className="text-[var(--accent-strong)]">Gyms & Fitness Chains in India</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            Multi-branch member management, zero-cost WhatsApp automated receipts & reminders, instant QR self check-in, and UPI revenue tracking — built specifically for Indian gym owners.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 font-bold gap-2" onClick={() => navigate('/login')}>
              Explore Live Demo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base h-12 px-8 font-semibold gap-2"
              onClick={() => navigate('/check-in?gymId=gym_ironhouse&branchId=br_ironhouse_jh')}
            >
              <QrCode className="h-4 w-4 text-[var(--accent)]" /> Try Member QR Check-In
            </Button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> No Credit Card Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> ₹0 Initial WhatsApp SMS Cost</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> 1-Click Multi-Branch Setup</span>
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div className="pt-10">
            <Card className="shadow-2xl border-[var(--line-strong)] overflow-hidden text-left">
              <div className="h-10 bg-[var(--surface-2)] border-b border-[var(--line)] px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ml-3 text-xs font-mono text-[var(--muted)]">ironhouse.mygymteq.com/dashboard</span>
                </div>
                <Badge variant="success" className="text-[10px]">LIVE WORKER EDGE</Badge>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--surface)]">
                <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
                  <p className="text-xs text-[var(--muted)] font-medium">Active Members</p>
                  <p className="text-2xl font-bold font-mono text-[var(--ink)] mt-1">142</p>
                </div>
                <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
                  <p className="text-xs text-[var(--muted)] font-medium">Today's Check-ins</p>
                  <p className="text-2xl font-bold font-mono text-[var(--info)] mt-1">34</p>
                </div>
                <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
                  <p className="text-xs text-[var(--muted)] font-medium">Monthly Revenue</p>
                  <p className="text-2xl font-bold font-mono text-[var(--ok)] mt-1">₹2,85,000</p>
                </div>
                <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
                  <p className="text-xs text-[var(--muted)] font-medium">Pending Dues</p>
                  <p className="text-2xl font-bold font-mono text-[var(--warn)] mt-1">₹42,000</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Core Features Grid ──────────────────────────────────────── */}
      <section id="features" className="py-16 bg-[var(--surface)] border-y border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-display text-[var(--ink)]">Built for How Indian Gyms Actually Operate</h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              Everything you need to stop revenue leakage, manage trainers, and keep members renewing on time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:border-[var(--accent)] transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Zero-Cost WhatsApp Engine</CardTitle>
                <CardDescription>
                  Send instant admission welcome receipts and renewal reminders directly to members' WhatsApp via 1-click wa.me links — ₹0 SMS gateway cost.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[var(--accent)] transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[var(--info-soft)] text-[var(--info)] flex items-center justify-center mb-2">
                  <QrCode className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Front-Desk QR Self Check-In</CardTitle>
                <CardDescription>
                  Members scan the desk QR with their smartphone and enter their phone number to check in. Includes 20-minute duplicate check-in blocking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[var(--accent)] transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">UPI, Cash & Dues Ledger</CardTitle>
                <CardDescription>
                  Record UPI transactions with UTR numbers, generate sequential tax receipts (`REC-2026-0001`), and track outstanding balances per member.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[var(--accent)] transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[var(--warn-soft)] text-[var(--warn)] flex items-center justify-center mb-2">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Member 360° Profiles</CardTitle>
                <CardDescription>
                  Complete audit history, plan timeline, payment history ledger, and workout check-in streaks for every single gym member.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[var(--accent)] transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Multi-Branch Management</CardTitle>
                <CardDescription>
                  Manage Jubilee Hills HQ, Gachibowli, or multiple city branches under a single owner account with branch-specific staff access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[var(--accent)] transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[var(--info-soft)] text-[var(--info)] flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Midnight Auto-Expiry Cron</CardTitle>
                <CardDescription>
                  Cloudflare Cron runs every night at 00:01 IST, smoothly expiring lapsed memberships and surfacing them for immediate WhatsApp follow-ups.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Transparent Pricing Section ────────────────────────────── */}
      <section id="pricing" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-display text-[var(--ink)]">Simple, Transparent Pricing</h2>
            <p className="text-sm text-[var(--muted)] mt-2">No hidden setup fees. Scale as your gym business expands.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-1">Starter Gym</Badge>
                <CardTitle className="text-xl">Single Branch</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-[var(--ink)]">₹999</span>
                  <span className="text-xs text-[var(--muted)]"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Up to 250 Members</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> 1 Gym Branch</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> QR Self Check-In Placard</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> 1-Click WhatsApp Receipts</p>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/login')}>Get Started</Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-[var(--accent)] ring-2 ring-[var(--accent)] shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--accent-on)] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <CardHeader>
                <Badge variant="default" className="w-fit mb-1">Pro Fitness</Badge>
                <CardTitle className="text-xl">Growing Gyms</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-[var(--ink)]">₹2,499</span>
                  <span className="text-xs text-[var(--muted)]"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Up to 1,000 Members</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Up to 3 Branches</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Unlimited Staff & Trainers</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Automated WhatsApp Expiry Reminders</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> UPI & Dues Tracking</p>
                <Button className="w-full mt-4 font-bold" onClick={() => navigate('/login')}>Start 14-Day Free Trial</Button>
              </CardContent>
            </Card>

            {/* Chain Plan */}
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-1">Gym Chain</Badge>
                <CardTitle className="text-xl">Franchise & Chain</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-[var(--ink)]">₹5,999</span>
                  <span className="text-xs text-[var(--muted)]"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Unlimited Members</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Unlimited Branches</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Custom Subdomain Branding</p>
                <p className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Dedicated Account Manager</p>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/login')}>Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-[var(--accent-on)] text-xs font-bold">
              G
            </div>
            <span className="font-bold font-display text-[var(--ink)]">MyGymTeq</span>
            <span className="text-xs text-[var(--muted)]">© 2026 · Made for Indian Gym Businesses</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <Button variant="link" size="sm" onClick={() => navigate('/login')}>Super Admin Portal</Button>
            <Button variant="link" size="sm" onClick={() => navigate('/login')}>Gym Owner Sign In</Button>
            <Button variant="link" size="sm" onClick={() => navigate('/check-in?gymId=gym_ironhouse&branchId=br_ironhouse_jh')}>Self Check-In</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
