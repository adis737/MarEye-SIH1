import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { waterQualityData, location } = await request.json()

    if (!waterQualityData || !location) {
      return NextResponse.json({ error: "Water quality data and location are required" }, { status: 400 })
    }

    console.log("[v0] Starting water quality analysis...")

    // Analyze water quality with Gemini AI
    const result = await GeminiAIService.analyzeWaterQuality(waterQualityData, location)

    console.log("[v0] Water quality analysis completed, quality:", result.overallQuality)

    // Store analysis result in database
    const db = await getDatabase()
    const analysisRecord = {
      analysisType: "water_quality_analysis",
      inputData: {
        type: "environmental_data",
        data: JSON.stringify({ waterQualityData, location }),
      },
      results: {
        primary: result.overallQuality,
        confidence: result.qualityIndex,
        alternatives: result.primaryContaminants,
        explanation: `Water quality: ${result.overallQuality} (${result.qualityIndex}/100). Contamination: ${result.contaminationLevel}`,
      },
      modelUsed: "gemini-2.0-flash",
      processingTime: Date.now(),
      createdAt: new Date(),
    }

    await db.collection("aiAnalyses").insertOne(analysisRecord)

    // Update water quality data in database with AI insights
    const waterQualityRecord = {
      location,
      measurements: waterQualityData,
      qualityIndex: result.qualityIndex,
      contaminationLevel: result.contaminationLevel,
      aiAnalysis: {
        overallAssessment: result.overallQuality,
        primaryContaminants: result.primaryContaminants,
        recommendations: result.recommendations,
      },
      samplingDate: new Date(),
      samplingMethod: "AI Analysis",
      researchTeam: "AI Water Quality Assessment",
      createdAt: new Date(),
    }

    await db.collection("waterQualityData").insertOne(waterQualityRecord)

    return NextResponse.json({
      success: true,
      result,
      analysisId: (analysisRecord as any)._id,
    })
  } catch (error) {
    console.error("[v0] Water quality analysis API error:", error)
    return NextResponse.json({ error: "Failed to analyze water quality" }, { status: 500 })
  }
}
