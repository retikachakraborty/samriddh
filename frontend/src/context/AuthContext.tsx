import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUserApi, signinApi, signoutApi, signupApi } from '../api/auth';
import { clearStoredTokens, getStoredToken } from '../api/client';
import type { AuthUser } from '../types/api';

export interface UserProfileInfo {
  name: string;
  roleTitle: string;
  accessLevel: string;
  avatarInitials: string;
  isDemo: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfileInfo;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  signin: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isDemo = Boolean(
    user?.is_demo ||
    user?.email === 'executive@samriddh.com' ||
    user?.role === 'demo'
  );

  const profile: UserProfileInfo = isDemo
    ? {
        name: 'Samriddh Demo',
        roleTitle: 'Demo Account',
        accessLevel: 'Read-only',
        avatarInitials: 'DM',
        isDemo: true,
      }
    : {
        name: user?.name || (user?.email ? user.email.split('@')[0] : 'Retail Analyst'),
        roleTitle: 'Strategic Analyst',
        accessLevel: 'Full Access',
        avatarInitials: user?.email ? user.email.substring(0, 2).toUpperCase() : 'RA',
        isDemo: false,
      };

  const initAuth = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const fetchedUser = await getCurrentUserApi();
      setUser(fetchedUser);
      localStorage.setItem('samriddh_user', JSON.stringify(fetchedUser));
    } catch {
      clearStoredTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const signin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const session = await signinApi({ email, password: pass });
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signupApi({ email, password: pass });
      const session = await signinApi({ email, password: pass });
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      const demoEmail = 'executive@samriddh.com';
      const demoPass = 'SamriddhPassword2026!';
      const session = await signinApi({ email: demoEmail, password: demoPass });
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signout = async () => {
    setIsLoading(true);
    try {
      await signoutApi();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const fetchedUser = await getCurrentUserApi();
      setUser(fetchedUser);
    } catch {
      // Keep existing user if transient network error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isDemo,
        signin,
        signup,
        loginAsDemo,
        signout,
        refreshUser,
      }}
    >
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
