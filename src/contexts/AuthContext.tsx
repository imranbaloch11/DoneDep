'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
// Temporary type definitions until shared types are properly configured
interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    refreshToken?: string;
    user: User;
  };
}
import { authApi } from '@/services/api/auth';
import { tokenStorage } from '@/utils/tokenStorage';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            tokenStorage.clearTokens();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          tokenStorage.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login process');
      const response = await authApi.login({ email, password });
      console.log('AuthContext: API response:', response);
      
      if (response.success && response.data && response.data.user && response.data.token) {
        console.log('AuthContext: Setting user and token');
        setUser(response.data.user);
        tokenStorage.setAccessToken(response.data.token);
        if (response.data.refreshToken) {
          tokenStorage.setRefreshToken(response.data.refreshToken);
        }
        toast.success('Login successful!');
        
        console.log('AuthContext: Redirecting to dashboard');
        // Force navigation to dashboard
        setTimeout(() => {
          console.log('AuthContext: Executing redirect');
          window.location.href = '/dashboard';
        }, 500);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name });
      
      if (response.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        router.push('/login?message=Please check your email to verify your account');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      tokenStorage.clearTokens();
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      
      if (response.success && response.token) {
        tokenStorage.setAccessToken(response.token);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
