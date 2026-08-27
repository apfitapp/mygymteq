import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Users,
  Shield,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { AdminShell } from '@/components/layout/AdminShell';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: metricsData } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.getAdminMetrics(),
  });

  const { data: gymsData, isLoading: gymsLoading } = useQuery({
    queryKey: ['admin-gyms'],
    queryFn: () => api.getAdminGyms(),
  });

  const { data: plansData } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => api.getAdminPlans(),
  });

  const gyms = gymsData?.gyms || [];
  const plans = plansData?.plans || [];
  const metrics = metricsData || { totalGyms: 0, activeGyms: 0, totalMembers: 0, platformRevenue: 0 };

  // Onboard Gym Form State
  const [gymName, setGymName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [planId, setPlanId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('admin123');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (plans.length > 0 && !planId) {
      setPlanId(plans[0].id);
    }
  }, [plans, planId]);

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await api.createGym({
        gymName,
        slug,
        city: city || undefined,
        gymPhone,
        planId,
        ownerName,
        ownerEmail,
        ownerPhone,
        ownerPassword,
      });

      setSuccess(true);
      setGymName('');
      setSlug('');
      setCity('');
      setGymPhone('');
      setOwnerName('');
      setOwnerEmail('');
      setOwnerPhone('');

      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    } catch (err: any) {
      setError(err.message || 'Failed to onboard gym');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (gymId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleGymStatus(gymId, nextStatus);
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const formatCurrency = (paise: number) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
  };

  return (
    <AdminShell title="Tenants & Commercial Subscriptions">
      {/* Platform KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gyms"
          value={metrics.totalGyms}
          subtitle={`${metrics.activeGyms} Active Tenants`}
          variant="accent"
          icon={<Building2 className="size-4" />}
        />
        <StatCard
          title="Active Gyms"
          value={metrics.activeGyms}
          subtitle="Subscribed & operational"
          variant="ok"
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          title="Platform Members"
          value={metrics.totalMembers}
          subtitle="Across all studios"
          variant="default"
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Platform Collections"
          value={formatCurrency(metrics.platformRevenue)}
          subtitle="Gross transaction volume"
          variant="default"
          icon={<IndianRupee className="size-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Tenant Directory (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-base">Subscribed Gyms</CardTitle>
                <CardDescription className="text-xs">
                  All gym tenants provisioned on the platform
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {gyms.length} Tenants
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2 hover:bg-surface-2">
                    <TableHead className="font-mono text-[10px] uppercase">Gym Name &amp; City</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Plan</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Members</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gymsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                        Loading tenant directory...
                      </TableCell>
                    </TableRow>
                  ) : gyms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                        No gym tenants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    gyms.map((g: any) => (
                      <TableRow key={g.id} className="hover:bg-secondary/40">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">{g.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {g.city || 'India'} • {g.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-secondary text-foreground">
                            {g.plan_name || 'Standard'}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {g.member_count || 0} / {g.max_members === -1 ? '∞' : g.max_members}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold ${
                              g.status === 'ACTIVE'
                                ? 'bg-ok/10 text-ok'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {g.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(g.id, g.status)}
                            className={`h-7 text-xs font-mono font-medium ${
                              g.status === 'ACTIVE'
                                ? 'text-destructive border-destructive/30 hover:bg-destructive/10'
                                : 'text-ok border-ok/30 hover:bg-ok/10'
                            }`}
                          >
                            {g.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Onboard New Gym Wizard (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="font-display text-base">Onboard New Gym</CardTitle>
              <CardDescription className="text-xs">
                Provision a new gym tenant &amp; primary owner account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-ok/30 bg-ok/10 text-ok">
                  <CheckCircle2 className="size-4" />
                  <AlertDescription className="text-xs font-semibold">
                    New gym onboarded &amp; primary owner account activated!
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateGym} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="gName" className="text-xs font-semibold">Gym Name *</Label>
                  <Input
                    id="gName"
                    required
                    placeholder="e.g. Gold Coast Fitness"
                    value={gymName}
                    onChange={(e) => {
                      setGymName(e.target.value);
                      if (!slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gSlug" className="text-xs font-semibold">Slug *</Label>
                    <Input
                      id="gSlug"
                      required
                      placeholder="gold-coast"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gCity" className="text-xs font-semibold">City</Label>
                    <Input
                      id="gCity"
                      placeholder="Bangalore"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gPhone" className="text-xs font-semibold">Gym Phone *</Label>
                    <Input
                      id="gPhone"
                      required
                      placeholder="9876543210"
                      value={gymPhone}
                      onChange={(e) => setGymPhone(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gPlan" className="text-xs font-semibold">SaaS Plan *</Label>
                    <select
                      id="gPlan"
                      value={planId}
                      onChange={(e) => setPlanId(e.target.value)}
                      className="h-9 px-2.5 rounded-md border border-input bg-card text-xs font-sans focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.price_monthly / 100}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex flex-col gap-2.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Primary Owner Credentials
                  </p>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="oName" className="text-xs font-semibold">Owner Name *</Label>
                    <Input
                      id="oName"
                      required
                      placeholder="e.g. Vikram Singh"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="oEmail" className="text-xs font-semibold">Owner Email *</Label>
                      <Input
                        id="oEmail"
                        type="email"
                        required
                        placeholder="owner@gym.com"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="oPhone" className="text-xs font-semibold">Owner Phone *</Label>
                      <Input
                        id="oPhone"
                        required
                        placeholder="9876543210"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="oPass" className="text-xs font-semibold">Initial Password *</Label>
                    <Input
                      id="oPass"
                      type="password"
                      required
                      min={6}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-bold text-xs h-10 mt-2"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Gym & Owner'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
};
