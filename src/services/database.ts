import { supabase } from '../lib/supabase';
import { Person, SearchFilter, SearchResult, SearchHistory, Analytics, Experience, Education, SocialProfile } from '../types';

// ============================================
// PEOPLE SERVICE
// ============================================

/**
 * Search for people based on filters
 */
export const searchPeople = async (filters: SearchFilter): Promise<SearchResult[]> => {
  try {
    let query = supabase
      .from('people')
      .select(`
        *,
        experience:experience(*),
        education:education(*),
        social_profiles:social_profiles(*)
      `);

    // Apply filters
    if (filters.name) {
      const nameParts = filters.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        query = query.or(`first_name.ilike.%${nameParts[0]}%,last_name.ilike.%${nameParts[1]}%`);
      } else {
        query = query.or(`first_name.ilike.%${filters.name}%,last_name.ilike.%${filters.name}%`);
      }
    }

    if (filters.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }

    if (filters.position) {
      query = query.ilike('position', `%${filters.position}%`);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.contains('skills', filters.skills);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;

    // Transform data to match Person interface
    const results: SearchResult[] = (data || []).map((person: any) => ({
      id: person.id,
      person: {
        id: person.id,
        firstName: person.first_name,
        lastName: person.last_name,
        email: person.email || undefined,
        phone: person.phone || undefined,
        company: person.company || undefined,
        position: person.position || undefined,
        location: person.location || undefined,
        linkedinUrl: person.linkedin_url || undefined,
        avatar: person.avatar_url || undefined,
        bio: person.bio || undefined,
        skills: person.skills || [],
        experience: (person.experience || []).map((exp: any) => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
          startDate: new Date(exp.start_date),
          endDate: exp.end_date ? new Date(exp.end_date) : undefined,
          description: exp.description || undefined,
          current: exp.current,
        })),
        education: (person.education || []).map((edu: any) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: new Date(edu.start_date),
          endDate: edu.end_date ? new Date(edu.end_date) : undefined,
          gpa: edu.gpa || undefined,
        })),
        socialProfiles: (person.social_profiles || []).map((profile: any) => ({
          platform: profile.platform,
          url: profile.url,
          username: profile.username || undefined,
        })),
        lastUpdated: new Date(person.last_updated),
      },
      relevanceScore: calculateRelevanceScore(person, filters),
      matchedFields: getMatchedFields(person, filters),
    }));

    return results;
  } catch (error) {
    console.error('Error searching people:', error);
    throw error;
  }
};

/**
 * Get a person by ID with all related data
 */
