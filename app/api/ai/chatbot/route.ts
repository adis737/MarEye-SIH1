import { NextRequest, NextResponse } from "next/server"
import { generateGrokResponse } from "@/lib/grok-client"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check if Grok API key is available
    if (!process.env.GROK_API_KEY) {
      console.error("GROK_API_KEY not found in environment variables")
      return NextResponse.json(
        { error: "Grok API key not configured" },
        { status: 500 }
      )
    }

    console.log("GROK_API_KEY found, generating response...")

    // Generate response using Grok API
    const response = await generateGrokResponse(message, context || '')

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chatbot API error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    )
  }
}
