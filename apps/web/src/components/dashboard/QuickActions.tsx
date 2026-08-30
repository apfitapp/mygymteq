import React from 'react';
import { Plus, CreditCard, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  canManage?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = () => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-9">
        <a href="#/members/new">
          <Plus className="mr-1.5 size-4" /> Add Member
        </a>
      </Button>
      <Button asChild variant="outline" size="sm" className="font-medium text-xs h-9">
        <a href="#/payments">
          <CreditCard className="mr-1.5 size-4" /> Collect Payment
        </a>
      </Button>
      <Button asChild variant="outline" size="sm" className="font-medium text-xs h-9">
        <a href="#/attendance">
          <CalendarCheck className="mr-1.5 size-4" /> Attendance Desk
        </a>
      </Button>
    </div>
  );
};
