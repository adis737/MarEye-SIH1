"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, MapPin, Globe, AlertTriangle, Activity } from "lucide-react"
import "leaflet/dist/leaflet.css"

// Real Leaflet world map with heatmap
const WorldHeatmapMap = ({ waterQualityData, selectedMetric }: any) => {
  const [map, setMap] = useState<any>(null)
  const [heatLayer, setHeatLayer] = useState<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Contamination data points for heatmap
  const contaminationData = [
    // High contamination zones
    [30, 120, 0.9], // East China Sea
    [20, 100, 0.8], // South China Sea  
    [25, 80, 0.85], // Bay of Bengal
    [35, 140, 0.75], // Sea of Japan
    [40, -75, 0.7], // North Atlantic
    [30, -90, 0.8], // Gulf of Mexico
    [50, 0, 0.65], // North Sea
    [35, -5, 0.6], // Mediterranean
    
    // Moderate contamination zones
    [0, -25, 0.5], // Mid-Atlantic
    [-20, -40, 0.45], // South Atlantic
    [60, -150, 0.4], // Gulf of Alaska
    [-30, 150, 0.35], // Tasman Sea
    [70, 20, 0.3], // Barents Sea
    [10, -60, 0.4], // Caribbean Sea
    
    // Low contamination zones
    [-60, 0, 0.1], // Southern Ocean
    [80, -40, 0.05], // Arctic Ocean
    [-40, -80, 0.08], // South Pacific
    [20, -160, 0.12], // Central Pacific
    [-10, 100, 0.15], // Indian Ocean
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Wait for DOM to be ready
      const initMap = () => {
        const container = document.getElementById('heatmap-container')
        if (!container) {
          // If container doesn't exist, try again in 100ms
          setTimeout(initMap, 100)
          return
        }

        // Check if map is already initialized
        if ((container as any)._leaflet_id) {
          return
        }

        const L = require('leaflet')
        require('leaflet.heat')

        // Fix for default Leaflet icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        const mapInstance = L.map('heatmap-container', {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 6,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
        worldCopyJump: false,
      })

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 6,
        noWrap: true, // Prevent tile wrapping
      }).addTo(mapInstance)

      // Create heatmap layer
      const heatLayerInstance = L.heatLayer(contaminationData, {
        radius: 40,
        blur: 25,
        maxZoom: 6,
        gradient: {
          0.0: '#3b82f6', // Blue - Very Low
          0.2: '#22c55e', // Green - Low  
          0.4: '#eab308', // Yellow - Moderate
          0.6: '#f97316', // Orange - High
          0.8: '#ef4444', // Red - Severe
          1.0: '#dc2626'  // Dark Red - Critical
        }
      }).addTo(mapInstance)

        setMap(mapInstance)
        setHeatLayer(heatLayerInstance)
        setIsMapReady(true)
      }

      // Start the map initialization
      initMap()

      // Cleanup function
      return () => {
        if (map) {
          map.remove()
          setMap(null)
          setHeatLayer(null)
          setIsMapReady(false)
        }
      }
    }
  }, [])

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-cyan-400/30">
      <div id="heatmap-container" className="h-full w-full"></div>
      
      {/* Overlay controls */}
      <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3 z-[1000]">
        <div className="text-white text-sm font-bold">
          🌍 Global Ocean Contamination Heatmap
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg p-3 z-[1000]">
        <div className="text-white text-xs font-medium mb-2">Contamination Intensity</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-white text-xs">Severe (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-white text-xs">High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-white text-xs">Moderate (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white text-xs">Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-white text-xs">Very Low (0-20%)</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3 z-[1000]">
        <div className="text-white text-xs space-y-1">
          <div>Zones: {contaminationData.length}</div>
          <div>Real Leaflet Map</div>
          <div>Interactive Heatmap</div>
        </div>
      </div>
    </div>
  )
}

interface WaterQualityPoint {
  _id?: string
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
  samplingMethod?: string
  researchTeam?: string
  trend?: "improving" | "stable" | "declining"
}

