export interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  authors?: string[];
  instructors?: string[];
  contentTypes?: string[];
  levels?: string[];
  languages?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  duration?: {
    min?: number;
    max?: number;
  };
  rating?: {
    min?: number;
    max?: number;
  };
  price?: {
    min?: number;
    max?: number;
    isFree?: boolean;
    isPaid?: boolean;
  };
  sortBy?:
    | 'relevance'
    | 'newest'
    | 'oldest'
    | 'rating'
    | 'popularity'
    | 'price_low'
    | 'price_high'
    | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'course' | 'instructor' | 'category' | 'tag' | 'lesson';
  count?: number;
  metadata?: {
    isHistory?: boolean;
    image?: string;
    description?: string;
    url?: string;
    category?: string;
    rating?: number;
    price?: number;
  };
  highlighted?: string;
  score?: number;
}

export interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'instructor' | 'forum_post' | 'resource';
  title: string;
  description: string;
  url: string;
  image?: string;
  score: number;
  highlighted: {
    title?: string;
    description?: string;
    content?: string;
  };
  metadata: {
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
    category?: {
      id: string;
      name: string;
      color?: string;
    };
    tags?: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
    stats?: {
      rating?: number;
      reviewCount?: number;
      enrollmentCount?: number;
      duration?: number;
      lessonCount?: number;
      updatedAt?: string;
      createdAt?: string;
    };
    price?: {
      amount: number;
      currency: string;
      originalAmount?: number;
      discount?: number;
      isFree: boolean;
    };
    level?: string;
    language?: string;
    certification?: boolean;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  aggregations: {
    categories: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    tags: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    instructors: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    levels: Array<{
      value: string;
      count: number;
    }>;
    languages: Array<{
      value: string;
      count: number;
    }>;
    priceRanges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
    contentTypes: Array<{
      type: string;
      count: number;
    }>;
  };
  suggestions?: SearchSuggestion[];
  searchTime: number;
  query: string;
  appliedFilters: SearchFilters;
}

export interface FacetedFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'date_range';
  options: Array<{
    value: string | number;
    label: string;
    count: number;
    selected?: boolean;
  }>;
  range?: {
    min: number;
    max: number;
    step?: number;
  };
  collapsed?: boolean;
  searchable?: boolean;
}

export interface SmartDiscovery {
  id: string;
  type:
    | 'trending'
    | 'recommended'
    | 'recently_viewed'
    | 'similar'
    | 'new_arrivals'
    | 'featured';
  title: string;
  description?: string;
  items: SearchResult[];
  metadata: {
    algorithm?: string;
    confidence?: number;
    reasons?: string[];
    updatedAt: string;
  };
}

export interface SearchAnalytics {
  id: string;
  query: string;
  filters: SearchFilters;
  results: {
    total: number;
    clickedResults: string[];
    viewedResults: string[];
    topResult?: string;
  };
  user: {
    id?: string;
    sessionId: string;
    userAgent: string;
    location?: {
      country?: string;
      city?: string;
    };
  };
  timing: {
    searchTime: number;
    renderTime: number;
    interactionTime?: number;
  };
  interactions: Array<{
    type: 'click' | 'view' | 'filter_change' | 'sort_change' | 'page_change';
    target: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  createdAt: string;
}

export interface SearchOptimization {
  query: string;
  metrics: {
    searchVolume: number;
    clickThroughRate: number;
    conversionRate: number;
    bounceRate: number;
    averagePosition: number;
    zeroResultsRate: number;
  };
  suggestions: {
    queryImprovements: string[];
    contentGaps: string[];
    filterOptimizations: string[];
  };
  trends: Array<{
    date: string;
    volume: number;
    ctr: number;
    conversions: number;
  }>;
}

export interface AutocompleteRequest {
  query: string;
  limit?: number;
  types?: ('query' | 'course' | 'instructor' | 'category' | 'tag')[];
  includeMetadata?: boolean;
  context?: {
    currentPage?: string;
    userHistory?: string[];
    preferences?: Record<string, any>;
  };
}

export interface IntelligentSearch {
  query: string;
  intent: {
    type: 'search' | 'browse' | 'learn' | 'compare' | 'enroll';
    confidence: number;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
  };
  corrections: {
    original: string;
    suggested: string;
    confidence: number;
  }[];
  expansions: {
    synonyms: string[];
    relatedTerms: string[];
    concepts: string[];
  };
  personalizedBoosts: Array<{
    field: string;
    factor: number;
    reason: string;
  }>;
}
