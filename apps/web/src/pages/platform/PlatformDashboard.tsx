import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Users,
  TrendingUp,
  Plus,
  Power,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { formatInr } from '@gym/shared';

const DEMO_GYMS = [
  { id: 'gym_1', name: 'Iron House Fitness', slug: 'ironhouse', city: 'Hyderabad', status: 'ACTIVE', members: 142, mrr: 285000, plan: 'Pro' },
  { id: 'gym_2', name: 'PowerHouse Fitness Arena', slug: 'powerhouse', city: 'Bengaluru', status: 'ACTIVE', members: 88, mrr: 165000, plan: 'Starter' },
  { id: 'gym_3', name: 'FitZone Studio', slug: 'fitzone', city: 'Mumbai', status: 'TRIAL', members: 24, mrr: 0, plan: 'Trial' },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  TRIAL: 'warning',
  SUSPENDED: 'destructive',
  INACTIVE: 'secondary',
};

export const PlatformDashboard: React.FC = () => {
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    gymName: '', slug: '', ownerName: '', ownerEmail: '', ownerPhone: '', city: '',
  });

  const totalGyms = DEMO_GYMS.length;
  const activeGyms = DEMO_GYMS.filter((g) => g.status === 'ACTIVE').length;
  const totalMembers = DEMO_GYMS.reduce((sum, g) => sum + g.members, 0);
  const totalMrr = DEMO_GYMS.reduce((sum, g) => sum + g.mrr, 0);

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboardModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--ink)]">Platform Overview</h1>
          <p className="text-sm text-[var(--muted)]">MyGymTeq SaaS Super Admin Dashboard</p>
        </div>
        <Button onClick={() => setShowOnboardModal(true)}>
          <Plus className="h-4 w-4" /> Onboard New Gym
        </Button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Total Gyms</p>
                <p className="text-2xl font-bold text-[var(--ink)] mt-1 font-mono">{totalGyms}</p>
              </div>
              <div className="bg-[var(--accent-soft)] text-[var(--accent)] p-2.5 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Active Gyms</p>
                <p className="text-2xl font-bold text-[var(--ok)] mt-1 font-mono">{activeGyms}</p>
              </div>
              <div className="bg-[var(--ok-soft)] text-[var(--ok)] p-2.5 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Total Members</p>
                <p className="text-2xl font-bold text-[var(--ink)] mt-1 font-mono">{totalMembers}</p>
              </div>
              <div className="bg-[var(--info-soft)] text-[var(--info)] p-2.5 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Monthly MRR</p>
                <p className="text-2xl font-bold text-[var(--accent)] mt-1 font-mono">{formatInr(totalMrr)}</p>
              </div>
              <div className="bg-[var(--accent-soft)] text-[var(--accent)] p-2.5 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gym Tenants Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gym Tenants</CardTitle>
          <CardDescription>All registered gym businesses on the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gym Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="hidden md:table-cell">MRR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_GYMS.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium text-[var(--ink)]">{g.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="flex items-center gap-1 text-xs text-[var(--muted)] font-mono">
                      <Globe className="h-3 w-3" /> {g.slug}.mygymteq.com
                    </span>
                  </TableCell>
                  <TableCell>{g.city}</TableCell>
                  <TableCell className="font-mono">{g.members}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono">{formatInr(g.mrr)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[g.status] || 'secondary'}>{g.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={g.status === 'SUSPENDED' ? 'default' : 'ghost'}
                      size="sm"
                      className={g.status !== 'SUSPENDED' ? 'text-[var(--err)]' : ''}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {g.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Onboard New Gym Dialog */}
      <Dialog open={showOnboardModal} onOpenChange={setShowOnboardModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Onboard New Gym</DialogTitle>
            <DialogDescription>
              Register a new gym tenant. This will auto-create their database, primary branch, owner account, and default membership plans.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboard} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Gym Name</Label>
                <Input value={onboardForm.gymName} onChange={(e) => setOnboardForm({ ...onboardForm, gymName: e.target.value })} placeholder="FitZone Studio" required />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input value={onboardForm.slug} onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value })} placeholder="fitzone" required />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={onboardForm.city} onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })} placeholder="Mumbai" required />
              </div>
            </div>
            <Separator />
            <p className="text-sm font-medium text-[var(--ink)]">Owner Account</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Owner Name</Label>
                <Input value={onboardForm.ownerName} onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })} placeholder="Vikas Jain" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={onboardForm.ownerEmail} onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })} placeholder="vikas@fitzone.in" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={onboardForm.ownerPhone} onChange={(e) => setOnboardForm({ ...onboardForm, ownerPhone: e.target.value })} placeholder="9876543210" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowOnboardModal(false)}>Cancel</Button>
              <Button type="submit">Onboard Gym</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
