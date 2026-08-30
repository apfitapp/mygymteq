import React, { useState } from 'react';
import { Menu, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';

interface AppHeaderProps {
  title: string;
  breadcrumb?: string;
  onOpenMobileMenu: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, breadcrumb, onOpenMobileMenu }) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[var(--header-h)] shrink-0 items-center justify-between gap-4 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenMobileMenu}
            className="md:hidden size-8.5 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>

          <div className="flex flex-col min-w-0">
            {breadcrumb && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground truncate">
                {breadcrumb}
              </span>
            )}
            <h1 className="text-sm font-bold font-display text-foreground truncate tracking-tight sm:text-base">
              {title}
            </h1>
          </div>
        </div>

        {/* Global Search / Quick Commands & Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/70 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors group"
          >
            <Search className="size-3.5 group-hover:text-primary transition-colors" />
            <span className="text-xs">Quick search...</span>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-card px-1.5 py-0.5 rounded-xs border border-border/80 text-muted-foreground shadow-2xs">
              <Command className="size-2.5" /> K
            </kbd>
          </button>

          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  );
};
