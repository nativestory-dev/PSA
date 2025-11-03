import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, SubscriptionPlan } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

// Helper function to transform Supabase user to our User type
const transformSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    // Get user profile from our custom table
    const profileResult = await (supabase
      .from('user_profiles') as any)
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      // PGRST116 is "not found" - we'll create profile if it doesn't exist
      console.error('Error fetching user profile:', profileResult.error);
    }

    // Type assertion for profile data
    const profile: any = profileResult.data;

    // If profile doesn't exist yet, wait a bit and retry (trigger might be creating it)
    if (!profile && profileResult.error?.code === 'PGRST116') {
      // Wait for trigger to create profile, retry up to 3 times
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const retryResult = await (supabase
          .from('user_profiles') as any)
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (retryResult.data) {
          const retryProfile: any = retryResult.data;
          return {
            id: retryProfile.id,
            email: retryProfile.email,
            firstName: retryProfile.first_name || '',
            lastName: retryProfile.last_name || '',
            avatar: retryProfile.avatar_url || undefined,
            bio: retryProfile.bio || undefined,
            phone: retryProfile.phone || undefined,
            location: retryProfile.location || undefined,
            role: retryProfile.role as 'admin' | 'user' | 'premium',
            subscriptionPlan: getSubscriptionPlan(retryProfile.subscription_plan),
            createdAt: new Date(retryProfile.created_at),
            lastLoginAt: retryProfile.last_login_at ? new Date(retryProfile.last_login_at) : new Date(),
          };
        }
      }
      
      // If still not found after retries, return null (trigger should have created it)
      console.error('Profile not found after retries - trigger may not have run');
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      avatar: profile.avatar_url || undefined,
      bio: profile.bio || undefined,
      phone: profile.phone || undefined,
      location: profile.location || undefined,
      role: profile.role as 'admin' | 'user' | 'premium',
      subscriptionPlan: getSubscriptionPlan(profile.subscription_plan),
      createdAt: new Date(profile.created_at),
      lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : new Date(),
    };
  } catch (error) {
    console.error('Error transforming user:', error);
    return null;
  }
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const transformedUser = await transformSupabaseUser(session.user);
          setUser(transformedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const transformedUser = await transformSupabaseUser(session.user);
        setUser(transformedUser);
        
        // Update last login time
        if (event === 'SIGNED_IN') {
          await (supabase
            .from('user_profiles') as any)
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed: No user returned');

      const transformedUser = await transformSupabaseUser(data.user);
      if (!transformedUser) {
        throw new Error('Failed to load user profile');
      }

      setUser(transformedUser);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed: No user returned');

      // Wait for the database trigger to create the profile
      // (The trigger in fix_rls_policy.sql automatically creates the profile)
      // Wait a bit longer to ensure trigger has completed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the profile with firstName and lastName
      // The trigger creates it automatically, we just add the name info
      // Retry update in case profile isn't ready yet
      let updateSuccess = false;
      for (let i = 0; i < 3; i++) {
        const updateResult = await (supabase
          .from('user_profiles') as any)
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
          })
          .eq('id', authData.user.id);
        
        if (!updateResult.error) {
          updateSuccess = true;
          break;
        }
        
        // Wait and retry
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!updateSuccess) {
        console.warn('Could not update profile with name - it will be created by trigger');
      }

      const transformedUser = await transformSupabaseUser(authData.user);
      if (!transformedUser) {
        throw new Error('Failed to load user profile');
      }

      setUser(transformedUser);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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

      const { error } = await (supabase
        .from('user_profiles') as any)
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Reload user profile
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const transformedUser = await transformSupabaseUser(supabaseUser);
        setUser(transformedUser);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
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
