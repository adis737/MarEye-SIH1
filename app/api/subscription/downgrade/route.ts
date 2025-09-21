import { NextRequest, NextResponse } from "next/server";
import { getUserCollection } from "@/dbCollections";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    console.log("Downgrade API called");
    
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
        error: "Authentication required" 
      }, { status: 401 });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    const decoded: any = jwt.verify(token, jwtSecret);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid token" 
      }, { status: 401 });
    }

    const { planId } = await req.json();
    console.log("Downgrading user", decoded.id, "to plan:", planId);

    // Validate plan
    if (planId !== 'basic') {
      return NextResponse.json({ 
        success: false, 
        error: "Only downgrade to basic plan is supported" 
      }, { status: 400 });
    }

    // Update user subscription
    const users = await getUserCollection();
    const result = await users.updateOne(
      { _id: new ObjectId(decoded.id) },
      {
        $set: {
          "subscription.plan": 'basic',
          "subscription.status": 'active',
          "subscription.startDate": new Date(),
          "subscription.endDate": null, // Basic plan has no end date
          "tokens.dailyLimit": 10, // Basic plan has 10 tokens per day
          "tokens.usedToday": 0, // Reset daily usage
          "tokens.remaining": 10, // Reset remaining tokens
          "tokens.lastResetDate": new Date(),
          "tokens.totalUsed": 0, // Reset total usage
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    console.log("Successfully downgraded user to basic plan");

    return NextResponse.json({
      success: true,
      message: "Successfully switched to Basic plan",
      plan: 'basic'
    });

  } catch (error: any) {
    console.error("Downgrade error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
