import { NextRequest, NextResponse } from "next/server";
import { PayPalService } from "@/lib/paypal-service";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getUserCollection } from "@/dbCollections";

export async function POST(req: NextRequest) {
  try {
    console.log("PayPal create-order API called");
    const { planId } = await req.json();
    console.log("Plan ID received:", planId);

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

    // Get user from token (optional - allow payments for non-logged-in users)
    const cookieHeader = req.headers.get("cookie");
    console.log("Cookie header:", cookieHeader ? "Present" : "Missing");
    
    let userId = null;
    let user = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const token = cookies['auth_token'];
      console.log("Auth token found:", token ? "Yes" : "No");
      
      if (token) {
        try {
          // Verify JWT token
          const jwtSecret = process.env.JWT_SECRET || "supersecret";
          const decoded: any = jwt.verify(token, jwtSecret);
          
          if (decoded && decoded.id) {
            userId = decoded.id;
            console.log("User ID from token:", userId);
            
            // Get user from database
            const users = await getUserCollection();
            user = await users.findOne({ _id: new ObjectId(decoded.id) });
            console.log("User found in database:", user ? "Yes" : "No");
          }
        } catch (jwtError) {
          console.log("JWT verification failed, proceeding without authentication");
        }
      }
    }
    
    console.log("Processing payment for:", userId ? "Logged-in user" : "Guest user");

    // Convert INR to USD for PayPal (PayPal sandbox doesn't support INR)
    const usdAmount = PayPalService.convertINRToUSD(plan.price);

    console.log(`Creating PayPal order: ${plan.price} INR -> ${usdAmount} USD for plan: ${plan.name}`);
    console.log('PayPal sandbox account should accept USD payments');

    // Additional validation for USD amount
    if (usdAmount < 0.50) {
      return NextResponse.json({
        success: false,
        error: "Amount too small for PayPal processing"
      }, { status: 400 });
    }

    // Create PayPal order with USD
    const order = await PayPalService.createOrder(
      usdAmount,
      'USD',
      `${plan.name} - Oceanova AI Platform`
    );

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to create PayPal order" 
      }, { status: 500 });
    }

    // Store order details in database for verification (only for logged-in users)
    if (userId && user) {
      const users = await getUserCollection();
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
                   paymentHistory: {
                     id: order.id,
                     amount: plan.price, // Store original INR amount
                     currency: 'INR',
                     status: 'pending',
                     date: new Date(),
                     plan: planId,
                     paymentMethod: 'paypal',
                     paypalAmount: usdAmount, // Store PayPal USD amount
                     paypalCurrency: 'USD'
                   }
          } as any
        }
      );
      console.log("Payment history stored for user:", userId);
    } else {
      console.log("Guest user - payment history not stored");
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.approvalUrl,
      amount: usdAmount,
      currency: 'USD',
      originalAmount: plan.price,
      originalCurrency: 'INR'
    });

  } catch (error: any) {
    console.error("PayPal order creation error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
