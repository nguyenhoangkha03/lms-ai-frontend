import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  widgetLayout: {
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isVisible: boolean;
  }[];

  viewMode: 'grid' | 'list' | 'compact';
  showWelcomeMessage: boolean;
  lastVisited: string | null;

  activityFeedFilter: 'all' | 'courses' | 'achievements' | 'assessments';
  recommendationsFilter: 'all' | 'learning' | 'review' | 'practice';
  quickActionsExpanded: boolean;

  favoriteWidgets: string[];
  hiddenWidgets: string[];
  dashboardTheme: 'default' | 'minimal' | 'detailed';

  isRefreshing: boolean;
  lastRefresh: string | null;
  autoRefreshEnabled: boolean;
  refreshInterval: number;

  dismissedRecommendations: string[];
  completedActions: string[];
  viewedActivities: string[];

  currentStudySession: {
    isActive: boolean;
    startTime: string | null;
    courseId: string | null;
    lessonId: string | null;
    elapsedMinutes: number;
  };

  activeTab: 'overview' | 'progress' | 'recommendations' | 'goals';
  expandedSections: string[];
  tooltipsEnabled: boolean;
}

const initialState: DashboardState = {
  widgetLayout: [
    {
      id: 'stats',
      position: { x: 0, y: 0 },
      size: { width: 12, height: 2 },
      isVisible: true,
    },
    {
      id: 'progress',
      position: { x: 0, y: 2 },
      size: { width: 8, height: 4 },
      isVisible: true,
    },
    {
      id: 'quick-actions',
      position: { x: 8, y: 2 },
      size: { width: 4, height: 4 },
      isVisible: true,
    },
    {
      id: 'ai-recommendations',
      position: { x: 0, y: 6 },
      size: { width: 6, height: 4 },
      isVisible: true,
    },
    {
      id: 'activity-feed',
      position: { x: 6, y: 6 },
      size: { width: 6, height: 4 },
      isVisible: true,
    },
  ],

  viewMode: 'grid',
  showWelcomeMessage: true,
  lastVisited: null,

  activityFeedFilter: 'all',
  recommendationsFilter: 'all',
  quickActionsExpanded: false,

  favoriteWidgets: [],
  hiddenWidgets: [],
  dashboardTheme: 'default',

  isRefreshing: false,
  lastRefresh: null,
  autoRefreshEnabled: true,
  refreshInterval: 300, // 5 minutes

  dismissedRecommendations: [],
  completedActions: [],
  viewedActivities: [],

  currentStudySession: {
    isActive: false,
    startTime: null,
    courseId: null,
    lessonId: null,
    elapsedMinutes: 0,
  },

  activeTab: 'overview',
  expandedSections: [],
  tooltipsEnabled: true,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Layout management
    updateWidgetLayout: (
      state,
      action: PayloadAction<typeof initialState.widgetLayout>
    ) => {
      state.widgetLayout = action.payload;
    },

    toggleWidgetVisibility: (state, action: PayloadAction<string>) => {
      const widget = state.widgetLayout.find(w => w.id === action.payload);
      if (widget) {
        widget.isVisible = !widget.isVisible;
      }
    },

    setViewMode: (state, action: PayloadAction<DashboardState['viewMode']>) => {
      state.viewMode = action.payload;
    },

    setDashboardTheme: (
      state,
      action: PayloadAction<DashboardState['dashboardTheme']>
    ) => {
      state.dashboardTheme = action.payload;
    },

    // Welcome message
    dismissWelcomeMessage: state => {
      state.showWelcomeMessage = false;
    },

    updateLastVisited: state => {
      state.lastVisited = new Date().toISOString();
    },

    // Filters
    setActivityFeedFilter: (
      state,
      action: PayloadAction<DashboardState['activityFeedFilter']>
    ) => {
      state.activityFeedFilter = action.payload;
    },

    setRecommendationsFilter: (
      state,
      action: PayloadAction<DashboardState['recommendationsFilter']>
    ) => {
      state.recommendationsFilter = action.payload;
    },

    toggleQuickActionsExpanded: state => {
      state.quickActionsExpanded = !state.quickActionsExpanded;
    },

    // Personalization
    addFavoriteWidget: (state, action: PayloadAction<string>) => {
      if (!state.favoriteWidgets.includes(action.payload)) {
        state.favoriteWidgets.push(action.payload);
      }
    },

    removeFavoriteWidget: (state, action: PayloadAction<string>) => {
      state.favoriteWidgets = state.favoriteWidgets.filter(
        id => id !== action.payload
      );
    },

    hideWidget: (state, action: PayloadAction<string>) => {
      if (!state.hiddenWidgets.includes(action.payload)) {
        state.hiddenWidgets.push(action.payload);
      }
    },

    showWidget: (state, action: PayloadAction<string>) => {
      state.hiddenWidgets = state.hiddenWidgets.filter(
        id => id !== action.payload
      );
    },

    // Refresh state
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
      if (!action.payload) {
        state.lastRefresh = new Date().toISOString();
      }
    },

    toggleAutoRefresh: state => {
      state.autoRefreshEnabled = !state.autoRefreshEnabled;
    },

    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },

    // User interactions
    dismissRecommendation: (state, action: PayloadAction<string>) => {
      if (!state.dismissedRecommendations.includes(action.payload)) {
        state.dismissedRecommendations.push(action.payload);
      }
    },

    completeAction: (state, action: PayloadAction<string>) => {
      if (!state.completedActions.includes(action.payload)) {
        state.completedActions.push(action.payload);
      }
    },

    markActivityViewed: (state, action: PayloadAction<string>) => {
      if (!state.viewedActivities.includes(action.payload)) {
        state.viewedActivities.push(action.payload);
      }
    },

    // Study session
    startStudySession: (
      state,
      action: PayloadAction<{ courseId?: string; lessonId?: string }>
    ) => {
      state.currentStudySession = {
        isActive: true,
        startTime: new Date().toISOString(),
        courseId: action.payload.courseId || null,
        lessonId: action.payload.lessonId || null,
        elapsedMinutes: 0,
      };
    },

    updateStudySessionTime: (state, action: PayloadAction<number>) => {
      if (state.currentStudySession.isActive) {
        state.currentStudySession.elapsedMinutes = action.payload;
      }
    },

    endStudySession: state => {
      state.currentStudySession = {
        isActive: false,
        startTime: null,
        courseId: null,
        lessonId: null,
        elapsedMinutes: 0,
      };
    },

    // Navigation
    setActiveTab: (
      state,
      action: PayloadAction<DashboardState['activeTab']>
    ) => {
      state.activeTab = action.payload;
    },

    toggleSection: (state, action: PayloadAction<string>) => {
      const index = state.expandedSections.indexOf(action.payload);
      if (index >= 0) {
        state.expandedSections.splice(index, 1);
      } else {
        state.expandedSections.push(action.payload);
      }
    },

    setTooltipsEnabled: (state, action: PayloadAction<boolean>) => {
      state.tooltipsEnabled = action.payload;
    },

    // Reset dashboard
    resetDashboard: state => {
      return {
        ...initialState,
        lastVisited: state.lastVisited,
      };
    },

    // Load dashboard preferences
    loadDashboardPreferences: (
      state,
      action: PayloadAction<Partial<DashboardState>>
    ) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const {
  updateWidgetLayout,
  toggleWidgetVisibility,
  setViewMode,
  setDashboardTheme,
  dismissWelcomeMessage,
  updateLastVisited,
  setActivityFeedFilter,
  setRecommendationsFilter,
  toggleQuickActionsExpanded,
  addFavoriteWidget,
  removeFavoriteWidget,
  hideWidget,
  showWidget,
  setRefreshing,
  toggleAutoRefresh,
  setRefreshInterval,
  dismissRecommendation,
  completeAction,
  markActivityViewed,
  startStudySession,
  updateStudySessionTime,
  endStudySession,
  setActiveTab,
  toggleSection,
  setTooltipsEnabled,
  resetDashboard,
  loadDashboardPreferences,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
