"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Square, Play, Volume2, VolumeX, Waves } from "lucide-react"
import { VoiceAgent } from "@/components/voice-agent"

export default function VoiceAgentPage() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handleStartCall = () => {
    console.log("[Voice Agent] Starting call with AI scientist")
    setIsCallActive(true)
  }

  const handleEndCall = () => {
    console.log("[Voice Agent] Ending call with AI scientist")
    setIsCallActive(false)
    setIsRecording(false)
    
    // Stop all speech synthesis immediately
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      console.log("[Voice Agent] All speech synthesis cancelled on call end")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/10 to-blue-900/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="p-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Waves className="h-8 w-8 text-cyan-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Deep Sea Research AI
              </h1>
              <Waves className="h-8 w-8 text-cyan-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            <p className="text-xl text-slate-300 text-balance max-w-2xl mx-auto">
              Connect with our AI marine biologist for real-time voice conversations about deep ocean mysteries,
              underwater ecosystems, and cutting-edge research discoveries.
            </p>
          </div>
        </header>

        {/* Main Voice Interface */}
        <main className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Call Control Center */}
            <Card className="mb-8 bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">
                  {isCallActive ? "Connected to AI Marine Biologist" : "AI Marine Biologist"}
                </CardTitle>
                <CardDescription className="text-slate-300">
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
                        ? "bg-red-600 hover:bg-red-700 animate-pulse"
                        : "bg-green-600 hover:bg-green-700 hover:scale-105"
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
                  <p className="text-lg font-medium text-white">{isCallActive ? "End Call" : "Call AI Scientist"}</p>
                  {isCallActive && (
                    <p className="text-sm text-slate-400 mt-1">
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
                      className={`${isRecording ? "bg-red-600/10 border-red-500 text-red-400" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                    >
                      {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isRecording ? "Stop Recording" : "Record Call"}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsMuted(!isMuted)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
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
                    <Badge variant="outline" className="border-red-500 text-red-400">
                      🔴 Recording
                    </Badge>
                  )}
                  {isMuted && <Badge variant="outline" className="border-slate-600 text-slate-400">🔇 Muted</Badge>}
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
            {!isCallActive && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">🌊 Deep Sea Exploration</CardTitle>
                    <CardDescription className="text-slate-300">
                      Discover the mysteries of the deep ocean with AI-powered research tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">
                      Our AI can help you understand hydrothermal vents, bioluminescent creatures, 
                      and the unique ecosystems found in the deepest parts of our oceans.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">🔬 Marine Biology</CardTitle>
                    <CardDescription className="text-slate-300">
                      Learn about marine species identification and conservation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">
                      Get expert insights on marine life, their habitats, threats they face, 
                      and conservation strategies to protect our ocean ecosystems.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">🤖 AI Research Assistant</CardTitle>
                    <CardDescription className="text-slate-300">
                      Real-time voice conversations with Dr. Marina
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">
                      Have natural conversations about marine science, ask questions about 
                      ocean research, and get personalized insights from our AI marine biologist.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
