import React, { useState } from 'react';
import { Check, IndianRupee, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PricingSection: React.FC = () => {
  const [billingYearly, setBillingYearly] = useState(false);

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
          <IndianRupee className="size-3 mr-1.5 inline" />
          <span>TRANSPARENT PRICING</span>
        </Badge>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          Predictable pricing for gyms of all sizes
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          No setup fees. No hidden charges. All plans include the owner dashboard, QR attendance, and WhatsApp receipts.
        </p>

        {/* Monthly / Yearly Switcher */}
        <div className="inline-flex items-center gap-1 mt-6 p-1 bg-secondary/80 border border-border rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingYearly(false)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              !billingYearly ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingYearly(true)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              billingYearly ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {/* Starter Tier */}
        <Card className="p-6 flex flex-col justify-between border-border shadow-xs bg-card rounded-xl">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">For Small Studios</p>
            <CardTitle className="text-lg font-display font-bold text-foreground mt-1">Starter</CardTitle>
            <CardDescription className="text-xs text-muted-foreground pt-1 min-h-[36px]">
              Perfect for boutique fitness studios and single-owner gyms.
            </CardDescription>
            <div className="my-5 pb-4 border-b border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-foreground">
                  ₹{(billingYearly ? 9999 : 999).toLocaleString('en-IN')}
                </span>
                <span className="text-muted-foreground text-xs font-mono">/{billingYearly ? 'yr' : 'mo'}</span>
              </div>
              {billingYearly && <p className="text-[11px] text-primary font-mono mt-1">≈ ₹833/month billed yearly</p>}
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Up to 100 active members</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> 3 staff &amp; trainer logins</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Owner console &amp; member portal</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> QR &amp; manual attendance desk</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Payments, invoices &amp; dues</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> WhatsApp receipts &amp; reminders</li>
            </ul>
          </div>
          <div className="mt-8">
            <Button asChild variant="outline" className="w-full justify-center text-xs rounded-lg h-9 font-medium">
              <a href="#/login">Get Started</a>
            </Button>
          </div>
        </Card>

        {/* Professional Tier (Highlighted) */}
        <Card className="p-6 h-full flex flex-col justify-between border-primary/50 ring-1 ring-primary/40 shadow-md relative bg-card rounded-xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
            Most Popular
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">For Growing Gyms</p>
            <CardTitle className="text-lg font-display font-bold text-foreground mt-1">Professional</CardTitle>
            <CardDescription className="text-xs text-muted-foreground pt-1 min-h-[36px]">
              For high-footfall clubs with active trainers and PT clients.
            </CardDescription>
            <div className="my-5 pb-4 border-b border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-primary">
                  ₹{(billingYearly ? 19999 : 1999).toLocaleString('en-IN')}
                </span>
                <span className="text-muted-foreground text-xs font-mono">/{billingYearly ? 'yr' : 'mo'}</span>
              </div>
              {billingYearly && <p className="text-[11px] text-primary font-mono mt-1">≈ ₹1,667/month billed yearly</p>}
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 font-medium text-foreground"><Check className="size-3.5 text-primary shrink-0" /> Everything in Starter</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Up to 500 active members</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> 10 staff &amp; trainer logins</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> PT collections &amp; commission splits</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Advanced reports &amp; Excel export</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Priority WhatsApp support</li>
            </ul>
          </div>
          <div className="mt-8">
            <Button asChild className="w-full justify-center text-xs rounded-lg h-9 bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90">
              <a href="#/login">Get Started</a>
            </Button>
          </div>
        </Card>

        {/* Enterprise Tier */}
        <Card className="p-6 flex flex-col justify-between border-border shadow-xs bg-card rounded-xl">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">For Chains &amp; Franchises</p>
            <CardTitle className="text-lg font-display font-bold text-foreground mt-1">Enterprise</CardTitle>
            <CardDescription className="text-xs text-muted-foreground pt-1 min-h-[36px]">
              For multi-location gym chains, franchises, and large facilities.
            </CardDescription>
            <div className="my-5 pb-4 border-b border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-foreground">
                  ₹{(billingYearly ? 39999 : 3999).toLocaleString('en-IN')}
                </span>
                <span className="text-muted-foreground text-xs font-mono">/{billingYearly ? 'yr' : 'mo'}</span>
              </div>
              {billingYearly && <p className="text-[11px] text-primary font-mono mt-1">≈ ₹3,333/month billed yearly</p>}
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 font-medium text-foreground"><Check className="size-3.5 text-primary shrink-0" /> Everything in Professional</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Unlimited members &amp; staff</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Multi-branch tenant support</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Dedicated onboarding specialist</li>
              <li className="flex items-center gap-2"><Check className="size-3.5 text-primary shrink-0" /> Custom API integrations &amp; SLA</li>
            </ul>
          </div>
          <div className="mt-8">
            <Button asChild variant="outline" className="w-full justify-center text-xs rounded-lg h-9 font-medium">
              <a href="#/login">Contact Sales</a>
            </Button>
          </div>
        </Card>
      </div>

      {/* Launch Offer Callout */}
      <div className="max-w-3xl mx-auto mt-10 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-foreground">Free 1-on-1 Onboarding + Data Migration</p>
          <p className="text-[11px] text-muted-foreground">Switch over without losing any past member history, package dates, or payments.</p>
        </div>
        <Button asChild size="sm" className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs h-8 px-4 shrink-0 shadow-xs hover:bg-primary/90">
          <a href="#/login">Claim Free Migration</a>
        </Button>
      </div>
    </section>
  );
};
