import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PaymentStats } from '@/components/payments/PaymentStats';
import { PaymentTable } from '@/components/payments/PaymentTable';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { InvoiceDialog } from '@/components/billing/InvoiceDialog';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canCollect = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'STAFF';

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.getPayments({ limit: 100 }),
  });

  const { data: membersData } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.getMembers({ limit: 200 }),
  });

  const payments = data?.payments || [];
  const summary = data?.summary || { monthlyRevenue: 0, todayRevenue: 0, pendingDues: 0 };
  const members = membersData?.members || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoicePaymentId, setInvoicePaymentId] = useState<string | null>(null);

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <AppShell title="Payments & Dues" breadcrumb="Billing">
      <PageContainer>
        <PageHeader
          title="Financial Ledger & Dues"
          description="Complete transaction record, collections overview, and receipt issuance"
          actions={
            canCollect && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-primary text-primary-foreground font-bold text-xs h-9"
              >
                <Plus className="mr-1.5 size-4" /> Collect Payment
              </Button>
            )
          }
        />

        {/* KPI Cards */}
        <PaymentStats summary={summary} />

        {/* Payment Ledger Table */}
        <PaymentTable
          payments={payments}
          isLoading={isLoading}
          onOpenInvoice={(id) => setInvoicePaymentId(id)}
        />

        {/* GST Invoice Dialog */}
        <InvoiceDialog
          paymentId={invoicePaymentId}
          open={!!invoicePaymentId}
          onOpenChange={(open) => !open && setInvoicePaymentId(null)}
        />

        {/* Record Payment Dialog */}
        <PaymentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          members={members}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </PageContainer>
    </AppShell>
  );
};
