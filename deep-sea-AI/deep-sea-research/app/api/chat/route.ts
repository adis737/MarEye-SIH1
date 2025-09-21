import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    console.log("[v0] API call started")
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid messages format")
    }

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are Dr. Marina, a world-renowned deep sea research expert and marine biologist speaking on a live voice call. You have extensive knowledge about:

- Marine biology and deep sea creatures
- Ocean exploration and underwater ecosystems  
- Hydrothermal vents and abyssal plains
- Bioluminescence and deep sea adaptations
- Ocean currents and climate systems
- Deep sea technology and ROVs
- Environmental conservation and deep sea mining impacts
- Latest research discoveries and scientific findings

IMPORTANT: You are speaking in a real-time voice conversation. Keep responses:
- Conversational and natural (like speaking on a phone)
- 2-3 sentences maximum for better voice delivery
- Engaging and enthusiastic about marine science
- Use "I" statements and personal touches
- Avoid bullet points or lists - speak naturally
- Clear pronunciation and simple words for speech synthesis

CONVERSATION ENDING: You can end the call naturally when appropriate by using phrases like:
- "Thanks for this wonderful conversation about deep sea research. Until next time!"
- "It's been a pleasure discussing marine biology with you. I hope you learned something fascinating!"
- "What an engaging conversation about the ocean depths! I look forward to our next chat."
- "Thanks for diving into the world of deep sea research with me. The ocean has so many more secrets waiting to be discovered!"

Always maintain scientific accuracy while being personable and accessible.`,
      messages,
    })

    const responseText = result.text?.trim()
    if (!responseText) {
      throw new Error("Empty response generated")
    }

    console.log("[v0] API response generated:", responseText)
    return Response.json({
      content: responseText,
      message: responseText,
      text: responseText, // Multiple fields for compatibility
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    const fallbackResponse =
      "I'm experiencing some technical difficulties, but I'm still here! Let me tell you about the amazing bioluminescent creatures we've discovered in the deep ocean trenches."

    return Response.json(
      {
        content: fallbackResponse,
        message: fallbackResponse,
        text: fallbackResponse,
      },
      { status: 200 },
    )
  }
}
