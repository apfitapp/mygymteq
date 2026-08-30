import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  UserX,
  MessageCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface InactiveMember {
  id: string;
  name: string;
  phone: string;
  plan: string;
  daysInactive: number;
  lastCheckIn: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface RetentionChurnRadarProps {
  atRiskMembers?: InactiveMember[];
  gymName?: string;
}

export const RetentionChurnRadar: React.FC<RetentionChurnRadarProps> = ({
  atRiskMembers = [],
  gymName = 'GymTech',
}) => {
  const [nudgedMembers, setNudgedMembers] = useState<Record<string, boolean>>({});

  const handleNudge = (id: string, phone: string, name: string) => {
    const text = `Hi ${name}! We noticed you haven't visited the gym recently. We miss seeing you crush your workouts! Let us know if you need any workout advice or a session with our trainer. — Team ${gymName}`;
    window.open(buildWhatsAppUrl(phone, text), '_blank');
    setNudgedMembers((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <Card className="rounded-sm border border-border bg-card shadow-xs flex flex-col overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UserX className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold text-foreground">
                  Silent Dropouts &amp; Churn Radar
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-mono font-bold">
                  {atRiskMembers.length} AT-RISK
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Members missing for 7+ days with active paid plans
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-medium">Early nudges reduce churn up to 40%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border">
        {atRiskMembers.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="size-10 rounded-full bg-ok/10 text-ok flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No Dropouts or Inactive Members Detected</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Attendance consistency is healthy across your enrolled members. Any member missing for 7+ days will be flagged here.
            </p>
          </div>
        ) : (
          atRiskMembers.map((member) => {
            const isNudged = nudgedMembers[member.id];
            return (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-sm bg-secondary border border-border text-foreground flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {member.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 font-mono font-bold ${
                          member.riskLevel === 'HIGH'
                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {member.daysInactive}d Absent
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
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
                        ? 'border-ok text-ok bg-ok/10'
                        : 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-xs'
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
          })
        )}
      </CardContent>
    </Card>
  );
};
