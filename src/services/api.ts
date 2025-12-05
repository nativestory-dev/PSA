import axios, { AxiosInstance } from 'axios';

// Create axios instance with base URL and headers
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for Sanctum cookies
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
  }) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// People API
export const peopleAPI = {
  search: async (filters: Record<string, any>) => {
    const response = await api.post('/people/search', filters);
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/people/${id}`);
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/people/suggestions/connections');
    return response.data;
  },
};

// Search History API
export const searchHistoryAPI = {
  getHistory: async () => {
    const response = await api.get('/search/history');
    return response.data;
  },

  deleteHistoryItem: async (id: string | number) => {
    const response = await api.delete(`/search/history/${id}`);
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/search/history');
    return response.data;
  },
};

// Connections API
export const connectionsAPI = {
  getConnections: async () => {
    const response = await api.get('/connections');
    return response.data;
  },

  createConnection: async (personId: string | number) => {
    const response = await api.post('/connections', { person_id: personId });
    return response.data;
  },

  acceptConnection: async (id: string | number) => {
    const response = await api.put(`/connections/${id}/accept`);
    return response.data;
  },

  deleteConnection: async (id: string | number) => {
    const response = await api.delete(`/connections/${id}`);
    return response.data;
  },
};

// Exports API
export const exportsAPI = {
  getExports: async () => {
    const response = await api.get('/exports');
    return response.data;
  },

  createExport: async (format: 'csv' | 'pdf' | 'excel', data: any[], searchId?: string | number) => {
    const payload: any = { format, data };
    if (searchId) payload.search_id = searchId;
    
    const response = await api.post('/exports', payload);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

export default {
  auth: authAPI,
  people: peopleAPI,
  searchHistory: searchHistoryAPI,
  connections: connectionsAPI,
  exports: exportsAPI,
  analytics: analyticsAPI,
};
