import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

export async function POST(req: NextRequest) {
  try {
    console.log("Downgrade API called");
    const { planId } = await req.json();
    console.log("Plan ID received:", planId);

    if (!planId) {
      console.log("No plan ID provided");
      return NextResponse.json({
        success: false,
        error: "Plan ID is required"
      }, { status: 400 });
    }

    // Get user from JWT token
    const cookieHeader = req.headers.get("cookie");
    console.log("Cookie header:", cookieHeader);
    if (!cookieHeader) {
      console.log("No cookie header found");
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
    console.log("Auth token found:", token ? "Yes" : "No");
    if (!token) {
      console.log("No auth token found in cookies");
      return NextResponse.json({
        success: false,
        error: "Authentication token not found"
      }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    const decoded: any = jwt.verify(token, jwtSecret);
    console.log("JWT decoded:", decoded);

    if (!decoded || !decoded.id) {
      console.log("Invalid JWT token");
      return NextResponse.json({
        success: false,
        error: "Invalid authentication token"
      }, { status: 401 });
    }

    // Connect to database
    const db = await getDatabase();
    const users = db.collection("users");
    console.log("Updating user with ID:", decoded.id);

    // Get the plan configuration to get the correct daily token limit
    const planConfig = SUBSCRIPTION_PLANS[planId];
    const dailyTokenLimit = planConfig?.dailyTokens || 10;

    console.log("Plan config:", planConfig);
    console.log("Daily token limit for plan:", dailyTokenLimit);

    // Update user's subscription to basic plan
    const result = await users.updateOne(
      { _id: new ObjectId(decoded.id) },
      {
        $set: {
          subscription: {
            plan: planId,
            status: 'active',
            startDate: new Date(),
            endDate: null, // Basic plan has no end date
            autoRenew: false
          },
          // Update token limits and reset usage for the new plan
          tokens: {
            dailyLimit: dailyTokenLimit,
            usedToday: 0,
            lastResetDate: new Date(),
            totalUsed: 0 // Reset total usage as well
          }
        }
      }
    );

    console.log("Database update result:", result);
    if (result.matchedCount === 0) {
      console.log("No user found with ID:", decoded.id);
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 });
    }

    console.log("Successfully updated user subscription");
    return NextResponse.json({
      success: true,
      message: "Successfully switched to Basic plan",
      subscription: {
        plan: planId,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error("Error downgrading subscription:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
