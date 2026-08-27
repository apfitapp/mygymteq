import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, UserPlus, Phone, CreditCard, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { GymStatusBadge } from '@/components/ui/GymStatusBadge';
import { api } from '@/lib/api';

export const MembersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, statusFilter],
    queryFn: () => api.getMembers({ search: search || undefined, status: statusFilter }),
  });

  const members = data?.members || [];

  const formatCurrency = (paise: number) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
  };

  return (
    <AppShell title="Member Directory" breadcrumb="Members">
      {/* Header & Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Enrolled Members
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage your member database, renewals, and package histories
          </p>
        </div>

        <Button asChild className="bg-primary text-primary-foreground font-bold text-xs h-9">
          <a href="#/members/new">
            <Plus className="mr-1.5 size-4" /> Add Member
          </a>
        </Button>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-2 border border-border rounded-lg self-start sm:self-auto">
          {['ALL', 'ACTIVE', 'EXPIRED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'All Members' : s === 'ACTIVE' ? 'Active' : 'Expired'}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {members.length} member{members.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Member Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-2 hover:bg-surface-2">
                <TableHead className="font-mono text-[10px] uppercase">Member</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Contact</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Current Plan</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-right">Dues</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Loading member roster...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No members match the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m: any) => {
                  const initials = `${m.first_name[0]}${m.last_name ? m.last_name[0] : ''}`.toUpperCase();

                  return (
                    <TableRow key={m.id} className="hover:bg-secondary/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
                            {m.photo_url ? (
                              <img src={m.photo_url} alt={m.first_name} className="size-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <a
                              href={`#/members/${m.id}`}
                              className="font-semibold text-xs text-foreground hover:underline truncate"
                            >
                              {m.first_name} {m.last_name || ''}
                            </a>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {m.member_code}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs font-mono">
                          <span className="text-foreground">{m.phone}</span>
                          {m.email && <span className="text-muted-foreground text-[11px] truncate">{m.email}</span>}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-foreground">{m.plan_name || 'No Active Plan'}</span>
                          {m.membership_end_date && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              Exp: {new Date(m.membership_end_date * 1000).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <GymStatusBadge status={m.status} />
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs">
                        {m.membership_due_amount > 0 ? (
                          <span className="text-destructive font-bold">
                            {formatCurrency(m.membership_due_amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                            <a href={`#/members/${m.id}`}>
                              Profile <ChevronRight className="ml-1 size-3" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
};
