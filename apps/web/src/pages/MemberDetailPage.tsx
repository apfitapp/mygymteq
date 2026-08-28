import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  User,
  MessageCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Pencil,
  Snowflake,
  Play,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { GymStatusBadge } from '@/components/ui/GymStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { EditMemberDialog } from '@/components/members/EditMemberDialog';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const { data, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => api.getMemberDetail(id!),
    enabled: !!id,
  });

  const freezeMutation = useMutation({
    mutationFn: (action: 'freeze' | 'unfreeze') =>
      action === 'freeze' ? api.freezeMember(id!) : api.unfreezeMember(id!),
    onSuccess: (res) => {
      toast('success', res.status === 'FROZEN' ? 'Membership paused' : 'Membership resumed', res.message);
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (err: any) => {
      toast('error', 'Freeze action failed', err.message);
    },
  });

  const member = data?.member;
  const activeMembership = data?.activeMembership;
  const memberships = data?.memberships || [];
  const payments = data?.payments || [];
  const attendance = data?.attendance || [];

  const formatCurrency = (paise: number) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <AppShell title="Member Profile" breadcrumb="Members">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (error || !member) {
    return (
      <AppShell title="Member Profile" breadcrumb="Members">
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          Member not found or failed to load.
        </div>
      </AppShell>
    );
  }

  const initials = `${member.first_name?.[0] || 'M'}${member.last_name ? member.last_name[0] : ''}`.toUpperCase();
  const cleanPhone = (member.phone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappChatUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${member.first_name}, greeting from the gym!`)}`;

  return (
    <AppShell title={`${member.first_name} ${member.last_name || ''}`} breadcrumb="Members">
      <div className="flex flex-col gap-6">
        <a
          href="#/members"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors w-fit"
        >
          <ArrowLeft className="size-3.5" /> Back to Directory
        </a>

        {/* Member Profile Header */}
        <Card className="border-border shadow-xs bg-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display text-xl font-bold shrink-0 overflow-hidden shadow-xs">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.first_name} className="size-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
                    {member.first_name} {member.last_name || ''}
                  </h2>
                  <GymStatusBadge status={member.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                  <span>ID: {member.member_code}</span>
                  <span>•</span>
                  <span>Joined: {new Date(member.joined_date * 1000).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="text-xs h-9 font-semibold gap-1.5 border-border hover:bg-secondary"
              >
                <Pencil className="size-3.5" />
                <span>Edit Profile</span>
              </Button>

              <Button asChild variant="outline" size="sm" className="text-xs h-9 text-[#25D366] hover:text-[#20BA5A] border-[#25D366]/30">
                <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4 mr-1.5 fill-current" /> WhatsApp
                </a>
              </Button>

              {canManage && member.status !== 'CANCELLED' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={freezeMutation.isPending}
                  onClick={() => freezeMutation.mutate(member.status === 'FROZEN' ? 'unfreeze' : 'freeze')}
                  className={`text-xs h-9 font-semibold gap-1.5 ${
                    member.status === 'FROZEN'
                      ? 'border-ok/40 text-ok hover:bg-ok/10'
                      : 'border-warn/40 text-warn hover:bg-warn/10'
                  }`}
                >
                  {member.status === 'FROZEN' ? (
                    <>
                      <Play className="size-3.5" /> Resume
                    </>
                  ) : (
                    <>
                      <Snowflake className="size-3.5" /> Freeze
                    </>
                  )}
                </Button>
              )}

              <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9">
                <a href={`#/members/${member.id}/renew`}>
                  <RefreshCw className="size-3.5 mr-1.5" /> Renew Plan
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Edit Member Dialog */}
        <EditMemberDialog
          member={member}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        {/* Details Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-surface-2 border border-border p-1">
            <TabsTrigger value="overview" className="text-xs font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="membership" className="text-xs font-semibold">Membership ({memberships.length})</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs font-semibold">Payments ({payments.length})</TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs font-semibold">Attendance ({attendance.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="mt-4 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Active Plan Card */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-semibold">Current Active Package</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {activeMembership ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-base font-bold text-foreground">
                          {activeMembership.plan_name || 'Membership'}
                        </span>
                        <GymStatusBadge status={activeMembership.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-border">
                        <div>
                          <p className="text-muted-foreground font-mono text-[10px] uppercase">Start Date</p>
                          <p className="font-semibold text-foreground">
                            {new Date(activeMembership.start_date * 1000).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-mono text-[10px] uppercase">End Date</p>
                          <p className="font-semibold text-foreground">
                            {new Date(activeMembership.end_date * 1000).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-border font-mono">
                        <div>
                          <p className="text-muted-foreground text-[10px]">Package Fee</p>
                          <p className="font-bold text-foreground">{formatCurrency(activeMembership.final_amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">Paid</p>
                          <p className="font-bold text-ok">{formatCurrency(activeMembership.paid_amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">Pending Due</p>
                          <p className={`font-bold ${activeMembership.due_amount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                            {formatCurrency(activeMembership.due_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No active membership package assigned.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal & Emergency Info */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-semibold">Personal &amp; Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Mobile Phone</span>
                    <span className="font-mono font-semibold text-foreground">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-mono text-foreground">{member.email || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Gender / DOB</span>
                    <span className="text-foreground">{member.gender || 'N/A'} • {member.date_of_birth || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Emergency Contact</span>
                    <span className="text-foreground">
                      {member.emergency_contact_name || 'None'} {member.emergency_contact_phone ? `(${member.emergency_contact_phone})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-foreground truncate max-w-xs">{member.address || 'None'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: MEMBERSHIP HISTORY */}
          <TabsContent value="membership" className="mt-4">
            <Card className="border-border shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2 hover:bg-surface-2">
                    <TableHead className="font-mono text-[10px] uppercase">Plan</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Duration</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Start Date</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">End Date</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Fee</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                        No recorded membership terms.
                      </TableCell>
                    </TableRow>
                  ) : (
                    memberships.map((ms: any) => (
                      <TableRow key={ms.id}>
                        <TableCell className="font-semibold text-xs text-foreground">{ms.plan_name || 'Custom'}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{ms.duration_months || 1} mo</TableCell>
                        <TableCell className="text-xs font-mono">{new Date(ms.start_date * 1000).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="text-xs font-mono">{new Date(ms.end_date * 1000).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell><GymStatusBadge status={ms.status} /></TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">{formatCurrency(ms.final_amount)}</TableCell>
                        <TableCell className="text-right text-xs font-mono text-destructive font-bold">{formatCurrency(ms.due_amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* TAB 3: PAYMENT LEDGER */}
          <TabsContent value="payments" className="mt-4">
            <Card className="border-border shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2 hover:bg-surface-2">
                    <TableHead className="font-mono text-[10px] uppercase">Receipt No</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Date</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Mode</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Reference</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Amount</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                        No recorded payment transactions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono font-bold text-xs text-foreground">{p.receipt_number}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {new Date(p.payment_date * 1000).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="text-xs font-mono">{p.payment_mode}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{p.reference_id || '—'}</TableCell>
                        <TableCell className="text-right text-xs font-mono font-bold text-foreground">
                          {formatCurrency(p.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-ok/10 text-ok">
                            {p.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* TAB 4: ATTENDANCE LOGS */}
          <TabsContent value="attendance" className="mt-4">
            <Card className="border-border shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2 hover:bg-surface-2">
                    <TableHead className="font-mono text-[10px] uppercase">Date</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Check-in Time</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                        No attendance check-ins logged for this member.
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs font-mono font-semibold text-foreground">
                          {a.date_key}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {new Date(a.check_in_time * 1000).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-secondary text-foreground">
                            {a.method}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};
