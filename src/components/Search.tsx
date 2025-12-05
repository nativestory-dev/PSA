import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SearchFilter, Person, SearchResult } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { searchPeople, saveSearchHistory } from '../services/database';
import ViewPersonProfile from './ViewPersonProfile';
import { useSearch } from '../contexts/SearchContext';

interface SearchFormData {
  query: string;
  name?: string;
  company?: string;
  location?: string;
  position?: string;
  skills?: string;
  experienceMin?: number;
  experienceMax?: number;
  education?: string;
  industry?: string;
  salaryMin?: number;
  salaryMax?: number;
}

const Search: React.FC = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);



  const { searchResults, performSearch, loading } = useSearch();

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilter>({});
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>();

  const watchedValues = watch();

  useEffect(() => {
    // Load recent search queries from history (optional - can be enhanced)
    // For now, we'll keep this as a simple local array
    const savedHistory = localStorage.getItem('recentSearchQueries');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing search history:', error);
      }
    }
  }, []);

  const onSubmit = async (data: SearchFormData) => {
  if (!user) {
    toast.error('Please log in to search');
    return;
  }

  const filters: SearchFilter = {
    name: (data.name || data.query || '').trim() || undefined,
    company: data.company?.trim() || undefined,
    location: data.location?.trim() || undefined,
    position: data.position?.trim() || undefined,
    skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : undefined,
    experience: (data.experienceMin || data.experienceMax) ? {
      min: data.experienceMin,
      max: data.experienceMax,
    } : undefined,
    education: data.education?.trim() || undefined,
    industry: data.industry?.trim() || undefined,
    salaryRange: (data.salaryMin || data.salaryMax) ? {
      min: data.salaryMin,
      max: data.salaryMax,
    } : undefined,
  };

 await performSearch(data.query || '', filters, user?.id);


  // Local search history (still local)
  if (data.query) {
    const newHistory = [data.query, ...searchHistory.filter(item => item !== data.query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('recentSearchQueries', JSON.stringify(newHistory));
  }
};
  const clearFilters = () => {
    reset();
    setSelectedFilters({}); 
  };

  const exportResults = (format: 'csv' | 'pdf' | 'excel') => {
    // Implement export functionality
    console.log(`Exporting results as ${format}`);
  };

  return (
    <div className="min-h-screen bg-linkedin-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People Search</h1>
          <p className="text-gray-600">Find professionals with advanced search filters and parameters</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-linkedin p-6 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Search Query */}
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  {...register('query', { required: 'Search query is required' })}
                  type="text"
                  placeholder="Search for people, companies, positions..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.query && (
                <p className="mt-1 text-sm text-red-600">{errors.query.message}</p>
              )}
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <input
                    {...register('company')}
                    type="text"
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                  />
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <div className="relative">
                  <input
                    {...register('position')}
                    type="text"
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                  />
                  <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    {...register('location')}
                    type="text"
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                  />
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-linkedin-blue hover:text-linkedin-darkBlue font-medium"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-linkedin-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma-separated)
                    </label>
                    <input
                      {...register('skills')}
                      type="text"
                      placeholder="e.g., React, Python, Machine Learning"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <div className="relative">
                      <input
                        {...register('education')}
                        type="text"
                        placeholder="e.g., Computer Science, MBA"
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                      />
                      <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      {...register('industry')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="experienceMin" className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (years)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        {...register('experienceMin', { valueAsNumber: true })}
                        type="number"
                        placeholder="Min"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                      />
                      <input
                        {...register('experienceMax', { valueAsNumber: true })}
                        type="number"
                        placeholder="Max"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-linkedin p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => {
                    reset({ query });
                    handleSubmit(onSubmit)();
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-linkedin">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Search Results ({searchResults.length})
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportResults('csv')}
                    className="px-3 py-1 text-sm text-linkedin-blue hover:text-linkedin-darkBlue font-medium"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportResults('pdf')}
                    className="px-3 py-1 text-sm text-linkedin-blue hover:text-linkedin-darkBlue font-medium"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportResults('excel')}
                    className="px-3 py-1 text-sm text-linkedin-blue hover:text-linkedin-darkBlue font-medium"
                  >
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {searchResults.map((result) => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={result.person.avatar}
                        alt={`${result.person.firstName} ${result.person.lastName}`}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {result.person.firstName} {result.person.lastName}
                            </h3>
                            <p className="text-gray-600">{result.person.position} at {result.person.company}</p>
                            <p className="text-sm text-gray-500">{result.person.location}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Relevance</div>
                            <div className="text-lg font-semibold text-linkedin-blue">{result.relevanceScore}%</div>
                          </div>
                        </div>
                        
                        {result.person.bio && (
                          <p className="mt-2 text-gray-600">{result.person.bio}</p>
                        )}
                        
                        {result.person.skills && result.person.skills.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {result.person.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-linkedin-lightBlue text-linkedin-blue text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex items-center space-x-4">
                          <button className="bg-linkedin-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-linkedin-darkBlue transition-colors">
                            Contact
                          </button>
                        <button className="text-linkedin-blue hover:text-linkedin-darkBlue text-sm font-medium"
                                onClick={() => setSelectedPerson(result.person)}
                        >
                                  View Profile
                        </button>
                          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-linkedin p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for people...</p>
          </div>
        )}
      </div>
      {selectedPerson && (
  <ViewPersonProfile person={selectedPerson} onClose={() => setSelectedPerson(null)} />
)}

    </div>
  );
};

export default Search;
