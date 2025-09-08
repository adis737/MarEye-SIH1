"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Droplets,
  MapPin,
  Filter,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Zap,
  Eye,
  Search,
} from "lucide-react"

interface WaterQualityPoint {
  id: string
  location: {
    latitude: number
    longitude: number
    depth: number
    region: string
  }
  measurements: {
    temperature: number
    salinity: number
    pH: number
    dissolvedOxygen: number
    turbidity: number
    pollutants: {
      microplastics: number
      heavyMetals: {
        mercury: number
        lead: number
        cadmium: number
      }
      chemicals: {
        pesticides: number
        hydrocarbons: number
      }
    }
  }
  qualityIndex: number
  contaminationLevel: "low" | "moderate" | "high" | "severe"
  samplingDate: string
  trend: "improving" | "stable" | "declining"
}

export function InteractiveWaterQualityMap() {
  const [waterQualityData, setWaterQualityData] = useState<WaterQualityPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<WaterQualityPoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    contaminationLevel: "all",
    qualityRange: [0, 100],
    region: "all",
    timeframe: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Sample data - in production this would come from your API
  const sampleData: WaterQualityPoint[] = [
    {
      id: "1",
      location: { latitude: 36.7783, longitude: -119.4179, depth: 1500, region: "Monterey Bay" },
      measurements: {
        temperature: 4.2,
        salinity: 34.5,
        pH: 7.8,
        dissolvedOxygen: 2.1,
        turbidity: 0.5,
        pollutants: {
          microplastics: 12.3,
          heavyMetals: { mercury: 0.05, lead: 0.02, cadmium: 0.01 },
          chemicals: { pesticides: 0.1, hydrocarbons: 0.3 },
        },
      },
      qualityIndex: 78,
      contaminationLevel: "low",
      samplingDate: "2024-01-15",
      trend: "stable",
    },
    {
      id: "2",
      location: { latitude: 25.7617, longitude: -80.1918, depth: 2000, region: "Florida Straits" },
      measurements: {
        temperature: 5.8,
        salinity: 35.1,
        pH: 7.6,
        dissolvedOxygen: 1.8,
        turbidity: 1.2,
        pollutants: {
          microplastics: 28.7,
          heavyMetals: { mercury: 0.12, lead: 0.08, cadmium: 0.03 },
          chemicals: { pesticides: 0.4, hydrocarbons: 1.2 },
        },
      },
      qualityIndex: 52,
      contaminationLevel: "moderate",
      samplingDate: "2024-01-20",
      trend: "declining",
    },
    {
      id: "3",
      location: { latitude: 11.3733, longitude: 142.5917, depth: 3500, region: "Mariana Trench" },
      measurements: {
        temperature: 2.1,
        salinity: 34.7,
        pH: 8.1,
        dissolvedOxygen: 3.2,
        turbidity: 0.2,
        pollutants: {
          microplastics: 5.1,
          heavyMetals: { mercury: 0.02, lead: 0.01, cadmium: 0.005 },
          chemicals: { pesticides: 0.05, hydrocarbons: 0.1 },
        },
      },
      qualityIndex: 92,
      contaminationLevel: "low",
      samplingDate: "2024-01-25",
      trend: "improving",
    },
    {
      id: "4",
      location: { latitude: 0, longitude: -25, depth: 2500, region: "Mid-Atlantic Ridge" },
      measurements: {
        temperature: 3.8,
        salinity: 34.9,
        pH: 7.4,
        dissolvedOxygen: 1.2,
        turbidity: 2.1,
        pollutants: {
          microplastics: 45.2,
          heavyMetals: { mercury: 0.18, lead: 0.15, cadmium: 0.08 },
          chemicals: { pesticides: 0.8, hydrocarbons: 2.1 },
        },
      },
      qualityIndex: 35,
      contaminationLevel: "high",
      samplingDate: "2024-01-18",
      trend: "declining",
    },
    {
      id: "5",
      location: { latitude: -23.5505, longitude: -46.6333, depth: 1800, region: "South Atlantic" },
      measurements: {
        temperature: 6.2,
        salinity: 35.3,
        pH: 7.2,
        dissolvedOxygen: 0.8,
        turbidity: 3.5,
        pollutants: {
          microplastics: 67.8,
          heavyMetals: { mercury: 0.25, lead: 0.22, cadmium: 0.12 },
          chemicals: { pesticides: 1.2, hydrocarbons: 3.8 },
        },
      },
      qualityIndex: 18,
      contaminationLevel: "severe",
      samplingDate: "2024-01-22",
      trend: "declining",
    },
  ]

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setWaterQualityData(sampleData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getQualityColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500"
      case "moderate":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "severe":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getQualityTextColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600"
      case "moderate":
        return "text-yellow-600"
      case "high":
        return "text-orange-600"
      case "severe":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const filteredData = waterQualityData.filter((point) => {
    const matchesContamination =
      filters.contaminationLevel === "all" || point.contaminationLevel === filters.contaminationLevel
    const matchesQuality =
      point.qualityIndex >= filters.qualityRange[0] && point.qualityIndex <= filters.qualityRange[1]
    const matchesRegion =
      filters.region === "all" || point.location.region.toLowerCase().includes(filters.region.toLowerCase())
    const matchesSearch = searchQuery === "" || point.location.region.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesContamination && matchesQuality && matchesRegion && matchesSearch
  })

  const analyzeWaterQuality = async (point: WaterQualityPoint) => {
    try {
      console.log("[v0] Starting water quality analysis for:", point.location.region)

      const response = await fetch("/api/ai/water-quality-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waterQualityData: point.measurements,
          location: point.location,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Water quality analysis completed:", result)
        // You could update the UI with AI insights here
      }
    } catch (error) {
      console.error("[v0] Water quality analysis error:", error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Droplets className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Interactive Water Quality Mapping</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
          Real-time monitoring and analysis of deep-sea water quality with contamination level indicators and AI-powered
          insights.
        </p>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Filter className="h-5 w-5 text-primary" />
            Filters & Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Search Region</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search regions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Contamination Level</label>
              <Select
                value={filters.contaminationLevel}
                onValueChange={(value) => setFilters({ ...filters, contaminationLevel: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Quality Index Range</label>
              <div className="px-2">
                <Slider
                  value={filters.qualityRange}
                  onValueChange={(value) => setFilters({ ...filters, qualityRange: value })}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.qualityRange[0]}</span>
                  <span>{filters.qualityRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Actions</label>
              <Button
                onClick={() => setIsLoading(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Global Water Quality Map
                <Badge variant="secondary" className="ml-auto">
                  {filteredData.length} monitoring stations
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-800 rounded-lg h-96 overflow-hidden">
                {/* World map background with grid */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
                  {/* Grid lines for map effect */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`h-${i}`} className="absolute w-full h-px bg-slate-500" style={{ top: `${i * 10}%` }} />
                    ))}
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute h-full w-px bg-slate-500"
                        style={{ left: `${i * 5.56}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Data points */}
                <div className="absolute inset-0">
                  {filteredData.map((point) => (
                    <div
                      key={point.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{
                        left: `${((point.location.longitude + 180) / 360) * 100}%`,
                        top: `${((90 - point.location.latitude) / 180) * 100}%`,
                      }}
                      onClick={() => setSelectedPoint(point)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${getQualityColor(point.contaminationLevel)} animate-pulse border-2 border-white shadow-lg group-hover:scale-125 transition-transform`}
                      >
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="font-medium">{point.location.region}</div>
                          <div>Quality: {point.qualityIndex}%</div>
                          <div>Level: {point.contaminationLevel}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg p-3">
                  <div className="text-white text-xs font-medium mb-2">Contamination Levels</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white text-xs">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-white text-xs">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-white text-xs">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-white text-xs">Severe</span>
                    </div>
                  </div>
                </div>

                {/* Statistics overlay */}
                <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3">
                  <div className="text-white text-xs space-y-1">
                    <div>
                      Avg Quality:{" "}
                      {Math.round(filteredData.reduce((acc, p) => acc + p.qualityIndex, 0) / filteredData.length || 0)}%
                    </div>
                    <div>Stations: {filteredData.length}</div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                      <span>
                        Alerts:{" "}
                        {
                          filteredData.filter(
                            (p) => p.contaminationLevel === "high" || p.contaminationLevel === "severe",
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Details */}
        <div className="space-y-6">
          {selectedPoint ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-card-foreground">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-accent" />
                    Station Details
                  </span>
                  {getTrendIcon(selectedPoint.trend)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-card-foreground">{selectedPoint.location.region}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPoint.location.latitude.toFixed(4)}°, {selectedPoint.location.longitude.toFixed(4)}°
                  </p>
                  <p className="text-sm text-muted-foreground">Depth: {selectedPoint.location.depth}m</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Index</span>
                    <Badge variant={selectedPoint.qualityIndex >= 70 ? "default" : "destructive"}>
                      {selectedPoint.qualityIndex}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contamination</span>
                    <Badge className={`${getQualityColor(selectedPoint.contaminationLevel)} text-white`}>
                      {selectedPoint.contaminationLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-card-foreground">Measurements</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="text-card-foreground">{selectedPoint.measurements.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">pH:</span>
                        <span className="text-card-foreground">{selectedPoint.measurements.pH}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salinity:</span>
                        <span className="text-card-foreground">{selectedPoint.measurements.salinity} PSU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Oxygen:</span>
                        <span className="text-card-foreground">{selectedPoint.measurements.dissolvedOxygen} mg/L</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-card-foreground">Pollutants</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Microplastics:</span>
                        <span
                          className={
                            selectedPoint.measurements.pollutants.microplastics > 20
                              ? "text-red-600"
                              : "text-card-foreground"
                          }
                        >
                          {selectedPoint.measurements.pollutants.microplastics} p/m³
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mercury:</span>
                        <span
                          className={
                            selectedPoint.measurements.pollutants.heavyMetals.mercury > 0.1
                              ? "text-red-600"
                              : "text-card-foreground"
                          }
                        >
                          {selectedPoint.measurements.pollutants.heavyMetals.mercury} µg/L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hydrocarbons:</span>
                        <span
                          className={
                            selectedPoint.measurements.pollutants.chemicals.hydrocarbons > 1.0
                              ? "text-red-600"
                              : "text-card-foreground"
                          }
                        >
                          {selectedPoint.measurements.pollutants.chemicals.hydrocarbons} µg/L
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => analyzeWaterQuality(selectedPoint)}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Click on a monitoring station to view detailed information</p>
              </CardContent>
            </Card>
          )}

          {/* Summary Statistics */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Thermometer className="h-5 w-5 text-primary" />
                Summary Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(filteredData.reduce((acc, p) => acc + p.qualityIndex, 0) / filteredData.length || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Quality Index</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{filteredData.length}</div>
                  <div className="text-xs text-muted-foreground">Active Stations</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-card-foreground">Contamination Breakdown</h4>
                {["low", "moderate", "high", "severe"].map((level) => {
                  const count = filteredData.filter((p) => p.contaminationLevel === level).length
                  const percentage = filteredData.length > 0 ? (count / filteredData.length) * 100 : 0
                  return (
                    <div key={level} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getQualityColor(level)}`}></div>
                        <span className="capitalize text-card-foreground">{level}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
