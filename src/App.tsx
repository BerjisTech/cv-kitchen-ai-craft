
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

// Create a client with default options
// This avoids re-fetching when navigating between pages
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false, // Critical: prevent refetching data when tab regains focus
      retry: 1,
    },
  },
});

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
  
  // Prevent page refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Do nothing when visibility changes, preventing default refresh behavior
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
