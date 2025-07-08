'use client';

import { createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/api/api-client';
import { GlobalErrorHandler } from '@/lib/error-handler';

interface ApiContextValue {
  apiClient: typeof apiClient;
  errorHandler: GlobalErrorHandler;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const errorHandler = GlobalErrorHandler.getInstance();

  const value: ApiContextValue = {
    apiClient,
    errorHandler,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}
