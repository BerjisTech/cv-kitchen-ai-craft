
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAdmin, userRole } = useAuth();
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage system users</p>
              <p className="text-sm text-muted-foreground mt-2">
                View, edit, and manage user accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage job postings</p>
              <p className="text-sm text-muted-foreground mt-2">
                Review and moderate job listings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configure system parameters</p>
              <p className="text-sm text-muted-foreground mt-2">
                Update system-wide settings
              </p>
            </CardContent>
          </Card>
        </div>
        
        {userRole === 'superadmin' && (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-400">Superadmin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have superadmin privileges</p>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-2">
                This section is only visible to superadmins
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
