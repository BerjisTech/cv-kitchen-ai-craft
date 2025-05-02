
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getCurrentUserId, promoteToSuperadmin } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';

export const AdminSetup: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchUserId() {
      const id = await getCurrentUserId();
      setUserId(id);
    }
    
    fetchUserId();
  }, []);
  
  const handlePromote = async () => {
    if (!userId) return;
    await promoteToSuperadmin(userId);
    // Reload the page to reflect the changes
    window.location.reload();
  };
  
  return (
    <div className="p-6 border rounded-lg bg-amber-50 space-y-4">
      <h2 className="text-xl font-bold">Admin Setup</h2>
      
      <div>
        <p className="mb-2">Current user: {user?.email}</p>
        <p className="mb-2">User ID: {userId || 'Loading...'}</p>
      </div>
      
      <Button 
        onClick={handlePromote}
        disabled={!userId}
      >
        Promote to Superadmin
      </Button>
      
      <p className="text-xs text-muted-foreground mt-4">
        This component is for development purposes only. Remove it in production.
      </p>
    </div>
  );
};
