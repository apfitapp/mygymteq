import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Layers,
  CreditCard,
  QrCode,
  BarChart3,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

/* ─── Pipeline Node ─── */

interface NodeDef {
  id: string;
  label: string;
  metric: string;
  unit: string;
  icon: React.ElementType;
  description: string;
}

const NODES: NodeDef[] = [
  { id: 'members', label: 'Members', metric: '142', unit: 'active members', icon: Users, description: 'Track member profiles, contact info, and pause/freeze requests in one place.' },
  { id: 'plans', label: 'Memberships', metric: '6', unit: 'active plans', icon: Layers, description: 'Monthly to annual packages with custom fees, admission charges, and GST rules.' },
  { id: 'payments', label: 'Billing', metric: '₹4.5L', unit: 'this month', icon: CreditCard, description: 'Record cash, UPI, and card payments with instant WhatsApp receipts.' },
  { id: 'attendance', label: 'Attendance', metric: '28', unit: 'today', icon: QrCode, description: 'Instant QR code and phone number check-in with automated expiry alerts.' },
  { id: 'dashboard', label: 'Reports', metric: '97%', unit: 'collected', icon: BarChart3, description: 'Live revenue tracking, payment dues, and 1-click accountant Excel exports.' },
];

/* ─── Animated Connector ─── */

const Connector: React.FC = () => (
  <div className="hidden lg:flex items-center justify-center w-8 shrink-0 relative">
    <div className="w-full h-px bg-border" />
    <motion.div
      className="absolute size-1.5 rounded-full bg-primary"
      animate={{ x: [-14, 14] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

/* ─── Main Component ─── */

export const GymOSFlow: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <section id="gym-os" className="py-20 sm:py-28 border-t border-border/40 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono font-bold tracking-wider uppercase mb-4">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            HOW GYMTECH RUNS YOUR GYM
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            Five simple steps. <span className="text-gradient">One software.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Every daily task — from a new walk-in joining to monthly financial reports — happens automatically in one place.
          </p>
        </div>

        {/* Pipeline Flow */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 lg:gap-0">
          {NODES.map((node, idx) => {
            const Icon = node.icon;
            const isHovered = hoveredNode === node.id;
            return (
              <React.Fragment key={node.id}>
                {idx > 0 && <Connector />}
                <motion.div
                  onHoverStart={() => setHoveredNode(node.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  className={`relative flex-1 p-4 sm:p-5 rounded-xl border transition-all cursor-default ${
                    isHovered
                      ? 'border-primary/50 bg-primary/5 shadow-lg'
                      : 'border-border bg-card shadow-xs'
                  }`}
                  layout
                >
                  {/* Step Number */}
                  <div className="absolute -top-2.5 left-4 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-card border border-border rounded text-muted-foreground">
                    0{idx + 1}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isHovered ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-foreground mb-0.5">{node.label}</h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-display font-bold text-foreground">{node.metric}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{node.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Description */}
                  <motion.div
                    initial={false}
                    animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border/60">
                      {node.description}
                    </p>
                  </motion.div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Flow Narrative */}
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-muted-foreground inline-flex items-center gap-2 flex-wrap justify-center">
            <span>Member registers</span>
            <ChevronRight className="size-3 text-primary" />
            <span>Plan selected</span>
            <ChevronRight className="size-3 text-primary" />
            <span>Payment received</span>
            <ChevronRight className="size-3 text-primary" />
            <span>Attendance marked</span>
            <ChevronRight className="size-3 text-primary" />
            <span className="text-primary font-semibold">Reports updated live</span>
          </p>
        </div>
      </div>
    </section>
  );
};
