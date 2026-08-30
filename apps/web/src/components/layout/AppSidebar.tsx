import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Tag,
  CreditCard,
  ShieldAlert,
  BarChart3,
  Settings,
  X,
  LogOut,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/shared/Logo';

type NavRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'TRAINER' | 'SUPER_ADMIN' | 'MEMBER';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: NavRole[];
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapsed,
}) => {
  const location = useLocation();
  const { gym, user, logout } = useAuth();

  const ALL: NavRole[] = ['OWNER', 'MANAGER', 'STAFF', 'TRAINER'];
  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Overview',
      items: [{ key: 'dashboard', label: 'Dashboard', href: '#/dashboard', icon: LayoutDashboard, roles: ALL }],
    },
    {
      label: 'Members',
      items: [
        { key: 'members', label: 'Member Directory', href: '#/members', icon: Users, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { key: 'attendance', label: 'Attendance Desk', href: '#/attendance', icon: CalendarCheck, roles: ALL },
      ],
    },
    {
      label: 'Billing',
      items: [
        { key: 'plans', label: 'Membership Plans', href: '#/plans', icon: Tag, roles: ['OWNER', 'MANAGER'] },
        { key: 'payments', label: 'Payments & Dues', href: '#/payments', icon: CreditCard, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { key: 'pt', label: 'PT Collections', href: '#/pt-collections', icon: Trophy, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
      ],
    },
    {
      label: 'Operations',
      items: [
        { key: 'staff', label: 'Staff & Trainers', href: '#/staff', icon: ShieldAlert, roles: ['OWNER', 'MANAGER'] },
        { key: 'reports', label: 'Reports & Insights', href: '#/reports', icon: BarChart3, roles: ['OWNER', 'MANAGER'] },
      ],
    },
    {
      label: 'System',
      items: [
        { key: 'settings', label: 'Settings', href: '#/settings/notifications', icon: Settings, roles: ['OWNER', 'MANAGER'] },
      ],
    },
  ];

  const role = (user?.role || 'STAFF') as NavRole;
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  const currentPath = location.pathname;

  return (
    <TooltipProvider delayDuration={150}>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 md:static ${
          isCollapsed ? 'md:w-[var(--sidebar-collapsed-w)]' : 'md:w-[var(--sidebar-w)]'
        } ${isOpen ? 'translate-x-0 w-[var(--sidebar-w)]' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className={`flex h-[var(--header-h)] items-center justify-between border-b border-border ${isCollapsed ? 'px-3 justify-center' : 'px-4'}`}>
          <a href="#/dashboard" className="flex items-center gap-2.5 min-w-0 group">
            <Logo size="sm" showText={false} />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-foreground truncate leading-tight">
                  {gym?.name || 'GymTech'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-ok/10 text-ok border border-ok/20">
                    <span className="size-1.5 rounded-full bg-ok shrink-0 animate-pulse" />
                    Active Gym
                  </span>
                </div>
              </div>
            )}
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 flex flex-col gap-5">
          {visibleGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!isCollapsed && (
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 font-mono">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const itemPath = item.href.replace('#', '');
                  const isActive = currentPath === itemPath || (itemPath !== '/dashboard' && currentPath.startsWith(itemPath));
                  const Icon = item.icon;

                  const linkEl = (
                    <a
                      key={item.key}
                      href={item.href}
                      onClick={() => onClose()}
                      className={`relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all select-none ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-primary/10 text-primary font-bold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {isActive && !isCollapsed && (
                        <span className="ml-auto size-1.5 rounded-full bg-primary" />
                      )}
                    </a>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.key}>
                        <TooltipTrigger asChild>
                          {linkEl}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkEl;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {onToggleCollapsed && (
          <div className="hidden md:flex items-center justify-center p-2 border-t border-border/60">
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>
        )}

        {/* Sidebar footer with user info & logout */}
        <div className="border-t border-border p-2.5 flex flex-col gap-2">
          <div className={`flex items-center gap-2.5 p-2 rounded-lg bg-secondary/60 border border-border ${isCollapsed ? 'justify-center p-1.5' : ''}`}>
            <div className="size-7 rounded-md bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold shrink-0 shadow-xs">
              {user?.name?.slice(0, 1) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              title="Sign Out"
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
