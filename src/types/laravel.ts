import { SubscriptionPlan } from './index';

export interface LaravelUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    id: number;
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    role: 'admin' | 'user' | 'premium' | 'enterprise';
    subscription_plan: string;
    subscription_expires_at: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface AuthResponse {
  user: LaravelUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

// Extend the base User type with Laravel-specific fields
declare module './index' {
  interface User {
    // Add any additional Laravel-specific fields here
    subscriptionExpiresAt: Date | null;
    role: 'admin' | 'user' | 'premium' | 'enterprise';
  }
}
