import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building2, UserPlus, Plus, Settings2 } from 'lucide-react';

const DEMO_BRANCHES = [
  { id: 'br_1', name: 'Jubilee Hills HQ', city: 'Hyderabad', isPrimary: true, status: 'ACTIVE' },
  { id: 'br_2', name: 'Gachibowli Branch', city: 'Hyderabad', isPrimary: false, status: 'ACTIVE' },
];

const DEMO_STAFF = [
  { id: 'u_1', fullName: 'Raj Kumar', email: 'staff@ironhouse.in', role: 'STAFF', branch: 'Jubilee Hills HQ', status: 'ACTIVE' },
  { id: 'u_2', fullName: 'Priya Trainer', email: 'trainer@ironhouse.in', role: 'TRAINER', branch: 'Jubilee Hills HQ', status: 'ACTIVE' },
];

export const SettingsPage: React.FC = () => {
  const { gym } = useAuth();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

  const [gymForm, setGymForm] = useState({
    name: gym?.name || 'Iron House Fitness',
    gstin: '36AABCI1234C1Z5',
    phone: '040-12345678',
    address: 'Plot 123, Jubilee Hills, Hyderabad, Telangana 500033',
  });

  const [branchForm, setBranchForm] = useState({ name: '', city: '', address: '' });
  const [staffForm, setStaffForm] = useState({ fullName: '', email: '', phone: '', role: 'STAFF', branchId: '' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--ink)]">Settings</h1>
        <p className="text-sm text-[var(--muted)]">Manage your gym profile, branches, and staff</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Gym Profile
          </TabsTrigger>
          <TabsTrigger value="branches">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> Branches
          </TabsTrigger>
          <TabsTrigger value="staff">
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Staff & Trainers
          </TabsTrigger>
        </TabsList>

        {/* Gym Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gym Details</CardTitle>
              <CardDescription>Update your gym's public profile and tax information</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>Gym Name</Label>
                  <Input value={gymForm.name} onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input value={gymForm.gstin} onChange={(e) => setGymForm({ ...gymForm, gstin: e.target.value })} placeholder="Enter 15-digit GSTIN" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={gymForm.phone} onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={gymForm.address} onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })} />
                </div>
                <Separator />
                <Button type="button">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Branches</CardTitle>
                <CardDescription>{DEMO_BRANCHES.length} branch locations</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddBranch(true)}>
                <Plus className="h-4 w-4" /> Add Branch
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_BRANCHES.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-[var(--ink)]">{b.name}</TableCell>
                      <TableCell>{b.city}</TableCell>
                      <TableCell>
                        {b.isPrimary ? <Badge variant="default">Primary</Badge> : <Badge variant="secondary">Branch</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">{b.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Staff & Trainers</CardTitle>
                <CardDescription>{DEMO_STAFF.length} team members</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddStaff(true)}>
                <Plus className="h-4 w-4" /> Add Staff
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_STAFF.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-[var(--ink)]">{s.fullName}</TableCell>
                      <TableCell className="text-xs">{s.email}</TableCell>
                      <TableCell>
                        <Badge variant={s.role === 'TRAINER' ? 'info' : 'secondary'}>{s.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{s.branch}</TableCell>
                      <TableCell>
                        <Badge variant="success">{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Branch Dialog */}
      <Dialog open={showAddBranch} onOpenChange={setShowAddBranch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
            <DialogDescription>Create a new branch location for your gym</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddBranch(false); }}>
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} placeholder="e.g. Banjara Hills Branch" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={branchForm.city} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} placeholder="Hyderabad" required />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} placeholder="Full address" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddBranch(false)}>Cancel</Button>
              <Button type="submit">Add Branch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Create a login account for a staff member or trainer</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddStaff(false); }}>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={staffForm.fullName} onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={staffForm.role} onValueChange={(val) => setStaffForm({ ...staffForm, role: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Front Desk Staff</SelectItem>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={staffForm.branchId} onValueChange={(val) => setStaffForm({ ...staffForm, branchId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {DEMO_BRANCHES.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddStaff(false)}>Cancel</Button>
              <Button type="submit">Add Staff</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
