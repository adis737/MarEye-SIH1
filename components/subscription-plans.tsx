"use client";

import { useState, useEffect } from "react";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/lib/subscription-plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Crown, Zap, Building2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PaymentForm } from "@/components/payment-form";

interface SubscriptionPlansProps {
  currentPlan?: string;
  onPlanSelect?: (planId: string) => void;
}

export function SubscriptionPlans({ currentPlan = 'basic', onPlanSelect }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [planToDowngrade, setPlanToDowngrade] = useState<SubscriptionPlan | null>(null);

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    console.log("handlePlanSelect called with:", plan.id, "currentPlan:", currentPlan);
    
    if (plan.id === currentPlan) {
      toast.info("You are already on this plan");
      return;
    }

    if (plan.price === 0) {
      console.log("Basic plan selected, current plan:", currentPlan);
      // Show confirmation dialog for basic plan (downgrade or info)
      if (currentPlan !== 'basic') {
        console.log("Showing downgrade confirmation dialog");
        setPlanToDowngrade(plan);
        setShowDowngradeConfirm(true);
        return;
      } else {
        // If already on basic, show info dialog instead of just a toast
        console.log("Showing basic plan info dialog");
        setPlanToDowngrade(plan);
        setShowDowngradeConfirm(true);
        return;
      }
    }

    // Show payment form for all paid plans (including enterprise)
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    toast.success("Payment successful! Your subscription has been upgraded.");
    onPlanSelect?.(selectedPlan?.id || '');
    
    // Don't trigger automatic refresh - let the success page handle it
    // The success page will redirect or handle the flow appropriately
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleDowngradeConfirm = async () => {
    console.log("handleDowngradeConfirm called, planToDowngrade:", planToDowngrade);
    if (!planToDowngrade) return;
    
    setLoading(planToDowngrade.id);
    try {
      console.log("Making API call to downgrade to:", planToDowngrade.id);
      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId: planToDowngrade.id })
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.success) {
        toast.success("Successfully switched to Basic plan!");
        console.log("Calling onPlanSelect with:", planToDowngrade.id);
        onPlanSelect?.(planToDowngrade.id);
        setShowDowngradeConfirm(false);
        setPlanToDowngrade(null);
        
        // Trigger a custom event to refresh token status (only for plan switches)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('tokenStatusRefresh'));
        }, 500);
      } else {
        toast.error(data.error || "Failed to switch to Basic plan");
      }
    } catch (error) {
      console.error("Error switching to basic plan:", error);
      toast.error("Failed to switch to Basic plan");
    } finally {
      setLoading(null);
    }
  };

  const handleDowngradeCancel = () => {
    setShowDowngradeConfirm(false);
    setPlanToDowngrade(null);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Building2 className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return "from-blue-500 to-cyan-500";
      case 'pro':
        return "from-purple-500 to-pink-500";
      case 'enterprise':
        return "from-emerald-500 to-teal-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
            plan.popular ? 'ring-2 ring-purple-500 shadow-2xl' : 'shadow-lg'
          } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
        >
          {plan.popular && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
              Most Popular
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${getPlanColor(plan.id)} flex items-center justify-center text-white`}>
              {getPlanIcon(plan.id)}
            </div>
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            <CardDescription className="text-gray-600">
              {plan.description}
            </CardDescription>
            <div className="mt-4">
              {plan.price === 0 ? (
                <div className="text-3xl font-bold text-green-600">Free</div>
              ) : (
                <div className="text-3xl font-bold">
                  ₹{plan.price}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {plan.dailyTokens === -1 ? 'Unlimited' : plan.dailyTokens}
              </div>
              <div className="text-sm text-gray-500">AI Tokens per day</div>
            </div>
            
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => handlePlanSelect(plan)}
              disabled={loading === plan.id || currentPlan === plan.id}
              className={`w-full ${
                plan.popular 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
              } text-white`}
            >
              {loading === plan.id ? (
                "Processing..."
              ) : currentPlan === plan.id ? (
                "Current Plan"
              ) : plan.price === 0 ? (
                currentPlan !== 'basic' ? "Switch to Basic" : "Get Started"
              ) : (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Upgrade to {plan.name}</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6" />
              <span>Complete Your Payment</span>
            </DialogTitle>
            <DialogDescription>
              Secure payment for your {selectedPlan?.name} subscription
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <PaymentForm
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Basic Plan Dialog */}
      <Dialog open={showDowngradeConfirm} onOpenChange={setShowDowngradeConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-blue-500" />
              <span>{currentPlan !== 'basic' ? 'Switch to Basic Plan' : 'Basic Plan'}</span>
            </DialogTitle>
            <DialogDescription>
              {currentPlan !== 'basic' 
                ? 'Are you sure you want to switch to the Basic plan?'
                : 'You are currently on the Basic plan. Here\'s what you get:'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {currentPlan !== 'basic' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ What happens when you switch:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your current subscription will be cancelled</li>
                  <li>• You'll get 10 tokens per day (instead of your current limit)</li>
                  <li>• You'll lose access to premium features</li>
                  <li>• Your token usage will be reset</li>
                </ul>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">✅ Basic Plan includes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 10 daily tokens for AI analysis</li>
                <li>• Basic species identification</li>
                <li>• eDNA analysis</li>
                <li>• Basic water quality monitoring</li>
                <li>• Community support</li>
                <li>• Free forever</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDowngradeCancel}
              className="flex-1"
              disabled={loading === 'basic'}
            >
              {currentPlan !== 'basic' ? 'Cancel' : 'Close'}
            </Button>
            {currentPlan !== 'basic' && (
              <Button
                onClick={handleDowngradeConfirm}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={loading === 'basic'}
              >
                {loading === 'basic' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Switching...</span>
                  </div>
                ) : (
                  "Switch to Basic"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
