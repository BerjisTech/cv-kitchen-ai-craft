
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading, isAdmin, activeRole } = useAuth();
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Check if current route is a recruiter route
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');

  if (isLoading) {
    // You could add a loading spinner here
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with the current location as state
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Enforce admin access for admin routes
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Enforce recruiter or admin access for recruiter routes
  if (isRecruiterRoute && activeRole !== 'recruiter' && activeRole !== 'staff' && activeRole !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated and has proper permissions, render the outlet (children)
  return <Outlet />;
};
