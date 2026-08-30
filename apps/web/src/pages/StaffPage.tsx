import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, ShieldAlert, UserCheck, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/lib/auth';

export const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const { data, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const staff = data?.staff || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'STAFF' | 'TRAINER'>('STAFF');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.createStaff({
        name,
        email,
        phone,
        role,
        password,
      });

      setDialogOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Staff & Trainers" breadcrumb="Operations">
      <PageContainer>
        <PageHeader
          title="Team & Access Control"
          description="Manage front desk personnel, fitness trainers, and role authorizations"
          actions={
            canManage && (
              <Button
                onClick={() => {
                  setError(null);
                  setDialogOpen(true);
                }}
                className="bg-primary text-primary-foreground font-bold text-xs h-9"
              >
                <Plus className="mr-1.5 size-4" /> Add Team Member
              </Button>
            )
          }
        />

        <Card className="border-border shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base">Active Roster</CardTitle>
            <span className="font-mono text-xs text-muted-foreground">
              {staff.length} registered members
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : staff.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No staff members found"
                description="Invite team members to help manage front desk or training."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2 hover:bg-surface-2">
                    <TableHead className="font-mono text-[10px] uppercase">Staff Member</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Role</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Contact</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s: any) => (
                    <TableRow key={s.id} className="hover:bg-secondary/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center font-mono font-bold text-xs">
                            {s.name?.[0] || 'S'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">{s.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{s.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={s.role} variant="role" /></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{s.phone || '—'}</TableCell>
                      <TableCell>
                        <span className="inline-flex px-1.5 py-0.5 rounded font-mono text-[10px] bg-ok/10 text-ok font-semibold">
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {new Date(s.created_at * 1000).toLocaleDateString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      {/* Add Staff Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Staff Member</DialogTitle>
            <DialogDescription className="text-xs">
              Assign role and credentials for gym console access
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staffName" className="text-xs font-semibold">Full Name *</Label>
              <Input
                id="staffName"
                required
                placeholder="e.g. Ramesh Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staffEmail" className="text-xs font-semibold">Email *</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  required
                  placeholder="ramesh@gym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staffPhone" className="text-xs font-semibold">Phone *</Label>
                <Input
                  id="staffPhone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staffRole" className="text-xs font-semibold">Role *</Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger id="staffRole" className="text-xs">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Front Desk / Staff</SelectItem>
                    <SelectItem value="TRAINER">Fitness Trainer</SelectItem>
                    <SelectItem value="MANAGER">Gym Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staffPassword" className="text-xs font-semibold">Initial Password *</Label>
                <Input
                  id="staffPassword"
                  type="password"
                  required
                  min={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </PageContainer>
    </AppShell>
  );
};
