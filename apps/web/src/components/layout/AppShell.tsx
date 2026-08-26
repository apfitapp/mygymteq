import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck2,
  Settings,
  ShieldAlert,
  LogOut,
  Building2,
  Layers,
  Menu,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const AppShell: React.FC = () => {
  const { user, gym, branches, activeBranch, setActiveBranch, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems = isSuperAdmin
    ? [
      { label: 'Platform Overview', path: '/admin', icon: LayoutDashboard },
      { label: 'Gym Tenants', path: '/admin/gyms', icon: Building2 },
      { label: 'SaaS Plans', path: '/admin/plans', icon: Layers },
      { label: 'Audit Logs', path: '/admin/audit', icon: ShieldAlert },
    ]
    : [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Members', path: '/members', icon: Users },
      { label: 'Memberships & Plans', path: '/memberships', icon: Layers },
      { label: 'Payments & Receipts', path: '/payments', icon: CreditCard },
      { label: 'Attendance', path: '/attendance', icon: CalendarCheck2 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ];

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/dashboard' || item.path === '/admin'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)] font-semibold'
                : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
            )
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[var(--sidebar-w)] border-r border-[var(--line)] bg-[var(--surface)]">
        {/* Brand */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-[var(--accent-on)] font-bold text-sm">G</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--ink)] font-display">
              MyGymTeq
            </h1>
            <p className="text-xs text-[var(--muted)] truncate max-w-[140px]">
              {isSuperAdmin ? 'Super Admin' : gym?.name || 'Gym SaaS'}
            </p>
          </div>
        </div>

        <Separator />
        <SidebarNav />
        <Separator />

        {/* User section */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="text-xs font-semibold text-[var(--ink)] truncate">{user?.fullName}</p>
                <Badge variant={isSuperAdmin ? 'info' : 'outline'} className="text-[10px] py-0 px-1.5">
                  {user?.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out" className="text-[var(--muted)] hover:text-[var(--err)]">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-[var(--header-h)] border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between px-4 lg:px-6">
          {/* Mobile menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-5">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                      <span className="text-[var(--accent-on)] font-bold text-xs">G</span>
                    </div>
                    MyGymTeq
                  </SheetTitle>
                </SheetHeader>
                <Separator />
                <SidebarNav />
                <Separator />
                <div className="p-4">
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-[var(--err)]">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-bold text-[var(--ink)] font-display">MyGymTeq</span>
          </div>

          {/* Branch Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {!isSuperAdmin && branches.length > 0 && (
              <Select
                value={activeBranch?.id || ''}
                onValueChange={(val) => {
                  const branch = branches.find((b) => b.id === val);
                  if (branch) setActiveBranch(branch);
                }}
              >
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1.5 text-[var(--accent)]" />
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} {branch.isPrimary ? '(HQ)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {gym && (
              <Badge variant="success" className="hidden md:inline-flex">
                {gym.name}
              </Badge>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Quick Check-In */}
            {!isSuperAdmin && (
              <Button
                size="sm"
                onClick={() => navigate('/attendance')}
                className="hidden sm:flex gap-1.5"
              >
                <CalendarCheck2 className="h-3.5 w-3.5" />
                Quick Check-In
              </Button>
            )}

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden lg:flex">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{user?.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[var(--err)]">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--bg)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
