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

    // Find the pending payment record
    const pendingPayment = user.paymentHistory?.find(
      (payment: any) => payment.id === orderId && payment.status === 'pending'
    );

    if (!pendingPayment) {
      return NextResponse.json({
        success: false, 
        error: "Payment record not found or already processed" 
      }, { status: 404 });
    }

    // Capture the PayPal order
    const payment = await PayPalService.captureOrder(orderId);

    if (!payment || payment.status !== 'COMPLETED') {
      return NextResponse.json({ 
        success: false, 
        error: "Payment capture failed" 
      }, { status: 400 });
    }

    // Upgrade user subscription
    const upgradeSuccess = await TokenService.upgradeSubscription(
      decoded.id,
      pendingPayment.plan,
      payment.id
    );

    if (!upgradeSuccess) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to upgrade subscription" 
      }, { status: 500 });
    }

    // Update payment status
    await users.updateOne(
      { 
        _id: new ObjectId(decoded.id),
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

    return NextResponse.json({ 
      success: true, 
      message: "Payment captured and subscription upgraded successfully",
      paymentId: payment.id,
      orderId: orderId,
      planId: pendingPayment.plan
    });

  } catch (error: any) {
    console.error("PayPal payment capture error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
