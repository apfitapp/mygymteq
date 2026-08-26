import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Clock, MessageCircle } from 'lucide-react';
import { formatInr, generateWhatsAppLink } from '@gym/shared';

const DEMO_PLANS = [
  { id: 'plan_1', name: 'Monthly Fitness', durationDays: 30, price: 200000, admissionFee: 50000, status: 'ACTIVE' },
  { id: 'plan_2', name: 'Quarterly Plan', durationDays: 90, price: 500000, admissionFee: 50000, status: 'ACTIVE' },
  { id: 'plan_3', name: 'Annual VIP', durationDays: 365, price: 1500000, admissionFee: 0, status: 'ACTIVE' },
];

const DEMO_EXPIRING = [
  { memberId: 'mem_1', memberName: 'Rahul Sharma', phone: '9876543210', planName: 'Monthly Fitness', endDate: '2026-08-30', daysLeft: 3 },
  { memberId: 'mem_5', memberName: 'Kiran Kumar', phone: '9876543214', planName: 'Quarterly Plan', endDate: '2026-09-02', daysLeft: 6 },
  { memberId: 'mem_6', memberName: 'Divya Srinivasan', phone: '9876543215', planName: 'Monthly Fitness', endDate: '2026-09-05', daysLeft: 9 },
];

export const MembershipsPage: React.FC = () => {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', durationDays: '30', price: '', admissionFee: '0' });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreatePlan(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--ink)]">Memberships & Plans</h1>
          <p className="text-sm text-[var(--muted)]">Manage your plan catalog and track expiring memberships</p>
        </div>
        <Button onClick={() => setShowCreatePlan(true)}>
          <Plus className="h-4 w-4" /> Create Plan
        </Button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_PLANS.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
              <CardDescription>{plan.durationDays} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">Price</span>
                  <span className="text-lg font-bold font-mono text-[var(--ink)]">{formatInr(plan.price)}</span>
                </div>
                {plan.admissionFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Admission Fee</span>
                    <span className="text-sm font-mono text-[var(--ink-2)]">{formatInr(plan.admissionFee)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expiring Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--warn)]" />
              Expiring Soon
            </CardTitle>
            <p className="text-xs text-[var(--muted)] mt-0.5">{DEMO_EXPIRING.length} memberships expiring within 10 days</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_EXPIRING.map((m) => (
                <TableRow key={m.memberId}>
                  <TableCell className="font-medium text-[var(--ink)]">{m.memberName}</TableCell>
                  <TableCell>{m.planName}</TableCell>
                  <TableCell>
                    <Badge variant={m.daysLeft <= 3 ? 'destructive' : 'warning'}>
                      {m.daysLeft} days left
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={generateWhatsAppLink(m.phone, 'RENEWAL_REMINDER', {
                          gymName: 'Iron House Fitness',
                          memberName: m.memberName,
                          expiryDate: m.endDate,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-1.5"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Remind
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Membership Plan</DialogTitle>
            <DialogDescription>Define a new plan that members can subscribe to</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Monthly Fitness" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input type="number" value={planForm.durationDays} onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} placeholder="2000" required />
              </div>
              <div className="space-y-2">
                <Label>Admission (₹)</Label>
                <Input type="number" value={planForm.admissionFee} onChange={(e) => setPlanForm({ ...planForm, admissionFee: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreatePlan(false)}>Cancel</Button>
              <Button type="submit">Create Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
