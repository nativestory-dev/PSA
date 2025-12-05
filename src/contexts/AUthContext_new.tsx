import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, SubscriptionPlan } from '../types';

// Configure axios defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Important for Sanctum cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to transform Laravel user response to our User type
const transformLaravelUser = (userData: any): User => {
  return {
    id: userData.id.toString(),
    email: userData.email,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    avatar: userData.avatar_url || undefined,
    bio: userData.bio || undefined,
    phone: userData.phone || undefined,
    location: userData.location || undefined,
    role: userData.role as 'admin' | 'user' | 'premium',
    subscriptionPlan: getSubscriptionPlan(userData.subscription_plan || 'free'),
    createdAt: new Date(userData.created_at),
    lastLoginAt: userData.last_login_at ? new Date(userData.last_login_at) : new Date(),
  };
};

// Helper function to get subscription plan details
const getSubscriptionPlan = (planName: string): SubscriptionPlan => {
  const plans: Record<string, SubscriptionPlan> = {
    free: {
      id: '1',
      name: 'free',
      price: 0,
      currency: 'USD',
      features: ['Basic search', 'Limited exports'],
      maxSearches: 10,
      maxExports: 5,
    },
    basic: {
      id: '2',
      name: 'basic',
      price: 9.99,
      currency: 'USD',
      features: ['Advanced search', 'More exports', 'Email support'],
      maxSearches: 100,
      maxExports: 25,
    },
    premium: {
      id: '3',
      name: 'premium',
      price: 29.99,
      currency: 'USD',
      features: ['Unlimited searches', 'Advanced filters', 'Export to multiple formats', 'Priority support'],
      maxSearches: -1,
      maxExports: 100,
    },
    enterprise: {
      id: '4',
      name: 'enterprise',
      price: 99.99,
      currency: 'USD',
      features: ['Everything in Premium', 'API access', 'Custom integrations', 'Dedicated support'],
      maxSearches: -1,
      maxExports: -1,
    },
  };

  return plans[planName] || plans.free;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const response = await api.get('/user');
          const transformedUser = transformLaravelUser(response.data.data || response.data);
          setUser(transformedUser);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Get CSRF cookie first (required for Sanctum)
      await axios.get(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000'}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Attempt login
      const response = await api.post('/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token
      localStorage.setItem('auth_token', token);

      // Transform and set user
      const transformedUser = transformLaravelUser(userData);
      setUser(transformedUser);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      // Get CSRF cookie first
      await axios.get(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000'}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Register user
      const response = await api.post('/register', {
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      });

      const { token, user: userResponse } = response.data;

      // Store token
      localStorage.setItem('auth_token', token);

      // Transform and set user
      const transformedUser = transformLaravelUser(userResponse);
      setUser(transformedUser);
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updateData: any = {};
      
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.avatar !== undefined) updateData.avatar_url = userData.avatar;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.location !== undefined) updateData.location = userData.location;
      if (userData.subscriptionPlan) updateData.subscription_plan = userData.subscriptionPlan.name;

      const response = await api.put('/user/profile', updateData);

      // Transform and update user
      const transformedUser = transformLaravelUser(response.data.data || response.data);
      setUser(transformedUser);
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { api };