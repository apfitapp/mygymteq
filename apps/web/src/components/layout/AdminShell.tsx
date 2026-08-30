import React, { useState } from 'react';
import { Shield, Building2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ title, children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-w)] flex-col border-r border-border/80 bg-card/95 backdrop-blur-md transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[var(--header-h)] items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size="sm" showText={false} />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-foreground leading-tight truncate">
                GymTech Platform
              </p>
              <span className="inline-flex rounded-xs bg-err/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-err border border-err/20">
                SUPER ADMIN
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xs p-1 text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform control
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Manage gym tenants &amp; commercial plans.</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <a
            href="#/admin"
            className="flex items-center gap-3 rounded-xs px-3 py-2 text-xs font-semibold bg-foreground text-background"
          >
            <Building2 className="size-4 shrink-0" />
            <span>Gyms &amp; Tenants</span>
          </a>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between p-2 rounded-xs bg-surface-2 border border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-xs bg-foreground text-background font-mono text-xs font-bold flex items-center justify-center">
                SA
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">Platform Super Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="size-7 rounded-xs text-muted-foreground hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-[var(--header-h)] shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-card/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden size-8"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </Button>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Platform Administration
              </p>
              <h1 className="text-base font-bold font-display text-foreground truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[var(--maxw)] w-full mx-auto flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
};
