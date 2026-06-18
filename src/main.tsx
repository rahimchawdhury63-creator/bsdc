import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { initializeOneSignal } from '@config/onesignal';
import './i18n';
import './styles/global.css';
import './styles/typography.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/animations.css';
import './styles/dark-theme.css';
import './styles/admin.css';
import './styles/fabric.css';
/** React Query client with production-safe defaults for Firebase-backed reads. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 0
    }
  }
});

/** Registers the custom offline worker without blocking first render. */
const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('BSDC service worker registration failed', error);
      });
    });
  }
};

/** Bootstraps third-party browser integrations that are safe for public clients. */
initializeOneSignal();
registerServiceWorker();

/** Mount React into the app shell with providers required by all future features. */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
