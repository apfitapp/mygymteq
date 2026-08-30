import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/shared/Logo';

interface LandingNavbarProps {
  isScrolled: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ isScrolled }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md py-3 border-b border-border shadow-xs'
          : 'bg-background/90 backdrop-blur-md py-4 border-b border-border/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#/" className="flex items-center">
          <Logo />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-xs text-muted-foreground tracking-wide">
          <a href="#product" className="hover:text-foreground transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <Button asChild size="sm" className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs h-9 px-4 shadow-xs gap-1.5 hover:bg-primary/90">
              <a href={user.role === 'SUPER_ADMIN' ? '#/admin' : '#/dashboard'}>
                <span>Open Workspace</span>
                <ArrowRight className="size-3.5" />
              </a>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs h-9 px-3 text-muted-foreground hover:text-foreground">
                <a href="#/login">Sign In</a>
              </Button>
              <Button asChild size="sm" className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs h-9 px-4 shadow-xs hover:bg-primary/90">
                <a href="#/login">Launch App</a>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="size-8.5 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-3 overflow-hidden shadow-lg"
          >
            <a href="#product" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1.5 text-muted-foreground hover:text-foreground">
              Product Workflow
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1.5 text-muted-foreground hover:text-foreground">
              How It Works
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1.5 text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium py-1.5 text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <div className="h-px bg-border my-1" />
            <div className="flex flex-col gap-2 pt-1">
              <Button asChild variant="outline" size="sm" className="w-full justify-center text-xs rounded-lg">
                <a href="#/login">Sign In</a>
              </Button>
              <Button asChild size="sm" className="w-full justify-center bg-primary text-primary-foreground font-semibold text-xs rounded-lg shadow-xs hover:bg-primary/90">
                <a href="#/login">Launch App</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
