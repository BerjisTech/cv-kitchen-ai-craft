
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = "Admin Dashboard" 
}) => {
  const location = useLocation();
  
  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/analytics', label: 'Platform Analytics' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/jobs', label: 'Job Post Oversight' },
    { path: '/admin/billing', label: 'Billing & Subscriptions' },
    { path: '/admin/ai', label: 'AI Management' },
    { path: '/admin/content', label: 'Content Moderation' },
    { path: '/admin/roles', label: 'Permissions & Roles' },
    { path: '/admin/communications', label: 'Communication Tools' },
    { path: '/admin/system', label: 'System Monitoring' }
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="sticky top-4 bg-card rounded-xl border p-4 shadow">
              <Accordion type="single" collapsible defaultValue="admin-nav">
                <AccordionItem value="admin-nav" className="border-none">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="font-medium">Admin Navigation</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 py-2">
                      {adminLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md hover:bg-accent",
                            location.pathname === link.path && "bg-accent font-medium"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
