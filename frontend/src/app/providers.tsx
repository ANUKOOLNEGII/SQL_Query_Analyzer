import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};
export default AppProviders;
