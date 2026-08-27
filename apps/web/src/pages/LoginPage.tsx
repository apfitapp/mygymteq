import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@ironhouse.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      // Redirect based on user credentials
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

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background text-foreground relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Dumbbell className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Sign In to GymTeq
          </h1>
          <p className="text-xs text-muted-foreground">
            Access your gym operational console or platform management
          </p>
        </div>

        <Card className="border-border shadow-md bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Account Credentials</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <span className="text-[11px] text-muted-foreground">Default: admin123</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="font-mono text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold text-xs h-10 mt-1"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-1.5 size-4" />}
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-border flex flex-col gap-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold text-center">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoFill('admin@ironhouse.in', 'admin123')}
                  className="text-[11px] font-medium justify-start h-8 px-2.5 truncate"
                >
                  🏋️ Gym Owner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoFill('superadmin@mygymteq.com', 'admin123')}
                  className="text-[11px] font-medium justify-start h-8 px-2.5 truncate text-err hover:text-err"
                >
                  🛡️ Super Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoFill('staff@ironhouse.in', 'admin123')}
                  className="text-[11px] font-medium justify-start h-8 px-2.5 truncate"
                >
                  📋 Front Desk
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoFill('trainer@ironhouse.in', 'trainer123')}
                  className="text-[11px] font-medium justify-start h-8 px-2.5 truncate"
                >
                  💪 Trainer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a href="#/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};
