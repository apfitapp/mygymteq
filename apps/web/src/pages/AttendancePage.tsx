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
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [message, setMessage] = useState<{ type: 'success' | 'warn' | 'error'; text: string } | null>(null);

  const handleCheckIn = async (code: string, method: 'MANUAL' | 'QR_SCAN' = 'MANUAL') => {
    if (!code.trim()) return;
    setMessage(null);
    setIsCheckingIn(true);

    try {
      const res = await api.checkIn({
        memberIdOrCode: code.trim(),
        method,
      });

      if (res.alreadyCheckedIn) {
        setMessage({
          type: 'warn',
          text: `${res.member.name} (${res.member.memberCode}) has already checked in today!`,
        });
      } else {
        setMessage({
          type: 'success',
          text: `Check-in recorded! Welcome, ${res.member.name} (${res.member.memberCode}).`,
        });
        setInputCode('');
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Check-in failed. Please verify member code or phone number.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <AppShell title="Attendance Desk" breadcrumb="Operations">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Quick Check-in Terminal (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="font-display text-base">Check-in Terminal</CardTitle>
              <CardDescription className="text-xs">
                Scan QR or enter member code / phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              {message && (
                <Alert
                  variant={message.type === 'error' ? 'destructive' : 'default'}
                  className={message.type === 'success' ? 'border-ok/30 bg-ok/10 text-ok' : message.type === 'warn' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' : ''}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <AlertCircle className="size-4" />
                  )}
                  <AlertDescription className="text-xs">{message.text}</AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckIn(inputCode, 'MANUAL');
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="code" className="text-xs font-semibold">
                    Member Code or Mobile Phone
                  </Label>
                  <Input
                    id="code"
                    autoFocus
                    placeholder="e.g. MEM-1001 or 9876543210"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="font-mono text-sm h-10 font-bold"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={isCheckingIn || !inputCode.trim()}
                    className="flex-1 bg-primary text-primary-foreground font-bold text-xs h-10"
                  >
                    <UserCheck className="mr-1.5 size-4" /> Check In
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCheckingIn}
                    onClick={() => handleCheckIn('MEM-1001', 'QR_SCAN')}
                    title="Simulate QR Code Badge Scanner"
                    className="text-xs h-10"
                  >
                    <QrCode className="size-4 mr-1" /> Simulate QR
                  </Button>
                </div>
              </form>

              {/* Tips */}
              <div className="p-3 rounded-lg bg-surface-2 border border-border text-[11px] text-muted-foreground flex flex-col gap-1">
                <span className="font-semibold text-foreground font-mono">Reception Desk Tip:</span>
                <span>Press Enter to instantly record attendance for rush hour queues.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Today's Check-in Log (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-base">Today's Check-ins</CardTitle>
                <CardDescription className="text-xs">{todayFormatted}</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {logs.length} checked in
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2 hover:bg-surface-2">
                    <TableHead className="font-mono text-[10px] uppercase">Time</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Member</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Phone</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                        Loading daily attendance log...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                        No members have checked in yet today.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-secondary/40">
                        <TableCell className="font-mono text-xs text-foreground font-bold">
                          {new Date(log.check_in_time * 1000).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-foreground">
                              {log.first_name} {log.last_name || ''}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {log.member_code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.phone}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex px-1.5 py-0.2 rounded font-mono text-[10px] bg-secondary text-foreground font-medium">
                            {log.method}
                          </span>
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
