import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { PublicCheckInPage } from '@/pages/PublicCheckInPage';
import { PlatformDashboard } from '@/pages/platform/PlatformDashboard';
import { DashboardPage } from '@/pages/tenant/DashboardPage';
import { MembersPage } from '@/pages/tenant/MembersPage';
import { MemberDetailPage } from '@/pages/tenant/MemberDetailPage';
import { MembershipsPage } from '@/pages/tenant/MembershipsPage';
import { PaymentsPage } from '@/pages/tenant/PaymentsPage';
import { AttendancePage } from '@/pages/tenant/AttendancePage';
import { SettingsPage } from '@/pages/tenant/SettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing Landing Page */}
              <Route path="/" element={<HomePage />} />

              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Public Member QR Self Check-In Route */}
              <Route path="/check-in" element={<PublicCheckInPage />} />

              {/* Platform Super Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PlatformDashboard />} />
                <Route path="gyms" element={<PlatformDashboard />} />
                <Route path="plans" element={<PlatformDashboard />} />
                <Route path="audit" element={<PlatformDashboard />} />
              </Route>

              {/* Tenant Gym Management Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/members/:id" element={<MemberDetailPage />} />
                <Route path="/memberships" element={<MembershipsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};
