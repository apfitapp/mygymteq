import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Gym, Branch } from '@gym/shared';
import { apiRequest } from '@/api/client';

interface AuthContextType {
  user: User | null;
  gym: Gym | null;
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setActiveBranch: (branch: Branch) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveBranch = (branch: Branch) => {
    setActiveBranchState(branch);
    localStorage.setItem('gym_active_branch_id', branch.id);
  };

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User; gym: Gym | null; branches: Branch[] }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.success || !res.data) {
      throw new Error(res.error || 'Login failed');
    }

    const { token, user: userData, gym: gymData, branches: branchData } = res.data;

    localStorage.setItem('gym_auth_token', token);
    if (gymData) {
      localStorage.setItem('gym_active_gym_id', gymData.id);
    }
    setUser(userData);
    setGym(gymData);
    setBranches(branchData || []);

    const primaryBranch = (branchData || []).find((b) => b.isPrimary) || (branchData || [])[0] || null;
    setActiveBranchState(primaryBranch);
    if (primaryBranch) {
      localStorage.setItem('gym_active_branch_id', primaryBranch.id);
    }
  };

  const logout = () => {
    localStorage.removeItem('gym_auth_token');
    localStorage.removeItem('gym_active_gym_id');
    localStorage.removeItem('gym_active_branch_id');
    setUser(null);
    setGym(null);
    setBranches([]);
    setActiveBranchState(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('gym_auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setGym(res.data.gym);
        setBranches(res.data.branches);

        if (res.data.gym) {
          localStorage.setItem('gym_active_gym_id', res.data.gym.id);
        }

        const savedBranchId = localStorage.getItem('gym_active_branch_id');
        const matchedBranch = res.data.branches.find((b: Branch) => b.id === savedBranchId);
        const branchToSet = matchedBranch || res.data.branches.find((b: Branch) => b.isPrimary) || res.data.branches[0] || null;
        setActiveBranchState(branchToSet);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        gym,
        branches,
        activeBranch,
        isLoading,
        login,
        logout,
        setActiveBranch,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
