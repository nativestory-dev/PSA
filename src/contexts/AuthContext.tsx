import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionPlan } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
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

// Helper function to transform Laravel user to our User type
const transformLaravelUser = (laravelUser: any): User => {
  // Laravel returns user with nested profile
  const profile = laravelUser.profile || {};
  
  return {
    id: laravelUser.id.toString(),
    email: laravelUser.email,
    name: laravelUser.name,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    avatarUrl: profile.avatar_url || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    location: profile.location || '',
    role: profile.role || 'user',
    subscriptionPlan: profile.subscription_plan || 'free',
    subscriptionExpiresAt: profile.subscription_expires_at || null,
    lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : null,
    emailVerified: true, // Assuming Laravel handles email verification
    createdAt: new Date(laravelUser.created_at),
    updatedAt: new Date(laravelUser.updated_at),
  };
};

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
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Verify token by fetching user profile
          const userData = await authAPI.getProfile();
          setUser(transformLaravelUser(userData));
        }
      } catch (err) {
        console.error('Session check failed:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const token = await authAPI.login(email, password);
      localStorage.setItem('auth_token', token);
      const userData = await authAPI.getProfile();
      setUser(transformLaravelUser(userData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const token = await authAPI.register(userData);
      localStorage.setItem('auth_token', token);
      const userData = await authAPI.getProfile();
      setUser(transformLaravelUser(userData));
    } catch (err) {
      setError(err.message);

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
