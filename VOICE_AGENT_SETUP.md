# Voice Agent Integration Setup

## Overview
The Deep-sea-AI voice agent has been successfully integrated into the main project. This provides real-time voice conversations with Dr. Marina, an AI marine biologist.

## Features
- Real-time voice conversation with AI marine biologist
- Speech recognition and synthesis
- Natural conversation flow with interruption handling
- Automatic call timeout (5 minutes)
- Mute/unmute functionality
- Recording capability
- Deep sea research expertise

## Setup Requirements

### 1. Environment Variables
Add the following environment variable to your `.env.local` file:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Dependencies
The following dependencies have been added to `package.json`:
- `@ai-sdk/groq`: For Groq AI integration
- `ai`: AI SDK for text generation

### 3. Installation
Run the following command to install the new dependencies:

```bash
npm install
```

## Usage

### Access the Voice Agent
1. Navigate to `/voice-agent` in your application
2. Click the "Call AI Scientist" button to start a conversation
3. Speak naturally - the AI will respond with voice
4. Use the mute/unmute and recording controls as needed

### API Endpoint
The voice agent uses the `/api/ai/voice-agent` endpoint which:
- Accepts POST requests with messages array
- Uses Groq's Llama 3.3 70B model
- Returns AI responses optimized for voice synthesis

## Components

### VoiceAgent Component (`components/voice-agent.tsx`)
- Handles speech recognition and synthesis
- Manages conversation flow and interruptions
- Provides real-time status indicators
- Includes call duration tracking

### Voice Agent Page (`app/voice-agent/page.tsx`)
- Main interface for voice conversations
- Call controls and status indicators
- Research highlights when not in call

### API Route (`app/api/ai/voice-agent/route.ts`)
- Processes voice conversation requests
- Uses Groq AI for natural responses
- Optimized for marine biology expertise

## Navigation Integration
The voice agent has been added to the main navigation:
- Desktop: "Voice AI" menu item with 🎙️ icon
- Mobile: Included in main navigation items

## Technical Details

### Speech Recognition
- Uses Web Speech API
- Continuous listening with interruption handling
- Automatic restart on errors
- 12-second silence timeout for AI responses

### Speech Synthesis
- Uses Web Speech Synthesis API
- Voice selection with fallbacks
- Rate and pitch optimization for natural speech
- Interruption handling for user input

### AI Integration
- Groq Llama 3.3 70B model
- Specialized marine biology prompts
- Conversational tone optimization
- Natural call ending detection

## Troubleshooting

### Common Issues
1. **Speech recognition not working**: Ensure microphone permissions are granted
2. **No voice output**: Check browser compatibility with Speech Synthesis API
3. **API errors**: Verify GROQ_API_KEY is set correctly

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Good support
- Safari: Limited support for speech recognition
- Mobile browsers: Varies by platform

## Future Enhancements
- Multi-language support
- Voice customization options
- Conversation history
- Integration with other AI services
- Advanced marine biology knowledge base


