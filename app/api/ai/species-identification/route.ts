import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { imageData, additionalContext } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    console.log("[v0] Starting species identification analysis...")

    // Analyze image with Gemini AI
    const result = await GeminiAIService.identifySpeciesFromImage(imageData, additionalContext)

    console.log("[v0] Species identification completed:", result.species)

    // Store analysis result in database
    const db = await getDatabase()
    const analysisRecord = {
      analysisType: "species_identification",
      inputData: {
        type: "image",
        data: imageData.substring(0, 100) + "...", // Store truncated for privacy
      },
      results: {
        primary: result.species,
        confidence: result.confidence,
        alternatives: [],
        explanation: result.description,
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
    console.error("[v0] Species identification API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Species identification failed",
      },
      { status: 500 },
    )
  }
}
