
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { ProfileData } from '@/services/profileService';

interface ProfileContactProps {
  profile: ProfileData | null;
  isPublic?: boolean;
}

export const ProfileContact: React.FC<ProfileContactProps> = ({ profile, isPublic = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Ways to reach me</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground" size={18} />
            <span>{profile?.email || 'Email not available'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground" size={18} />
            <span>{profile?.phone || 'Phone not available'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-muted-foreground" size={18} />
            <span>{profile?.location || 'Location not available'}</span>
          </div>
          
          <div className="border-t border-border pt-4 mt-6">
            <h4 className="text-sm font-medium mb-3">Social Profiles</h4>
            <div className="flex gap-3">
              <a href="#" className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {!isPublic && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>I'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Input placeholder="Your Name" />
              </div>
              <div>
                <Input type="email" placeholder="Your Email" />
              </div>
              <div>
                <Input placeholder="Subject" />
              </div>
              <div>
                <textarea 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={4}
                  placeholder="Your Message"
                ></textarea>
              </div>
              <Button className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
