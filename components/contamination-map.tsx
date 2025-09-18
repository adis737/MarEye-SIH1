"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Waves, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface ContaminationData {
  id: string
  source?: string
  location: {
    name: string
    coordinates: [number, number]
    region?: string
  }
  contaminationLevel: "low" | "moderate" | "high" | "severe"
  pollutants: string[]
  lastUpdated: string
  qualityIndex: number
  temperature?: number
  salinity?: number
  ph?: number
  dissolvedOxygen?: number
  turbidity?: number
  chlorophyll?: number
  microplastics?: number
  samplingDate?: Date
}

export function ContaminationMap() {
  const [contaminationData, setContaminationData] = useState<ContaminationData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLive, setIsLive] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [dataSource, setDataSource] = useState<string>('Loading...')

  useEffect(() => {
    setMounted(true)
    fetchContaminationData()
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      if (isLive) {
        fetchContaminationData()
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [isLive])

  const fetchContaminationData = async () => {
    try {
      console.log("Fetching real-time ocean monitoring data...")
      
      // Try real-time API first
      const realTimeResponse = await fetch("/api/real-coean-data")
      console.log("Real-time API response status:", realTimeResponse.status)
      
      if (realTimeResponse.ok) {
        const realTimeData = await realTimeResponse.json()
        console.log("Real-time data received:", realTimeData)
        console.log("Data length:", realTimeData.data?.length)
        
        if (realTimeData.success && realTimeData.data && realTimeData.data.length > 0) {
          console.log("Setting contamination data:", realTimeData.data)
          setContaminationData(realTimeData.data)
          setDataSource(realTimeData.sources?.join(', ') || 'Real-time APIs')
          setLastUpdate(new Date())
          setLoading(false)
          return
        } else {
          console.log("Real-time data is empty or invalid, falling back...")
        }
      } else {
        console.log("Real-time API failed with status:", realTimeResponse.status)
      }
      
      // Fallback to database API
      console.log("Falling back to database API...")
      const response = await fetch("/api/water-quality?limit=20")
      console.log("Database API Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Database API Data received:", data)
        const rawData = data.data || []
        console.log("Raw data length:", rawData.length)
        
        // Use the data as-is to avoid hydration mismatches
        const dynamicData = rawData.map((point: any) => ({
          ...point,
          lastUpdated: new Date().toISOString()
        }))
        
        console.log("Setting database contamination data:", dynamicData)
        setContaminationData(dynamicData)
        setDataSource('MongoDB Database')
        setLastUpdate(new Date())
        setLoading(false)
      } else {
        console.log("Database API failed, using mock data")
        // Use mock data if API fails
        const mockData = getMockContaminationData()
        console.log("Using mock data:", mockData)
        setContaminationData(mockData)
        setDataSource('Mock Data (Offline)')
        setLoading(false)
      }
    } catch (error) {
      console.error("Failed to fetch contamination data, using mock data:", error)
      // Use mock data if API fails
      const mockData = getMockContaminationData()
      console.log("Using error fallback mock data:", mockData)
      setContaminationData(mockData)
      setDataSource('Mock Data (Error)')
    } finally {
      setLoading(false)
    }
  }

  const getMockContaminationData = (): ContaminationData[] => [
    {
      id: 'pacific-001',
      location: {
        name: 'North Pacific Gyre',
        coordinates: [32.0, -145.0]
      },
      contaminationLevel: 'high',
      pollutants: ['Microplastics', 'Heavy Metals', 'Oil Residue'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 35
    },
    {
      id: 'pacific-002',
      location: {
        name: 'Great Barrier Reef',
        coordinates: [-18.0, 147.0]
      },
      contaminationLevel: 'moderate',
      pollutants: ['Agricultural Runoff', 'Sediment'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 65
    },
    {
      id: 'pacific-003',
      location: {
        name: 'Hawaiian Waters',
        coordinates: [21.0, -157.0]
      },
      contaminationLevel: 'low',
      pollutants: ['Minimal Contamination'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 85
    },
    {
      id: 'pacific-004',
      location: {
        name: 'Tokyo Bay',
        coordinates: [35.5, 139.8]
      },
      contaminationLevel: 'severe',
      pollutants: ['Industrial Waste', 'Heavy Metals', 'Sewage'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 15
    },
    {
      id: 'atlantic-001',
      location: {
        name: 'Gulf of Mexico',
        coordinates: [28.0, -90.0]
      },
      contaminationLevel: 'high',
      pollutants: ['Oil Spill Residue', 'Agricultural Runoff'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 40
    },
    {
      id: 'atlantic-002',
      location: {
        name: 'North Sea',
        coordinates: [56.0, 3.0]
      },
      contaminationLevel: 'moderate',
      pollutants: ['Industrial Discharge', 'Agricultural Runoff'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 60
    },
    {
      id: 'atlantic-003',
      location: {
        name: 'Caribbean Sea',
        coordinates: [15.0, -75.0]
      },
      contaminationLevel: 'low',
      pollutants: ['Minimal Contamination'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 80
    },
    {
      id: 'atlantic-004',
      location: {
        name: 'Baltic Sea',
        coordinates: [58.0, 20.0]
      },
      contaminationLevel: 'severe',
      pollutants: ['Eutrophication', 'Heavy Metals', 'Industrial Waste'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 25
    },
    {
      id: 'indian-001',
      location: {
        name: 'Bay of Bengal',
        coordinates: [15.0, 88.0]
      },
      contaminationLevel: 'high',
      pollutants: ['Agricultural Runoff', 'Industrial Waste'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 45
    },
    {
      id: 'indian-002',
      location: {
        name: 'Maldives Waters',
        coordinates: [3.0, 73.0]
      },
      contaminationLevel: 'low',
      pollutants: ['Minimal Contamination'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 90
    },
    {
      id: 'mediterranean-001',
      location: {
        name: 'Mediterranean Sea',
        coordinates: [36.0, 15.0]
      },
      contaminationLevel: 'moderate',
      pollutants: ['Urban Runoff', 'Industrial Discharge'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 55
    },
    {
      id: 'arctic-001',
      location: {
        name: 'Arctic Ocean',
        coordinates: [80.0, 0.0]
      },
      contaminationLevel: 'low',
      pollutants: ['Minimal Contamination'],
      lastUpdated: new Date().toISOString(),
      qualityIndex: 88
    }
  ]

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

  // Convert lat/lng coordinates to map positions
  const getMapPosition = (coordinates: [number, number]) => {
    const [lat, lng] = coordinates
    
    // Convert latitude to Y position (0-100%)
    const y = ((90 - lat) / 180) * 100
    
    // Convert longitude to X position (0-100%)
    const x = ((lng + 180) / 360) * 100
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  if (!mounted || loading) {
    return (
      <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-900/40 to-blue-900/40 border border-cyan-400/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Waves className="h-5 w-5 text-cyan-400" />
              Global Contamination Map
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-cyan-300">
                  {isLive ? 'Live' : 'Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsLive(!isLive)}
                className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                {isLive ? 'Pause' : 'Resume'}
              </button>
              <div className="text-xs text-cyan-300">
                Last update: {mounted ? lastUpdate.toLocaleTimeString() : 'Loading...'}
              </div>
            </div>
          </div>
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
          {/* World Map Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-800/40 to-blue-950/60"></div>
          
          {/* Simplified World Map Continents */}
          <div className="absolute inset-0 opacity-20">
            {/* North America */}
            <div className="absolute w-16 h-20 bg-green-600/30 rounded-lg" style={{left: '15%', top: '25%'}}></div>
            {/* South America */}
            <div className="absolute w-12 h-24 bg-green-600/30 rounded-lg" style={{left: '20%', top: '45%'}}></div>
            {/* Europe */}
            <div className="absolute w-8 h-12 bg-green-600/30 rounded-lg" style={{left: '45%', top: '20%'}}></div>
            {/* Africa */}
            <div className="absolute w-10 h-20 bg-green-600/30 rounded-lg" style={{left: '48%', top: '35%'}}></div>
            {/* Asia */}
            <div className="absolute w-20 h-16 bg-green-600/30 rounded-lg" style={{left: '55%', top: '15%'}}></div>
            {/* Australia */}
            <div className="absolute w-12 h-8 bg-green-600/30 rounded-lg" style={{left: '70%', top: '60%'}}></div>
            {/* Antarctica */}
            <div className="absolute w-32 h-6 bg-white/20 rounded-lg" style={{left: '20%', top: '85%'}}></div>
          </div>

          {/* Grid Lines for Map Reference */}
          <div className="absolute inset-0 opacity-10">
            {/* Latitude lines */}
            <div className="absolute w-full h-px bg-white/30" style={{top: '20%'}}></div>
            <div className="absolute w-full h-px bg-white/30" style={{top: '40%'}}></div>
            <div className="absolute w-full h-px bg-white/30" style={{top: '60%'}}></div>
            <div className="absolute w-full h-px bg-white/30" style={{top: '80%'}}></div>
            {/* Longitude lines */}
            <div className="absolute h-full w-px bg-white/30" style={{left: '25%'}}></div>
            <div className="absolute h-full w-px bg-white/30" style={{left: '50%'}}></div>
            <div className="absolute h-full w-px bg-white/30" style={{left: '75%'}}></div>
          </div>

          {/* Ocean Current Lines */}
          <div className="absolute inset-0 opacity-20">
            {/* Gulf Stream */}
            <div className="absolute w-32 h-px bg-cyan-300/40" style={{left: '20%', top: '30%', transform: 'rotate(15deg)'}}></div>
            {/* North Atlantic Current */}
            <div className="absolute w-24 h-px bg-cyan-300/40" style={{left: '35%', top: '25%', transform: 'rotate(45deg)'}}></div>
            {/* Pacific Current */}
            <div className="absolute w-40 h-px bg-cyan-300/40" style={{left: '10%', top: '40%', transform: 'rotate(-10deg)'}}></div>
            {/* Indian Ocean Current */}
            <div className="absolute w-28 h-px bg-cyan-300/40" style={{left: '60%', top: '45%', transform: 'rotate(25deg)'}}></div>
          </div>

          {/* Animated Water Waves */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/5 to-transparent animate-pulse delay-1000"></div>
          </div>

          {/* Real-time data indicator */}
          {isLive && (
            <div className="absolute top-4 right-4 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              Live Data
            </div>
          )}

          {/* Data source indicator */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 border border-cyan-400/20">
            <div className="text-xs text-cyan-300 font-medium">Data Source</div>
            <div className="text-xs text-white">{dataSource}</div>
          </div>

          {/* Map Labels */}
          <div className="absolute inset-0 text-xs text-white/60 pointer-events-none">
            <div className="absolute" style={{left: '15%', top: '25%'}}>North America</div>
            <div className="absolute" style={{left: '20%', top: '50%'}}>South America</div>
            <div className="absolute" style={{left: '45%', top: '20%'}}>Europe</div>
            <div className="absolute" style={{left: '48%', top: '40%'}}>Africa</div>
            <div className="absolute" style={{left: '60%', top: '15%'}}>Asia</div>
            <div className="absolute" style={{left: '70%', top: '65%'}}>Australia</div>
          </div>

          {/* Contamination Points */}
          <div className="absolute inset-0 p-4">
            {(() => {
              console.log("Rendering contamination points:", contaminationData.length, contaminationData)
              return contaminationData.map((point) => {
                const position = getMapPosition(point.location.coordinates)
                console.log(`Rendering point ${point.id} at position:`, position)
              return (
                <div
                  key={point.id}
                  className={`absolute cursor-pointer transform transition-all duration-500 hover:scale-125 ${getContaminationColor(point.contaminationLevel)} rounded-full p-3 border-2 backdrop-blur-sm shadow-lg`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setSelectedRegion(selectedRegion === point.id ? null : point.id)}
                  title={`${point.location.name} - ${point.contaminationLevel.toUpperCase()}\nSource: ${point.source || 'Unknown'}\nUpdated: ${new Date(point.lastUpdated).toLocaleTimeString()}`}
                >
                  {getContaminationIcon(point.contaminationLevel)}
                </div>
              )
            })
            })()}
          </div>

          {/* Compass */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 border border-cyan-400/20">
            <div className="text-xs text-white font-medium mb-1">N</div>
            <div className="w-8 h-8 border border-cyan-400/40 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-cyan-400"></div>
            </div>
          </div>

          {/* Scale Indicator */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 border border-cyan-400/20">
            <div className="text-xs text-white font-medium mb-1">Scale</div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-px bg-cyan-400"></div>
              <span className="text-xs text-cyan-300">1000km</span>
            </div>
          </div>

          {/* Region Details Popup */}
          {selectedRegion && (() => {
            const region = contaminationData.find((d) => d.id === selectedRegion)
            if (!region) return null
            
            return (
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-lg p-4 border border-cyan-400/20 max-w-sm z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{region.location.name}</h3>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300">Data Source:</span>
                    <span className="text-white text-xs bg-blue-500/20 px-2 py-1 rounded">
                      {region.source || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300">Quality Index:</span>
                    <span className="text-white">{region.qualityIndex}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300">Level:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getContaminationColor(region.contaminationLevel)}`}>
                      {region.contaminationLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300">Pollutants:</span>
                    <div className="flex flex-wrap gap-1">
                      {region.pollutants.map((pollutant, index) => (
                        <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                          {pollutant}
                        </span>
                      ))}
                    </div>
                  </div>
                  {region.temperature && (
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300">Temperature:</span>
                      <span className="text-white">{region.temperature.toFixed(1)}°C</span>
                    </div>
                  )}
                  {region.salinity && (
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300">Salinity:</span>
                      <span className="text-white">{region.salinity.toFixed(1)} PSU</span>
                    </div>
                  )}
                  {region.microplastics && (
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300">Microplastics:</span>
                      <span className="text-white">{region.microplastics} particles/m³</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300">Last Updated:</span>
                    <span className="text-white">{new Date(region.lastUpdated).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })()}

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
          {(() => {
            const stats = [
              { level: "low", count: contaminationData.filter((d) => d.contaminationLevel === "low").length },
              { level: "moderate", count: contaminationData.filter((d) => d.contaminationLevel === "moderate").length },
              { level: "high", count: contaminationData.filter((d) => d.contaminationLevel === "high").length },
              { level: "severe", count: contaminationData.filter((d) => d.contaminationLevel === "severe").length },
            ]
            console.log("Statistics summary:", stats, "Total data points:", contaminationData.length)
            return stats
          })().map(({ level, count }) => (
            <div key={level} className={`p-3 rounded-lg ${getContaminationColor(level)} backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-1">
                {getContaminationIcon(level)}
                <span className="text-white text-xs font-medium capitalize">{level}</span>
                {isLive && (
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-white text-lg font-bold">{count}</div>
              <div className="text-white/60 text-xs">
                {contaminationData.length > 0 ? `${Math.round((count / contaminationData.length) * 100)}%` : '0%'} of total
              </div>
            </div>
          ))}
        </div>

        {/* Real-time status */}
        <div className="mt-4 p-3 bg-slate-900/60 backdrop-blur-md rounded-lg border border-cyan-400/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-cyan-300">
                {isLive ? 'Real-time monitoring active' : 'Monitoring paused'}
              </span>
            </div>
            <div className="text-cyan-300">
              {contaminationData.length} monitoring points
            </div>
            <div className="text-cyan-300">
              Next update: {isLive ? '10s' : 'Paused'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
