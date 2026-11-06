import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, LoginInput, RegisterInput } from '@ai-resume/shared';
import { apiFetch } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiFetch<UserProfile>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (input: LoginInput) => {
    const res = await apiFetch<{ user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    if (res.success && res.data) {
      setUser(res.data.user);
    } else {
      throw new Error(res.error?.message || 'Login failed');
    }
  };

  const register = async (input: RegisterInput) => {
    const res = await apiFetch<{ user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    if (res.success && res.data) {
      setUser(res.data.user);
    } else {
      throw new Error(res.error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

