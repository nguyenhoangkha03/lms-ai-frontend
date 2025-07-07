import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { THEME_CONFIG, STORAGE_KEYS } from '@/constants';

interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
  options?: Record<string, any>;
}

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

interface UIState {
  theme: 'light' | 'dark';
  language: string;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  modals: Record<string, ModalState>;
  toasts: ToastState[];
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  breadcrumbs: Array<{ title: string; href?: string }>;
  pageTitle: string;
}

const initialState: UIState = {
  theme: 'light',
  language: 'en',
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  modals: {},
  toasts: [],
  loading: {},
  errors: {},
  breadcrumbs: [],
  pageTitle: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.theme, action.payload);
      }
    },

    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.theme, state.theme);
      }
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.language, action.payload);
      }
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.sidebarState,
          JSON.stringify(action.payload)
        );
      }
    },

    toggleSidebar: state => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.sidebarState,
          JSON.stringify(state.sidebarCollapsed)
        );
      }
    },

    setSidebarMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarMobileOpen = action.payload;
    },

    toggleSidebarMobile: state => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },

    openModal: (
      state,
      action: PayloadAction<{
        id: string;
        type?: string;
        data?: any;
        options?: Record<string, any>;
      }>
    ) => {
      const { id, type, data, options } = action.payload;
      state.modals[id] = {
        isOpen: true,
        type,
        data,
        options,
      };
    },

    closeModal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.modals[id]) {
        state.modals[id].isOpen = false;
      }
    },

    closeAllModals: state => {
      Object.keys(state.modals).forEach(id => {
        state.modals[id].isOpen = false;
      });
    },

    addToast: (
      state,
      // Omit<ToastState, 'id'> nghĩa là lấy tất cả thuộc tính của ToastState trừ id
      action: PayloadAction<Omit<ToastState, 'id'> & { id?: string }>
    ) => {
      const toast = {
        id: action.payload.id || Math.random().toString(36).substr(2, 9),
        ...action.payload,
      };
      state.toasts.push(toast);
    },

    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    clearToasts: state => {
      state.toasts = [];
    },

    setUILoading: (
      state,
      action: PayloadAction<{ key: string; value: boolean }>
    ) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },

    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },

    setUIError: (
      state,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      const { key, value } = action.payload;
      state.errors[key] = value;
    },

    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },

    clearAllErrors: state => {
      state.errors = {};
    },

    setBreadcrumbs: (
      state,
      action: PayloadAction<Array<{ title: string; href?: string }>>
    ) => {
      state.breadcrumbs = action.payload;
    },

    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setLanguage,
  setSidebarCollapsed,
  toggleSidebar,
  setSidebarMobileOpen,
  toggleSidebarMobile,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setUILoading,
  clearLoading,
  setUIError,
  clearError,
  clearAllErrors,
  setBreadcrumbs,
  setPageTitle,
} = uiSlice.actions;

export default uiSlice.reducer;