export const getPersonById = async (id: string): Promise<Person | null> => {
  try {
    const { data, error } = await supabase
      .from('people')
      .select(`
        *,
        experience:experience(*),
        education:education(*),
        social_profiles:social_profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return transformPersonFromDB(data);
  } catch (error) {
    console.error('Error getting person:', error);
    return null;
  }
};

/**
 * Get suggested connections for a user
 */
export const getSuggestedConnections = async (userId: string, limit: number = 3): Promise<Person[]> => {
  try {
    // Get random people not yet connected
    const { data, error } = await supabase
      .from('people')
      .select('id')
      .limit(100);

    if (error) throw error;

    // Get user's existing connections
    const { data: connections } = await supabase
      .from('connections')
      .select('person_id')
      .eq('user_id', userId);

    const connectedIds = new Set((connections || []).map((c: any) => c.person_id));

    // Filter out connected people and get random selection
    const availableIds = (data || [])
      .map((p: any) => p.id)
      .filter((id: string) => !connectedIds.has(id))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    if (availableIds.length === 0) return [];

    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select(`
        id,
        first_name,
        last_name,
        company,
        position,
        location,
        avatar_url,
        skills
      `)
      .in('id', availableIds);

    if (peopleError) throw peopleError;

    return (people || []).map((p: any) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      company: p.company || undefined,
      position: p.position || undefined,
      location: p.location || undefined,
      avatar: p.avatar_url || undefined,
      skills: p.skills || [],
      lastUpdated: new Date(),
    }));
  } catch (error) {
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
  userId: string,
  query: string | null,
  filters: SearchFilter,
  resultsCount: number
): Promise<SearchHistory | null> => {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query,
        filters: filters as any,
        results_count: resultsCount,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      query: data.query || '',
      filters: data.filters as SearchFilter,
      resultsCount: data.results_count,
      createdAt: new Date(data.created_at),
      userId: data.user_id,
    };
  } catch (error) {
    console.error('Error saving search history:', error);
    return null;
  }
};

/**
 * Get search history for a user
 */
export const getSearchHistory = async (userId: string, limit: number = 50): Promise<SearchHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      query: item.query || '',
      filters: item.filters as SearchFilter,
      resultsCount: item.results_count,
      createdAt: new Date(item.created_at),
      userId: item.user_id,
    }));
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/**
 * Delete a search history item
 */
export const deleteSearchHistory = async (historyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', historyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting search history:', error);
    return false;
  }
};

// ============================================
// ANALYTICS SERVICE
// ============================================

/**
 * Get analytics for a user
 */
export const getAnalytics = async (userId: string): Promise<Analytics | null> => {
  try {
    // Get total searches
    const { count: totalSearches } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get searches this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: searchesThisMonth } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    // Get exports
    const { count: totalExports } = await supabase
      .from('export_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: exportsThisMonth } = await supabase
      .from('export_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    // Get top companies (from search history filters)
    const { data: searchHistory } = await supabase
      .from('search_history')
      .select('filters')
      .eq('user_id', userId)
      .limit(1000);

    const companyCounts = new Map<string, number>();
    (searchHistory || []).forEach((item: any) => {
      const filters = item.filters;
      if (filters?.company) {
        const company = filters.company as string;
        companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
      }
    });

    const topSearchedCompanies = Array.from(companyCounts.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get top positions
    const positionCounts = new Map<string, number>();
    (searchHistory || []).forEach((item: any) => {
      const filters = item.filters;
      if (filters?.position) {
        const position = filters.position as string;
        positionCounts.set(position, (positionCounts.get(position) || 0) + 1);
      }
    });

    const topSearchedPositions = Array.from(positionCounts.entries())
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get searches by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentSearches } = await supabase
      .from('search_history')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString());

    const dayCounts = new Map<string, number>();
    (recentSearches || []).forEach((item: any) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      dayCounts.set(date, (dayCounts.get(date) || 0) + 1);
    });

    const searchesByDay = Array.from(dayCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSearches: totalSearches || 0,
      totalExports: totalExports || 0,
      searchesThisMonth: searchesThisMonth || 0,
      exportsThisMonth: exportsThisMonth || 0,
      topSearchedCompanies,
      topSearchedPositions,
      searchesByDay,
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    return null;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformPersonFromDB(data: any): Person {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
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
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startDate: new Date(exp.start_date),
      endDate: exp.end_date ? new Date(exp.end_date) : undefined,
      description: exp.description || undefined,
      current: exp.current,
    })),
    education: (data.education || []).map((edu: any) => ({
      id: edu.id,
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
    lastUpdated: new Date(data.last_updated),
  };
}

function calculateRelevanceScore(person: any, filters: SearchFilter): number {
  let score = 50; // Base score

  if (filters.name && person.first_name && person.last_name) {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    if (fullName.includes(filters.name.toLowerCase())) {
      score += 20;
    }
  }

  if (filters.company && person.company?.toLowerCase().includes(filters.company.toLowerCase())) {
    score += 15;
  }

  if (filters.position && person.position?.toLowerCase().includes(filters.position.toLowerCase())) {
    score += 15;
  }

  if (filters.location && person.location?.toLowerCase().includes(filters.location.toLowerCase())) {
    score += 10;
  }

  if (filters.skills && person.skills) {
    const matchingSkills = person.skills.filter((skill: string) =>
      filters.skills!.some(filterSkill => skill.toLowerCase().includes(filterSkill.toLowerCase()))
    );
    score += matchingSkills.length * 5;
  }

  return Math.min(score, 100);
}

function getMatchedFields(person: any, filters: SearchFilter): string[] {
  const matched: string[] = [];

  if (filters.name && person.first_name && person.last_name) {
    matched.push('name');
  }
  if (filters.company && person.company) {
    matched.push('company');
  }
  if (filters.position && person.position) {
    matched.push('position');
  }
  if (filters.location && person.location) {
    matched.push('location');
  }
  if (filters.skills && person.skills && person.skills.length > 0) {
    matched.push('skills');
  }

  return matched;
}

