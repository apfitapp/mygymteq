import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Phone, Mail, Calendar, RefreshCw, MessageCircle } from 'lucide-react';
import { formatInr, generateWhatsAppLink } from '@gym/shared';

// Demo data for the detail page
const DEMO_MEMBER = {
  id: 'mem_1', memberCode: 'MEM-1001', fullName: 'Rahul Sharma', email: 'rahul@email.com',
  phone: '9876543210', gender: 'MALE', status: 'ACTIVE', dateOfBirth: '1995-06-15',
  address: 'Jubilee Hills, Hyderabad', emergencyContact: '9876543299',
  gymId: 'gym_1', branchId: 'br_1', createdAt: '2026-01-15',
};

const DEMO_MEMBERSHIP = {
  planName: 'Monthly Fitness', startDate: '2026-08-01', endDate: '2026-08-31',
  status: 'ACTIVE', amountPaid: 200000, amountDue: 0,
};

const DEMO_PAYMENTS = [
  { id: 'pay_1', date: '2026-08-01', amount: 200000, method: 'UPI', receiptNo: 'REC-2026-0042', note: 'Monthly plan payment' },
  { id: 'pay_2', date: '2026-07-01', amount: 200000, method: 'CASH', receiptNo: 'REC-2026-0031', note: 'Monthly plan payment' },
  { id: 'pay_3', date: '2026-06-01', amount: 200000, method: 'UPI', receiptNo: 'REC-2026-0019', note: 'Monthly plan payment' },
];

const DEMO_ATTENDANCE = [
  { date: '2026-08-26', time: '07:15 AM' },
  { date: '2026-08-25', time: '06:50 AM' },
  { date: '2026-08-24', time: '07:30 AM' },
  { date: '2026-08-22', time: '07:00 AM' },
  { date: '2026-08-21', time: '06:45 AM' },
];

const METHOD_VARIANT: Record<string, 'default' | 'info' | 'secondary'> = {
  UPI: 'default',
  CASH: 'secondary',
  CARD: 'info',
};

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewForm, setRenewForm] = useState({ planId: '', amountPaid: '', paymentMethod: 'UPI' });

  // In production, fetch member by id
  const member = { ...DEMO_MEMBER, id: id || DEMO_MEMBER.id };
  const membership = DEMO_MEMBERSHIP;

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRenewModal(false);
  };

  const whatsappUrl = generateWhatsAppLink(member.phone, 'CUSTOM', {
    gymName: 'Iron House Fitness',
    memberName: member.fullName,
    customMessage: `Hi ${member.fullName}, your membership at our gym is active until ${membership.endDate}. Thank you!`,
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/members')} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{member.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl font-bold font-display text-[var(--ink)]">{member.fullName}</h1>
                <Badge variant={member.status === 'ACTIVE' ? 'success' : 'destructive'}>{member.status}</Badge>
                <span className="text-xs font-mono text-[var(--muted)]">{member.memberCode}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--ink-2)]">
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {member.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {member.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </Button>
              <Button size="sm" onClick={() => setShowRenewModal(true)} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Renew
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Membership Summary */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Plan</p>
              <p className="text-sm font-semibold text-[var(--ink)] mt-1">{membership.planName}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Valid Until</p>
              <p className="text-sm font-semibold text-[var(--ink)] mt-1">{new Date(membership.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Paid</p>
              <p className="text-sm font-semibold text-[var(--ok)] mt-1 font-mono">{formatInr(membership.amountPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Due</p>
              <p className="text-sm font-semibold text-[var(--ink)] mt-1 font-mono">{formatInr(membership.amountDue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Payments / Attendance */}
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Log</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="hidden sm:table-cell">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_PAYMENTS.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-[var(--ink)]">{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</TableCell>
                      <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                      <TableCell className="font-mono font-medium text-[var(--ink)]">{formatInr(p.amount)}</TableCell>
                      <TableCell><Badge variant={METHOD_VARIANT[p.method] || 'secondary'}>{p.method}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell text-[var(--muted)]">{p.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_ATTENDANCE.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-[var(--ink)]">{new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</TableCell>
                      <TableCell className="font-mono">{a.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Renew Dialog */}
      <Dialog open={showRenewModal} onOpenChange={setShowRenewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Membership</DialogTitle>
            <DialogDescription>Select a plan and record payment for {member.fullName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenew} className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={renewForm.planId} onValueChange={(val) => setRenewForm({ ...renewForm, planId: val })}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Fitness — ₹2,000</SelectItem>
                  <SelectItem value="quarterly">Quarterly Plan — ₹5,000</SelectItem>
                  <SelectItem value="annual">Annual VIP — ₹15,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" value={renewForm.amountPaid} onChange={(e) => setRenewForm({ ...renewForm, amountPaid: e.target.value })} placeholder="2000" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={renewForm.paymentMethod} onValueChange={(val) => setRenewForm({ ...renewForm, paymentMethod: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRenewModal(false)}>Cancel</Button>
              <Button type="submit">Renew & Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
