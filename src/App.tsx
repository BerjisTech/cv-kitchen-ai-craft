
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeProvider';
import { useTheme } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider, useAuth } from './context/AuthContext';
import Kitchen from './pages/Kitchen';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Shelf from './pages/Shelf';
import { CVViewer } from './components/kitchen/CVViewer';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className={`app ${isDarkMode ? 'dark' : ''}`}>
          <BrowserRouter>
            <UserProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/kitchen" />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/kitchen"
                  element={
                    <ProtectedRoute>
                      <Kitchen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shelf"
                  element={
                    <ProtectedRoute>
                      <Shelf />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen/cv-viewer/:cvId"
                  element={
                    <ProtectedRoute>
                      <CVViewer />
                    </ProtectedRoute>
                  }
                />
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
