import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingState';

interface AttendanceHistoryProps {
  logs: any[];
  isLoading?: boolean;
  todayFormatted: string;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  logs,
  isLoading,
  todayFormatted,
}) => {
  return (
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
        {isLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No check-ins today"
            description="Members who verify attendance will appear in this real-time stream."
          />
        ) : (
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
              {logs.map((log: any) => (
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
                    {new Date(log.check_in_time * 1000).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-ok/10 text-ok border-ok/30 font-mono text-[10px]">
                      VERIFIED
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
