import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  Send,
  CheckCircle,
  Calendar,
  CreditCard,
  MessageSquareShare,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface RenewalRecoveryCenterProps {
  expiringMembers?: any[];
  gymName?: string;
}

export const RenewalRecoveryCenter: React.FC<RenewalRecoveryCenterProps> = ({
  expiringMembers = [],
  gymName = 'GymTech',
}) => {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSendReminder = (item: any) => {
    if (item.whatsapp_url) {
      window.open(item.whatsapp_url, '_blank');
    } else {
      const expiryText = new Date(item.end_date * 1000).toLocaleDateString('en-IN');
      const message = `Hi ${item.first_name}! Your membership at ${gymName} expires on ${expiryText}. Renew today to keep your workout consistency and lock in your active rate! — Team ${gymName}`;
      window.open(buildWhatsAppUrl(item.phone, message), '_blank');
    }
    setSentMap((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleBroadcastAll = () => {
    setIsBroadcasting(true);
    expiringMembers.forEach((item, index) => {
      setTimeout(() => {
        setSentMap((prev) => ({ ...prev, [item.id]: true }));
        if (index === expiringMembers.length - 1) {
          setIsBroadcasting(false);
        }
      }, (index + 1) * 300);
    });
  };

  const pendingCount = expiringMembers.filter((m) => !sentMap[m.id]).length;

  return (
    <Card className="rounded-sm border border-border bg-card shadow-xs flex flex-col overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Zap className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold text-foreground">
                  WhatsApp Renewal Recovery
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-mono font-bold">
                  {pendingCount} QUEUED
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Members expiring in the next 7 days ready for 1-click reminders
              </CardDescription>
            </div>
          </div>

          {expiringMembers.length > 0 && (
            <Button
              size="sm"
              onClick={handleBroadcastAll}
              disabled={pendingCount === 0 || isBroadcasting}
              className="h-8 px-3.5 bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-sm"
            >
              <Send className="size-3.5" />
              <span>{isBroadcasting ? 'Broadcasting...' : `Broadcast All (${pendingCount})`}</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border">
        {expiringMembers.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="size-10 rounded-full bg-ok/10 text-ok flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No Renewals Due in the Next 7 Days</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              All active gym memberships are up to date. Upcoming term expirations will appear here automatically.
            </p>
          </div>
        ) : (
          expiringMembers.map((item) => {
            const isSent = sentMap[item.id];
            const expiryDateStr = new Date(item.end_date * 1000).toLocaleDateString('en-IN');
            return (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-sm bg-secondary border border-border text-foreground flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {item.first_name?.[0] || 'M'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {item.first_name} {item.last_name || ''}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        Expires {expiryDateStr}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {item.phone} {item.membership_due_amount ? `· Due: ₹${(item.membership_due_amount / 100).toLocaleString('en-IN')}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    size="sm"
                    variant={isSent ? 'outline' : 'default'}
                    onClick={() => handleSendReminder(item)}
                    className={`h-8 px-3 text-xs font-semibold gap-1.5 ${
                      isSent
                        ? 'border-ok text-ok bg-ok/10'
                        : 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-xs'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <CheckCircle className="size-3.5" />
                        <span>Sent</span>
                      </>
                    ) : (
                      <>
                        <MessageSquareShare className="size-3.5 fill-current" />
                        <span>Send Reminder</span>
                      </>
                    )}
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-foreground hover:bg-secondary">
                    <a href={`#/members/${item.id}/renew`}>Renew</a>
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
