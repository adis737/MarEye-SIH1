import { NextRequest, NextResponse } from "next/server";
import { PayPalService } from "@/lib/paypal-service";
import { TokenService } from "@/lib/token-service";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getUserCollection } from "@/dbCollections";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        error: "Order ID is required" 
      }, { status: 400 });
    }

    // Get user from token (optional - allow payments for non-logged-in users)
    const cookieHeader = req.headers.get("cookie");
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
      if (token) {
        try {
          const jwtSecret = process.env.JWT_SECRET || "supersecret";
          const decoded: any = jwt.verify(token, jwtSecret);
          
          if (decoded && decoded.id) {
            userId = decoded.id;
            const users = await getUserCollection();
            user = await users.findOne({ _id: new ObjectId(decoded.id) });
          }
        } catch (jwtError) {
          console.log("JWT verification failed, proceeding without authentication");
        }
      }
    }

    // For logged-in users, find the pending payment record
    let pendingPayment = null;
    if (user && user.paymentHistory) {
      pendingPayment = user.paymentHistory.find(
        (payment: any) => payment.id === orderId && payment.status === 'pending'
      );
      console.log("Found pending payment:", pendingPayment ? "Yes" : "No");
    }

    // For guest users, we'll still capture the payment but won't update user subscription
    console.log("Processing capture for:", userId ? "Logged-in user" : "Guest user");
    console.log("User ID:", userId);
    console.log("Pending payment found:", pendingPayment ? "Yes" : "No");

    // Capture the PayPal order
    const payment = await PayPalService.captureOrder(orderId);

    if (!payment || payment.status !== 'COMPLETED') {
      return NextResponse.json({ 
        success: false, 
        error: "Payment capture failed" 
      }, { status: 400 });
    }

    // Upgrade user subscription (only for logged-in users)
    let upgradeSuccess = true;
    if (userId && pendingPayment) {
      upgradeSuccess = await TokenService.upgradeSubscription(
        userId,
        pendingPayment.plan,
        payment.id
      );

      if (!upgradeSuccess) {
        return NextResponse.json({ 
          success: false, 
          error: "Failed to upgrade subscription" 
        }, { status: 500 });
      }
      console.log("Subscription upgraded for user:", userId);
    } else {
      console.log("Guest user - subscription not upgraded");
    }

    // Update payment status (only for logged-in users)
    if (userId && user) {
      const users = await getUserCollection();
      await users.updateOne(
        { 
          _id: new ObjectId(userId),
        'paymentHistory.id': orderId
      },
      {
        $set: {
          'paymentHistory.$.status': 'completed',
          'paymentHistory.$.paymentId': payment.id,
          'paymentHistory.$.payerEmail': payment.payerEmail
        }
      }
    );
    }

    return NextResponse.json({ 
      success: true, 
      message: userId && pendingPayment ? "Payment captured and subscription upgraded successfully" : "Payment captured successfully",
      paymentId: payment.id,
      orderId: orderId,
      planId: pendingPayment?.plan || 'unknown',
      subscriptionUpgraded: userId && pendingPayment ? true : false
    });

  } catch (error: any) {
    console.error("PayPal payment capture error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
