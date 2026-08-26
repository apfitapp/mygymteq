import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Phone, Mail } from 'lucide-react';
import type { Member } from '@gym/shared';
import { apiClient } from '@/api/client';

const STATUS_MAP: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  ACTIVE: 'success',
  EXPIRED: 'destructive',
  FROZEN: 'warning',
  INACTIVE: 'secondary',
};

export const MembersPage: React.FC = () => {
  const { activeBranch } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', gender: 'MALE',
    dateOfBirth: '', address: '', emergencyContact: '', planId: '',
    amountPaid: '', paymentMethod: 'CASH',
  });

  useEffect(() => {
    apiClient<Member[]>('/members')
      .then((res) => {
        if (res.data) setMembers(res.data);
      })
      .catch(() => {
        // Demo data
        setMembers([
          { id: 'mem_1', memberCode: 'MEM-1001', fullName: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', gender: 'MALE', status: 'ACTIVE', gymId: '', branchId: '', createdAt: '2026-01-15' } as Member,
          { id: 'mem_2', memberCode: 'MEM-1002', fullName: 'Sneha Reddy', email: 'sneha@email.com', phone: '9876543211', gender: 'FEMALE', status: 'ACTIVE', gymId: '', branchId: '', createdAt: '2026-02-01' } as Member,
          { id: 'mem_3', memberCode: 'MEM-1003', fullName: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', gender: 'MALE', status: 'EXPIRED', gymId: '', branchId: '', createdAt: '2026-01-20' } as Member,
          { id: 'mem_4', memberCode: 'MEM-1004', fullName: 'Priya Nair', email: 'priya@email.com', phone: '9876543213', gender: 'FEMALE', status: 'ACTIVE', gymId: '', branchId: '', createdAt: '2026-03-10' } as Member,
        ]);
      });
  }, [activeBranch]);

  const filtered = members.filter((m) => {
    const matchesSearch = !search || m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/api/members', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName, email: form.email, phone: form.phone,
          gender: form.gender, dateOfBirth: form.dateOfBirth || undefined,
          address: form.address || undefined, emergencyContact: form.emergencyContact || undefined,
          planId: form.planId || undefined,
          initialPayment: form.amountPaid ? { amount: Number(form.amountPaid) * 100, method: form.paymentMethod } : undefined,
        }),
      });
      setShowRegisterModal(false);
      // Refresh
      const res = await apiClient<Member[]>('/members');
      if (res.data) setMembers(res.data);
    } catch {
      // Keep modal open on error
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--ink)]">Members</h1>
          <p className="text-sm text-[var(--muted)]">{filtered.length} members found</p>
        </div>
        <Button onClick={() => setShowRegisterModal(true)}>
          <UserPlus className="h-4 w-4" />
          Register Member
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <Input
                placeholder="Search by name, code, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="FROZEN">Frozen</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <TableCell className="font-mono text-xs font-medium text-[var(--ink)]">{member.memberCode}</TableCell>
                  <TableCell className="font-medium text-[var(--ink)]">{member.fullName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {member.phone}</span>
                      {member.email && <span className="flex items-center gap-1 text-[var(--muted)]"><Mail className="h-3 w-3" /> {member.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_MAP[member.status] || 'secondary'}>{member.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-[var(--muted)]">
                    {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[var(--muted)]">
                    No members found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register Member Dialog */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New Member</DialogTitle>
            <DialogDescription>Fill in the member's details. A unique member code will be auto-generated.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="reg-name">Full Name *</Label>
                <Input id="reg-name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Rahul Sharma" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone *</Label>
                <Input id="reg-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(val) => setForm({ ...form, gender: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-dob">Date of Birth</Label>
                <Input id="reg-dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="reg-address">Address</Label>
                <Input id="reg-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jubilee Hills, Hyderabad" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
              <Button type="submit">Register Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
