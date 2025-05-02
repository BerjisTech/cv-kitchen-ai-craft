import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { ColorPaletteSelector } from '@/components/theme/ColorPaletteSelector';
import { BillingSection } from '@/components/billing/BillingSection';

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="glass mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue="San Francisco, CA" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select your preferred theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ThemeSelector />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reducedMotion" className="flex flex-col gap-1">
                    <span>Reduced Motion</span>
                    <span className="text-xs text-muted-foreground">Limit animations and transitions</span>
                  </Label>
                  <Switch id="reducedMotion" />
                </div>
              </CardContent>
            </Card>
            
            <ColorPaletteSelector />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage your notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifs" className="flex flex-col gap-1">
                    <span>Email Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive updates via email</span>
                  </Label>
                  <Switch id="emailNotifs" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="cvViewNotifs" className="flex flex-col gap-1">
                    <span>CV View Alerts</span>
                    <span className="text-xs text-muted-foreground">Get notified when your CV is viewed</span>
                  </Label>
                  <Switch id="cvViewNotifs" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketingNotifs" className="flex flex-col gap-1">
                    <span>Marketing Emails</span>
                    <span className="text-xs text-muted-foreground">Receive promotional content</span>
                  </Label>
                  <Switch id="marketingNotifs" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profileVisibility" className="flex flex-col gap-1">
                    <span>Profile Visibility</span>
                    <span className="text-xs text-muted-foreground">Make your profile visible to employers</span>
                  </Label>
                  <Switch id="profileVisibility" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataCollection" className="flex flex-col gap-1">
                    <span>Data Collection</span>
                    <span className="text-xs text-muted-foreground">Allow anonymous usage data collection</span>
                  </Label>
                  <Switch id="dataCollection" defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <BillingSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
