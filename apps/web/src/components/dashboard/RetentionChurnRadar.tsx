import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Flame,
  MessageCircle,
  Clock,
  UserX,
  TrendingDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface InactiveMember {
  id: string;
  name: string;
  phone: string;
  plan: string;
  daysInactive: number;
  lastCheckIn: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

const mockAtRiskMembers: InactiveMember[] = [
  {
    id: '1',
    name: 'Vikram Malhotra',
    phone: '9876543210',
    plan: 'Annual Pro',
    daysInactive: 14,
    lastCheckIn: '14 days ago (14 Aug)',
    riskLevel: 'HIGH',
  },
  {
    id: '2',
    name: 'Ananya Deshmukh',
    phone: '9876543211',
    plan: '6 Months Strength',
    daysInactive: 11,
    lastCheckIn: '11 days ago (17 Aug)',
    riskLevel: 'HIGH',
  },
  {
    id: '3',
    name: 'Karan Mehra',
    phone: '9876543212',
    plan: 'Quarterly Fitness',
    daysInactive: 8,
    lastCheckIn: '8 days ago (20 Aug)',
    riskLevel: 'MEDIUM',
  },
  {
    id: '4',
    name: 'Pooja Hegde',
    phone: '9876543213',
    plan: 'Annual Pro',
    daysInactive: 7,
    lastCheckIn: '7 days ago (21 Aug)',
    riskLevel: 'MEDIUM',
  },
];

export const RetentionChurnRadar: React.FC = () => {
  const [nudgedMembers, setNudgedMembers] = useState<Record<string, boolean>>({});

  const handleNudge = (id: string, phone: string, name: string) => {
    const text = encodeURIComponent(
      `Hi ${name}! We noticed you haven't visited the gym in a few days. We miss seeing you crush your workouts! Let us know if you need any workout advice or a session with our trainer. — Team Iron House`
    );
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
    setNudgedMembers((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-[var(--line)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[var(--warn-soft)] text-[var(--warn)] flex items-center justify-center shrink-0">
              <UserX className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold text-[var(--ink)]">
                  Silent Dropouts & Churn Radar
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/30 font-mono font-bold">
                  {mockAtRiskMembers.length} AT-RISK
                </Badge>
              </div>
              <CardDescription className="text-xs text-[var(--muted)]">
                Members missing for 7+ days with active paid plans
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Sparkles className="size-3.5 text-[var(--accent-strong)]" />
            <span className="font-medium">Nudge early to save 40% churn</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-[var(--line)]">
        {mockAtRiskMembers.map((member) => {
          const isNudged = nudgedMembers[member.id];
          return (
            <div
              key={member.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--ink)] truncate">
                      {member.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 font-mono font-bold ${
                        member.riskLevel === 'HIGH'
                          ? 'bg-[var(--err-soft)] text-[var(--err)] border-[var(--err)]/30'
                          : 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/30'
                      }`}
                    >
                      {member.daysInactive}d Absent
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    {member.plan} · Last check-in: {member.lastCheckIn}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  size="sm"
                  variant={isNudged ? 'outline' : 'default'}
                  onClick={() => handleNudge(member.id, member.phone, member.name)}
                  className={`h-8 px-3 text-xs font-semibold gap-1.5 ${
                    isNudged
                      ? 'border-[var(--ok)] text-[var(--ok)] bg-[var(--ok-soft)]'
                      : 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-2xs'
                  }`}
                >
                  {isNudged ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Nudged</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="size-3.5 fill-current" />
                      <span>Send "We Miss You"</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
