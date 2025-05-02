
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Check, X, Sparkles, Award, Crown, Briefcase, Building, Star } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PlanType = 'job-seeker' | 'recruiter';
type JobSeekerPlan = 'free' | 'pro' | 'pro-plus';
type RecruiterPlan = 'lite' | 'pro' | 'unlimited';
type Addon = 'ai-tailoring' | 'headshot-review' | 'design-help';

export const BillingSection = () => {
  const [planType, setPlanType] = useState<PlanType>('job-seeker');
  const [selectedJobSeekerPlan, setSelectedJobSeekerPlan] = useState<JobSeekerPlan>('free');
  const [selectedRecruiterPlan, setSelectedRecruiterPlan] = useState<RecruiterPlan>('lite');
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => 
      prev.includes(addon)
        ? prev.filter(a => a !== addon)
        : [...prev, addon]
    );
  };

  const getBillingAmount = () => {
    let total = 0;
    
    if (planType === 'job-seeker') {
      if (selectedJobSeekerPlan === 'pro') {
        total += 7;
      } else if (selectedJobSeekerPlan === 'pro-plus') {
        total += 12;
      }
    } else {
      if (selectedRecruiterPlan === 'lite') {
        total += 29;
      } else if (selectedRecruiterPlan === 'pro') {
        total += 99;
      } else if (selectedRecruiterPlan === 'unlimited') {
        total += 299;
      }
    }
    
    return total;
  };
  
  const billingTotal = getBillingAmount();

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Billing & Plans</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-6">
            <Tabs 
              defaultValue="job-seeker" 
              className="w-full" 
              onValueChange={(value) => setPlanType(value as PlanType)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="job-seeker">🧑‍💼 Job Seeker</TabsTrigger>
                <TabsTrigger value="recruiter">🧑‍💻 Recruiter</TabsTrigger>
              </TabsList>
              
              <TabsContent value="job-seeker" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Free Plan */}
                  <Card className={`relative overflow-hidden border-2 ${selectedJobSeekerPlan === 'free' ? 'border-primary' : 'border-border'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-400"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Free
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">$0</span>
                        <span className="text-muted-foreground"> / month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>2 CVs and 2 Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>1 Landing Page</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Limited templates</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Basic AI help</span>
                        </li>
                      </ul>
                      <RadioGroup value={selectedJobSeekerPlan} onValueChange={(value) => setSelectedJobSeekerPlan(value as JobSeekerPlan)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="free" id="free" />
                          <Label htmlFor="free">Select plan</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Pro Plan */}
                  <Card className={`relative overflow-hidden border-2 ${selectedJobSeekerPlan === 'pro' ? 'border-primary' : 'border-border'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="mr-2 h-5 w-5" />
                        Pro
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">$7</span>
                        <span className="text-muted-foreground"> / month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Unlimited CVs & Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Advanced templates</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Portfolio + Analytics</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>AI tone/style preferences</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>5 AI-assisted job matches per month</span>
                        </li>
                      </ul>
                      <RadioGroup value={selectedJobSeekerPlan} onValueChange={(value) => setSelectedJobSeekerPlan(value as JobSeekerPlan)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pro" id="pro" />
                          <Label htmlFor="pro">Select plan</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Pro+ Plan */}
                  <Card className={`relative overflow-hidden border-2 ${selectedJobSeekerPlan === 'pro-plus' ? 'border-primary' : 'border-border'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Crown className="mr-2 h-5 w-5" />
                        Pro+
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">$12</span>
                        <span className="text-muted-foreground"> / month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Priority AI processing</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>10 job-tailored landing pages</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>AI photo feedback + suggestions</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Custom domain (e.g., benedictcv.com)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>CV view alerts & engagement stats</span>
                        </li>
                      </ul>
                      <RadioGroup value={selectedJobSeekerPlan} onValueChange={(value) => setSelectedJobSeekerPlan(value as JobSeekerPlan)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pro-plus" id="pro-plus" />
                          <Label htmlFor="pro-plus">Select plan</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Add-ons section */}
                <Card>
                  <CardHeader>
                    <CardTitle>🔁 Add-ons</CardTitle>
                    <CardDescription>Enhance your experience with add-on services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Add-on</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Select</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Extra AI Tailoring</TableCell>
                          <TableCell>$1 / use</TableCell>
                          <TableCell>For job-specific CV tuning</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleAddon('ai-tailoring')}
                              className={selectedAddons.includes('ai-tailoring') ? 'bg-primary text-primary-foreground' : ''}
                            >
                              {selectedAddons.includes('ai-tailoring') ? 'Selected' : 'Select'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Headshot Review</TableCell>
                          <TableCell>$3</TableCell>
                          <TableCell>AI + expert feedback</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleAddon('headshot-review')}
                              className={selectedAddons.includes('headshot-review') ? 'bg-primary text-primary-foreground' : ''}
                            >
                              {selectedAddons.includes('headshot-review') ? 'Selected' : 'Select'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Custom Design Help</TableCell>
                          <TableCell>$10</TableCell>
                          <TableCell>Work with a real designer</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleAddon('design-help')}
                              className={selectedAddons.includes('design-help') ? 'bg-primary text-primary-foreground' : ''}
                            >
                              {selectedAddons.includes('design-help') ? 'Selected' : 'Select'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recruiter" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Recruiter Lite Plan */}
                  <Card className={`relative overflow-hidden border-2 ${selectedRecruiterPlan === 'lite' ? 'border-primary' : 'border-border'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Recruiter Lite
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">$29</span>
                        <span className="text-muted-foreground"> / month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>10 candidate requests/month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>AI job matching</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Access public CVs & portfolios</span>
                        </li>
                      </ul>
                      <RadioGroup value={selectedRecruiterPlan} onValueChange={(value) => setSelectedRecruiterPlan(value as RecruiterPlan)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lite" id="recruiter-lite" />
                          <Label htmlFor="recruiter-lite">Select plan</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Recruiter Pro Plan */}
                  <Card className={`relative overflow-hidden border-2 ${selectedRecruiterPlan === 'pro' ? 'border-primary' : 'border-border'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        Recruiter Pro
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">$99</span>
                        <span className="text-muted-foreground"> / month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>50 requests/month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Priority response from job seekers</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Advanced search & filters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Message templates</span>
                        </li>
                      </ul>
                      <RadioGroup value={selectedRecruiterPlan} onValueChange={(value) => setSelectedRecruiterPlan(value as RecruiterPlan)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pro" id="recruiter-pro" />
                          <Label htmlFor="recruiter-pro">Select plan</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Recruiter Unlimited Plan */}
                  <Card className={`relative overflow-hidden border-2 ${selectedRecruiterPlan === 'unlimited' ? 'border-primary' : 'border-border'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        Recruiter Unlimited
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">$299</span>
                        <span className="text-muted-foreground"> / month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Unlimited requests</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Branded company page</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Job post + CV request bundle</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Analytics on who accepts/refuses</span>
                        </li>
                      </ul>
                      <RadioGroup value={selectedRecruiterPlan} onValueChange={(value) => setSelectedRecruiterPlan(value as RecruiterPlan)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unlimited" id="recruiter-unlimited" />
                          <Label htmlFor="recruiter-unlimited">Select plan</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Enterprise Option */}
                <Card>
                  <CardHeader>
                    <CardTitle>📦 Bulk / Enterprise Plan</CardTitle>
                    <CardDescription>Custom pricing for larger organizations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>Custom pricing for universities, hiring agencies, or marketplaces. Offers:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Shared team inboxes</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Usage dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Applicant tracking export (CSV, JSON)</span>
                      </li>
                    </ul>
                    <Button className="w-full">Contact Sales</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Billing Summary</CardTitle>
          <CardDescription>Your current plan and payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">
                {planType === 'job-seeker' 
                  ? `${selectedJobSeekerPlan === 'free' ? 'Free' : selectedJobSeekerPlan === 'pro' ? 'Pro' : 'Pro+'} Plan`
                  : `Recruiter ${selectedRecruiterPlan === 'lite' ? 'Lite' : selectedRecruiterPlan === 'pro' ? 'Pro' : 'Unlimited'}`}
              </h3>
              <p className="text-sm text-muted-foreground">Billed monthly</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold">${billingTotal}</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Button className="w-full" disabled={billingTotal === 0}>
              {billingTotal === 0 ? 'Current Plan' : 'Proceed to Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Constraints */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            Smart Constraints
          </CardTitle>
          <CardDescription>Special features and limitations of each plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="mr-2 h-5 w-5 text-blue-500 flex items-center justify-center">•</div>
              <span><strong>Request Throttling:</strong> Free users can only approve 3 CV requests/month to encourage upgrades.</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 h-5 w-5 text-blue-500 flex items-center justify-center">•</div>
              <span><strong>Engagement-based Rewards:</strong> Job seekers can earn 1 free AI tailoring per recruiter view.</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 h-5 w-5 text-blue-500 flex items-center justify-center">•</div>
              <span><strong>Employer Transparency:</strong> Job seekers can see company profile and rating before approving a request.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
};
