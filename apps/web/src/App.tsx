import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/ui/toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { NewMemberPage } from './pages/NewMemberPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { RenewMemberPage } from './pages/RenewMemberPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { PlansPage } from './pages/PlansPage';
import { StaffPage } from './pages/StaffPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsNotificationsPage } from './pages/SettingsNotificationsPage';
import { AdminPage } from './pages/AdminPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { MemberPortalPage } from './pages/MemberPortalPage';
import { PtCollectionsPage } from './pages/PtCollectionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Gym Owner & Staff Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
                    <MembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members/new"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
                    <NewMemberPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members/:id"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF', 'TRAINER']}>
                    <MemberDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members/:id/renew"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
                    <RenewMemberPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
                    <PaymentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pt-collections"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}>
                    <PtCollectionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF', 'TRAINER']}>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                    <PlansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                    <StaffPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/notifications"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                    <SettingsNotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Platform Super Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Member Self-Service Portal Route */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute allowMember={true}>
                    <MemberPortalPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
