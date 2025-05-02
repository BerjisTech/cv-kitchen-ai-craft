
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading, isAdmin, activeRole, userRole } = useAuth();
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Check if current route is a recruiter route
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');

  console.log("Protected Route - Current route:", location.pathname);
  console.log("Protected Route - Is admin route:", isAdminRoute);
  console.log("Protected Route - User role:", userRole);
  console.log("Protected Route - Active role:", activeRole);
  console.log("Protected Route - Is admin:", isAdmin);

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
    console.log("Access denied: User is not an admin");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Enforce recruiter or admin access for recruiter routes
  if (isRecruiterRoute && activeRole !== 'recruiter' && activeRole !== 'staff' && activeRole !== 'superadmin') {
    console.log("Access denied: User does not have recruiter privileges");
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated and has proper permissions, render the outlet (children)
  return <Outlet />;
};
