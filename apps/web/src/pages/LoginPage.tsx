import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight, Shield, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CaptchaField } from '@/components/ui/CaptchaField';

type LoginRole = 'GYM' | 'SUPER_ADMIN';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<LoginRole>('GYM');
  const [email, setEmail] = useState('admin@ironhouse.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaAttempted, setCaptchaAttempted] = useState(false);

  const handleCaptchaValidate = React.useCallback((isValid: boolean) => {
    setIsCaptchaValid(isValid);
  }, []);

  const handleRoleSelect = (role: LoginRole) => {
    setActiveRole(role);
    setError(null);
    if (role === 'GYM') {
      setEmail('admin@ironhouse.in');
      setPassword('admin123');
    } else {
      setEmail('superadmin@mygymteq.com');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCaptchaAttempted(true);

    if (!isCaptchaValid) {
      setError('Please complete the security verification code correctly before signing in.');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      const savedUserStr = localStorage.getItem('gym_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (savedUser?.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Subtle Ambient Glass Glows */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col gap-5 z-10">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="size-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <Dumbbell className="size-5" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Sign In to GymTeq
          </h1>
          <p className="text-xs text-muted-foreground">
            Precision management console for Gyms &amp; Platform Super Administrators
          </p>
        </div>

        {/* Squarish Role Selector Tabs (Radius: 2px - 4px) */}
        <div className="grid grid-cols-2 p-1 bg-surface-2/90 backdrop-blur-md border border-border rounded-sm">
          <button
            type="button"
            onClick={() => handleRoleSelect('GYM')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xs text-xs font-semibold transition-all duration-150 ${
              activeRole === 'GYM'
                ? 'bg-card text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="size-3.5 text-primary" />
            <span>Gym Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('SUPER_ADMIN')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xs text-xs font-semibold transition-all duration-150 ${
              activeRole === 'SUPER_ADMIN'
                ? 'bg-card text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="size-3.5 text-err" />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Squarish Glass Card with neon accent */}
        <Card className="glass-card shadow-2xl relative overflow-hidden border border-border/90 rounded-sm">
          {/* Subtle top laser border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-90" />

          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-base font-semibold">
              {activeRole === 'GYM' ? 'Gym Console Login' : 'Platform Super Admin'}
            </CardTitle>
            <CardDescription className="text-xs">
              {activeRole === 'GYM'
                ? 'Access members, renewals, packages, attendance, and revenue'
                : 'Manage gym tenants, platform metrics, and commercial licenses'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 rounded-sm">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="font-mono text-xs rounded-sm h-9 bg-card/70"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">Demo: admin123</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="font-mono text-xs rounded-sm h-9 bg-card/70"
                />
              </div>

              {/* Free Security CAPTCHA Field */}
              <CaptchaField
                onValidate={handleCaptchaValidate}
                error={captchaAttempted && !isCaptchaValid ? 'Enter the matching verification code' : null}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold text-xs h-10 mt-1 rounded-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {isLoading ? 'Authenticating...' : `Sign In as ${activeRole === 'GYM' ? 'Gym' : 'Super Admin'}`}
                {!isLoading && <ArrowRight className="ml-1.5 size-4" />}
              </Button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-5 pt-4 border-t border-border/80 flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold text-center">
                Quick Demo Switcher
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={activeRole === 'GYM' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleRoleSelect('GYM')}
                  className="text-[11px] font-semibold justify-start h-8 px-2.5 rounded-sm truncate"
                >
                  🏋️ Gym Owner
                </Button>
                <Button
                  type="button"
                  variant={activeRole === 'SUPER_ADMIN' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleRoleSelect('SUPER_ADMIN')}
                  className="text-[11px] font-semibold justify-start h-8 px-2.5 rounded-sm truncate text-err hover:text-err"
                >
                  🛡️ Super Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a href="#/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};
