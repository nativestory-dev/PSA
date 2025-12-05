import { api } from '../contexts/AuthContext';
import { Person, SearchFilter, SearchResult, SearchHistory, Analytics } from '../types';

// ============================================
// PEOPLE SERVICE
// ============================================

/**
 * Search for people based on filters
 */
export const searchPeople = async (filters: SearchFilter): Promise<SearchResult[]> => {
  try {
    const response = await api.post('/people/search', {
      name: filters.name || null,
      company: filters.company || null,
      position: filters.position || null,
      location: filters.location || null,
      skills: filters.skills || [],
    });

    // Transform Laravel response to match our SearchResult interface
    const results: SearchResult[] = (response.data.results || response.data).map((item: any) => ({
      id: item.id.toString(),
      person: transformPersonFromAPI(item),
      relevanceScore: item.relevance_score || 50,
      matchedFields: item.matched_fields || [],
    }));

    return results;
  } catch (error: any) {
    console.error('Error searching people:', error);
    throw new Error(error.response?.data?.message || 'Failed to search people');
  }
};

/**
 * Get a person by ID with all related data
 */
export const getPersonById = async (id: string): Promise<Person | null> => {
  try {
    const response = await api.get(`/people/${id}`);
    return transformPersonFromAPI(response.data.data || response.data);
  } catch (error: any) {
    console.error('Error getting person:', error);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Failed to get person');
  }
};

/**
 * Get suggested connections for a user
 */
export const getSuggestedConnections = async (limit: number = 3): Promise<Person[]> => {
  try {
    const response = await api.get('/people/suggestions/connections', {
      params: { limit }
    });

    const people = response.data.results || response.data || [];
    return people.map((p: any) => transformPersonFromAPI(p));
  } catch (error: any) {
    console.error('Error getting suggested connections:', error);
    return [];
  }
};

// ============================================
// SEARCH HISTORY SERVICE
// ============================================

/**
 * Save a search to history
 */
export const saveSearchHistory = async (
  query: string | null,
  filters: SearchFilter,
  resultsCount: number
): Promise<SearchHistory | null> => {
  try {
    const response = await api.post('/search/history', {
      query,
      filters: {
        name: filters.name || null,
        company: filters.company || null,
        position: filters.position || null,
        location: filters.location || null,
        skills: filters.skills || [],
      },
      results_count: resultsCount,
    });

    const data = response.data.data || response.data;
    return {
      id: data.id.toString(),
      query: data.query || '',
      filters: data.filters as SearchFilter,
      resultsCount: data.results_count,
      createdAt: new Date(data.created_at),
      userId: data.user_id.toString(),
    };
  } catch (error: any) {
    console.error('Error saving search history:', error);
    return null;
  }
};

/**
 * Get search history for a user
 */
export const getSearchHistory = async (limit: number = 50): Promise<SearchHistory[]> => {
  try {
    const response = await api.get('/search/history', {
      params: { limit }
    });

    const results = response.data.results || response.data || [];
    return results.map((item: any) => ({
      id: item.id.toString(),
      query: item.query || '',
      filters: item.filters as SearchFilter,
      resultsCount: item.results_count,
      createdAt: new Date(item.created_at),
      userId: item.user_id.toString(),
    }));
  } catch (error: any) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/**
 * Delete a search history item
 */
export const deleteSearchHistory = async (historyId: string): Promise<boolean> => {
  try {
    await api.delete(`/search/history/${historyId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting search history:', error);
    return false;
  }
};

/**
 * Delete all search history
 */
export const deleteAllSearchHistory = async (): Promise<boolean> => {
  try {
    await api.delete('/search/history');
    return true;
  } catch (error: any) {
    console.error('Error deleting all search history:', error);
    return false;
  }
};

// ============================================
// ANALYTICS SERVICE
// ============================================

/**
 * Get analytics for a user
 */
export const getAnalytics = async (): Promise<Analytics | null> => {
  try {
    const response = await api.get('/analytics');
    const data = response.data.data || response.data;

    return {
      totalSearches: data.total_searches || 0,
      totalExports: data.total_exports || 0,
      searchesThisMonth: data.searches_this_month || 0,
      exportsThisMonth: data.exports_this_month || 0,
      topSearchedCompanies: data.top_searched_companies || [],
      topSearchedPositions: data.top_searched_positions || [],
      searchesByDay: data.searches_by_day || [],
    };
  } catch (error: any) {
    console.error('Error getting analytics:', error);
    return null;
  }
};

// ============================================
// CONNECTIONS SERVICE
// ============================================

/**
 * Get all connections
 */
export const getConnections = async (): Promise<any[]> => {
  try {
    const response = await api.get('/connections');
    return response.data.results || response.data || [];
  } catch (error: any) {
    console.error('Error getting connections:', error);
    return [];
  }
};

/**
 * Create a new connection
 */
export const createConnection = async (personId: string): Promise<any> => {
  try {
    const response = await api.post('/connections', {
      person_id: personId
    });
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error creating connection:', error);
    throw new Error(error.response?.data?.message || 'Failed to create connection');
  }
};

/**
 * Accept a connection
 */
export const acceptConnection = async (connectionId: string): Promise<boolean> => {
  try {
    await api.put(`/connections/${connectionId}/accept`);
    return true;
  } catch (error: any) {
    console.error('Error accepting connection:', error);
    return false;
  }
};

/**
 * Delete a connection
 */
export const deleteConnection = async (connectionId: string): Promise<boolean> => {
  try {
    await api.delete(`/connections/${connectionId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting connection:', error);
    return false;
  }
};

// ============================================
// EXPORTS SERVICE
// ============================================

/**
 * Get all exports
 */
export const getExports = async (): Promise<any[]> => {
  try {
    const response = await api.get('/exports');
    return response.data.results || response.data || [];
  } catch (error: any) {
    console.error('Error getting exports:', error);
    return [];
  }
};

/**
 * Create an export request
 */
export const createExportRequest = async (searchId: string, format: string): Promise<any> => {
  try {
    const response = await api.post('/exports', {
      search_id: searchId,
      format: format
    });
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error creating export request:', error);
    throw new Error(error.response?.data?.message || 'Failed to create export request');
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform API person data to Person interface
 */
function transformPersonFromAPI(data: any): Person {
  return {
    id: data.id.toString(),
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    email: data.email || undefined,
    phone: data.phone || undefined,
    company: data.company || undefined,
    position: data.position || undefined,
    location: data.location || undefined,
    linkedinUrl: data.linkedin_url || undefined,
    avatar: data.avatar_url || undefined,
    bio: data.bio || undefined,
    skills: data.skills || [],
    experience: (data.experience || []).map((exp: any) => ({
      id: exp.id.toString(),
      company: exp.company,
      position: exp.position,
      startDate: new Date(exp.start_date),
      endDate: exp.end_date ? new Date(exp.end_date) : undefined,
      description: exp.description || undefined,
      current: exp.current || false,
    })),
    education: (data.education || []).map((edu: any) => ({
      id: edu.id.toString(),
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: new Date(edu.start_date),
      endDate: edu.end_date ? new Date(edu.end_date) : undefined,
      gpa: edu.gpa || undefined,
    })),
    socialProfiles: (data.social_profiles || []).map((profile: any) => ({
      platform: profile.platform,
      url: profile.url,
      username: profile.username || undefined,
    })),
    lastUpdated: new Date(data.last_updated || data.updated_at),
  };
}