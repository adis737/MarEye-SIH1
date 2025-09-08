import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { locationData, environmentalData, humanActivityData } = await request.json()

    if (!locationData || !environmentalData) {
      return NextResponse.json({ error: "Location and environmental data are required" }, { status: 400 })
    }

    console.log("[v0] Starting threat assessment analysis...")

    // Analyze threats with Gemini AI
    const result = await GeminiAIService.assessEnvironmentalThreats(locationData, environmentalData, humanActivityData)

    console.log("[v0] Threat assessment completed, level:", result.threatLevel)

    // Store analysis result in database
    const db = await getDatabase()
    const analysisRecord = {
      analysisType: "threat_assessment",
      inputData: {
        type: "environmental_data",
        data: JSON.stringify({ locationData, environmentalData }),
      },
      results: {
        primary: result.threatLevel,
        confidence: result.urgency * 10, // Convert urgency to confidence percentage
        alternatives: result.primaryThreats,
        explanation: `Primary threats: ${result.primaryThreats.join(", ")}`,
      },
      modelUsed: "gemini-2.0-flash",
      processingTime: Date.now(),
      createdAt: new Date(),
    }

    await db.collection("aiAnalyses").insertOne(analysisRecord)

    // Create conservation alert if threat level is high or critical
    if (result.threatLevel === "high" || result.threatLevel === "critical") {
      const alert = {
        alertType: "habitat_degradation",
        severity: result.threatLevel === "critical" ? "critical" : "high",
        title: `Environmental Threat Detected in ${locationData.region}`,
        description: `AI analysis detected ${result.threatLevel} level threats: ${result.primaryThreats.join(", ")}`,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          region: locationData.region,
        },
        affectedSpecies: result.affectedSpecies,
        threatFactors: result.humanImpactFactors,
        recommendedActions: result.recommendations,
        status: "active",
        reportedBy: "AI Threat Assessment System",
        reportedDate: new Date(),
        lastUpdated: new Date(),
      }

      await db.collection("conservationAlerts").insertOne(alert)
    }

    return NextResponse.json({
      success: true,
      result,
      analysisId: analysisRecord._id,
    })
  } catch (error) {
    console.error("[v0] Threat assessment API error:", error)
    return NextResponse.json({ error: "Failed to assess environmental threats" }, { status: 500 })
  }
}
