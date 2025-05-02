
import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { AdminSetup } from '@/components/admin/AdminSetup';

const AdminDashboard = () => {
  const { userRole } = useAuth();
  
  return (
    <AdminLayout title="Admin Dashboard">
      {/* Temporary admin setup - remove in production */}
      <AdminSetup />
      
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
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 mt-6">
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
    </AdminLayout>
  );
};

export default AdminDashboard;
