import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface AppHeaderProps {
  title: string;
  breadcrumb?: string;
  onOpenMobileMenu: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, breadcrumb, onOpenMobileMenu }) => {
  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-h)] shrink-0 items-center justify-between gap-4 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden size-8"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </Button>

        <div className="flex flex-col min-w-0">
          {breadcrumb && (
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {breadcrumb}
            </span>
          )}
          <h1 className="text-sm font-bold font-display text-foreground truncate tracking-tight sm:text-base">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
};
