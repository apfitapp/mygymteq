import React from 'react';
import { Logo } from '@/components/shared/Logo';

export const FooterSection: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-md py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <Logo />
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              The all-in-one operating system for modern gyms, fitness centers, and strength clubs. Manage members, automated attendance, GST receipts, and trainer commissions in one place.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-primary pt-1 font-semibold">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>All Systems Operational &bull; Cloud Engine Synced</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#product" className="hover:text-foreground transition-colors">Product Workflow</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing Plans</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Col 3: Portal Logins */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground mb-3">Portals</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#/login" className="hover:text-foreground transition-colors">Owner / Staff Sign In</a></li>
              <li><a href="#/login" className="hover:text-foreground transition-colors">Trainer Check-in Desk</a></li>
              <li><a href="#/login" className="hover:text-foreground transition-colors">Member Self-Service Portal</a></li>
              <li><a href="#/reset-password" className="hover:text-foreground transition-colors">Password Reset</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GymTech. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#/" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#/" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#/" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
