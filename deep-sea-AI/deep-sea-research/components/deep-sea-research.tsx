"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Square, Play, Volume2, VolumeX, Waves } from "lucide-react"
import { VoiceAgent } from "@/components/voice-agent"
import { ResearchHighlights } from "@/components/research-highlights"
import { OceanBackground } from "@/components/ocean-background"

export function DeepSeaResearch() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handleStartCall = () => {
    console.log("[v0] Starting call with AI scientist")
    setIsCallActive(true)
  }

  const handleEndCall = () => {
    console.log("[v0] Ending call with AI scientist")
    setIsCallActive(false)
    setIsRecording(false)
    
    // Stop all speech synthesis immediately
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      console.log("[v0] All speech synthesis cancelled on call end")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <OceanBackground />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="p-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Waves className="h-8 w-8 text-accent wave-animation" />
              <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Deep Sea Research AI
              </h1>
              <Waves className="h-8 w-8 text-accent wave-animation" style={{ animationDelay: "0.5s" }} />
            </div>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Connect with our AI marine biologist for real-time voice conversations about deep ocean mysteries,
              underwater ecosystems, and cutting-edge research discoveries.
            </p>
          </div>
        </header>

        {/* Main Voice Interface */}
        <main className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Call Control Center */}
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isCallActive ? "Connected to AI Marine Biologist" : "AI Marine Biologist"}
                </CardTitle>
                <CardDescription>
                  {isCallActive
                    ? "You're now connected! Speak naturally and the AI will respond with voice. Dr. Marina can also end the call when appropriate."
                    : "Click to start a real-time voice conversation with our AI deep sea expert"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                {/* Main Call Button */}
                <div className="relative">
                  <Button
                    size="lg"
                    onClick={isCallActive ? handleEndCall : handleStartCall}
                    className={`h-24 w-24 rounded-full text-white transition-all duration-300 text-lg font-semibold ${
                      isCallActive
                        ? "bg-destructive hover:bg-destructive/90 pulse-record"
                        : "bg-green-600 hover:bg-green-700 float-animation"
                    }`}
                  >
                    {isCallActive ? (
                      <>
                        <PhoneOff className="h-8 w-8 mb-1" />
                      </>
                    ) : (
                      <>
                        <Phone className="h-8 w-8 mb-1" />
                      </>
                    )}
                  </Button>
                  {isCallActive && (
                    <div className="absolute -inset-3 rounded-full border-2 border-green-500/30 animate-ping" />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium">{isCallActive ? "End Call" : "Call AI Scientist"}</p>
                  {isCallActive && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Speak naturally • 12-second timeout for responses
                    </p>
                  )}
                </div>

                {/* Control Buttons - Only show when call is active */}
                {isCallActive && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRecording(!isRecording)}
                      className={isRecording ? "bg-destructive/10 border-destructive text-destructive" : ""}
                    >
                      {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isRecording ? "Stop Recording" : "Record Call"}
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                      {isMuted ? "Unmute" : "Mute"}
                    </Button>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="flex gap-2 flex-wrap justify-center">
                  <Badge variant={isCallActive ? "default" : "secondary"} className="text-sm">
                    {isCallActive ? "🟢 Call Active" : "⚫ Ready to Call"}
                  </Badge>
                  {isRecording && (
                    <Badge variant="outline" className="border-destructive text-destructive">
                      🔴 Recording
                    </Badge>
                  )}
                  {isMuted && <Badge variant="outline">🔇 Muted</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Voice Agent Component - Only show when call is active */}
            {isCallActive && (
              <VoiceAgent
                isCallActive={isCallActive}
                isMuted={isMuted}
                isRecording={isRecording}
                onEndCall={handleEndCall}
              />
            )}

            {/* Research Highlights - Only show when call is not active */}
            {!isCallActive && <ResearchHighlights />}
          </div>
        </main>
      </div>
    </div>
  )
}
