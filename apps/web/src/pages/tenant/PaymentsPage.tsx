import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, IndianRupee, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatInr } from '@gym/shared';

const METHOD_VARIANT: Record<string, 'default' | 'info' | 'secondary'> = {
  UPI: 'default',
  CASH: 'secondary',
  CARD: 'info',
};

const DEMO_PAYMENTS = [
  { id: 'p1', receiptNo: 'REC-2026-0042', memberName: 'Rahul Sharma', memberCode: 'MEM-1001', amount: 200000, method: 'UPI', utrReference: 'UTR123456789', date: '2026-08-26', note: 'Monthly plan renewal' },
  { id: 'p2', receiptNo: 'REC-2026-0041', memberName: 'Sneha Reddy', memberCode: 'MEM-1002', amount: 500000, method: 'CARD', utrReference: '', date: '2026-08-25', note: 'Quarterly plan' },
  { id: 'p3', receiptNo: 'REC-2026-0040', memberName: 'Amit Patel', memberCode: 'MEM-1003', amount: 200000, method: 'CASH', utrReference: '', date: '2026-08-24', note: 'Monthly plan' },
  { id: 'p4', receiptNo: 'REC-2026-0039', memberName: 'Priya Nair', memberCode: 'MEM-1004', amount: 50000, method: 'UPI', utrReference: 'UTR987654321', date: '2026-08-23', note: 'Admission fee' },
];

export const PaymentsPage: React.FC = () => {
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    memberId: '', amount: '', method: 'UPI', utrReference: '', note: '',
  });

  const totalCollected = DEMO_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  const totalDues = 4200000; // Demo

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRecordPayment(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--ink)]">Payments & Receipts</h1>
          <p className="text-sm text-[var(--muted)]">Track collections, record payments, and manage outstanding dues</p>
        </div>
        <Button onClick={() => setShowRecordPayment(true)}>
          <Plus className="h-4 w-4" /> Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">This Month</p>
                <p className="text-2xl font-bold text-[var(--ok)] mt-1 font-mono">{formatInr(totalCollected)}</p>
              </div>
              <div className="bg-[var(--ok-soft)] text-[var(--ok)] p-2.5 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Outstanding Dues</p>
                <p className="text-2xl font-bold text-[var(--err)] mt-1 font-mono">{formatInr(totalDues)}</p>
              </div>
              <div className="bg-[var(--err-soft)] text-[var(--err)] p-2.5 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Receipts Issued</p>
                <p className="text-2xl font-bold text-[var(--ink)] mt-1 font-mono">{DEMO_PAYMENTS.length}</p>
              </div>
              <div className="bg-[var(--accent-soft)] text-[var(--accent)] p-2.5 rounded-lg">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_PAYMENTS.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-medium text-[var(--ink)]">{p.receiptNo}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[var(--ink)]">{p.memberName}</p>
                      <p className="text-xs text-[var(--muted)]">{p.memberCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-[var(--ink)]">{formatInr(p.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={METHOD_VARIANT[p.method] || 'secondary'}>{p.method}</Badge>
                    {p.utrReference && <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono">{p.utrReference}</p>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-[var(--muted)]">
                    {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-[var(--muted)]">{p.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordPayment} onOpenChange={setShowRecordPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment received from a member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <Input placeholder="Search member by name or code..." value={paymentForm.memberId} onChange={(e) => setPaymentForm({ ...paymentForm, memberId: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="2000" required />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={paymentForm.method} onValueChange={(val) => setPaymentForm({ ...paymentForm, method: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {paymentForm.method === 'UPI' && (
              <div className="space-y-2">
                <Label>UTR Reference</Label>
                <Input value={paymentForm.utrReference} onChange={(e) => setPaymentForm({ ...paymentForm, utrReference: e.target.value })} placeholder="UTR123456789" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} placeholder="Monthly plan renewal" rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRecordPayment(false)}>Cancel</Button>
              <Button type="submit">Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
