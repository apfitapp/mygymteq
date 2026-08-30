import React from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="rounded-3xl border border-border bg-gradient-to-b from-card via-card to-secondary/30 p-8 sm:p-14 text-center relative shadow-2xl overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-96 bg-primary/15 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase mb-6">
            <Sparkles className="size-3" />
            <span>START MODERNIZING TODAY</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight mb-4">
            Everything you need to run an exceptional gym
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join modern fitness facilities running fast check-ins, automated GST billing, and zero revenue leakage.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
            <Button asChild size="lg" className="rounded-lg bg-primary text-primary-foreground font-semibold text-sm h-11 px-7 shadow-md hover:bg-primary/90 gap-2">
              <a href="#/login">
                <span>Sign In to Console</span>
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-lg text-sm h-11 px-6 border-border hover:bg-secondary/60">
              <a href="#pricing">
                <span>View Pricing Plans</span>
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> Free 1-on-1 migration
            </span>
            <span className="text-border hidden sm:inline">&bull;</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> No long-term lock-in
            </span>
            <span className="text-border hidden sm:inline">&bull;</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> WhatsApp dispatch included
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
