"use client";

import { useState, useEffect } from "react";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { TokenStatus } from "@/components/token-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Zap, Crown, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Subscription {
  plan: string;
  status: string;
}

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string>('basic');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/tokens/status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentPlan(data.subscription.plan);
        setSubscription(data.subscription);
      } else {
        toast.error(data.error || "Failed to fetch subscription info");
      }
    } catch (error) {
      console.error("Error fetching subscription info:", error);
      toast.error("Failed to fetch subscription info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <Crown className="w-5 h-5" />;
      case 'enterprise':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return "bg-blue-100 text-blue-800";
      case 'pro':
        return "bg-purple-100 text-purple-800";
      case 'enterprise':
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading subscription information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      {/* Top Home Button - Always Visible */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center space-x-2 text-white hover:text-cyan-200 transition-colors bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-4 py-2 rounded-lg border-2 border-cyan-400 shadow-xl font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>
      </div>
      
      <div className="container mx-auto px-4 pt-1 pb-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center space-x-2 text-white hover:text-cyan-200 transition-colors bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-4 py-2 rounded-lg border-2 border-cyan-400 shadow-xl font-semibold z-10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </Link>
            
            <div className="text-right">
              {subscription ? (
                <>
                  <div className="text-sm text-cyan-300 mb-1">Current Plan</div>
                  <Badge className={`${getPlanColor(subscription.plan)} flex items-center space-x-1 w-fit`}>
                    {getPlanIcon(subscription.plan)}
                    <span className="capitalize">{subscription.plan}</span>
                  </Badge>
                </>
              ) : (
                <div className="text-sm text-cyan-300">Loading...</div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Subscription & Billing</h1>
            <p className="text-cyan-200 text-sm">Monitor your usage, manage your subscription and billing</p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-white/20">
              Plans & Pricing
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white/20">
              Billing History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-400/20 rounded-xl p-4">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Your Dashboard</h2>
              <p className="text-cyan-200">
                Monitor your usage, manage your subscription and billing, and explore our AI-powered marine biodiversity platform.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Token Usage Card */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Token Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TokenStatus />
                </CardContent>
              </Card>

              {/* Plan Status Card */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center space-x-2">
                    {getPlanIcon(currentPlan)}
                    <span>Current Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Plan</span>
                    <Badge className={`${getPlanColor(currentPlan)} capitalize`}>
                      {currentPlan}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {subscription?.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Daily Tokens</span>
                    <span className="text-white font-medium">
                      {currentPlan === 'enterprise' ? 'Unlimited' : 
                       currentPlan === 'pro' ? '100' : '10'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                    onClick={() => setActiveTab('plans')}
                  >
                    View All Plans
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                    onClick={() => setActiveTab('billing')}
                  >
                    Billing History
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Plan Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan Description */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Plan Benefits</CardTitle>
                  <CardDescription className="text-cyan-200">
                    {currentPlan === 'basic' && 'Perfect for getting started with marine biodiversity analysis'}
                    {currentPlan === 'pro' && 'Ideal for professional researchers and marine biologists'}
                    {currentPlan === 'enterprise' && 'For organizations requiring enterprise-level features'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPlan === 'basic' && (
                      <>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>10 daily tokens for species identification</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Basic water quality analysis</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Community support</span>
                        </div>
                      </>
                    )}
                    {currentPlan === 'pro' && (
                      <>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>100 daily tokens for advanced analysis</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Advanced AI predictions</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Priority support</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Data export features</span>
                        </div>
                      </>
                    )}
                    {currentPlan === 'enterprise' && (
                      <>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Unlimited tokens and analysis</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Custom AI model training</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>Dedicated support team</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-200">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span>API access and integrations</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Monthly Cost</span>
                    <span className="text-white font-medium text-xl">
                      {currentPlan === 'basic' ? 'Free' :
                       currentPlan === 'pro' ? '₹399' : '₹999'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Next Billing Date</span>
                    <span className="text-white font-medium">
                      {currentPlan === 'basic' ? 'N/A' : 'Monthly'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Auto-renewal</span>
                    <Badge className={currentPlan === 'basic' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                      {currentPlan === 'basic' ? 'Disabled' : 'Enabled'}
                    </Badge>
                  </div>

                  {currentPlan !== 'basic' && (
                    <Button 
                      variant="outline" 
                      className="w-full border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                    >
                      Manage Billing
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Plan</h2>
              <p className="text-cyan-200 mb-8">
                Select the plan that best fits your research needs. You can upgrade or downgrade at any time.
              </p>
              <div id="subscription-plans">
                <SubscriptionPlans 
                  currentPlan={currentPlan} 
                  onPlanSelect={(planId) => {
                    setCurrentPlan(planId);
                    fetchSubscriptionInfo();
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Billing History</h2>
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Payment History</CardTitle>
                  <CardDescription className="text-cyan-200">
                    View your past payments and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPlan === 'basic' ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                      <p className="text-cyan-200">No payment history for free plan</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-cyan-200">Payment history will be displayed here</p>
                      <p className="text-sm text-cyan-300 mt-2">
                        This feature will be available after your first payment
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
