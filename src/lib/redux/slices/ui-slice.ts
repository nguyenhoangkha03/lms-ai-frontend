import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  } | null;
  modals: {
    [key: string]: boolean;
  };
  activeTab: string;
  searchQuery: string;
  filters: Record<string, any>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: UIState = {
  isLoading: false,
  sidebarCollapsed: false,
  theme: 'system',
  language: 'en',
  notifications: null,
  modals: {},
  activeTab: '',
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    toggleSidebar: state => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        duration?: number;
      }>
    ) => {
      state.notifications = {
        show: true,
        ...action.payload,
      };
    },

    hideNotification: state => {
      state.notifications = null;
    },

    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },

    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = action.payload;
    },

    updateFilter: (
      state,
      action: PayloadAction<{ key: string; value: any }>
    ) => {
      state.filters[action.payload.key] = action.payload.value;
    },

    clearFilters: state => {
      state.filters = {};
    },

    setPagination: (
      state,
      action: PayloadAction<{
        page?: number;
        pageSize?: number;
        total?: number;
      }>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    resetUI: () => initialState,
  },
});

export const {
  setLoading,
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setLanguage,
  showNotification,
  hideNotification,
  openModal,
  closeModal,
  setActiveTab,
  setSearchQuery,
  setFilters,
  updateFilter,
  clearFilters,
  setPagination,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
