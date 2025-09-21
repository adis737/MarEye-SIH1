import { NextRequest, NextResponse } from "next/server";
import { PayPalService } from "@/lib/paypal-service";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getUserCollection } from "@/dbCollections";

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid subscription plan" 
      }, { status: 400 });
    }

    // Check if it's a paid plan
    if (plan.price === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "This plan is free and doesn't require payment" 
      }, { status: 400 });
    }

    // Get user from token
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const token = cookies['auth_token'];
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication token not found" 
      }, { status: 401 });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid or expired token" 
      }, { status: 401 });
    }

    // Get user from database
    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    
    if (!user) {
      return NextResponse.json({
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    // Try processing in USD first, then fall back to INR
    let amount = plan.price;
    let currency = 'INR';
    let convertedAmount = plan.price;

    // Option 1: Try USD conversion (if your PayPal account supports USD)
    if (process.env.PAYPAL_USE_USD === 'true') {
      convertedAmount = PayPalService.convertINRToUSD(plan.price);
      currency = 'USD';
      amount = convertedAmount;
      
      console.log(`Creating PayPal order: ${plan.price} INR -> ${convertedAmount} USD for plan: ${plan.name}`);
    } else {
      // Option 2: Use INR directly (if your PayPal account supports INR)
      console.log(`Creating PayPal order: ${plan.price} INR for plan: ${plan.name}`);
    }

    // Additional validation for minimum amount
    if (currency === 'USD' && amount < 0.50) {
      return NextResponse.json({
        success: false,
        error: "Amount too small for PayPal processing (minimum $0.50 USD)"
      }, { status: 400 });
    }

    if (currency === 'INR' && amount < 1) {
      return NextResponse.json({
        success: false,
        error: "Amount too small for PayPal processing (minimum ₹1 INR)"
      }, { status: 400 });
    }

    // Create PayPal order
    const order = await PayPalService.createOrder(
      amount,
      currency,
      `${plan.name} - Oceanova AI Platform`
    );

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to create PayPal order. Please check your PayPal account currency settings." 
      }, { status: 500 });
    }

    // Store order details in database for verification
    const paymentRecord: any = {
      id: order.id,
      amount: plan.price, // Store original INR amount
      currency: 'INR',
      status: 'pending',
      date: new Date(),
      plan: planId,
      paymentMethod: 'paypal'
    };

    // Add PayPal specific fields if currency conversion was used
    if (currency === 'USD') {
      paymentRecord.paypalAmount = amount;
      paymentRecord.paypalCurrency = 'USD';
    }

    await users.updateOne(
      { _id: new ObjectId(decoded.id) },
      {
        $push: {
          paymentHistory: paymentRecord
        }
      } as any
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.approvalUrl,
      amount: amount,
      currency: currency,
      originalAmount: plan.price,
      originalCurrency: 'INR'
    });

  } catch (error: any) {
    console.error("PayPal order creation error:", error);
    
    // More specific error handling
    if (error.message?.includes('currency')) {
      return NextResponse.json({ 
        success: false, 
        error: "Currency not supported by PayPal account. Please check your PayPal sandbox account settings." 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}