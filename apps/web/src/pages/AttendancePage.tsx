import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { CheckInPanel } from '@/components/attendance/CheckInPanel';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { api } from '@/lib/api';

export const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.getAttendance(),
    refetchInterval: 10000,
  });

  const logs = data?.logs || [];

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

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <AppShell title="Attendance & Kiosk Desk" breadcrumb="Operations">
      <PageContainer>
        <PageHeader
          title="Member Attendance & Check-In Kiosk"
          description="High-speed tablet dialpad, digital QR scanner, and live floor occupancy"
          actions={<AttendanceStats count={logs.length} />}
        />

        {/* Main Kiosk & Attendance Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Check-In Terminal */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <CheckInPanel
              onCheckIn={handleCheckIn}
              isCheckingIn={isCheckingIn}
              errorMessage={errorMessage}
              blockedMember={blockedMember}
              lastCheckedMember={lastCheckedMember}
            />
          </div>

          {/* Right: Live Activity Feed */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <AttendanceHistory
              logs={logs}
              isLoading={isLoading}
              todayFormatted={todayFormatted}
            />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
};
