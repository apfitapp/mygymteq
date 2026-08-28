import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, AlertCircle, Building2, Mail, CheckCircle2, KeyRound, User } from 'lucide-react';
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
import { CloudflareTurnstile } from '@/components/ui/CloudflareTurnstile';
import { api } from '@/lib/api';

type LoginRole = 'GYM' | 'MEMBER' | 'SUPER_ADMIN';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<LoginRole>('GYM');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Member Portal state
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [memberCode, setMemberCode] = useState('');

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password dialog state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotDevUrl, setForgotDevUrl] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleRoleSelect = (role: LoginRole) => {
    setActiveRole(role);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Member Portal Login
    if (activeRole === 'MEMBER') {
      if (!memberIdentifier.trim() || !memberCode.trim()) {
        setError('Please enter both your registered phone number/email and member code.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.memberLogin({
          identifier: memberIdentifier.trim(),
          codeOrPin: memberCode.trim(),
          turnstileToken: turnstileToken || undefined,
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

    // 2. Staff / Admin Login
    setIsLoading(true);
    try {
      await login({ email, password, turnstileToken: turnstileToken || undefined });
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Subtle Ambient Glass Glows */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col gap-5 z-10">
        <div className="flex flex-col items-center text-center gap-2">
          <img src="/logo.png" alt="GymTech" className="h-12 w-auto rounded-sm shadow-md shadow-primary/15" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Sign In to GymTech
          </h1>
          <p className="text-xs text-muted-foreground">
            Enterprise management console for Gyms, Staff, Members &amp; Platform Admins
          </p>
        </div>

        {/* 3-Way Role Selector Tabs */}
        <div className="grid grid-cols-3 p-1 bg-secondary border border-border rounded-sm">
          <button
            type="button"
            onClick={() => handleRoleSelect('GYM')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xs text-xs font-semibold transition-all duration-150 ${
              activeRole === 'GYM'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="size-3.5 text-primary" />
            <span>Staff Console</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('MEMBER')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xs text-xs font-semibold transition-all duration-150 ${
              activeRole === 'MEMBER'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="size-3.5 text-primary" />
            <span>Member Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('SUPER_ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xs text-xs font-semibold transition-all duration-150 ${
              activeRole === 'SUPER_ADMIN'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="size-3.5 text-destructive" />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Squarish Glass Card with neon accent */}
        <Card className="glass-card shadow-2xl relative overflow-hidden border border-border rounded-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-90" />

          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-base font-semibold">
              {activeRole === 'GYM'
                ? 'Gym Staff Sign In'
                : activeRole === 'MEMBER'
                ? 'Member Self-Service Sign In'
                : 'Platform Super Admin'}
            </CardTitle>
            <CardDescription className="text-xs">
              {activeRole === 'GYM'
                ? 'Access members, renewals, packages, attendance, and revenue'
                : activeRole === 'MEMBER'
                ? 'Access your digital QR pass, plan validity, dues, and check-in logs'
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
              {activeRole === 'MEMBER' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="memberIdentifier" className="text-xs font-semibold">
                      Registered Phone Number or Email
                    </Label>
                    <Input
                      id="memberIdentifier"
                      required
                      value={memberIdentifier}
                      onChange={(e) => setMemberIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210 or rahul@gmail.com"
                      className="font-mono text-xs rounded-sm h-9 bg-card/70"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="memberCode" className="text-xs font-semibold">
                      Member Code / Pass ID
                    </Label>
                    <Input
                      id="memberCode"
                      required
                      value={memberCode}
                      onChange={(e) => setMemberCode(e.target.value)}
                      placeholder="e.g. MEM-1001"
                      className="font-mono text-xs rounded-sm h-9 bg-card/70 uppercase"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Your unique member code is provided on enrollment receipts.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@yourgym.com"
                      className="font-mono text-xs rounded-sm h-9 bg-card/70"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
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
                </>
              )}

              {/* Cloudflare Turnstile Bot Verification */}
              <CloudflareTurnstile onSuccess={(token) => setTurnstileToken(token)} />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold text-xs h-10 mt-1 rounded-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {isLoading
                  ? 'Authenticating...'
                  : activeRole === 'MEMBER'
                  ? 'Access Member Portal'
                  : `Sign In as ${activeRole === 'GYM' ? 'Gym Staff' : 'Super Admin'}`}
                {!isLoading && <ArrowRight className="ml-1.5 size-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <a href="#/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl p-6 rounded-md">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-sm bg-primary/10 text-primary flex items-center justify-center">
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
              <div className="p-3 bg-ok/10 border border-ok/30 rounded-sm text-ok text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{forgotMessage}</span>
              </div>

              {forgotDevUrl && (
                <div className="p-3 bg-secondary/80 border border-border rounded-sm text-xs flex flex-col gap-1.5 font-mono">
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
                <Alert variant="destructive" className="rounded-sm">
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
                  className="font-mono text-xs h-9"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim()}
                  className="bg-primary text-primary-foreground font-bold text-xs h-9 px-4"
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
