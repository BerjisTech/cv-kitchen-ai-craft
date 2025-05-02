
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getCurrentUserId, promoteToSuperadmin } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { toast } from "@/components/ui/sonner";

export const AdminSetup: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  
  useEffect(() => {
    async function fetchUserId() {
      const id = await getCurrentUserId();
      setUserId(id);
    }
    
    fetchUserId();
  }, []);
  
  const handlePromote = async () => {
    if (!userId) return;
    
    const success = await promoteToSuperadmin(userId);
    
    if (success) {
      toast.success("Role updated to superadmin. Please refresh the page to see changes.");
    }
  };
  
  const isSuperadmin = userRole === 'superadmin';
  
  return (
    <div className="p-6 mb-6 border rounded-lg bg-amber-50 space-y-4">
      <h2 className="text-xl font-bold">Admin Setup</h2>
      
      <div>
        <p className="mb-2">Current user: {user?.email}</p>
        <p className="mb-2">User ID: {userId || 'Loading...'}</p>
        <p className="mb-2">Current role: <span className="font-semibold">{userRole || 'Loading...'}</span></p>
      </div>
      
      {!isSuperadmin ? (
        <Button 
          onClick={handlePromote}
          disabled={!userId}
        >
          Promote to Superadmin
        </Button>
      ) : (
        <p className="text-green-700 font-medium">✅ You already have superadmin privileges</p>
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        This component is for development purposes only. Remove it in production.
      </p>
    </div>
  );
};
