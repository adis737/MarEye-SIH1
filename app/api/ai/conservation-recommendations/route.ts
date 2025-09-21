import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"
import { TokenService } from "@/lib/token-service"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { speciesData, threatData, resourceConstraints } = await request.json()

    if (!speciesData || !threatData) {
      return NextResponse.json({ error: "Species data and threat assessment are required" }, { status: 400 })
    }

    // Check token availability for authenticated users
    const cookieHeader = request.headers.get("cookie");
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
            // Check token availability
            const tokenCheck = await TokenService.checkTokenAvailability(decoded.id);
            if (!tokenCheck.success) {
              return NextResponse.json({ 
                error: "Daily token limit reached. Please upgrade your plan to continue.",
                tokenLimitReached: true,
                tokensRemaining: tokenCheck.tokensRemaining
              }, { status: 429 });
            }

            // Consume token
            const tokenResult = await TokenService.consumeToken(decoded.id, "conservation_recommendations");
            if (!tokenResult.success) {
              return NextResponse.json({ 
                error: "Failed to process request. Please try again.",
                tokenLimitReached: true,
                tokensRemaining: tokenResult.tokensRemaining
              }, { status: 429 });
            }
          }
        } catch (jwtError) {
          // Continue without token check for invalid tokens
          console.log("JWT verification failed, proceeding without token check");
        }
      }
    }

    console.log("[v0] Generating conservation recommendations...")

    // Generate recommendations with Gemini AI
    const result = await GeminiAIService.generateConservationRecommendations(
      speciesData,
      threatData,
      resourceConstraints,
    )

    console.log("[v0] Conservation recommendations generated, priority:", result.priority)

    // Store analysis result in database
    const db = await getDatabase()
    const analysisRecord = {
      analysisType: "conservation_recommendation",
      inputData: {
        type: "threat_and_species_data",
        data: JSON.stringify({ speciesData, threatData }),
      },
      results: {
        primary: result.priority,
        confidence: result.priority === "urgent" ? 95 : result.priority === "high" ? 85 : 70,
        alternatives: result.actions,
        explanation: `Conservation priority: ${result.priority}. Actions: ${result.actions.join(", ")}`,
      },
      modelUsed: "gemini-2.0-flash",
      processingTime: Date.now(),
      createdAt: new Date(),
    }

    await db.collection("aiAnalyses").insertOne(analysisRecord)

    return NextResponse.json({
      success: true,
      result,
      analysisId: (analysisRecord as any)._id,
    })
  } catch (error) {
    console.error("[v0] Conservation recommendations API error:", error)
    return NextResponse.json({ error: "Failed to generate conservation recommendations" }, { status: 500 })
  }
}
