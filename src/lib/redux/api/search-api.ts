import { baseApi } from '@/lib/api/base-api';
import {
  SearchFilters,
  SearchResponse,
  SearchSuggestion,
  SmartDiscovery,
  SearchOptimization,
  AutocompleteRequest,
  IntelligentSearch,
  FacetedFilter,
} from '@/lib/types/search';

export const searchApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    universalSearch: builder.query<SearchResponse, SearchFilters>({
      query: filters => ({
        url: '/search',
        params: filters,
      }),
      providesTags: ['Search'],
    }),

    // Course-specific search
    searchCourses: builder.query<SearchResponse, SearchFilters>({
      query: filters => ({
        url: '/search/courses',
        params: filters,
      }),
      providesTags: ['Search', 'Course'],
    }),

    // Instructor search
    searchInstructors: builder.query<SearchResponse, SearchFilters>({
      query: filters => ({
        url: '/search/instructors',
        params: filters,
      }),
      providesTags: ['Search', 'User'],
    }),

    // Forum search
    searchForum: builder.query<SearchResponse, SearchFilters>({
      query: filters => ({
        url: '/search/forum',
        params: filters,
      }),
      providesTags: ['Search', 'Forum'],
    }),

    // Resource search
    searchResources: builder.query<SearchResponse, SearchFilters>({
      query: filters => ({
        url: '/search/resources',
        params: filters,
      }),
      providesTags: ['Search', 'Resource'],
    }),

    // =================== AUTOCOMPLETE & SUGGESTIONS ===================

    // Get autocomplete suggestions
    getAutocompleteSuggestions: builder.query<
      SearchSuggestion[],
      AutocompleteRequest
    >({
      query: ({ query, ...params }) => ({
        url: '/search/autocomplete',
        params: { q: query, ...params },
      }),
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get search suggestions based on context
    getSearchSuggestions: builder.query<
      SearchSuggestion[],
      {
        query?: string;
        type?: 'trending' | 'popular' | 'recent' | 'recommended';
        limit?: number;
        context?: Record<string, any>;
      }
    >({
      query: params => ({
        url: '/search/suggestions',
        params,
      }),
      providesTags: ['SearchSuggestions'],
    }),

    // Get trending searches
    getTrendingSearches: builder.query<
      SearchSuggestion[],
      {
        timeframe?: '1h' | '24h' | '7d' | '30d' | '90d';
        limit?: number;
        category?: string;
      }
    >({
      query: params => ({
        url: '/search/trending',
        params,
      }),
      providesTags: ['SearchTrending'],
    }),

    // =================== INTELLIGENT SEARCH ===================

    // Intelligent search with NLP processing
    intelligentSearch: builder.mutation<IntelligentSearch, { query: string }>({
      query: ({ query }) => ({
        url: '/search/intelligent',
        method: 'POST',
        body: { query },
      }),
    }),

    // Get search intent analysis
    analyzeSearchIntent: builder.mutation<
      {
        intent: string;
        confidence: number;
        entities: Array<{ type: string; value: string; confidence: number }>;
        suggestions: string[];
      },
      { query: string; context?: Record<string, any> }
    >({
      query: data => ({
        url: '/search/analyze-intent',
        method: 'POST',
        body: data,
      }),
    }),

    // Get personalized search results
    getPersonalizedSearch: builder.query<
      SearchResponse,
      SearchFilters & { usePersonalization?: boolean }
    >({
      query: filters => ({
        url: '/search/personalized',
        params: filters,
      }),
      providesTags: ['Search', 'PersonalizedSearch'],
    }),

    // =================== DISCOVERY ENGINE ===================

    // Get smart discovery content
    getSmartDiscovery: builder.query<
      SmartDiscovery[],
      {
        types?: string[];
        limit?: number;
        refreshCache?: boolean;
      }
    >({
      query: params => ({
        url: '/discovery/smart',
        params,
      }),
      providesTags: ['SmartDiscovery'],
    }),

    // Get content recommendations
    getContentRecommendations: builder.query<
      SearchResponse,
      {
        userId?: string;
        contentId?: string;
        contentType?: string;
        algorithm?: 'collaborative' | 'content_based' | 'hybrid';
        limit?: number;
      }
    >({
      query: params => ({
        url: '/discovery/recommendations',
        params,
      }),
      providesTags: ['ContentRecommendations'],
    }),

    // Get similar content
    getSimilarContent: builder.query<
      SearchResponse,
      {
        contentId: string;
        contentType: string;
        limit?: number;
        algorithm?: 'semantic' | 'collaborative' | 'tags';
      }
    >({
      query: params => ({
        url: '/discovery/similar',
        params,
      }),
      providesTags: ['SimilarContent'],
    }),

    // =================== FACETED SEARCH ===================

    // Get faceted filters for search
    getFacetedFilters: builder.query<
      FacetedFilter[],
      {
        query?: string;
        contentType?: string;
        includeZeroCounts?: boolean;
      }
    >({
      query: params => ({
        url: '/search/facets',
        params,
      }),
      providesTags: ['SearchFacets'],
    }),

    // Apply faceted filters to search
    applyFacetedSearch: builder.query<SearchResponse, SearchFilters>({
      query: filters => ({
        url: '/search/faceted',
        params: filters,
      }),
      providesTags: ['Search', 'FacetedSearch'],
    }),

    // Get filter suggestions based on current search
    getFilterSuggestions: builder.query<
      Array<{
        field: string;
        suggestions: Array<{ value: string; count: number }>;
      }>,
      { query: string; currentFilters?: SearchFilters }
    >({
      query: ({ query, currentFilters }) => ({
        url: '/search/filter-suggestions',
        params: { q: query, ...currentFilters },
      }),
    }),

    // =================== SEARCH ANALYTICS ===================

    // Track search interaction
    trackSearchInteraction: builder.mutation<
      void,
      {
        query: string;
        interactionType: 'search' | 'click' | 'view' | 'filter' | 'sort';
        target?: string;
        metadata?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/search/analytics/track',
        method: 'POST',
        body: data,
      }),
    }),

    // Get search analytics
    getSearchAnalytics: builder.query<
      {
        overview: {
          totalSearches: number;
          uniqueQueries: number;
          averageCTR: number;
          zeroResultsRate: number;
        };
        topQueries: Array<{
          query: string;
          count: number;
          ctr: number;
          conversionRate: number;
        }>;
        trends: Array<{
          date: string;
          searches: number;
          clicks: number;
          conversions: number;
        }>;
      },
      {
        timeRange?: '24h' | '7d' | '30d' | '90d';
        granularity?: 'hour' | 'day' | 'week';
      }
    >({
      query: params => ({
        url: '/search/analytics',
        params,
      }),
      providesTags: ['SearchAnalytics'],
    }),

    // Get search optimization suggestions
    getSearchOptimization: builder.query<
      SearchOptimization[],
      {
        query?: string;
        timeRange?: string;
        minVolume?: number;
      }
    >({
      query: params => ({
        url: '/search/optimization',
        params,
      }),
      providesTags: ['SearchOptimization'],
    }),

    // =================== ADMIN FEATURES ===================

    // Manage search boost rules
    getSearchBoostRules: builder.query<
      Array<{
        id: string;
        query: string;
        boostType: 'promote' | 'demote' | 'exclude';
        targetId: string;
        targetType: string;
        multiplier: number;
        isActive: boolean;
      }>,
      void
    >({
      query: () => '/api/v1/search/admin/boost-rules',
      providesTags: ['SearchBoostRules'],
    }),

    // Create search boost rule
    createSearchBoostRule: builder.mutation<
      void,
      {
        query: string;
        boostType: 'promote' | 'demote' | 'exclude';
        targetId: string;
        targetType: string;
        multiplier: number;
      }
    >({
      query: data => ({
        url: '/search/admin/boost-rules',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SearchBoostRules'],
    }),

    // Update search boost rule
    updateSearchBoostRule: builder.mutation<
      void,
      {
        id: string;
        data: {
          query?: string;
          boostType?: 'promote' | 'demote' | 'exclude';
          multiplier?: number;
          isActive?: boolean;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/search/admin/boost-rules/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SearchBoostRules'],
    }),

    // Delete search boost rule
    deleteSearchBoostRule: builder.mutation<void, string>({
      query: id => ({
        url: `/api/v1/search/admin/boost-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SearchBoostRules'],
    }),

    // Rebuild search index
    rebuildSearchIndex: builder.mutation<
      { message: string; taskId: string },
      { contentTypes?: string[]; full?: boolean }
    >({
      query: data => ({
        url: '/search/admin/rebuild-index',
        method: 'POST',
        body: data,
      }),
    }),

    // Get search index status
    getSearchIndexStatus: builder.query<
      {
        status: 'healthy' | 'rebuilding' | 'error';
        lastUpdate: string;
        totalDocuments: number;
        indexSize: string;
        contentTypes: Record<string, number>;
      },
      void
    >({
      query: () => '/api/v1/search/admin/index-status',
      providesTags: ['SearchIndexStatus'],
    }),
  }),
});

export const {
  // Basic Search
  useUniversalSearchQuery,
  useSearchCoursesQuery,
  useSearchInstructorsQuery,
  useSearchForumQuery,
  useSearchResourcesQuery,

  // Autocomplete & Suggestions
  useGetAutocompleteSuggestionsQuery,
  useGetSearchSuggestionsQuery,
  useGetTrendingSearchesQuery,

  // Intelligent Search
  useIntelligentSearchMutation,
  useAnalyzeSearchIntentMutation,
  useGetPersonalizedSearchQuery,

  // Discovery Engine
  useGetSmartDiscoveryQuery,
  useGetContentRecommendationsQuery,
  useGetSimilarContentQuery,

  // Faceted Search
  useGetFacetedFiltersQuery,
  useApplyFacetedSearchQuery,
  useGetFilterSuggestionsQuery,

  // Search Analytics
  useTrackSearchInteractionMutation,
  useGetSearchAnalyticsQuery,
  useGetSearchOptimizationQuery,

  // Admin Features
  useGetSearchBoostRulesQuery,
  useCreateSearchBoostRuleMutation,
  useUpdateSearchBoostRuleMutation,
  useDeleteSearchBoostRuleMutation,
  useRebuildSearchIndexMutation,
  useGetSearchIndexStatusQuery,
} = searchApi;
