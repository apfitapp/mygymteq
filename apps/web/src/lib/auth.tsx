import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SessionUser, Gym, LoginRequest } from '@gymtech/shared';
import { api } from './api';

interface AuthContextType {
  user: SessionUser | null;
  gym: Gym | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gym_token'));
  const [user, setUser] = useState<SessionUser | null>(() => {
    const saved = localStorage.getItem('gym_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [gym, setGym] = useState<Gym | null>(() => {
    const saved = localStorage.getItem('gym_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('gym_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
        if (data.gym) setGym(data.gym);
        localStorage.setItem('gym_user', JSON.stringify(data.user));
        if (data.gym) localStorage.setItem('gym_info', JSON.stringify(data.gym));
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_user');
        localStorage.removeItem('gym_info');
        queryClient.clear();
        setToken(null);
        setUser(null);
        setGym(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [queryClient]);

  const login = async (credentials: LoginRequest) => {
    queryClient.clear();
    const res = await api.login(credentials);
    setToken(res.token);
    setUser(res.user);
    setGym(res.gym || null);

    localStorage.setItem('gym_token', res.token);
    localStorage.setItem('gym_user', JSON.stringify(res.user));
    if (res.gym) {
      localStorage.setItem('gym_info', JSON.stringify(res.gym));
    }
  };

  const logout = () => {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    localStorage.removeItem('gym_info');
    queryClient.clear();
    setToken(null);
    setUser(null);
    setGym(null);
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider value={{ user, gym, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
