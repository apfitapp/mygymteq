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
  Dumbbell,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { gym, user } = useAuth();

  const navGroups = [
    {
      label: 'Overview',
      items: [{ key: 'dashboard', label: 'Dashboard', href: '#/dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Members',
      items: [
        { key: 'members', label: 'Member Directory', href: '#/members', icon: Users },
        { key: 'attendance', label: 'Attendance Desk', href: '#/attendance', icon: CalendarCheck },
      ],
    },
    {
      label: 'Billing',
      items: [
        { key: 'plans', label: 'Membership Plans', href: '#/plans', icon: Tag },
        { key: 'payments', label: 'Payments & Dues', href: '#/payments', icon: CreditCard },
      ],
    },
    {
      label: 'Operations',
      items: [
        { key: 'staff', label: 'Staff & Trainers', href: '#/staff', icon: ShieldAlert },
        { key: 'reports', label: 'Reports & Insights', href: '#/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'System',
      items: [
        { key: 'settings', label: 'Settings', href: '#/settings/notifications', icon: Settings },
      ],
    },
  ];

  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-w)] flex-col border-r border-border/80 bg-card/95 backdrop-blur-md transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-[var(--header-h)] items-center justify-between border-b border-border px-5">
          <a href="#/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xs bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 shadow-sm shadow-primary/20">
              <Dumbbell className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-foreground truncate leading-tight">
                {gym?.name || 'GymTeq'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-xs bg-ok/10 text-ok border border-ok/20">
                  <span className="size-1.5 rounded-full bg-ok shrink-0"></span>
                  Active Gym
                </span>
              </div>
            </div>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xs p-1 text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const itemPath = item.href.replace('#', '');
                  const isActive = currentPath === itemPath || (itemPath !== '/dashboard' && currentPath.startsWith(itemPath));
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      onClick={() => onClose()}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-medium transition-all duration-150 select-none ${
                        isActive
                          ? 'bg-primary/15 text-primary font-bold shadow-xs border border-primary/20'
                          : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="ml-auto size-1.5 rounded-xs bg-primary" />}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 p-2 rounded-xs bg-surface-2 border border-border">
            <div className="size-7 rounded-xs bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold shrink-0">
              {user?.name?.slice(0, 1) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
