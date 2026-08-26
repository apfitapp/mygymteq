import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { CheckCircle2, AlertCircle, Dumbbell, Sun, Moon, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';

export const PublicCheckInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const gymId = searchParams.get('gymId') || 'gym_ironhouse';
  const branchId = searchParams.get('branchId') || 'br_ironhouse_jh';
  const gymName = searchParams.get('gymName') || 'Iron House Fitness';

  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    memberName?: string;
    memberCode?: string;
    status?: string;
    checkInTime?: string;
    error?: string;
  } | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/attendance/self-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId,
          branchId,
          identifier: identifier.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          memberName: data.data.memberName,
          memberCode: data.data.memberCode,
          status: data.data.status,
          checkInTime: new Date(data.data.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
        setIdentifier('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Check-in failed. Please verify your phone number or Member ID.',
        });
      }
    } catch {
      setResult({
        success: false,
        error: 'Unable to connect to gym server. Please notify front desk staff.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      {/* Top Navbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-[var(--accent-on)] mb-3 shadow-md">
          <Dumbbell className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold font-display text-[var(--ink)]">{gymName}</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5 flex items-center justify-center gap-1.5">
          <UserCheck className="h-3.5 w-3.5 text-[var(--accent)]" /> Self-Service Member Check-In
        </p>
      </div>

      {/* Main Check-In Card */}
      <Card className="w-full max-w-md shadow-lg border-[var(--line-strong)]">
        <CardHeader>
          <CardTitle className="text-lg">Quick Attendance</CardTitle>
          <CardDescription>Enter your 10-digit mobile number or Member ID (e.g. MEM-1001)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-id">Mobile Number or Member ID</Label>
              <Input
                id="member-id"
                autoFocus
                placeholder="e.g. 9876543210 or MEM-1001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="text-base py-2.5 font-mono"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading || !identifier.trim()}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Checking in...
                </span>
              ) : (
                'Check In Now'
              )}
            </Button>
          </form>

          {/* Result Alert */}
          {result && (
            <div className="mt-5">
              {result.success ? (
                <div className="p-4 rounded-xl bg-[var(--ok-soft)] border border-[var(--ok)]/20 text-center space-y-2 animate-in fade-in-50">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--ok)] text-white mb-1">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--ink)]">Welcome, {result.memberName}!</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Checked in at <span className="font-semibold text-[var(--ink)] font-mono">{result.checkInTime}</span>
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <Badge variant="success">Membership Active</Badge>
                    <span className="text-xs font-mono text-[var(--muted)] self-center">{result.memberCode}</span>
                  </div>
                  <p className="text-xs text-[var(--ok)] font-medium pt-1">Have a powerful workout today! 🏋️‍♂️</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--err-soft)] border border-[var(--err)]/20 flex items-start gap-3 animate-in fade-in-50">
                  <AlertCircle className="h-5 w-5 text-[var(--err)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--err)]">Check-In Failed</h4>
                    <p className="text-xs text-[var(--ink-2)] mt-0.5">{result.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-4 border-t border-[var(--line)]">
            <p className="text-[11px] text-[var(--muted)] uppercase font-semibold tracking-wider mb-2">Quick Test Numbers:</p>
            <div className="flex flex-wrap gap-1.5">
              {['9876543210 (Rahul)', '9876543211 (Sneha)', 'MEM-1004 (Priya)'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setIdentifier(sample.split(' ')[0])}
                  className="text-xs px-2.5 py-1 rounded-md bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line-strong)] transition-colors font-mono"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Login Link */}
      <div className="mt-6 text-center">
        <Button variant="link" size="sm" onClick={() => navigate('/login')} className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">
          Gym Staff / Owner Sign In <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};
