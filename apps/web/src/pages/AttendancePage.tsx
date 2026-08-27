import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck,
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Delete,
  Camera,
  Smartphone,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from '@/lib/api';

export const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.getAttendance(),
    refetchInterval: 10000,
  });

  const logs = data?.logs || [];

  const [inputCode, setInputCode] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [lastCheckedMember, setLastCheckedMember] = useState<{
    name: string;
    code: string;
    phone?: string;
    plan?: string;
    alreadyCheckedIn?: boolean;
    dueAmount?: number;
    checkInTime?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'dialpad' | 'search' | 'camera'>('dialpad');

  const handleCheckIn = async (code: string, method: 'MANUAL' | 'QR_SCAN' = 'MANUAL') => {
    if (!code.trim()) return;
    setErrorMessage(null);
    setIsCheckingIn(true);

    try {
      const res = await api.checkIn({
        memberIdOrCode: code.trim(),
        method,
      });

      setLastCheckedMember({
        name: res.member?.name || 'Member',
        code: res.member?.memberCode || code,
        alreadyCheckedIn: res.alreadyCheckedIn,
        checkInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });

      setInputCode('');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      setErrorMessage(err.message || 'Check-in failed. Please verify member code or phone number.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDialpadPress = (val: string) => {
    if (val === 'CLEAR') {
      setInputCode('');
    } else if (val === 'BACK') {
      setInputCode((prev) => prev.slice(0, -1));
    } else {
      if (inputCode.length < 10) {
        const next = inputCode + val;
        setInputCode(next);
        // Auto-checkin if exactly 10 digits (Standard Indian Mobile Phone)
        if (next.length === 10) {
          handleCheckIn(next, 'MANUAL');
        }
      }
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <AppShell title="Attendance & Kiosk Desk" breadcrumb="Operations">
      
      {/* Top Banner */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Member Attendance &amp; Check-In Kiosk
          </h2>
          <p className="text-xs text-muted-foreground">
            High-speed tablet dialpad, digital QR scanner, and live floor occupancy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono font-bold bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]/30 px-3 py-1">
            <span className="size-2 rounded-full bg-[var(--ok)] animate-pulse mr-2"></span>
            {logs.length} Checked In Today
          </Badge>
        </div>
      </section>

      {/* Main Kiosk & Attendance Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Check-In Terminal (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-md overflow-hidden flex flex-col">
            <CardHeader className="p-5 pb-3 border-b border-[var(--line)]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="font-display text-base font-bold text-[var(--ink)]">
                    Fast Check-In Terminal
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--muted)]">
                    Wall tablet or reception desk interface
                  </CardDescription>
                </div>
                <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setActiveMode('dialpad')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeMode === 'dialpad' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                    }`}
                  >
                    <Smartphone className="size-3.5 inline mr-1" /> Keypad
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('camera')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeMode === 'camera' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                    }`}
                  >
                    <Camera className="size-3.5 inline mr-1" /> QR Camera
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 flex flex-col gap-4">
              
              {/* Feedback Alert Box */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-[var(--err-soft)] border border-[var(--err)]/30 text-[var(--err)] text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {lastCheckedMember && (
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  lastCheckedMember.alreadyCheckedIn
                    ? 'bg-[var(--warn-soft)] border-[var(--warn)]/30 text-[var(--ink)]'
                    : 'bg-[var(--ok-soft)] border-[var(--ok)]/30 text-[var(--ink)]'
                }`}>
                  <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                    lastCheckedMember.alreadyCheckedIn ? 'bg-[var(--warn)]' : 'bg-[var(--ok)]'
                  }`}>
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-display font-bold text-sm text-[var(--ink)]">
                      {lastCheckedMember.alreadyCheckedIn ? 'Already Checked In!' : `Welcome, ${lastCheckedMember.name}!`}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted)]">
                      Code: {lastCheckedMember.code} · Logged at {lastCheckedMember.checkInTime}
                    </span>
                  </div>
                </div>
              )}

              {/* Mode 1: Dialpad Kiosk */}
              {activeMode === 'dialpad' && (
                <div className="flex flex-col gap-3.5">
                  {/* Large Numeric Display */}
                  <div className="relative flex items-center justify-center h-14 rounded-xl border-2 border-[var(--line-strong)] bg-[var(--surface-2)] px-4">
                    <span className="font-mono text-2xl font-bold tracking-widest text-[var(--ink)]">
                      {inputCode ? (
                        inputCode.replace(/(\d{5})(\d{1,5})/, '$1 $2')
                      ) : (
                        <span className="text-[var(--muted)] text-sm tracking-normal font-sans font-normal">
                          Enter 10-Digit Mobile / Member ID
                        </span>
                      )}
                    </span>
                    {inputCode && (
                      <button
                        type="button"
                        onClick={() => setInputCode('')}
                        className="absolute right-3 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* 3x4 Touch Dialpad */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => {
                      const isAction = key === 'CLEAR' || key === 'BACK';
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleDialpadPress(key)}
                          className={`h-13 rounded-xl border font-mono font-bold text-lg transition-all active:scale-95 select-none flex items-center justify-center ${
                            isAction
                              ? 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] text-xs font-sans hover:bg-[var(--line)]'
                              : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] shadow-xs'
                          }`}
                        >
                          {key === 'BACK' ? <Delete className="size-5" /> : key}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    size="lg"
                    disabled={!inputCode || isCheckingIn}
                    onClick={() => handleCheckIn(inputCode, 'MANUAL')}
                    className="w-full h-12 bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-strong)] text-sm font-bold gap-2 shadow-sm"
                  >
                    <UserCheck className="size-4" />
                    <span>{isCheckingIn ? 'Verifying...' : 'Complete Check-In'}</span>
                  </Button>
                </div>
              )}

              {/* Mode 2: Live Camera QR Scanner */}
              {activeMode === 'camera' && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--line-strong)] rounded-xl bg-[var(--surface-2)] gap-3 text-center">
                  <div className="relative size-44 rounded-xl border-2 border-[var(--accent)] bg-black/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--accent)] animate-[bounce_2s_infinite]"></div>
                    <QrCode className="size-16 text-[var(--muted)] opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink)]">
                    Hold Member QR Code in front of camera
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Camera auto-detects digital passes and member badges
                  </p>
                </div>
              )}

              {/* Quick Demo Test Chips */}
              <div className="pt-2 border-t border-[var(--line)] flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--muted)]">
                  Quick Staff Chips
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Rahul Sharma', code: '9876543210' },
                    { name: 'Sneha Kapoor', code: '9876543211' },
                    { name: 'Priya Mani', code: 'MEM-1004' },
                    { name: 'Rohan Varma', code: 'MEM-1005' },
                  ].map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => handleCheckIn(m.code, 'MANUAL')}
                      className="p-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] text-left flex flex-col transition-all cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-[var(--ink)] truncate">{m.name}</span>
                      <span className="font-mono text-[10px] text-[var(--muted)]">{m.code}</span>
                    </button>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Floor Occupancy & Today's Attendance Feed (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-md overflow-hidden flex flex-col h-full">
            <CardHeader className="p-5 pb-3 border-b border-[var(--line)]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="font-display text-base font-bold text-[var(--ink)]">
                    Live Check-In Activity Log
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--muted)]">
                    {todayFormatted} · Real-time attendance feed
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-[var(--ink)] bg-[var(--surface-2)]">
                  Auto-sync (10s)
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
                    <TableHead className="font-mono text-[10px] uppercase">Member</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Method</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Check-In Time</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-xs text-[var(--muted)]">
                        Loading live check-ins...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-xs text-[var(--muted)]">
                        No members checked in yet today. Ready for first arrival.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-[var(--surface-2)]">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                              {log.first_name?.[0]}{log.last_name ? log.last_name[0] : ''}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs text-[var(--ink)] truncate">
                                {log.first_name} {log.last_name || ''}
                              </span>
                              <span className="font-mono text-[10px] text-[var(--muted)]">
                                {log.member_code} · {log.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            {log.method || 'MANUAL'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-[var(--ink)]">
                          {new Date(log.check_in_time * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]/30 font-mono text-[10px]">
                            VERIFIED
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>

    </AppShell>
  );
};
