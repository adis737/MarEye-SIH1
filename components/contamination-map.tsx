"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Waves, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface ContaminationData {
  id: string
  location: {
    name: string
    coordinates: [number, number]
  }
  contaminationLevel: "low" | "moderate" | "high" | "severe"
  pollutants: string[]
  lastUpdated: string
  qualityIndex: number
}

export function ContaminationMap() {
  const [contaminationData, setContaminationData] = useState<ContaminationData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  useEffect(() => {
    fetchContaminationData()
  }, [])

  const fetchContaminationData = async () => {
    try {
      const response = await fetch("/api/water-quality?limit=20")
      if (response.ok) {
        const data = await response.json()
        setContaminationData(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch contamination data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getContaminationColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-emerald-500/20 border-emerald-400/40"
      case "moderate":
        return "bg-yellow-500/20 border-yellow-400/40"
      case "high":
        return "bg-orange-500/20 border-orange-400/40"
      case "severe":
        return "bg-red-500/20 border-red-400/40"
      default:
        return "bg-gray-500/20 border-gray-400/40"
    }
  }

  const getContaminationIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case "moderate":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      case "severe":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Waves className="h-4 w-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-900/40 to-blue-900/40 border border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Waves className="h-5 w-5 text-cyan-400" />
            Global Contamination Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-900/40 to-blue-900/40 border border-cyan-400/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Waves className="h-5 w-5 text-cyan-400" />
          Global Contamination Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Interactive Map Visualization */}
        <div className="relative h-96 bg-gradient-to-br from-blue-950/50 to-cyan-950/50 rounded-lg border border-cyan-400/20 overflow-hidden">
          {/* Ocean Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-800/40 to-blue-950/60"></div>

          {/* Animated Water Waves */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
          </div>

          {/* Contamination Points */}
          <div className="absolute inset-0 p-4">
            {contaminationData.map((point, index) => (
              <div
                key={point.id}
                className={`absolute cursor-pointer transform transition-all duration-300 hover:scale-110 ${getContaminationColor(point.contaminationLevel)} rounded-full p-2 border backdrop-blur-sm`}
                style={{
                  left: `${(index % 8) * 12 + 10}%`,
                  top: `${Math.floor(index / 8) * 20 + 15}%`,
                }}
                onClick={() => setSelectedRegion(selectedRegion === point.id ? null : point.id)}
              >
                {getContaminationIcon(point.contaminationLevel)}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-cyan-400/20">
            <div className="text-xs text-white font-medium mb-2">Contamination Levels</div>
            <div className="space-y-1">
              {[
                { level: "low", label: "Low", color: "text-emerald-400" },
                { level: "moderate", label: "Moderate", color: "text-yellow-400" },
                { level: "high", label: "High", color: "text-orange-400" },
                { level: "severe", label: "Severe", color: "text-red-400" },
              ].map(({ level, label, color }) => (
                <div key={level} className="flex items-center gap-2 text-xs">
                  {getContaminationIcon(level)}
                  <span className={color}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Region Details */}
        {selectedRegion && (
          <div className="mt-4 p-4 bg-slate-900/60 backdrop-blur-md rounded-lg border border-cyan-400/20">
            {(() => {
              const region = contaminationData.find((d) => d.id === selectedRegion)
              if (!region) return null

              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">{region.location.name}</h3>
                    <Badge
                      variant="outline"
                      className={`${getContaminationColor(region.contaminationLevel)} text-white`}
                    >
                      {region.contaminationLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-cyan-300">Quality Index:</span>
                      <span className="text-white ml-2">{region.qualityIndex}/100</span>
                    </div>
                    <div>
                      <span className="text-cyan-300">Last Updated:</span>
                      <span className="text-white ml-2">{new Date(region.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {region.pollutants.length > 0 && (
                    <div className="mt-3">
                      <span className="text-cyan-300 text-sm">Detected Pollutants:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {region.pollutants.map((pollutant, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-red-500/20 text-red-300">
                            {pollutant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Statistics Summary */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {[
            { level: "low", count: contaminationData.filter((d) => d.contaminationLevel === "low").length },
            { level: "moderate", count: contaminationData.filter((d) => d.contaminationLevel === "moderate").length },
            { level: "high", count: contaminationData.filter((d) => d.contaminationLevel === "high").length },
            { level: "severe", count: contaminationData.filter((d) => d.contaminationLevel === "severe").length },
          ].map(({ level, count }) => (
            <div key={level} className={`p-3 rounded-lg ${getContaminationColor(level)} backdrop-blur-sm`}>
              <div className="flex items-center gap-2 mb-1">
                {getContaminationIcon(level)}
                <span className="text-white text-xs font-medium capitalize">{level}</span>
              </div>
              <div className="text-white text-lg font-bold">{count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
