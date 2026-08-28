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
  const [blockedMember, setBlockedMember] = useState<{ id?: string; name?: string; expiryDate?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'dialpad' | 'search' | 'camera'>('dialpad');

  const handleCheckIn = async (code: string, method: 'MANUAL' | 'QR_SCAN' = 'MANUAL') => {
    if (!code.trim()) return;
    setErrorMessage(null);
    setBlockedMember(null);
    setIsCheckingIn(true);

    try {
      const res = await api.checkIn({
        memberIdOrCode: code.trim(),
        method,
      });

      setBlockedMember(null);
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
      setLastCheckedMember(null);
      if (err.code === 'MEMBERSHIP_EXPIRED' || err.message?.includes('ACCESS DENIED') || err.message?.includes('expired')) {
        setBlockedMember({
          id: err.member?.id,
          name: err.member?.name,
          expiryDate: err.member?.expiryDate,
        });
      } else {
        setBlockedMember(null);
      }
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
          <Badge variant="outline" className="text-xs font-mono font-bold bg-ok/10 text-ok border-ok/30 px-3 py-1">
            <span className="size-2 rounded-full bg-ok animate-pulse mr-2"></span>
            {logs.length} Checked In Today
          </Badge>
        </div>
      </section>

      {/* Main Kiosk & Attendance Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Check-In Terminal (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col">
            <CardHeader className="p-5 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="font-display text-base font-bold text-foreground">
                    Fast Check-In Terminal
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium">
                    Wall tablet or reception desk interface
                  </CardDescription>
                </div>
                <div className="flex gap-1 p-0.5 rounded-lg bg-secondary border border-border">
                  <button
                    type="button"
                    onClick={() => setActiveMode('dialpad')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeMode === 'dialpad' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Smartphone className="size-3.5 inline mr-1" /> Keypad
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('camera')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeMode === 'camera' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
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
                <div className="p-4 rounded-xl bg-destructive/15 border-2 border-destructive/40 text-destructive flex flex-col gap-2.5 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="size-5 shrink-0 text-destructive mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">Access Verification Check</span>
                      <span className="text-xs text-destructive/90">{errorMessage}</span>
                    </div>
                  </div>
                  {blockedMember?.id && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button asChild size="sm" className="bg-destructive text-white hover:bg-destructive/90 font-bold text-xs h-8">
                        <a href={`#/members/${blockedMember.id}/renew`}>
                          Renew Membership Now <ArrowRight className="size-3.5 ml-1" />
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10">
                        <a href={`#/members/${blockedMember.id}`}>View Profile</a>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {lastCheckedMember && (
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  lastCheckedMember.alreadyCheckedIn
                    ? 'bg-warn/10 border-warn/30 text-foreground'
                    : 'bg-ok/10 border-ok/30 text-foreground'
                }`}>
                  <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                    lastCheckedMember.alreadyCheckedIn ? 'bg-warn' : 'bg-ok'
                  }`}>
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-display font-bold text-sm text-foreground">
                      {lastCheckedMember.alreadyCheckedIn ? 'Already Checked In!' : `Welcome, ${lastCheckedMember.name}!`}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Code: {lastCheckedMember.code} · Logged at {lastCheckedMember.checkInTime}
                    </span>
                  </div>
                </div>
              )}

              {/* Mode 1: Dialpad Kiosk */}
              {activeMode === 'dialpad' && (
                <div className="flex flex-col gap-3.5">
                  {/* Direct member code / phone entry */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCheckIn(inputCode, 'MANUAL');
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      id="code"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Member code (MEM-1001) or phone"
                      className="font-mono text-xs h-10 bg-card"
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputCode.trim() || isCheckingIn}
                      className="h-10 bg-primary text-primary-foreground font-bold text-xs shrink-0"
                    >
                      <Search className="size-3.5 mr-1" />
                      {isCheckingIn ? 'Verifying...' : 'Check In'}
                    </Button>
                  </form>

                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or tap keypad
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  {/* Large Numeric Display */}
                  <div className="relative flex items-center justify-center h-14 rounded-xl border-2 border-border bg-secondary/80 px-4">
                    <span className="font-mono text-2xl font-bold tracking-widest text-foreground">
                      {inputCode ? (
                        inputCode.replace(/(\d{5})(\d{1,5})/, '$1 $2')
                      ) : (
                        <span className="text-muted-foreground text-sm tracking-normal font-sans font-normal">
                          Enter 10-Digit Mobile / Member ID
                        </span>
                      )}
                    </span>
                    {inputCode && (
                      <button
                        type="button"
                        onClick={() => setInputCode('')}
                        className="absolute right-3 text-xs font-bold text-muted-foreground hover:text-foreground"
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
                              ? 'bg-secondary text-muted-foreground border-border text-xs font-sans hover:bg-secondary/70'
                              : 'bg-card text-foreground border-border hover:border-primary hover:bg-secondary/50 shadow-xs'
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
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold gap-2 shadow-sm"
                  >
                    <UserCheck className="size-4" />
                    <span>{isCheckingIn ? 'Verifying...' : 'Complete Check-In'}</span>
                  </Button>
                </div>
              )}

              {/* Mode 2: Live Camera QR Scanner */}
              {activeMode === 'camera' && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-secondary/40 gap-3 text-center">
                  <div className="relative size-44 rounded-xl border-2 border-primary bg-black/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-[bounce_2s_infinite]"></div>
                    <QrCode className="size-16 text-muted-foreground opacity-70" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Hold Member QR Code in front of camera
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Camera auto-detects digital passes and member badges
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Floor Occupancy & Today's Attendance Feed (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col h-full">
            <CardHeader className="p-5 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="font-display text-base font-bold text-foreground">
                    Live Check-In Activity Log
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium">
                    {todayFormatted} · Real-time attendance feed
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-foreground bg-secondary">
                  Auto-sync (10s)
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/70 hover:bg-secondary/70">
                    <TableHead className="font-mono text-[10px] uppercase">Member</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Method</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Check-In Time</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-xs text-muted-foreground">
                        Loading live check-ins...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-xs text-muted-foreground">
                        No members checked in yet today. Ready for arrival.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-secondary/50">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-secondary border border-border text-foreground flex items-center justify-center font-mono font-bold text-xs shrink-0">
                              {log.first_name?.[0]}{log.last_name ? log.last_name[0] : ''}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs text-foreground truncate">
                                {log.first_name} {log.last_name || ''}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
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
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {new Date(log.check_in_time * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-ok/10 text-ok border-ok/30 font-mono text-[10px]">
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
