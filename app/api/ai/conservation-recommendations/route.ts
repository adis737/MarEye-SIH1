import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { speciesData, threatData, resourceConstraints } = await request.json()

    if (!speciesData || !threatData) {
      return NextResponse.json({ error: "Species data and threat assessment are required" }, { status: 400 })
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
      analysisId: analysisRecord._id,
    })
  } catch (error) {
    console.error("[v0] Conservation recommendations API error:", error)
    return NextResponse.json({ error: "Failed to generate conservation recommendations" }, { status: 500 })
  }
}
