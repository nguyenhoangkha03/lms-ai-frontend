'use client';

import { Loader2 } from 'lucide-react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

const PersistLoading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      {/* Tạm hoãn render app cho đến khi state được rehydrate xong (khôi phục từ localStorage) */}
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
