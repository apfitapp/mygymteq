import React from 'react';
import { CreditCard, FileText, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingState';
import { formatCurrency } from '@/lib/utils';

interface PaymentTableProps {
  payments: any[];
  isLoading?: boolean;
  onOpenInvoice: (paymentId: string) => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  isLoading,
  onOpenInvoice,
}) => {
  const getModeBadge = (mode: string) => {
    const m = (mode || '').toUpperCase();
    if (m === 'UPI') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
          UPI
        </span>
      );
    }
    if (m === 'CASH') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] bg-ok/10 text-ok border border-ok/20 font-bold">
          CASH
        </span>
      );
    }
    if (m === 'CARD') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
          CARD
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] bg-secondary text-foreground font-medium">
        {mode}
      </span>
    );
  };

  return (
    <Card className="border-border shadow-xs overflow-hidden bg-card rounded-xl">
      <CardHeader className="py-3.5 px-5 border-b border-border flex flex-row items-center justify-between bg-card">
        <CardTitle className="font-display text-base font-bold">Payment Ledger</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">
          {payments.length} transaction records
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions recorded"
            description="Payments collected from members will appear in this ledger."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60 border-b border-border">
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Receipt No</TableHead>
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Date</TableHead>
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Member</TableHead>
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Mode</TableHead>
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Reference</TableHead>
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider text-right">Amount</TableHead>
                <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-secondary/50 transition-colors group">
                  <TableCell className="font-mono font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {p.receipt_number}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(p.payment_date * 1000).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-foreground">
                        {p.first_name} {p.last_name || ''}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {p.member_code} • {p.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getModeBadge(p.payment_mode)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.reference_id || '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-full px-2.5 hover:bg-secondary"
                        onClick={() => onOpenInvoice(p.id)}
                      >
                        <FileText className="size-3.5 mr-1" /> Invoice
                      </Button>
                      {p.whatsapp_url && (
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-[#25D366] hover:bg-[#25D366]/10 rounded-full px-2.5"
                        >
                          <a href={p.whatsapp_url} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="size-3.5 mr-1 fill-current" /> Share
                          </a>
                        </Button>
                      )}
                    </div>
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
