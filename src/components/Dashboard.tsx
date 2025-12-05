import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Analytics, SearchHistory } from '../types';
import { getAnalytics, getSearchHistory } from '../services/database';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Load analytics
        const analyticsData = await getAnalytics(user.id);
        if (analyticsData) {
          setAnalytics(analyticsData);
        }

        // Load recent searches
        const searches = await getSearchHistory(user.id, 5);
        setRecentSearches(searches);

              } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your people search activities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/search"
              className="bg-white rounded-lg shadow-linkedin p-6 hover:shadow-linkedin-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MagnifyingGlassIcon className="h-8 w-8 text-linkedin-blue" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Start New Search</h3>
                  <p className="text-gray-500">Find people with advanced filters</p>
                </div>
              </div>
            </Link>

            
            <Link
              to="/analytics"
              className="bg-white rounded-lg shadow-linkedin p-6 hover:shadow-linkedin-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-linkedin-blue" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">View Analytics</h3>
                  <p className="text-gray-500">Track your search performance</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-linkedin p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MagnifyingGlassIcon className="h-8 w-8 text-linkedin-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Searches</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalSearches.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-linkedin p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentArrowDownIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Exports</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalExports}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-linkedin p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">This Month</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.searchesThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-linkedin p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <StarIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">94%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <div className="bg-white rounded-lg shadow-linkedin">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Searches</h2>
                <Link
                  to="/search/history"
                  className="text-linkedin-blue hover:text-linkedin-darkBlue text-sm font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{search.query}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {search.resultsCount} results • {search.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {search.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

                  </div>

        {/* Top Companies and Positions */}
        {analytics && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-linkedin">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Searched Companies</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {analytics.topSearchedCompanies.map((item, index) => (
                    <div key={item.company} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900 ml-2">{item.company}</span>
                      </div>
                      <span className="text-sm text-gray-500">{item.count} searches</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-linkedin">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Searched Positions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {analytics.topSearchedPositions.map((item, index) => (
                    <div key={item.position} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900 ml-2">{item.position}</span>
                      </div>
                      <span className="text-sm text-gray-500">{item.count} searches</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
