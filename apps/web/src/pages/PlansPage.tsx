import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, Check, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardGridSkeleton } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { formatCurrency } from '@/lib/utils';

export const PlansPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const { data, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.getPlans(),
  });

  const plans = data?.plans || [];

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(1500);
  const [admissionFee, setAdmissionFee] = useState<number>(0);
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.createPlan({
        name,
        durationMonths: Number(durationMonths),
        price: Number(price),
        admissionFee: Number(admissionFee) || 0,
        description: description || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setDialogOpen(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Membership Plans" breadcrumb="Billing">
      <PageContainer>
        <PageHeader
          title="Gym Plan Catalog"
          description="Configure member packages, pricing durations, and admission fees"
          actions={
            canManage && (
              <Button
                onClick={() => {
                  setError(null);
                  setDialogOpen(true);
                }}
                className="bg-primary text-primary-foreground font-bold text-xs h-9"
              >
                <Plus className="mr-1.5 size-4" /> Create Plan
              </Button>
            )
          }
        />

        {/* Plans Grid */}
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No membership plans created yet"
            description='Click "+ Create Plan" to add your first membership package.'
            action={
              canManage ? (
                <Button
                  onClick={() => {
                    setError(null);
                    setDialogOpen(true);
                  }}
                  className="bg-primary text-primary-foreground font-bold text-xs"
                >
                  <Plus className="mr-1.5 size-4" /> Create Plan
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {plans.map((p) => (
              <Card key={p.id} className="card-hover-lift border-border shadow-xs flex flex-col justify-between p-5 bg-card relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-[#0284C7] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        {p.duration_months} Month{p.duration_months > 1 ? 's' : ''} Duration
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] text-ok border-ok/30 bg-ok/10 rounded-full">
                      Active
                    </Badge>
                  </div>

                  <div className="my-4">
                    <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono"> / term</span>
                    {p.admission_fee > 0 && (
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        + {formatCurrency(p.admission_fee)} Admission Fee
                      </p>
                    )}
                  </div>

                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="text-[11px]">ID: {p.id.slice(0, 8)}</span>
                <span className="text-primary font-semibold text-[11px]">Active in Catalog</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create Membership Plan</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new package tier to your gym catalog
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreatePlan} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="planName" className="text-xs font-semibold">Plan Name *</Label>
              <Input
                id="planName"
                required
                placeholder="e.g. Quarterly Strength &amp; Cardio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="months" className="text-xs font-semibold">Duration (Months) *</Label>
                <Input
                  id="months"
                  type="number"
                  required
                  min="1"
                  max="36"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fee" className="text-xs font-semibold">Price (₹) *</Label>
                <Input
                  id="fee"
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="adm" className="text-xs font-semibold">Admission Fee (₹)</Label>
              <Input
                id="adm"
                type="number"
                min="0"
                value={admissionFee}
                onChange={(e) => setAdmissionFee(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
              <Input
                id="desc"
                placeholder="Full access to gym equipment and lockers"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
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
                {isSubmitting ? 'Saving...' : 'Save Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </PageContainer>
    </AppShell>
  );
};
