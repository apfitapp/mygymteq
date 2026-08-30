import React from 'react';
import { ChevronRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingState';
import { formatCurrency } from '@/lib/utils';

interface MemberTableProps {
  members: any[];
  isLoading?: boolean;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0">
          <TableSkeleton rows={6} cols={6} />
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-0">
          <EmptyState
            icon={Users}
            title="No members found"
            description="No members match the current search or status filter criteria."
          />
        </CardContent>
      </Card>
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <Card className="border-border shadow-xs overflow-hidden bg-card rounded-xl">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60 border-b border-border">
              <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Member</TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Contact</TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Current Plan</TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider text-right">Dues</TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m: any) => {
              const initials = `${m.first_name?.[0] || 'M'}${m.last_name?.[0] || ''}`.toUpperCase();
              const isExpired = m.membership_end_date ? m.membership_end_date < nowSec : false;
              const daysRemaining = m.membership_end_date ? Math.ceil((m.membership_end_date - nowSec) / 86400) : 0;
              const effectiveStatus = isExpired || m.status === 'EXPIRED' ? 'EXPIRED' : m.status;

              return (
                <TableRow key={m.id} className="hover:bg-secondary/50 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8.5 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display text-xs font-bold shrink-0 overflow-hidden shadow-2xs group-hover:border-primary/40 transition-colors">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.first_name} className="size-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <a
                          href={`#/members/${m.id}`}
                          className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate"
                        >
                          {m.first_name} {m.last_name || ''}
                        </a>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {m.member_code}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col text-xs font-mono">
                      <span className="text-foreground">{m.phone}</span>
                      {m.email && <span className="text-muted-foreground text-[11px] truncate">{m.email}</span>}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-semibold text-foreground">{m.plan_name || 'No Plan'}</span>
                      {m.membership_end_date ? (
                        <>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {m.membership_start_date ? new Date(m.membership_start_date * 1000).toLocaleDateString('en-IN') : '—'} → {new Date(m.membership_end_date * 1000).toLocaleDateString('en-IN')}
                          </span>
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-destructive/10 text-destructive border border-destructive/30 w-fit">
                              EXPIRED · Frozen
                            </span>
                          ) : daysRemaining <= 7 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 w-fit">
                              Expiring ({daysRemaining}d left)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-ok/10 text-ok border border-ok/30 w-fit">
                              Active ({daysRemaining}d left)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">No active term</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={effectiveStatus} size="sm" />
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs">
                    {m.membership_due_amount > 0 ? (
                      <span className="text-destructive font-bold">
                        {formatCurrency(m.membership_due_amount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">₹0</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isExpired && (
                        <Button asChild size="sm" variant="outline" className="h-7 text-[11px] px-2.5 font-bold border-primary/40 text-primary hover:bg-primary/10 rounded-full">
                          <a href={`#/members/${m.id}/renew`}>Renew</a>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2.5 rounded-full hover:bg-secondary">
                        <a href={`#/members/${m.id}`}>
                          Profile <ChevronRight className="ml-1 size-3" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

