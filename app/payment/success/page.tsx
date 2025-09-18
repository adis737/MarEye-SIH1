"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const processPayment = async () => {
      const orderId = searchParams.get('token');
      
      if (!orderId) {
        setPaymentStatus('error');
        setIsProcessing(false);
        return;
      }

      try {
        // Capture the PayPal payment
        const response = await fetch('/api/payment/paypal/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          setPaymentStatus('success');
          toast.success("Payment successful! Your subscription has been upgraded.");
        } else {
          setPaymentStatus('error');
          toast.error(data.error || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        setPaymentStatus('error');
        toast.error("Payment processing failed");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-semibold text-white mb-2">Processing Payment</h2>
            <p className="text-slate-300">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="text-center">
          {paymentStatus === 'success' ? (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Payment Successful!</CardTitle>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Payment Failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentStatus === 'success' ? (
            <>
              <p className="text-slate-300">
                Your subscription has been successfully upgraded. You can now enjoy all the premium features!
              </p>
              <div className="space-y-2">
                <Link href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
                    View Subscription
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-300">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="space-y-2">
                <Link href="/subscription">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    Try Again
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
