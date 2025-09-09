import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/userModel";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // Add connection timeout and retry logic
    let connectionAttempts = 0;
    const maxAttempts = 3;
    
    while (connectionAttempts < maxAttempts) {
      try {
        await connectDB();
        break; // Successfully connected
      } catch (connectionError: any) {
        connectionAttempts++;
        console.log(`Connection attempt ${connectionAttempts} failed:`, connectionError.message);
        
        if (connectionAttempts >= maxAttempts) {
          throw new Error("Failed to connect to database after multiple attempts");
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * connectionAttempts));
      }
    }

    // Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ success: false, error: "No authentication cookie found" }, { status: 401 });
    }

    const token = cookieHeader.split("auth_token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication token not found" }, { status: 401 });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    } catch (jwtError: any) {
      console.error("JWT verification failed:", jwtError.message);
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    // Find user in database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
    
  } catch (err: any) {
    console.error("Profile API Error:", err);
    
    // Handle specific MongoDB connection errors
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
      return NextResponse.json({ 
        success: false, 
        error: "Database connection failed. Please try again later." 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}