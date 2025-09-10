import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromAuthHeader } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { sequence, sequenceType, locationContext, sequenceId, watchlist } = await request.json()

    if (!sequence || !sequenceType) {
      return NextResponse.json({ error: "DNA sequence and sequence type are required" }, { status: 400 })
    }

    console.log("[v0] Starting gene sequence analysis...")

    // Analyze gene sequence with Gemini AI
    const result = await GeminiAIService.analyzeGeneSequence(sequence, sequenceType, locationContext)

    console.log("[v0] Gene sequence analysis completed:", result.species)

    // Resolve user from auth header if present
    const authUser = getUserFromAuthHeader(request.headers.get("authorization"))

    // Store analysis result in database
    const db = await getDatabase()

    // Store in AI analyses collection
    const analysisRecord = {
      analysisType: "gene_sequence_analysis",
      inputData: {
        type: "gene_sequence",
        data: sequence.substring(0, 100) + "...", // Store truncated sequence
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
      userId: authUser?.id || null,
    }

    const analysisResult = await db.collection("aiAnalyses").insertOne(analysisRecord)

    // Store/update in gene sequences collection
    const geneSequenceRecord = {
      sequenceId: sequenceId || `seq_${Date.now()}`,
      dnaSequence: sequence,
      sequenceType,
      species: {
        predicted: result.species,
        confidence: result.confidence,
        alternativeMatches: [],
      },
      location: locationContext || null,
      samplingDate: new Date(),
      analysisStatus: "completed",
      analysisResults: {
        speciesIdentification: result.species,
        confidence: result.confidence,
        phylogeneticPosition: result.classification.phylum || "",
        noveltyScore: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: authUser?.id || null,
    }

    await db.collection("geneSequences").insertOne(geneSequenceRecord)

    // Optionally add to watchlist
    if (watchlist === true) {
      try {
        await db.collection("watchlist").insertOne({
          userId: authUser?.id || null,
          itemType: "gene_sequence",
          referenceId: geneSequenceRecord.sequenceId,
          title: result.species,
          summary: result.description?.slice(0, 140) || null,
          dataPreview: (sequence as string)?.slice(0, 100) + "...",
          score: result.confidence,
          createdAt: new Date(),
        })
      } catch (err) {
        console.warn("Failed to add gene sequence to watchlist", err)
      }
    }

    const enhancedResult = {
      ...result,
      analysisId: analysisResult.insertedId?.toString(),
      sequenceId: geneSequenceRecord.sequenceId,
      noveltyScore: 0,
      phylogeneticPosition: result.classification.phylum || "",
      alternativeMatches: [],
    }

    return NextResponse.json({
      success: true,
      ...enhancedResult,
    })
  } catch (error) {
    console.error("[v0] Gene sequence analysis API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gene sequence analysis failed",
      },
      { status: 500 },
    )
  }
}
