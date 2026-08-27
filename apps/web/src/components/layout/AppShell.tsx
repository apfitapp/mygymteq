import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  title: string;
  breadcrumb?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, breadcrumb, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <AppSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          title={title}
          breadcrumb={breadcrumb}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[var(--maxw)] w-full mx-auto flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
};
