import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function generateGrokResponse(message: string, context: string = '') {
  try {
    // Check if API key is available
    if (!process.env.GROK_API_KEY) {
      throw new Error('GROK_API_KEY not found in environment variables');
    }

    // Set the GROQ_API_KEY for the groq client
    process.env.GROQ_API_KEY = process.env.GROK_API_KEY;

    const systemPrompt = `You are an AI assistant for the MarEye Marine Security Platform. This platform focuses on:

${context}

Key features of the platform include:
- AI-powered submarine detection using advanced machine learning
- Mine identification and classification systems
- Diver tracking and monitoring
- Threat assessment and risk evaluation
- Real-time surveillance and monitoring
- Advanced AI processing for marine security
- Environmental data analysis for security operations

You should help users with:
- Understanding how to use the platform features
- Explaining marine security concepts
- Providing information about underwater defense systems
- Guiding users through detection processes
- Answering questions about threat assessment
- Explaining AI/ML techniques used in marine security

IMPORTANT: When providing lists or multiple points, use proper bullet point formatting with "-" at the beginning of each line. This will ensure proper display in the chat interface.

Keep responses helpful, informative, and focused on the platform's capabilities. Be concise but thorough.

User message: ${message}`;

    const result = await generateText({
      model: groq('llama-3.1-70b-versatile'),
      prompt: systemPrompt,
      temperature: 0.7,
    });

    return result.text;
  } catch (error) {
    console.error('Grok API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate response: ${errorMessage}`);
  }
}
