import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { SearchHistory, SearchFilter } from '../types';
import ExportManager from './ExportManager';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getSearchHistory, deleteSearchHistory } from '../services/database';

const SearchHistoryManager: React.FC = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearches, setSelectedSearches] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'results' | 'query'>('date');
  const [showExportManager, setShowExportManager] = useState(false);

  useEffect(() => {
    const loadSearchHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const history = await getSearchHistory(user.id, 100);
        setSearchHistory(history);
      } catch (error) {
        console.error('Error loading search history:', error);
        toast.error('Failed to load search history');
      } finally {
        setLoading(false);
      }
    };
    
    loadSearchHistory();
  }, [user]);

  const filteredHistory = searchHistory.filter(search => {
    const now = new Date();
    const searchDate = new Date(search.createdAt);
    
    switch (filterType) {
      case 'today':
        return searchDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return searchDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return searchDate >= monthAgo;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'results':
        return b.resultsCount - a.resultsCount;
      case 'query':
        return a.query.localeCompare(b.query);
      default:
        return 0;
    }
  });

  const handleDeleteSearch = async (searchId: string) => {
    try {
      const success = await deleteSearchHistory(searchId);
      if (success) {
        setSearchHistory(prev => prev.filter(search => search.id !== searchId));
        toast.success('Search deleted successfully');
      } else {
        toast.error('Failed to delete search');
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSearches.length === 0) return;

    try {
      const deletePromises = selectedSearches.map(id => deleteSearchHistory(id));
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount === selectedSearches.length) {
        setSearchHistory(prev => prev.filter(search => !selectedSearches.includes(search.id)));
        setSelectedSearches([]);
        toast.success(`${successCount} searches deleted successfully`);
      } else {
        toast.error(`Only ${successCount} of ${selectedSearches.length} searches were deleted`);
        // Reload history to sync state
        if (user?.id) {
          const history = await getSearchHistory(user.id, 100);
          setSearchHistory(history);
        }
      }
    } catch (error) {
      console.error('Error deleting searches:', error);
      toast.error('Failed to delete searches');
    }
  };

  const handleSelectAll = () => {
    if (selectedSearches.length === filteredHistory.length) {
      setSelectedSearches([]);
    } else {
      setSelectedSearches(filteredHistory.map(search => search.id));
    }
  };

  const handleSelectSearch = (searchId: string) => {
    setSelectedSearches(prev => 
      prev.includes(searchId) 
        ? prev.filter(id => id !== searchId)
        : [...prev, searchId]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getFilterSummary = (filters: SearchFilter) => {
    const parts = [];
    if (filters.company) parts.push(`Company: ${filters.company}`);
    if (filters.position) parts.push(`Position: ${filters.position}`);
    if (filters.location) parts.push(`Location: ${filters.location}`);
    if (filters.skills && filters.skills.length > 0) parts.push(`Skills: ${filters.skills.join(', ')}`);
    return parts.join(' • ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linkedin-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-linkedin-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linkedin-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search History</h1>
              <p className="text-gray-600 mt-2">Manage and review your past searches</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExportManager(!showExportManager)}
                className="bg-linkedin-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue flex items-center"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export History
              </button>
            </div>
          </div>
        </div>

        {/* Export Manager */}
        {showExportManager && (
          <div className="mb-8">
            <ExportManager 
              searchResults={[]} // Empty for now, would be populated with selected searches
              onExportComplete={() => setShowExportManager(false)}
            />
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-linkedin p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                >
                  <option value="date">Sort by Date</option>
                  <option value="results">Sort by Results</option>
                  <option value="query">Sort by Query</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {selectedSearches.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedSearches.length})
                </button>
              )}
              
              <button
                onClick={handleSelectAll}
                className="text-linkedin-blue hover:text-linkedin-darkBlue font-medium"
              >
                {selectedSearches.length === filteredHistory.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>

        {/* Search History List */}
        <div className="bg-white rounded-lg shadow-linkedin overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Search History ({filteredHistory.length} searches)
              </h2>
              <div className="text-sm text-gray-500">
                Showing {filteredHistory.length} of {searchHistory.length} searches
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((search) => (
              <div key={search.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedSearches.includes(search.id)}
                    onChange={() => handleSelectSearch(search.id)}
                    className="mt-1 h-4 w-4 text-linkedin-blue focus:ring-linkedin-blue border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {search.query}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{formatDate(search.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span>{getRelativeTime(search.createdAt)}</span>
                        </div>
                        
                        {getFilterSummary(search.filters) && (
                          <div className="text-sm text-gray-600 mb-3">
                            <FunnelIcon className="h-4 w-4 inline mr-1" />
                            {getFilterSummary(search.filters)}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                            <span>{search.resultsCount} results found</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-linkedin-blue hover:text-linkedin-darkBlue p-2 rounded-lg hover:bg-linkedin-lightBlue">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSearch(search.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredHistory.length === 0 && (
            <div className="p-12 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No searches found</h3>
              <p className="text-gray-600">
                {filterType === 'all' 
                  ? "You haven't performed any searches yet."
                  : `No searches found for the selected time period.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-linkedin-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Searches</p>
                <p className="text-2xl font-semibold text-gray-900">{searchHistory.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Results</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {searchHistory.reduce((sum, search) => sum + search.resultsCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {searchHistory.filter(search => {
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(search.createdAt) >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Results</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(searchHistory.reduce((sum, search) => sum + search.resultsCount, 0) / searchHistory.length) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHistoryManager;
