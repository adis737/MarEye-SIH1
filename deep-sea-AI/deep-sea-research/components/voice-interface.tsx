"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, User, Bot, Mic, MicOff } from "lucide-react"
import { useChat } from "ai/react"
// Web Speech API types are now globally available

interface VoiceInterfaceProps {
  isListening: boolean
  isMuted: boolean
  isRecording: boolean
  onClose: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function VoiceInterface({ isListening, isMuted, isRecording, onClose }: VoiceInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null)
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null)
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    messages: chatMessages,
    append,
    isLoading,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          console.log("[v0] Speech recognition started")
          setIsWaitingForSpeech(true)
          startSilenceTimeout()
        }

        recognition.onresult = (event) => {
          console.log("[v0] Speech recognition result received")
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
            setIsWaitingForSpeech(false)
          }

          if (finalTranscript) {
            setTranscript(finalTranscript)
            handleUserMessage(finalTranscript)
          } else {
            setTranscript(interimTranscript)
            startSilenceTimeout()
          }
        }

        recognition.onerror = (event) => {
          console.log("[v0] Speech recognition error:", event.error)
          if (event.error === "no-speech") {
            console.log("[v0] No speech detected, triggering timeout response")
            handleSilenceTimeout()
          } else if (event.error === "network") {
            console.log("[v0] Network error in speech recognition")
          } else {
            console.error("Speech recognition error:", event.error)
          }
          clearSilenceTimeout()
          setIsWaitingForSpeech(false)
        }

        recognition.onend = () => {
          console.log("[v0] Speech recognition ended")
          clearSilenceTimeout()
          setIsWaitingForSpeech(false)
          if (isListening && !isMuted) {
            setTimeout(() => {
              try {
                recognition.start()
              } catch (error) {
                console.log("[v0] Recognition restart failed:", error)
              }
            }, 100)
          }
        }

        setRecognition(recognition)
      } else {
        console.error("Speech recognition not supported in this browser")
      }

      if (window.speechSynthesis) {
        setSynthesis(window.speechSynthesis)
      } else {
        console.error("Speech synthesis not supported in this browser")
      }
    }
  }, [])

  const startSilenceTimeout = () => {
    clearSilenceTimeout()
    const timer = setTimeout(() => {
      console.log("[v0] 8-second silence timeout triggered")
      handleSilenceTimeout()
    }, 8000) // 8 seconds
    setSilenceTimer(timer)
  }

  const clearSilenceTimeout = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
    }
  }

  const handleSilenceTimeout = () => {
    console.log("[v0] Handling silence timeout")
    setIsWaitingForSpeech(false)
    const timeoutPrompts = [
      "Tell me something fascinating about bioluminescent creatures in the deep sea",
      "What's the most mysterious deep sea discovery in recent years?",
      "How do creatures survive in the deepest parts of the ocean?",
      "What makes hydrothermal vents so important for deep sea life?",
      "Tell me about the strangest deep sea creature you know",
    ]
    const randomPrompt = timeoutPrompts[Math.floor(Math.random() * timeoutPrompts.length)]
    handleUserMessage(randomPrompt)
  }

  useEffect(() => {
    if (recognition) {
      if (isListening && !isMuted) {
        try {
          recognition.start()
        } catch (error) {
          console.log("[v0] Recognition start failed:", error)
        }
      } else {
        recognition.stop()
        clearSilenceTimeout()
        setIsWaitingForSpeech(false)
      }
    }

    return () => {
      if (recognition) {
        recognition.stop()
        clearSilenceTimeout()
      }
    }
  }, [isListening, isMuted, recognition])

  const handleUserMessage = async (content: string) => {
    if (!content.trim()) return

    console.log("[v0] Processing user message:", content)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)
    setTranscript("")

    try {
      await append({
        role: "user",
        content: content.trim(),
      })
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now, but I'm still here to help with your deep sea research questions!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const lastMessage = chatMessages[chatMessages.length - 1]
    if (lastMessage && lastMessage.role === "assistant" && synthesis && !isMuted) {
      console.log("[v0] Processing AI response for speech")
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: lastMessage.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      const utterance = new SpeechSynthesisUtterance(lastMessage.content)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => {
        console.log("[v0] Speech synthesis started")
      }

      utterance.onend = () => {
        console.log("[v0] Speech synthesis ended")
      }

      utterance.onerror = (event) => {
        // Don't log "interrupted" as an error - it's expected behavior
        if (event.error !== "interrupted") {
          console.error("[v0] Speech synthesis error:", event.error)
        }
      }

      const speakWithVoice = () => {
        const voices = synthesis.getVoices()
        console.log("[v0] Available voices:", voices.length)

        const preferredVoice =
          voices.find((voice) => voice.name.includes("Neural") || voice.name.includes("Premium")) ||
          voices.find((voice) => voice.name.includes("Natural")) ||
          voices.find((voice) => voice.lang.startsWith("en") && voice.localService) ||
          voices.find((voice) => voice.lang.startsWith("en"))

        if (preferredVoice) {
          utterance.voice = preferredVoice
          console.log("[v0] Using voice:", preferredVoice.name)
        }

        // Add a small delay to prevent rapid interruptions
        setTimeout(() => {
          try {
            synthesis.speak(utterance)
          } catch (error) {
            console.error("[v0] Failed to speak:", error)
          }
        }, 100)
      }

      if (synthesis.getVoices().length === 0) {
        synthesis.onvoiceschanged = speakWithVoice
      } else {
        speakWithVoice()
      }
    }
  }, [chatMessages, synthesis, isMuted])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="mb-8 bg-card/90 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">AI Conversation</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />}
              {isListening ? "Listening" : "Paused"}
            </Badge>
            {isWaitingForSpeech && <Badge variant="outline">Waiting for speech...</Badge>}
            {isProcessing && <Badge variant="outline">Processing...</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-accent" />
                <p className="text-lg font-medium">Ready to explore the deep sea!</p>
                <p className="text-sm">
                  Ask me anything about marine biology, ocean research, or underwater ecosystems.
                </p>
                <p className="text-xs mt-2 opacity-70">I'll respond automatically after 8 seconds of silence.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-muted text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {transcript && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">Current transcript:</p>
            <p className="text-sm font-medium">{transcript}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
