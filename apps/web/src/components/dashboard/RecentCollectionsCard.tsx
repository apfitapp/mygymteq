import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface RecentCollectionsCardProps {
  recentPayments?: any[];
}

export const RecentCollectionsCard: React.FC<RecentCollectionsCardProps> = ({
  recentPayments = [],
}) => {
  return (
    <Card className="shadow-xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
        <div>
          <CardTitle className="font-display text-base">Recent Collections</CardTitle>
          <CardDescription className="text-xs">Latest recorded transactions</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs h-7">
          <a href="#/payments">View All</a>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {!recentPayments || recentPayments.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground px-4">
            No recent payment transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentPayments.slice(0, 6).map((p: any) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {p.first_name} {p.last_name || ''}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {p.payment_mode}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {p.receipt_number} • {new Date(p.payment_date * 1000).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold text-foreground">
                    {formatCurrency(p.amount)}
                  </span>
                  {p.whatsapp_url && (
                    <Button
                      asChild
                      size="icon"
                      variant="ghost"
                      className="size-8 text-[#25D366] hover:bg-[#25D366]/10"
                      title="Share WhatsApp Receipt"
                    >
                      <a href={p.whatsapp_url} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="size-4 fill-current" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
