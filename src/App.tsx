
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeProvider';
import { useTheme } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Kitchen from './pages/Kitchen';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Shelf from './pages/Shelf';
import Dashboard from './pages/Dashboard'; 
import Analytics from './pages/Analytics';
import { CVViewer } from './components/kitchen/CVViewer';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import PublicProfile from './pages/PublicProfile';
import LandingPage from './pages/LandingPage';
import { Skeleton } from './components/ui/skeleton';

// Create a client with default options that completely prevents unnecessary refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Prevent data from becoming stale
      refetchOnWindowFocus: false, // Critical: prevent refetching data when tab regains focus
      refetchOnMount: false, // Don't refetch on component mount
      refetchOnReconnect: false, // Don't refetch on network reconnect
      retry: 1,
    },
  },
});

// Prevent the browser from reloading on visibilitychange
if (typeof document !== 'undefined') {
  const originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
  
  // Override the visibilityState property to always return 'visible'
  if (originalVisibilityState && originalVisibilityState.get) {
    Object.defineProperty(Document.prototype, 'visibilityState', {
      get: function() {
        return 'visible';
      }
    });
  }
}

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Store whether the app has been initialized to prevent redundant loading
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Only show loading screen on first load, not when switching tabs
    if (!initialized) {
      const timer = setTimeout(() => {
        setLoading(false);
        setInitialized(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // If already initialized, don't show loading screen
      setLoading(false);
    }
  }, [initialized]);
  
  // Completely prevent page refresh on visibility change or focus
  useEffect(() => {
    const handleVisibilityChange = (e) => {
      // Prevent default behavior
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Prevent any events that might trigger refresh
    document.addEventListener('visibilitychange', handleVisibilityChange, true);
    window.addEventListener('focus', handleVisibilityChange, true);
    window.addEventListener('blur', handleVisibilityChange, true);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
      window.removeEventListener('focus', handleVisibilityChange, true);
      window.removeEventListener('blur', handleVisibilityChange, true);
    };
  }, []);
  
  // Override the normal browser reload behavior for the entire app
  useEffect(() => {
    // Store original performance and navigation timing API
    const originalGetEntries = window.performance.getEntries;
    
    // Override to prevent reloads triggered by performance measurements
    window.performance.getEntries = () => [];
    
    // Cleanup when component unmounts
    return () => {
      window.performance.getEntries = originalGetEntries;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-accent/30">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-primary font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className={`app ${isDarkMode ? 'dark' : ''}`}>
          <BrowserRouter>
            <UserProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/u/:username" element={<PublicProfile />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/kitchen" element={<Kitchen />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/shelf" element={<Shelf />} />
                  <Route path="/kitchen/cv-viewer/:cvId" element={<CVViewer />} />
                </Route>
              </Routes>
              <Toaster />
            </UserProvider>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
