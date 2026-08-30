import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ExcelMigrationDialog } from '@/components/members/ExcelMigrationDialog';
import { MemberFilters } from '@/components/members/MemberFilters';
import { MemberTable } from '@/components/members/MemberTable';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';
  const canAddMember = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'STAFF';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, statusFilter],
    queryFn: () => api.getMembers({ search: search || undefined, status: statusFilter }),
  });

  const members = data?.members || [];

  return (
    <AppShell title="Member Directory" breadcrumb="Members">
      <PageContainer>
        <PageHeader
          title="Enrolled Members"
          description="Manage your member database, renewals, and package histories"
          actions={
            <>
              {canManage && (
                <Button
                  variant="outline"
                  onClick={() => setIsMigrationOpen(true)}
                  className="text-xs h-9 font-medium gap-1.5 border-border hover:bg-secondary"
                >
                  <FileSpreadsheet className="size-4 text-primary" />
                  <span>Excel / CSV Migration</span>
                </Button>
              )}

              {canAddMember && (
                <Button asChild className="bg-primary text-primary-foreground font-bold text-xs h-9">
                  <a href="#/members/new">
                    <Plus className="mr-1.5 size-4" /> Add Member
                  </a>
                </Button>
              )}
            </>
          }
        />

        {/* Migration Dialog */}
        <ExcelMigrationDialog open={isMigrationOpen} onOpenChange={setIsMigrationOpen} />

        {/* Filters & Search */}
        <MemberFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalFound={members.length}
        />

        {/* Member Table */}
        <MemberTable members={members} isLoading={isLoading} />
      </PageContainer>
    </AppShell>
  );
};
