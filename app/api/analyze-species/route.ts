import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
  try {
    const { fileBase64, fileName, fileType, inputValue } = await req.json()

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Gemini API key not configured" 
      }, { status: 500 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = ""
    let imageData = null

    if (fileBase64 && fileName) {
      // Handle file upload
      const mimeType = fileType || "image/jpeg"
      imageData = {
        inlineData: {
          data: fileBase64.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: mimeType
        }
      }

      if (mimeType.startsWith('image/')) {
        prompt = `Analyze this deep-sea marine image and provide detailed species identification. Please respond with a JSON object containing:
        {
          "speciesName": "Scientific name of the species",
          "commonName": "Common name if available",
          "family": "Taxonomic family",
          "populationEstimate": "Approximate population remaining on Earth (e.g., 'Unknown', 'Rare (1,000-10,000)', 'Common (100,000+)')",
          "region": "Primary geographic region where found (e.g., 'Pacific Ocean', 'Atlantic Ocean', 'Deep sea trenches')",
          "confidence": "Confidence percentage (0-100)",
          "description": "Brief description of the species",
          "conservationStatus": "Conservation status if known",
          "habitat": "Specific habitat type",
          "depth": "Typical depth range if visible"
        }
        
        Focus on marine biodiversity, deep-sea species, and provide accurate scientific information.`
      } else if (mimeType === 'text/plain' || fileName.includes('.fasta') || fileName.includes('.fa')) {
        // Handle DNA/FASTA files
        const fileContent = Buffer.from(fileBase64.split(',')[1], 'base64').toString('utf-8')
        prompt = `Analyze this DNA sequence data (FASTA format) and identify the marine species. Please respond with a JSON object containing:
        {
          "speciesName": "Scientific name of the species",
          "commonName": "Common name if available", 
          "family": "Taxonomic family",
          "populationEstimate": "Approximate population remaining on Earth",
          "region": "Primary geographic region where found",
          "confidence": "Confidence percentage (0-100)",
          "description": "Brief description of the species",
          "conservationStatus": "Conservation status if known",
          "sequenceLength": "Length of the DNA sequence",
          "geneticMarkers": "Key genetic markers identified"
        }
        
        DNA Sequence Data:
        ${fileContent.substring(0, 1000)}...
        
        Focus on marine species identification from genetic data.`
      } else {
        // Handle other file types
        prompt = `Analyze this marine data file and identify any species information. Please respond with a JSON object containing:
        {
          "speciesName": "Scientific name of the species",
          "commonName": "Common name if available",
          "family": "Taxonomic family", 
          "populationEstimate": "Approximate population remaining on Earth",
          "region": "Primary geographic region where found",
          "confidence": "Confidence percentage (0-100)",
          "description": "Brief description of the species",
          "conservationStatus": "Conservation status if known",
          "dataType": "Type of data analyzed"
        }
        
        Focus on marine biodiversity and species identification.`
      }
    } else if (inputValue) {
      // Handle URL or data ID input
      prompt = `Based on the provided URL or data ID: "${inputValue}", analyze for marine species identification. Please respond with a JSON object containing:
      {
        "speciesName": "Scientific name of the species",
        "commonName": "Common name if available",
        "family": "Taxonomic family",
        "populationEstimate": "Approximate population remaining on Earth", 
        "region": "Primary geographic region where found",
        "confidence": "Confidence percentage (0-100)",
        "description": "Brief description of the species",
        "conservationStatus": "Conservation status if known",
        "source": "Data source type"
      }
      
      Focus on marine biodiversity and deep-sea species identification.`
    } else {
      return NextResponse.json({ 
        error: "No file or input provided" 
      }, { status: 400 })
    }

    // Generate content with Gemini
    const result = await model.generateContent([
      prompt,
      ...(imageData ? [imageData] : [])
    ])

    const response = await result.response
    const text = response.text()

    // Try to parse JSON response
    let analysisResult
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      // Fallback: create a structured response from the text
      analysisResult = {
        speciesName: "Unknown Species",
        commonName: "Unknown",
        family: "Unknown",
        populationEstimate: "Unknown",
        region: "Unknown",
        confidence: 50,
        description: text.substring(0, 200) + "...",
        conservationStatus: "Unknown",
        error: "Could not parse structured response"
      }
    }

    // Ensure required fields exist
    const finalResult = {
      speciesName: analysisResult.speciesName || "Unknown Species",
      commonName: analysisResult.commonName || "Unknown",
      family: analysisResult.family || "Unknown",
      populationEstimate: analysisResult.populationEstimate || "Unknown",
      region: analysisResult.region || "Unknown",
      confidence: Math.min(100, Math.max(0, analysisResult.confidence || 50)),
      description: analysisResult.description || "No description available",
      conservationStatus: analysisResult.conservationStatus || "Unknown",
      timestamp: new Date().toISOString(),
      ...analysisResult
    }

    return NextResponse.json({ 
      success: true,
      data: finalResult
    })

  } catch (error) {
    console.error("Error analyzing species:", error)
    return NextResponse.json({ 
      error: "Failed to analyze species",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
