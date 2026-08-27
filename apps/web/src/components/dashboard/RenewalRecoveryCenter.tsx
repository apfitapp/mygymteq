import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Send,
  CheckCircle,
  Calendar,
  CreditCard,
  MessageSquareShare,
  Sparkles,
  Zap
} from 'lucide-react';

interface ExpiringRenewal {
  id: string;
  name: string;
  phone: string;
  plan: string;
  expiryDate: string;
  daysLeft: number;
  dueAmount: number;
}

const mockRenewals: ExpiringRenewal[] = [
  {
    id: 'r1',
    name: 'Rohit Verma',
    phone: '9876543214',
    plan: 'Quarterly Fitness (₹4,500)',
    expiryDate: 'In 2 days (30 Aug)',
    daysLeft: 2,
    dueAmount: 0,
  },
  {
    id: 'r2',
    name: 'Sneha Kulkarni',
    phone: '9876543215',
    plan: 'Monthly Strength (₹1,800)',
    expiryDate: 'In 3 days (31 Aug)',
    daysLeft: 3,
    dueAmount: 0,
  },
  {
    id: 'r3',
    name: 'Amit Patel',
    phone: '9876543216',
    plan: '6 Months Pro (₹8,000)',
    expiryDate: 'In 5 days (02 Sep)',
    daysLeft: 5,
    dueAmount: 1000,
  },
  {
    id: 'r4',
    name: 'Divya Nair',
    phone: '9876543217',
    plan: 'Annual Elite (₹14,000)',
    expiryDate: 'In 7 days (04 Sep)',
    daysLeft: 7,
    dueAmount: 0,
  },
];

export const RenewalRecoveryCenter: React.FC = () => {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSendReminder = (item: ExpiringRenewal) => {
    const message = encodeURIComponent(
      `Hi ${item.name}! Your ${item.plan} at Iron House Fitness is expiring ${item.expiryDate}. Renew today to lock in your discounted rate and keep your workout routine unbroken! Let us know if you want us to send a payment link. — Team Iron House`
    );
    window.open(`https://wa.me/91${item.phone}?text=${message}`, '_blank');
    setSentMap((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleBroadcastAll = () => {
    setIsBroadcasting(true);
    // Simulate batch dispatch
    mockRenewals.forEach((item, index) => {
      setTimeout(() => {
        setSentMap((prev) => ({ ...prev, [item.id]: true }));
        if (index === mockRenewals.length - 1) {
          setIsBroadcasting(false);
        }
      }, (index + 1) * 300);
    });
  };

  const pendingCount = mockRenewals.filter((m) => !sentMap[m.id]).length;

  return (
    <Card className="rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-[var(--line)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center shrink-0">
              <Zap className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold text-[var(--ink)]">
                  WhatsApp Renewal Recovery Queue
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent-strong)] border-[var(--accent)]/30 font-mono font-bold">
                  {pendingCount} QUEUED
                </Badge>
              </div>
              <CardDescription className="text-xs text-[var(--muted)]">
                Members expiring in the next 7 days ready for 1-click reminders
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleBroadcastAll}
            disabled={pendingCount === 0 || isBroadcasting}
            className="h-8 px-3.5 bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-strong)] text-xs font-bold gap-1.5 shadow-sm"
          >
            <Send className="size-3.5" />
            <span>{isBroadcasting ? 'Sending...' : 'Broadcast All Queued (4)'}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-[var(--line)]">
        {mockRenewals.map((item) => {
          const isSent = sentMap[item.id];
          return (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {item.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--ink)] truncate">
                      {item.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 font-mono font-bold ${
                        item.daysLeft <= 3
                          ? 'bg-[var(--err-soft)] text-[var(--err)] border-[var(--err)]/30'
                          : 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/30'
                      }`}
                    >
                      {item.expiryDate}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    {item.plan} {item.dueAmount > 0 ? `· Balance Due: ₹${item.dueAmount}` : ''}
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
                      ? 'border-[var(--ok)] text-[var(--ok)] bg-[var(--ok-soft)]'
                      : 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-2xs'
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
                <Button asChild size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-[var(--ink)] hover:bg-[var(--line)]">
                  <a href={`#/members/${item.id}/renew`}>Renew</a>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
