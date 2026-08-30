import React from 'react';
import { Settings, FileSpreadsheet, Zap, ArrowRight } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STEPS = [
  {
    step: '01',
    title: 'Configure Your Gym & Plans',
    desc: 'Set up your membership tiers (Monthly, Quarterly, Annual), admission fees, and staff logins in under 2 minutes.',
    icon: Settings,
    tag: 'Quick Setup',
  },
  {
    step: '02',
    title: '1-Click Excel Member Import',
    desc: 'Upload your current member register. Active package dates, phone numbers, and emergency contacts migrate seamlessly.',
    icon: FileSpreadsheet,
    tag: 'Zero Data Loss',
  },
  {
    step: '03',
    title: 'Start QR Check-Ins & Go Live',
    desc: 'Put up your front-desk QR attendance code, start recording fee payments, and send instant WhatsApp bills.',
    icon: Zap,
    tag: 'Instant Operation',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-secondary/20 border-y border-border/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
            <Zap className="size-3 text-primary mr-1.5 inline" />
            <span>SIMPLE ONBOARDING</span>
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Go live in less than an afternoon
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No complicated hardware setup. Run GymTech on any tablet, laptop, or smartphone with zero installation friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.step}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="size-10 rounded-xl bg-primary/10 text-primary font-mono font-bold text-sm flex items-center justify-center">
                      {s.step}
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px] text-muted-foreground">
                      {s.tag}
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-base font-bold text-foreground mb-2">
                    {s.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </CardDescription>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Step {idx + 1} of 3</span>
                  <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ready <ArrowRight className="size-3" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
