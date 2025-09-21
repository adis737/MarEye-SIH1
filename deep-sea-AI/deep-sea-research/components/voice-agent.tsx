"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

interface VoiceAgentProps {
  isCallActive: boolean
  isMuted: boolean
  isRecording: boolean
  onEndCall: () => void
}

export function VoiceAgent({ isCallActive, isMuted, isRecording, onEndCall }: VoiceAgentProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [callDuration, setCallDuration] = useState(0)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const isRecognitionRunning = useRef(false)
  const shouldRestart = useRef(true)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCurrentlySpeaking = useRef(false)
  const interruptionCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const lastInterruptionCheck = useRef<number>(Date.now())

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const synthesis = window.speechSynthesis
      synthesisRef.current = synthesis

      const loadVoices = () => {
        const voices = synthesis.getVoices()
        if (voices.length > 0) {
          setVoicesLoaded(true)
          console.log("[v0] Voices loaded:", voices.length, "voices available")
        }
      }

      loadVoices()
      if (synthesis.onvoiceschanged !== undefined) {
        synthesis.onvoiceschanged = loadVoices
      }
      setTimeout(loadVoices, 100)
    }

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
      shouldRestart.current = false
      isCurrentlySpeaking.current = false
    }
  }, [])

  // Clear timeouts helper
  const clearAllTimeouts = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    if (callEndTimeoutRef.current) {
      clearTimeout(callEndTimeoutRef.current)
      callEndTimeoutRef.current = null
    }
    if (interruptionCheckInterval.current) {
      clearInterval(interruptionCheckInterval.current)
      interruptionCheckInterval.current = null
    }
  }, [])

  // Enhanced interruption system with monitoring
  const forceInterruptAI = useCallback(() => {
    console.log("[v0] Force interrupting AI speech")
    if (synthesisRef.current && isCurrentlySpeaking.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
      isCurrentlySpeaking.current = false
      console.log("[v0] AI speech force interrupted")
    }
  }, [])

  // Start recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isRecognitionRunning.current || isMuted || isSpeaking || isProcessing || isCurrentlySpeaking.current) {
      return
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.log("[v0] Recognition start failed:", error)
      restartTimeoutRef.current = setTimeout(() => {
        if (shouldRestart.current && !isRecognitionRunning.current && !isSpeaking && !isProcessing && !isCurrentlySpeaking.current) {
          startRecognition()
        }
      }, 3000)
    }
  }, [isMuted, isSpeaking, isProcessing])

  // Start interruption monitoring
  const startInterruptionMonitoring = useCallback(() => {
    if (interruptionCheckInterval.current) {
      clearInterval(interruptionCheckInterval.current)
    }
    
    interruptionCheckInterval.current = setInterval(() => {
      // Check if speech recognition is still running
      if (isCallActive && !isRecognitionRunning.current && !isMuted && !isSpeaking && !isProcessing) {
        console.log("[v0] Speech recognition stopped unexpectedly - restarting")
        startRecognition()
      }
      
      // Check if AI is speaking but recognition is not running (interruption system failed)
      if (isCallActive && isCurrentlySpeaking.current && !isRecognitionRunning.current) {
        console.log("[v0] AI speaking but recognition not running - potential interruption failure")
        // Force restart recognition to ensure interruption capability
        setTimeout(() => {
          if (isCallActive && !isRecognitionRunning.current) {
            startRecognition()
          }
        }, 1000)
      }
      
      lastInterruptionCheck.current = Date.now()
    }, 2000) // Check every 2 seconds
  }, [isCallActive, isMuted, isSpeaking, isProcessing, startRecognition])

  // Stop interruption monitoring
  const stopInterruptionMonitoring = useCallback(() => {
    if (interruptionCheckInterval.current) {
      clearInterval(interruptionCheckInterval.current)
      interruptionCheckInterval.current = null
    }
  }, [])

  // Start silence timeout
  const startSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
    
    if (!isSpeaking && !isProcessing && !isCurrentlySpeaking.current) {
      silenceTimeoutRef.current = setTimeout(() => {
        console.log("[v0] 12-second silence timeout - AI will speak")
        const timeoutPrompts = [
          "I'm here and ready to discuss deep sea research. What would you like to explore?",
          "Let me tell you about a fascinating deep sea discovery - bioluminescent creatures create their own light through chemical reactions.",
          "Did you know that the deepest part of the ocean, the Mariana Trench, is deeper than Mount Everest is tall?",
          "The deep sea is home to creatures that survive in complete darkness and crushing pressure. What interests you most?",
          "Hydrothermal vents on the ocean floor support entire ecosystems without sunlight. Would you like to know more?",
        ]
        const randomPrompt = timeoutPrompts[Math.floor(Math.random() * timeoutPrompts.length)]
        handleAIResponse(randomPrompt)
      }, 12000)
    }
  }, [isSpeaking, isProcessing])

  // Handle AI response
  const handleAIResponse = useCallback(async (text: string) => {
    if (!synthesisRef.current || isMuted || !text.trim() || !isCallActive) {
      setIsProcessing(false)
      return
    }

    console.log("[v0] Speaking AI response:", text)
    
    // Check for call ending phrases
    const endingPhrases = [
      "goodbye", "bye", "farewell", "see you later", "talk to you later",
      "have a great day", "thanks for calling", "end of call", "call ended",
      "that's all for now", "until next time", "take care", "catch you later",
      "thanks for the conversation", "nice talking with you", "end call",
      "call is over", "conversation is over", "we're done here",
      "end the call", "hang up", "disconnect", "finish the call", "close the call",
      "stop the call", "terminate the call", "end this call", "call is finished",
      "we should end", "let's end this", "time to go", "gotta go", "have to go"
    ]
    
    const lowerText = text.toLowerCase()
    if (endingPhrases.some(phrase => lowerText.includes(phrase))) {
      console.log("[v0] AI detected call ending phrase")
      const farewellMessages = [
        "Thank you for this wonderful conversation about deep sea research. Until next time, keep exploring the mysteries of the ocean!",
        "It's been a pleasure discussing marine biology with you. I hope you learned something fascinating about our deep sea world!",
        "What an engaging conversation about the ocean depths! I look forward to our next chat about marine science.",
        "Thanks for diving into the world of deep sea research with me. The ocean has so many more secrets waiting to be discovered!",
        "I've really enjoyed our conversation about the deep sea. Keep your curiosity about marine life alive!"
      ]
      
      const randomFarewell = farewellMessages[Math.floor(Math.random() * farewellMessages.length)]
      
      if (synthesisRef.current && !isMuted) {
        const utterance = new SpeechSynthesisUtterance(randomFarewell)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        utterance.onend = () => {
          setTimeout(() => onEndCall(), 1000)
        }
        
        utterance.onerror = () => {
          onEndCall()
        }
        
        synthesisRef.current.speak(utterance)
      } else {
        onEndCall()
      }
      return
    }
    
    setIsSpeaking(true)
    stopRecognition()

    if (isCurrentlySpeaking.current) {
      console.log("[v0] AI is already speaking, queuing new response")
      return
    }

    try {
      synthesisRef.current.cancel()
    } catch (error) {
      console.log("[v0] Speech cancellation completed")
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      console.log("[v0] AI started speaking")
      setIsSpeaking(true)
      isCurrentlySpeaking.current = true
    }

    utterance.onend = () => {
      console.log("[v0] AI finished speaking")
      setIsSpeaking(false)
      isCurrentlySpeaking.current = false

      if (isCallActive && !isMuted) {
        shouldRestart.current = true
        restartTimeoutRef.current = setTimeout(() => {
          if (!isRecognitionRunning.current && shouldRestart.current && !isCurrentlySpeaking.current && !isProcessing) {
            startRecognition()
          }
        }, 2000)
      }
    }

    utterance.onerror = (event) => {
      if (event.error !== "interrupted") {
        console.error("[v0] Speech synthesis error:", event.error)
      }
      setIsSpeaking(false)
      isCurrentlySpeaking.current = false

      if (isCallActive && !isMuted && event.error !== "interrupted") {
        shouldRestart.current = true
        restartTimeoutRef.current = setTimeout(() => {
          if (!isRecognitionRunning.current && shouldRestart.current && !isCurrentlySpeaking.current) {
            startRecognition()
          }
        }, 2000)
      }
    }

    const voices = synthesisRef.current.getVoices()
    const preferredVoice =
      voices.find((voice) => voice.name.includes("Samantha") && voice.lang.startsWith("en")) ||
      voices.find((voice) => voice.name.includes("Karen") && voice.lang.startsWith("en")) ||
      voices.find((voice) => voice.name.includes("Neural") && voice.lang.startsWith("en")) ||
      voices.find((voice) => voice.lang.startsWith("en") && voice.localService) ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      voices[0]

    if (preferredVoice) {
      utterance.voice = preferredVoice
      console.log("[v0] Using voice:", preferredVoice.name)
    }

    setTimeout(() => {
      if (!isCallActive) {
        console.log("[v0] Call ended, cancelling speech")
        setIsSpeaking(false)
        isCurrentlySpeaking.current = false
        return
      }
      
      try {
        synthesisRef.current?.speak(utterance)
      } catch (error) {
        console.error("[v0] Failed to speak:", error)
        setIsSpeaking(false)
      }
    }, 100)
  }, [isMuted, isCallActive])

  // Stop recognition
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isRecognitionRunning.current) {
      shouldRestart.current = false
      recognitionRef.current.stop()
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  // Handle user speech
  const handleUserSpeech = async (transcript: string) => {
    if (!transcript.trim() || !isCallActive) return

    console.log("[v0] Processing user message:", transcript)
    
    // Check if user wants to end the call
    const endingPhrases = [
      "goodbye", "bye", "farewell", "see you later", "talk to you later",
      "have a great day", "thanks for calling", "end of call", "call ended",
      "that's all for now", "until next time", "take care", "catch you later",
      "thanks for the conversation", "nice talking with you", "end call",
      "call is over", "conversation is over", "we're done here",
      "end the call", "hang up", "disconnect", "finish the call", "close the call",
      "stop the call", "terminate the call", "end this call", "call is finished",
      "we should end", "let's end this", "time to go", "gotta go", "have to go"
    ]
    
    const lowerTranscript = transcript.toLowerCase()
    if (endingPhrases.some(phrase => lowerTranscript.includes(phrase))) {
      console.log("[v0] User requested to end the call")
      const farewellMessages = [
        "Thank you for this wonderful conversation about deep sea research. Until next time, keep exploring the mysteries of the ocean!",
        "It's been a pleasure discussing marine biology with you. I hope you learned something fascinating about our deep sea world!",
        "What an engaging conversation about the ocean depths! I look forward to our next chat about marine science.",
        "Thanks for diving into the world of deep sea research with me. The ocean has so many more secrets waiting to be discovered!",
        "I've really enjoyed our conversation about the deep sea. Keep your curiosity about marine life alive!"
      ]
      
      const randomFarewell = farewellMessages[Math.floor(Math.random() * farewellMessages.length)]
      
      if (synthesisRef.current && !isMuted) {
        const utterance = new SpeechSynthesisUtterance(randomFarewell)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        utterance.onend = () => {
          setTimeout(() => onEndCall(), 1000)
        }
        
        utterance.onerror = () => {
          onEndCall()
        }
        
        synthesisRef.current.speak(utterance)
      } else {
        onEndCall()
      }
      return
    }
    
    setCurrentTranscript("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are Dr. Marina, an expert marine biologist and deep sea researcher. Respond naturally in a conversational tone as if you're speaking on a phone call. Keep responses concise but informative, around 2-3 sentences. Focus on deep sea research, marine biology, and ocean exploration.",
            },
            {
              role: "user",
              content: transcript,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.content || data.message || data.text || ""

      if (!aiResponse.trim()) {
        throw new Error("Empty response from API")
      }

      console.log("[v0] AI response received:", aiResponse)
      handleAIResponse(aiResponse)
    } catch (error) {
      console.error("[v0] Error getting AI response:", error)
      const fallbackResponses = [
        "I'm experiencing some technical difficulties, but let me tell you about the amazing creatures living in ocean trenches!",
        "There seems to be a connection issue, but I'm still here! Did you know that deep sea creatures create their own light?",
        "I'm having trouble with my systems right now, but I can still share fascinating facts about hydrothermal vents!",
      ]
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      handleAIResponse(randomFallback)
    } finally {
      setIsProcessing(false)
    }
  }

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined" || !isCallActive) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("[v0] Speech recognition not supported")
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log("[v0] Speech recognition started")
      setIsListening(true)
      isRecognitionRunning.current = true
      startSilenceTimeout()
    }

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      // If user is speaking (any transcript detected), immediately stop AI speech
      if (finalTranscript || interimTranscript) {
        console.log("[v0] User started speaking - interrupting AI")
        
        // Enhanced interruption with multiple fallbacks
        forceInterruptAI()
        
        // Additional safety check
        if (synthesisRef.current && isCurrentlySpeaking.current) {
          synthesisRef.current.cancel()
          setIsSpeaking(false)
          isCurrentlySpeaking.current = false
          console.log("[v0] AI speech interrupted by user (fallback)")
        }
        
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
          silenceTimeoutRef.current = null
        }
        setCurrentTranscript(interimTranscript || finalTranscript)
        
        // Update last interruption check time
        lastInterruptionCheck.current = Date.now()
      }

      if (finalTranscript.trim()) {
        console.log("[v0] User said:", finalTranscript)
        handleUserSpeech(finalTranscript.trim())
      } else if (interimTranscript.trim()) {
        startSilenceTimeout()
      }
    }

    recognition.onerror = (event) => {
      console.log("[v0] Speech recognition error:", event.error)

      if (event.error === "aborted") {
        isRecognitionRunning.current = false
        return
      }

      if (event.error === "no-speech") {
        const timeoutPrompts = [
          "I'm here and ready to discuss deep sea research. What would you like to explore?",
          "Let me tell you about a fascinating deep sea discovery - bioluminescent creatures create their own light through chemical reactions.",
          "Did you know that the deepest part of the ocean, the Mariana Trench, is deeper than Mount Everest is tall?",
          "The deep sea is home to creatures that survive in complete darkness and crushing pressure. What interests you most?",
          "Hydrothermal vents on the ocean floor support entire ecosystems without sunlight. Would you like to know more?",
        ]
        const randomPrompt = timeoutPrompts[Math.floor(Math.random() * timeoutPrompts.length)]
        handleAIResponse(randomPrompt)
      }

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }
    }

    recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
      isRecognitionRunning.current = false
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }

      if (shouldRestart.current && isCallActive && !isMuted && !isSpeaking && !isProcessing) {
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRestart.current && !isRecognitionRunning.current && !isSpeaking && !isProcessing) {
            startRecognition()
          }
        }, 2000)
      }
    }

    recognitionRef.current = recognition
    return recognition
  }, [isCallActive, startSilenceTimeout, handleUserSpeech, handleAIResponse, startRecognition])

  // Main call effect
  useEffect(() => {
    if (isCallActive) {
      shouldRestart.current = true
      
      // Start call end timer (5 minutes)
      callEndTimeoutRef.current = setTimeout(() => {
        console.log("[v0] 5 minutes of inactivity - AI ending call")
        const farewellMessages = [
          "Thank you for this wonderful conversation about deep sea research. Until next time, keep exploring the mysteries of the ocean!",
          "It's been a pleasure discussing marine biology with you. I hope you learned something fascinating about our deep sea world!",
          "What an engaging conversation about the ocean depths! I look forward to our next chat about marine science.",
          "Thanks for diving into the world of deep sea research with me. The ocean has so many more secrets waiting to be discovered!",
          "I've really enjoyed our conversation about the deep sea. Keep your curiosity about marine life alive!"
        ]
        
        const randomFarewell = farewellMessages[Math.floor(Math.random() * farewellMessages.length)]
        
        if (synthesisRef.current && !isMuted) {
          const utterance = new SpeechSynthesisUtterance(randomFarewell)
          utterance.rate = 0.9
          utterance.pitch = 1.0
          utterance.volume = 1.0
          
          utterance.onend = () => {
            setTimeout(() => onEndCall(), 1000)
          }
          
          utterance.onerror = () => {
            onEndCall()
          }
          
          synthesisRef.current.speak(utterance)
        } else {
          onEndCall()
        }
      }, 5 * 60 * 1000)

      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      const recognition = initializeSpeechRecognition()
      if (recognition && !isMuted) {
        setTimeout(() => startRecognition(), 500)
      }

      // Start interruption monitoring
      startInterruptionMonitoring()

      return () => {
        clearInterval(timer)
        clearAllTimeouts()
        stopInterruptionMonitoring()
        shouldRestart.current = false
        stopRecognition()
      }
    } else {
      shouldRestart.current = false
      stopRecognition()
      clearAllTimeouts()
      stopInterruptionMonitoring()
      
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
        console.log("[v0] Speech synthesis cancelled on call end")
      }
      
      setIsSpeaking(false)
      isCurrentlySpeaking.current = false
      setIsProcessing(false)
    }
  }, [isCallActive, isMuted, initializeSpeechRecognition, startRecognition, stopRecognition, clearAllTimeouts, stopInterruptionMonitoring, startInterruptionMonitoring, onEndCall])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          🌊 Dr. Marina - Marine Biologist
          <Badge variant="default" className="bg-green-600">
            Live Call • {formatDuration(callDuration)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-sm font-medium">
              {isListening ? "Listening..." : isSpeaking ? "AI Speaking..." : isProcessing ? "Processing..." : "Ready"}
            </span>
          </div>

          {currentTranscript && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">You're saying:</p>
              <p className="text-sm font-medium">{currentTranscript}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="destructive" onClick={onEndCall} className="flex items-center gap-2">
            <PhoneOff className="h-4 w-4" />
            End Call
          </Button>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />}
            {isListening ? "Listening" : "Not Listening"}
          </Badge>

          <Badge variant={isSpeaking ? "default" : "secondary"}>
            {isSpeaking ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
            {isSpeaking ? "AI Speaking" : "AI Ready"}
          </Badge>

          {isProcessing && <Badge variant="outline">Processing...</Badge>}

          <Badge variant={voicesLoaded ? "default" : "secondary"}>
            {voicesLoaded ? "🔊 Voice Ready" : "🔇 Loading Voice"}
          </Badge>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>💬 Speak naturally about deep sea research</p>
          <p>⏱️ AI responds automatically after 12 seconds of silence</p>
          <p>🎙️ Real-time voice conversation with Dr. Marina</p>
          <p>🤖 AI can end the call naturally when conversation concludes</p>
        </div>
      </CardContent>
    </Card>
  )
}
