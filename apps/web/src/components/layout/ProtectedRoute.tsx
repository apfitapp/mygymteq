import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@gymtech/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  allowMember?: boolean;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSuperAdmin = false,
  allowMember = false,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Member role isolation: Member accounts can only access member portal
  if (user.role === 'MEMBER' && !allowMember) {
    return <Navigate to="/portal" replace />;
  }

  if (requireSuperAdmin && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireSuperAdmin && user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Role authorization guard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
