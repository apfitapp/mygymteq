import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sun, Moon, Dumbbell } from 'lucide-react';

// Demo credentials for quick access
const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@mygymteq.com', password: 'Admin@12345', role: 'Platform Admin' },
  { label: 'Gym Owner', email: 'owner@ironhouse.in', password: 'IronHouse@123', role: 'Iron House Fitness' },
  { label: 'Front Desk', email: 'staff@ironhouse.in', password: 'Staff@12345', role: 'Staff Check-in' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent, loginEmail?: string, loginPassword?: string) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const finalEmail = loginEmail || email;
    const finalPassword = loginPassword || password;

    if (!finalEmail || !finalPassword) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      await login(finalEmail, finalPassword);
      navigate('/');
    } catch {
      setError('Invalid credentials. Try a demo account below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleLogin(fakeEvent, account.email, account.password);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      {/* Theme toggle - top right */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--accent)] mb-4">
          <Dumbbell className="h-7 w-7 text-[var(--accent-on)]" />
        </div>
        <h1 className="text-3xl font-bold font-display text-[var(--ink)]">MyGymTeq</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Multi-Tenant Gym Management Platform</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your credentials or try a demo account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@ironhouse.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--err)] bg-[var(--err-soft)] px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] px-2 text-xs text-[var(--muted)]">
                Quick Demo Access
              </span>
            </div>

            <div className="grid gap-2 mt-6">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  className="w-full justify-between h-auto py-2.5"
                  onClick={() => handleDemoLogin(account)}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{account.label}</p>
                    <p className="text-xs text-[var(--muted)]">{account.role}</p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{account.email}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-[var(--muted)]">
        © 2026 MyGymTeq · Cloudflare-Powered SaaS for Indian Gyms
      </p>
    </div>
  );
};