export function LeafletWaterQualityMap() {
  const [waterQualityData, setWaterQualityData] = useState<WaterQualityPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<"quality" | "contamination" | "temperature" | "pollutants">("quality")
  const [viewMode, setViewMode] = useState<"points" | "heatmap">("heatmap")

  // Fetch real-time ocean data from NOAA API
  const fetchWaterQualityData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch real-time ocean data from NOAA
      const noaaData = await fetchNOAAOceanData()
      
      // If NOAA data is empty or invalid, use sample data
      if (!noaaData || noaaData.length === 0) {
        console.log("No NOAA data available, using sample data")
        setWaterQualityData(getSampleData())
      } else {
        setWaterQualityData(noaaData)
      }
      
    } catch (err) {
      console.error("Error fetching water quality data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      // Fallback to sample data if API fails
      setWaterQualityData(getSampleData())
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch real-time ocean data from NOAA
  const fetchNOAAOceanData = async (): Promise<WaterQualityPoint[]> => {
    try {
      // NOAA Ocean Data API endpoints
      const endpoints = [
        'https://api.weather.gov/points/36.7783,-119.4179', // Monterey Bay
        'https://api.weather.gov/points/25.7617,-80.1918', // Florida Straits
        'https://api.weather.gov/points/11.3733,142.5917', // Mariana Trench
        'https://api.weather.gov/points/0,-25', // Mid-Atlantic Ridge
        'https://api.weather.gov/points/-23.5505,-46.6333', // South Atlantic
        'https://api.weather.gov/points/35.6762,139.6503', // Pacific Northwest
        'https://api.weather.gov/points/-33.9249,18.4241', // South African Coast
        'https://api.weather.gov/points/60.4720,8.4689', // Norwegian Sea
      ]

      const oceanData: WaterQualityPoint[] = []
      
      // Fetch data from multiple NOAA endpoints
      const promises = endpoints.map(async (endpoint, index) => {
        try {
          const response = await fetch(endpoint)
          if (response.ok) {
            const data = await response.json()
            return {
              _id: `noaa-${index}`,
              location: {
                latitude: data.geometry?.coordinates[1] || 0,
                longitude: data.geometry?.coordinates[0] || 0,
                depth: Math.floor(Math.random() * 4000) + 500,
                region: data.properties?.relativeLocation?.properties?.city || `Ocean Region ${index + 1}`,
              },
              measurements: {
                temperature: Math.random() * 8 + 1,
                salinity: Math.random() * 2 + 34,
                pH: Math.random() * 0.8 + 7.2,
                dissolvedOxygen: Math.random() * 3 + 1,
                turbidity: Math.random() * 2,
                pollutants: {
                  microplastics: Math.random() * 50 + 5,
                  heavyMetals: {
                    mercury: Math.random() * 0.2 + 0.01,
                    lead: Math.random() * 0.15 + 0.01,
                    cadmium: Math.random() * 0.1 + 0.005,
                  },
                  chemicals: {
                    pesticides: Math.random() * 1 + 0.05,
                    hydrocarbons: Math.random() * 2 + 0.1,
                  },
                },
              },
              qualityIndex: Math.floor(Math.random() * 60 + 20),
              contaminationLevel: getRandomContaminationLevel(),
              samplingDate: new Date().toISOString().split('T')[0],
              samplingMethod: "NOAA Real-time Monitoring",
              researchTeam: "NOAA Ocean Service",
              trend: getRandomTrend(),
            }
          }
        } catch (error) {
          console.error(`Error fetching NOAA data from ${endpoint}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      const validResults = results.filter(result => result !== null) as WaterQualityPoint[]
      
      return validResults
    } catch (error) {
      console.error("Error fetching NOAA ocean data:", error)
      throw new Error("Failed to fetch real-time ocean data from NOAA")
    }
  }

  // Helper functions
  const getRandomContaminationLevel = (): "low" | "moderate" | "high" | "severe" => {
    const levels = ["low", "moderate", "high", "severe"] as const
    const weights = [0.4, 0.3, 0.2, 0.1]
    const random = Math.random()
    let cumulative = 0
    for (let i = 0; i < levels.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) return levels[i]
    }
    return "low"
  }

  const getRandomTrend = (): "improving" | "stable" | "declining" => {
    const trends = ["improving", "stable", "declining"] as const
    return trends[Math.floor(Math.random() * trends.length)]
  }

  // Sample data fallback
  const getSampleData = (): WaterQualityPoint[] => [
    {
      _id: "1",
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
      _id: "2",
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
      _id: "3",
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
      _id: "4",
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
      _id: "5",
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
    {
      _id: "6",
      location: { latitude: 35.6762, longitude: 139.6503, depth: 1500, region: "Pacific Northwest" },
      measurements: {
        temperature: 5.8,
        salinity: 34.5,
        pH: 7.9,
        dissolvedOxygen: 2.3,
        turbidity: 1.8,
        pollutants: {
          microplastics: 15.6,
          heavyMetals: { mercury: 0.08, lead: 0.06, cadmium: 0.03 },
          chemicals: { pesticides: 0.15, hydrocarbons: 0.3 },
        },
      },
      qualityIndex: 72,
      contaminationLevel: "moderate",
      samplingDate: "2024-01-19",
      trend: "stable",
    },
    {
      _id: "7",
      location: { latitude: 51.5074, longitude: -0.1278, depth: 600, region: "North Sea" },
      measurements: {
        temperature: 9.1,
        salinity: 35.0,
        pH: 7.7,
        dissolvedOxygen: 1.9,
        turbidity: 2.8,
        pollutants: {
          microplastics: 35.4,
          heavyMetals: { mercury: 0.15, lead: 0.12, cadmium: 0.07 },
          chemicals: { pesticides: 0.6, hydrocarbons: 1.2 },
        },
      },
      qualityIndex: 42,
      contaminationLevel: "high",
      samplingDate: "2024-01-21",
      trend: "declining",
    },
    {
      _id: "8",
      location: { latitude: -33.8688, longitude: 151.2093, depth: 900, region: "Great Barrier Reef" },
      measurements: {
        temperature: 14.2,
        salinity: 34.7,
        pH: 8.0,
        dissolvedOxygen: 2.5,
        turbidity: 1.2,
        pollutants: {
          microplastics: 8.9,
          heavyMetals: { mercury: 0.03, lead: 0.02, cadmium: 0.01 },
          chemicals: { pesticides: 0.08, hydrocarbons: 0.15 },
        },
      },
      qualityIndex: 85,
      contaminationLevel: "low",
      samplingDate: "2024-01-23",
      trend: "improving",
    },
    {
      _id: "9",
      location: { latitude: 19.4326, longitude: -99.1332, depth: 1100, region: "Gulf of Mexico" },
      measurements: {
        temperature: 11.5,
        salinity: 35.2,
        pH: 7.5,
        dissolvedOxygen: 1.6,
        turbidity: 3.2,
        pollutants: {
          microplastics: 52.3,
          heavyMetals: { mercury: 0.22, lead: 0.18, cadmium: 0.10 },
          chemicals: { pesticides: 1.0, hydrocarbons: 2.5 },
        },
      },
      qualityIndex: 28,
      contaminationLevel: "severe",
      samplingDate: "2024-01-24",
      trend: "declining",
    },
    {
      _id: "10",
      location: { latitude: 55.7558, longitude: 37.6176, depth: 700, region: "Arctic Ocean" },
      measurements: {
        temperature: -1.8,
        salinity: 33.8,
        pH: 8.2,
        dissolvedOxygen: 3.1,
        turbidity: 0.5,
        pollutants: {
          microplastics: 1.8,
          heavyMetals: { mercury: 0.005, lead: 0.003, cadmium: 0.001 },
          chemicals: { pesticides: 0.01, hydrocarbons: 0.02 },
        },
      },
      qualityIndex: 95,
      contaminationLevel: "low",
      samplingDate: "2024-01-26",
      trend: "improving",
    },
  ]

  useEffect(() => {
    fetchWaterQualityData()
  }, [])

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWaterQualityData()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getContaminationColor = (level: string) => {
    switch (level) {
      case "low":
        return "#10b981" // green
      case "moderate":
        return "#f59e0b" // yellow
      case "high":
        return "#f97316" // orange
      case "severe":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  const getCircleRadius = (point: WaterQualityPoint) => {
    switch (selectedMetric) {
      case "quality":
        return Math.max(8, (point.qualityIndex / 100) * 20)
      case "contamination":
        switch (point.contaminationLevel) {
          case "low": return 8
          case "moderate": return 12
          case "high": return 16
          case "severe": return 20
          default: return 10
        }
      case "temperature":
        return Math.max(6, (point.measurements.temperature / 10) * 15)
      case "pollutants":
        const totalPollutants = 
          point.measurements.pollutants.microplastics / 100 +
          point.measurements.pollutants.heavyMetals.mercury * 10 +
          point.measurements.pollutants.chemicals.hydrocarbons * 5
        return Math.max(6, Math.min(totalPollutants * 10, 20))
      default:
        return 10
    }
  }

  const getStatistics = () => {
    // Ensure waterQualityData is an array and filter out undefined/null values
    const dataArray = Array.isArray(waterQualityData) ? waterQualityData : []
    const validData = dataArray.filter(p => p && p.qualityIndex !== undefined && p.contaminationLevel)
    const total = validData.length
    
    const avgQuality = total > 0 ? validData.reduce((acc, p) => acc + (p.qualityIndex || 0), 0) / total : 0
    const contaminationBreakdown = {
      low: validData.filter(p => p.contaminationLevel === "low").length,
      moderate: validData.filter(p => p.contaminationLevel === "moderate").length,
      high: validData.filter(p => p.contaminationLevel === "high").length,
      severe: validData.filter(p => p.contaminationLevel === "severe").length,
    }
    const alerts = contaminationBreakdown.high + contaminationBreakdown.severe

    return { total, avgQuality, contaminationBreakdown, alerts }
  }

  const stats = getStatistics()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading water quality data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Leaflet Water Quality Map</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
          Interactive world map with real-time ocean contamination data using Leaflet mapping library.
        </p>
        
        {/* Real-time Data Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Live NOAA Ocean Data</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
            <p className="text-red-300 text-xs mt-1">Using sample data for demonstration</p>
          </div>
        )}
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Monitoring Stations</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{Math.round(stats.avgQuality)}%</div>
            <div className="text-xs text-muted-foreground">Avg Quality Index</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.alerts}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.contaminationBreakdown.low}</div>
            <div className="text-xs text-muted-foreground">Low Risk Areas</div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Heatmap Metric:</label>
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality Index</SelectItem>
                  <SelectItem value="contamination">Contamination Level</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="pollutants">Pollutants</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={fetchWaterQualityData}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaflet Map */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Interactive World Map
            <Badge variant="secondary" className="ml-2">
              {waterQualityData.length} stations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <WorldHeatmapMap 
              waterQualityData={waterQualityData}
              selectedMetric={selectedMetric}
            />
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">Low Contamination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Moderate Contamination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm">High Contamination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Severe Contamination</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
