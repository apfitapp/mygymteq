import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle2, KeyRound, User, Lock, Mail, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { api } from '@/lib/api';
import { Logo } from '@/components/shared/Logo';

type LoginMode = 'STAFF' | 'MEMBER';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<LoginMode>('STAFF');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Member Portal state
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [memberCode, setMemberCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password dialog state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotDevUrl, setForgotDevUrl] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Member Portal Login
    if (mode === 'MEMBER') {
      if (!memberIdentifier.trim() || !memberCode.trim()) {
        setError('Please enter both your registered phone number/email and member code.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.memberLogin({
          identifier: memberIdentifier.trim(),
          codeOrPin: memberCode.trim(),
        });

        localStorage.setItem('gym_token', res.token);
        localStorage.setItem(
          'gym_user',
          JSON.stringify({
            id: res.member.id,
            name: `${res.member.first_name} ${res.member.last_name || ''}`.trim(),
            email: res.member.email || `${res.member.member_code.toLowerCase()}@member.gymtech.app`,
            role: 'MEMBER',
            gymId: res.member.gym_id,
          })
        );
        if (res.gym) {
          localStorage.setItem('gym_info', JSON.stringify(res.gym));
        }
        navigate('/portal');
      } catch (err: any) {
        setError(err.message || 'Invalid member credentials. Check your phone number and member code.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Staff / Admin Login (Auto-routes by role)
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
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);
    setForgotDevUrl(null);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMessage(res.message);
      if (res.devResetUrl) {
        setForgotDevUrl(res.devResetUrl);
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send password reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground overflow-hidden hero-mesh">
      {/* Ambient Glass Glows */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size="lg" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
            {mode === 'STAFF' ? 'Sign In to GymTech' : 'Member Self-Service Portal'}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs">
            {mode === 'STAFF'
              ? 'Enter your credentials to access your gym workspace'
              : 'Enter your registered phone and member code to view your digital pass'}
          </p>
        </div>

        {/* Clean Glass Sign-In Card */}
        <Card className="glass-card shadow-2xl relative overflow-hidden border border-border rounded-2xl p-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

          <CardContent className="p-6 sm:p-7">
            {error && (
              <Alert variant="destructive" className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'STAFF' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                      Work Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourgym.com"
                        className="pl-9 text-xs rounded-lg h-10 bg-secondary/40 border-border focus-visible:ring-primary font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotOpen(true);
                          setForgotMessage(null);
                          setForgotDevUrl(null);
                          setForgotError(null);
                          setForgotEmail(email);
                        }}
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="pl-9 text-xs rounded-lg h-10 bg-secondary/40 border-border focus-visible:ring-primary font-sans"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="memberIdentifier" className="text-xs font-semibold text-foreground">
                      Registered Phone or Email
                    </Label>
                    <Input
                      id="memberIdentifier"
                      required
                      value={memberIdentifier}
                      onChange={(e) => setMemberIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210 or rahul@gmail.com"
                      className="text-xs rounded-lg h-10 bg-secondary/40 border-border focus-visible:ring-primary font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="memberCode" className="text-xs font-semibold text-foreground">
                      Member Code
                    </Label>
                    <Input
                      id="memberCode"
                      required
                      value={memberCode}
                      onChange={(e) => setMemberCode(e.target.value)}
                      placeholder="e.g. MEM-1001"
                      className="text-xs rounded-lg h-10 bg-secondary/40 border-border focus-visible:ring-primary font-mono uppercase"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Found on your WhatsApp payment receipt or digital pass.
                    </span>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-semibold text-xs h-10 mt-1 rounded-lg shadow-sm hover:bg-primary/90 transition-all gap-2"
              >
                {isLoading ? 'Signing In...' : mode === 'STAFF' ? 'Sign In to Console' : 'Access Member Pass'}
                {!isLoading && <ArrowRight className="size-4" />}
              </Button>
            </form>

            {/* Seamless Mode Switcher */}
            <div className="pt-5 mt-5 border-t border-border/70 text-center">
              {mode === 'STAFF' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('MEMBER');
                    setError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <User className="size-3.5" />
                  <span>Are you a gym member? <span className="underline">Access Member Pass</span></span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('STAFF');
                    setError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <Building2 className="size-3.5" />
                  <span>Gym Owner or Staff? <span className="underline">Sign in to console</span></span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <a href="#/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl p-6 rounded-xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-base font-bold text-foreground">
                  Reset Account Password
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  We'll send a secure password reset link to your email address
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {forgotMessage ? (
            <div className="flex flex-col gap-3 py-4">
              <div className="p-3 bg-ok/10 border border-ok/30 rounded-lg text-ok text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{forgotMessage}</span>
              </div>

              {forgotDevUrl && (
                <div className="p-3 bg-secondary/80 border border-border rounded-lg text-xs flex flex-col gap-1.5 font-mono">
                  <span className="text-[11px] font-bold text-foreground">Local Dev Preview Link:</span>
                  <a
                    href={forgotDevUrl}
                    className="text-primary hover:underline break-all text-[11px]"
                  >
                    {forgotDevUrl}
                  </a>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForgotOpen(false)}
                className="mt-2 text-xs"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4 py-3">
              {forgotError && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">{forgotError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forgotEmailInput" className="text-xs font-semibold">
                  Registered Email Address
                </Label>
                <Input
                  id="forgotEmailInput"
                  type="email"
                  required
                  placeholder="admin@yourgym.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="text-xs h-10 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotOpen(false)}
                  className="text-xs h-9 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim()}
                  className="bg-primary text-primary-foreground font-bold text-xs h-9 px-4 rounded-lg"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
