import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroProductDemo } from '@/components/landing/HeroProductDemo';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-4 pb-16 sm:pt-8 sm:pb-24 overflow-hidden hero-mesh">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        {/* Release Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center"
        >
          <a
            href="#product"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-md text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shadow-xs mb-5 sm:mb-6"
          >
            <span className="flex size-2 rounded-full bg-primary animate-pulse" />
            <span>The Modern Gym Operating System</span>
            <ChevronRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        {/* Crisp Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground mb-6"
        >
          Run your fitness business with <br className="hidden sm:block" />
          <span className="text-gradient">modern SaaS precision</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-normal"
        >
          Manage members, track daily attendance with QR codes, generate automated GST bills, and send instant WhatsApp receipts — all in one simple software.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 w-full mb-10"
        >
          <Button
            asChild
            size="lg"
            className="rounded-lg bg-primary text-primary-foreground font-semibold text-sm h-11 px-6 shadow-md hover:bg-primary/90 gap-2 transition-all"
          >
            <a href="#/login">
              <span>Sign In to Console</span>
              <ArrowRight className="size-4" />
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-lg text-sm h-11 px-6 border-border hover:bg-secondary/60 gap-2"
          >
            <a href="#product">
              <span>See How It Works</span>
            </a>
          </Button>
        </motion.div>

        {/* Trust Badges Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-mono mb-14"
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-primary" /> Free Excel Member Import
          </span>
          <span className="text-border hidden sm:inline">&bull;</span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-primary" /> Instant QR Code Attendance
          </span>
          <span className="text-border hidden sm:inline">&bull;</span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-primary" /> 1-Click WhatsApp Invoices
          </span>
        </motion.div>

        {/* Live Auto-Playing Interactive Product Experience */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="max-w-4xl mx-auto relative text-left"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/15 rounded-3xl blur-2xl -z-10 opacity-70" />
          <HeroProductDemo />
        </motion.div>

      </div>
    </section>
  );
};
