import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Plus,
  IndianRupee,
  Calendar,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.getPayments({ limit: 100 }),
  });

  const { data: membersData } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.getMembers({ limit: 200 }),
  });

  const payments = data?.payments || [];
  const summary = data?.summary || { monthlyRevenue: 0, todayRevenue: 0, pendingDues: 0 };
  const members = membersData?.members || [];

  // Dialog State for Record Payment
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ receiptNumber: string; whatsappUrl?: string } | null>(null);

  const formatCurrency = (paise: number) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.recordPayment({
        memberId: selectedMemberId,
        amount: Number(amount),
        paymentMode,
        referenceId: referenceId || undefined,
        notes: notes || undefined,
      });

      setSuccessInfo(res);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Payments & Dues" breadcrumb="Billing">
      {/* Header & Record Button */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Financial Ledger &amp; Dues
          </h2>
          <p className="text-xs text-muted-foreground">
            Complete transaction record, collections overview, and receipt issuance
          </p>
        </div>

        <Button
          onClick={() => {
            setSuccessInfo(null);
            setError(null);
            if (members.length > 0) setSelectedMemberId(members[0].id);
            setDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground font-bold text-xs h-9"
        >
          <Plus className="mr-1.5 size-4" /> Collect Payment
        </Button>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Collections"
          value={formatCurrency(summary.monthlyRevenue)}
          subtitle="This calendar month"
          variant="ok"
          icon={<IndianRupee className="size-4" />}
        />
        <StatCard
          title="Today's Collections"
          value={formatCurrency(summary.todayRevenue)}
          subtitle="Collected today"
          variant="accent"
          icon={<CreditCard className="size-4" />}
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(summary.pendingDues)}
          subtitle="Total member dues"
          variant={summary.pendingDues > 0 ? 'err' : 'default'}
          icon={<AlertCircle className="size-4" />}
        />
      </div>

      {/* Payment Ledger Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base">Payment Ledger</CardTitle>
          <span className="font-mono text-xs text-muted-foreground">
            {payments.length} transaction records
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-2 hover:bg-surface-2">
                <TableHead className="font-mono text-[10px] uppercase">Receipt No</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Date</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Member</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Mode</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Reference</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-right">Amount</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-right">WhatsApp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    Loading payments ledger...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No transactions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-secondary/40">
                    <TableCell className="font-mono font-bold text-xs text-foreground">
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
                      <span className="inline-flex px-1.5 py-0.2 rounded font-mono text-[10px] bg-secondary text-foreground font-medium">
                        {p.payment_mode}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.reference_id || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.whatsapp_url && (
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-[#25D366] hover:bg-[#25D366]/10">
                          <a href={p.whatsapp_url} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="size-3.5 mr-1 fill-current" /> Share
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Record Payment</DialogTitle>
            <DialogDescription className="text-xs">
              Log a payment against dues or walk-in package renewal
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {successInfo ? (
            <div className="py-4 text-center flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-ok/10 text-ok flex items-center justify-center">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Payment Logged Successfully!</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  Receipt: {successInfo.receiptNumber}
                </p>
              </div>

              <div className="flex gap-2 w-full mt-2">
                {successInfo.whatsappUrl && (
                  <Button asChild className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold">
                    <a href={successInfo.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-4 mr-1.5 fill-current" /> Share WhatsApp Receipt
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRecordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="memberSelect" className="text-xs font-semibold">Select Member *</Label>
                <select
                  id="memberSelect"
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-card text-xs font-sans focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name || ''} ({m.member_code}) {m.membership_due_amount > 0 ? `— Due: ${formatCurrency(m.membership_due_amount)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount" className="text-xs font-semibold">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1500"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="mode" className="text-xs font-semibold">Payment Mode</Label>
                  <select
                    id="mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="h-9 px-3 rounded-md border border-input bg-card text-xs font-sans focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NETBANKING">Net Banking</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ref" className="text-xs font-semibold">Ref / Notes</Label>
                  <Input
                    id="ref"
                    placeholder="e.g. UPI Ref ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground font-bold text-xs"
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};
