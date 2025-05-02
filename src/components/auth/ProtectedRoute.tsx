
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

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

  // If user is authenticated, render the outlet (children)
  return <Outlet />;
};
