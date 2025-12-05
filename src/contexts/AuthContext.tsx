import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionPlan,SupabaseError } from '../types';
import supabase from '../services/apiAdapter';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    console.log('Attempting login with:', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {

const err = error as SupabaseError;

const errorObj = new Error(err.message || 'Login failed') as any;
errorObj.status = err.status;
errorObj.data = err.data ?? null;
throw errorObj;


    }

    if (!data?.session) {
      throw new Error('No session data received');
    }

    const userData = data.session.user;
    const user: User = {
      id: String(userData.id),  // Convert ID to string
      email: userData.email || '',
      firstName: (userData as any).user_metadata?.first_name || '',
      lastName: (userData as any).user_metadata?.last_name || '',
      role: 'user',
      subscriptionPlan: {
        id: '1',
        name: 'free',
        price: 0,
        currency: 'USD',
        features: ['Basic search', 'Limited exports'],
        maxSearches: 10,
        maxExports: 10,

      },
        // Add the missing properties
  createdAt: new Date(userData.created_at || Date.now()),
  lastLoginAt: new Date()
    };

    // Persist user in state and localStorage
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error: any) {
    console.error('Login error:', error); 
    throw error;
  } finally {
    setLoading(false);
  }
};

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      console.log('Attempting registration with:', { email: userData.email });
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      console.log('Registration response:', { data, error });

      if (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed');
      }

      if (!data?.user) {
        throw new Error('No user data received');
      }

// In the register function, update the user object:
const user: User = {
  id: String(data.user.id),  // Convert ID to string
  email: data.user.email || userData.email,
  firstName: userData.firstName,
  lastName: userData.lastName,
  role: 'user',
  subscriptionPlan: {
    id: '1',
    name: 'free',
    price: 0,
    currency: 'USD',
    features: ['Basic search', 'Limited exports'],
    maxSearches: 10,
    maxExports: 10,
  },
  // Add the missing properties
  createdAt: new Date(),
  lastLoginAt: new Date()};
      
      console.log('Registration successful, user:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      localStorage.removeItem('user');
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Map planId to app SubscriptionPlan config
  const planConfig = (planName: string): SubscriptionPlan => {
    switch (planName) {
      case 'basic':
        return {
          id: 'basic',
          name: 'basic',
          price: 19.99,
          currency: 'USD',
          features: ['Advanced search filters', 'Up to 100 searches per month', 'Advanced filters and parameters', 'Export up to 50 contacts', 'Priority email support', 'Search history'],
          maxSearches: 100,
          maxExports: 50,
        };
      case 'premium':
        return {
          id: 'premium',
          name: 'premium',
          price: 49.99,
          currency: 'USD',
          features: ['All Basic features', 'Unlimited searches', 'Advanced analytics', 'Unlimited exports', 'Priority phone support', 'API access', 'Custom integrations', 'Team collaboration'],
          maxSearches: -1,
          maxExports: -1,
        };
      case 'enterprise':
        return {
          id: 'enterprise',
          name: 'enterprise',
          price: 199.99,
          currency: 'USD',
          features: ['All Premium features', 'Dedicated account manager', 'Custom data sources', 'White-label solution', 'Advanced security features', 'SLA guarantee', 'Custom training', '24/7 phone support'],
          maxSearches: -1,
          maxExports: -1,
        };
      case 'free':
      default:
        return {
          id: 'free',
          name: 'free',
          price: 0,
          currency: 'USD',
          features: ['Basic search functionality', 'Up to 10 searches per month', 'Basic filters', 'Export up to 5 contacts', 'Email support'],
          maxSearches: 10,
          maxExports: 5,
        };
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;

    setLoading(true);
    try {
      // Map app User fields to Laravel payload
      const payload: any = {
        first_name: userData.firstName ?? user.firstName,
        last_name: userData.lastName ?? user.lastName,
        email: userData.email ?? user.email,
        phone: userData.phone ?? user.phone,
        location: userData.location ?? user.location,
        bio: userData.bio ?? user.bio,
        avatar_url: userData.avatar ?? user.avatar,
      };

      const { data, error } = await (supabase as any).auth.updateUserProfile(payload);
      if (error) {
        const err = error as SupabaseError;
        const errorObj = new Error(err.message || 'Profile update failed') as any;
        errorObj.status = err.status;
        errorObj.data = err.data ?? null;
        throw errorObj;
      }

      const apiUser: any = data?.user;
      if (!apiUser) throw new Error('No user data returned from profile update');

      const firstName = apiUser.user_metadata?.first_name || userData.firstName || user.firstName || '';
      const lastName = apiUser.user_metadata?.last_name || userData.lastName || user.lastName || '';
      const email = apiUser.email || user.email;

      const updatedPlan = {
        ...user.subscriptionPlan,
        name: (apiUser.user_metadata?.subscription_plan || user.subscriptionPlan.name) as any,
        expiresAt: apiUser.user_metadata?.subscription_expires_at
          ? new Date(apiUser.user_metadata.subscription_expires_at)
          : user.subscriptionPlan.expiresAt,
      };

      const updatedUser: User = {
        ...user,
        email,
        firstName,
        lastName,
        phone: payload.phone,
        location: payload.location,
        bio: payload.bio,
        avatar: payload.avatar_url,
        subscriptionPlan: updatedPlan,
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (planId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any).auth.updateUserSubscription(planId);
      if (error) {
        const err = error as SupabaseError;
        const errorObj = new Error(err.message || 'Subscription update failed') as any;
        errorObj.status = err.status;
        errorObj.data = err.data ?? null;
        throw errorObj;
      }

      const apiUser: any = data?.user;
      if (!apiUser) throw new Error('No user data returned from subscription update');
      const md = apiUser.user_metadata || {};
      const newPlanName = (md.subscription_plan || planId) as SubscriptionPlan['name'];
      const cfg = planConfig(newPlanName);
      const expiresAt = md.subscription_expires_at ? new Date(md.subscription_expires_at) : user.subscriptionPlan.expiresAt;

      const updatedUser: User = {
        ...user,
        subscriptionPlan: { ...cfg, expiresAt },
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Subscription update failed:', error);
      throw error;
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
    updateSubscription,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
