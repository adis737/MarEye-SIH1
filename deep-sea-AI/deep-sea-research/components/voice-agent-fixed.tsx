"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
// Web Speech API types are now globally available

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
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [lastActivityTime, setLastActivityTime] = useState<Date | null>(null)
  const [callEndTimer, setCallEndTimer] = useState<NodeJS.Timeout | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const isRecognitionRunning = useRef(false)
  const shouldRestart = useRef(true)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCurrentlySpeaking = useRef(false)

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

      // Force voice loading
      try {
        synthesis.cancel()
      } catch (error) {
        // Ignore cancellation errors during initialization
        console.log("[v0] Speech synthesis initialization completed")
      }
      loadVoices()

      if (synthesis.onvoiceschanged !== undefined) {
        synthesis.onvoiceschanged = loadVoices
      }

      // Fallback for browsers that don't fire voiceschanged
      setTimeout(loadVoices, 100)
    }

    // Cleanup function to stop all speech when component unmounts
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
        console.log("[v0] Speech synthesis cancelled on component unmount")
      }
      shouldRestart.current = false
      isCurrentlySpeaking.current = false
    }
  }, [])

  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined" || !isCallActive) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("[v0] Speech recognition not supported")
      return
    }

    // Clean up existing recognition
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

      if (finalTranscript || interimTranscript) {
        clearSilenceTimeout()
        setCurrentTranscript(interimTranscript || finalTranscript)
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

      // Don't restart on aborted errors to prevent loops
      if (event.error === "aborted") {
        isRecognitionRunning.current = false
        return
      }

      if (event.error === "no-speech") {
        handleSilenceTimeout()
      }

      clearSilenceTimeout()
    }

    recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
      isRecognitionRunning.current = false
      clearSilenceTimeout()

      // Only restart if we should and conditions are right
      if (shouldRestart.current && isCallActive && !isMuted && !isSpeaking && !isProcessing) {
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRestart.current && !isRecognitionRunning.current && !isSpeaking && !isProcessing) {
            startRecognition()
          }
        }, 2000) // Increased delay to prevent rapid restarts
      }
    }

    recognitionRef.current = recognition
    return recognition
  }, [isCallActive])

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isRecognitionRunning.current || isMuted || isSpeaking || isProcessing || isCurrentlySpeaking.current) {
      return
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.log("[v0] Recognition start failed:", error)
      // Don't retry immediately to prevent loops
      setTimeout(() => {
        if (shouldRestart.current && !isRecognitionRunning.current && !isSpeaking && !isProcessing && !isCurrentlySpeaking.current) {
          startRecognition()
        }
      }, 3000) // Increased delay
    }
  }, [isMuted, isSpeaking, isProcessing])

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isRecognitionRunning.current) {
      shouldRestart.current = false
      recognitionRef.current.stop()

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
    }
  }, [])

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
    }
  }, [silenceTimer])

  // Function to end call with farewell
  const endCallWithFarewell = useCallback(() => {
    console.log("[v0] AI is ending the call")
    const farewellMessages = [
      "Thank you for this wonderful conversation about deep sea research. Until next time, keep exploring the mysteries of the ocean!",
      "It's been a pleasure discussing marine biology with you. I hope you learned something fascinating about our deep sea world!",
      "What an engaging conversation about the ocean depths! I look forward to our next chat about marine science.",
      "Thanks for diving into the world of deep sea research with me. The ocean has so many more secrets waiting to be discovered!",
      "I've really enjoyed our conversation about the deep sea. Keep your curiosity about marine life alive!"
    ]
    
    const randomFarewell = farewellMessages[Math.floor(Math.random() * farewellMessages.length)]
    
    // Speak farewell message first
    if (synthesisRef.current && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(randomFarewell)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onend = () => {
        console.log("[v0] Farewell message completed, ending call")
        // End call after farewell message
        setTimeout(() => {
          onEndCall()
        }, 1000)
      }
      
      utterance.onerror = () => {
        console.log("[v0] Farewell speech error, ending call anyway")
        onEndCall()
      }
      
      synthesisRef.current.speak(utterance)
    } else {
      // If speech is muted or not available, end call immediately
      onEndCall()
    }
  }, [isMuted, onEndCall])

  const clearCallEndTimer = useCallback(() => {
    if (callEndTimer) {
      clearTimeout(callEndTimer)
      setCallEndTimer(null)
    }
  }, [callEndTimer])

  // Function to start call end timer (5 minutes of inactivity)
  const startCallEndTimer = useCallback(() => {
    clearCallEndTimer()
    const timer = setTimeout(() => {
      console.log("[v0] 5 minutes of inactivity - AI ending call")
      endCallWithFarewell()
    }, 5 * 60 * 1000) // 5 minutes
    setCallEndTimer(timer)
  }, [endCallWithFarewell, clearCallEndTimer])

  // Function to update activity time
  const updateActivityTime = useCallback(() => {
    setLastActivityTime(new Date())
    startCallEndTimer()
  }, [startCallEndTimer])

  const startSilenceTimeout = useCallback(() => {
    clearSilenceTimeout()
    // Only start timeout if AI is not currently speaking
    if (!isSpeaking && !isProcessing && !isCurrentlySpeaking.current) {
      const timer = setTimeout(() => {
        console.log("[v0] 12-second silence timeout - AI will speak")
        handleSilenceTimeout()
      }, 12000) // Increased to 12 seconds for more natural conversation
      setSilenceTimer(timer)
    }
  }, [isSpeaking, isProcessing])

  const handleSilenceTimeout = useCallback(() => {
    if (!isCallActive) return
    
    console.log("[v0] Handling silence timeout - AI taking initiative")
    const timeoutPrompts = [
      "I'm here and ready to discuss deep sea research. What would you like to explore?",
      "Let me tell you about a fascinating deep sea discovery - bioluminescent creatures create their own light through chemical reactions.",
      "Did you know that the deepest part of the ocean, the Mariana Trench, is deeper than Mount Everest is tall?",
      "The deep sea is home to creatures that survive in complete darkness and crushing pressure. What interests you most?",
      "Hydrothermal vents on the ocean floor support entire ecosystems without sunlight. Would you like to know more?",
    ]
    const randomPrompt = timeoutPrompts[Math.floor(Math.random() * timeoutPrompts.length)]
    handleAIResponse(randomPrompt)
  }, [isCallActive])

  // Function to check if AI wants to end the call
  const checkForCallEnding = useCallback((text: string) => {
    const endingPhrases = [
      "goodbye", "bye", "farewell", "see you later", "talk to you later",
      "have a great day", "thanks for calling", "end of call", "call ended",
      "that's all for now", "until next time", "take care", "catch you later",
      "thanks for the conversation", "nice talking with you", "end call",
      "call is over", "conversation is over", "we're done here"
    ]
    
    const lowerText = text.toLowerCase()
    return endingPhrases.some(phrase => lowerText.includes(phrase))
  }, [])

  const handleUserSpeech = async (transcript: string) => {
    if (!transcript.trim() || !isCallActive) return

    console.log("[v0] Processing user message:", transcript)
    setCurrentTranscript("")
    setIsProcessing(true)
    clearSilenceTimeout()
    updateActivityTime() // Track user activity

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
        console.error("[v0] API response not ok:", response.status, response.statusText)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API response data:", data)

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

  const handleAIResponse = useCallback(
    (text: string) => {
      if (!synthesisRef.current || isMuted || !text.trim() || !isCallActive) {
        setIsProcessing(false)
        return
      }

      console.log("[v0] Speaking AI response:", text)
      
      // Check if AI wants to end the call
      if (checkForCallEnding(text)) {
        console.log("[v0] AI detected call ending phrase")
        endCallWithFarewell()
        return
      }
      
      updateActivityTime() // Track AI activity
      setIsSpeaking(true)
      stopRecognition()

      // Only cancel if we're not already speaking the same or similar content
      if (isCurrentlySpeaking.current) {
        console.log("[v0] AI is already speaking, queuing new response")
        // Don't cancel, let the current speech finish
        return
      }

      // Cancel any ongoing speech gracefully
      try {
        synthesisRef.current.cancel()
      } catch (error) {
        // Ignore cancellation errors
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

        // Restart recognition after speaking with longer delay
        if (isCallActive && !isMuted) {
          shouldRestart.current = true
          setTimeout(() => {
            if (!isRecognitionRunning.current && shouldRestart.current && !isCurrentlySpeaking.current && !isProcessing) {
              startRecognition()
            }
          }, 2000) // Increased delay to ensure AI finished completely
        }
      }

      utterance.onerror = (event) => {
        // Don't log "interrupted" as an error - it's expected behavior
        if (event.error !== "interrupted") {
          console.error("[v0] Speech synthesis error:", event.error)
        }
        setIsSpeaking(false)
        isCurrentlySpeaking.current = false

        // Restart recognition after error (but not for interruptions)
        if (isCallActive && !isMuted && event.error !== "interrupted") {
          shouldRestart.current = true
          setTimeout(() => {
            if (!isRecognitionRunning.current && shouldRestart.current && !isCurrentlySpeaking.current) {
              startRecognition()
            }
          }, 2000)
        }
      }

      // Select best available voice
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

      // Add a small delay to prevent rapid interruptions
      setTimeout(() => {
        // Double-check that call is still active before speaking
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
    },
    [isMuted, isCallActive, stopRecognition, startRecognition, checkForCallEnding, endCallWithFarewell, updateActivityTime],
  )

  useEffect(() => {
    if (isCallActive) {
      setCallStartTime(new Date())
      setLastActivityTime(new Date())
      shouldRestart.current = true
      startCallEndTimer() // Start the call end timer

      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      // Initialize speech recognition
      const recognition = initializeSpeechRecognition()
      if (recognition && !isMuted) {
        setTimeout(() => startRecognition(), 500)
      }

      // Handle recording
      if (isRecording && !mediaRecorder) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const recorder = new MediaRecorder(stream)
            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                setRecordedChunks((prev) => [...prev, event.data])
              }
            }
            recorder.start()
            setMediaRecorder(recorder)
            console.log("[v0] Call recording started")
          })
          .catch((error) => {
            console.error("[v0] Failed to start recording:", error)
          })
      }

      return () => {
        clearInterval(timer)
        clearCallEndTimer()
        shouldRestart.current = false
        stopRecognition()

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop()
        }
      }
    } else {
      // Call ended - stop everything immediately
      shouldRestart.current = false
      stopRecognition()
      clearCallEndTimer()
      
      // Stop all speech synthesis immediately
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
        console.log("[v0] Speech synthesis cancelled on call end")
      }
      
      // Reset all speaking states
      setIsSpeaking(false)
      isCurrentlySpeaking.current = false
      setIsProcessing(false)
      clearSilenceTimeout()
    }
  }, [isCallActive, initializeSpeechRecognition, startRecognition, stopRecognition, startCallEndTimer, clearCallEndTimer])

  useEffect(() => {
    if (isMuted || isSpeaking || isProcessing || isCurrentlySpeaking.current) {
      stopRecognition()
    } else if (isCallActive && recognitionRef.current && !isRecognitionRunning.current) {
      shouldRestart.current = true
      setTimeout(() => startRecognition(), 1000) // Increased delay
    }
  }, [isMuted, isSpeaking, isProcessing, isCallActive, startRecognition, stopRecognition])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "audio/webm" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `deep-sea-call-${new Date().toISOString().slice(0, 19)}.webm`
      a.click()
      URL.revokeObjectURL(url)
      console.log("[v0] Call recording downloaded")
    }
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

          {isRecording && recordedChunks.length > 0 && (
            <Button variant="outline" onClick={downloadRecording} className="flex items-center gap-2 bg-transparent">
              Download Recording
            </Button>
          )}
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

