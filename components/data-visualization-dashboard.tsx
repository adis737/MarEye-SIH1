"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Fish, Waves, MapPin, Activity, RefreshCw } from "lucide-react"

interface BiodiversityData {
  id: string
  location: string
  date: string
  speciesCount: number
  threatLevel: "low" | "medium" | "high" | "critical"
  waterQuality: number
  temperature: number
  depth: number
  coordinates: [number, number]
}

interface SpeciesDistribution {
  species: string
  count: number
  conservationStatus: string
  percentage: number
}

interface TrendData {
  month: string
  speciesCount: number
  threatLevel: number
  waterQuality: number
}

export function DataVisualizationDashboard() {
  const [biodiversityData, setBiodiversityData] = useState<BiodiversityData[]>([])
  const [speciesDistribution, setSpeciesDistribution] = useState<SpeciesDistribution[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("6months")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [selectedRegion, selectedTimeframe])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dashboard-data?region=${selectedRegion}&timeframe=${selectedTimeframe}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
      }

      const data = await response.json()
      setBiodiversityData(data.biodiversityData)
      setSpeciesDistribution(data.speciesDistribution)
      setTrendData(data.trendData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "#10b981"
      case "medium":
        return "#f59e0b"
      case "high":
        return "#ef4444"
      case "critical":
        return "#dc2626"
      default:
        return "#6b7280"
    }
  }

  const getConservationStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "critically endangered":
        return "#dc2626"
      case "endangered":
        return "#ef4444"
      case "vulnerable":
        return "#f59e0b"
      case "near threatened":
        return "#eab308"
      case "least concern":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const calculateStats = () => {
    if (!biodiversityData.length) return { totalSpecies: 0, avgWaterQuality: 0, criticalAreas: 0, trend: 0 }

    const totalSpecies = biodiversityData.reduce((sum, item) => sum + item.speciesCount, 0)
    const avgWaterQuality = biodiversityData.reduce((sum, item) => sum + item.waterQuality, 0) / biodiversityData.length
    const criticalAreas = biodiversityData.filter(
      (item) => item.threatLevel === "critical" || item.threatLevel === "high",
    ).length

    const recentData = trendData.slice(-2)
    const trend =
      recentData.length === 2
        ? ((recentData[1].speciesCount - recentData[0].speciesCount) / recentData[0].speciesCount) * 100
        : 0

    return { totalSpecies, avgWaterQuality, criticalAreas, trend }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Biodiversity Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights into marine ecosystem health</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="pacific">Pacific Ocean</SelectItem>
              <SelectItem value="atlantic">Atlantic Ocean</SelectItem>
              <SelectItem value="indian">Indian Ocean</SelectItem>
              <SelectItem value="arctic">Arctic Ocean</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Species</p>
                <p className="text-2xl font-bold">{stats.totalSpecies.toLocaleString()}</p>
              </div>
              <Fish className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Water Quality</p>
                <p className="text-2xl font-bold">{stats.avgWaterQuality.toFixed(1)}</p>
              </div>
              <Waves className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Areas</p>
                <p className="text-2xl font-bold">{stats.criticalAreas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Biodiversity Trend</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {stats.trend > 0 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  {Math.abs(stats.trend).toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Count Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Species Count Trends</CardTitle>
            <CardDescription>Monthly biodiversity changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="speciesCount" stroke="#3b82f6" strokeWidth={2} name="Species Count" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Water Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Water Quality vs Threat Level</CardTitle>
            <CardDescription>Correlation between water quality and ecosystem threats</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={biodiversityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="waterQuality" name="Water Quality" />
                <YAxis dataKey="speciesCount" name="Species Count" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter dataKey="speciesCount" fill="#10b981" name="Monitoring Stations" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Species Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Species Distribution</CardTitle>
            <CardDescription>Top species by population count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speciesDistribution.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="species" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Population Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conservation Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Conservation Status</CardTitle>
            <CardDescription>Species distribution by conservation status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={speciesDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="percentage"
                  nameKey="conservationStatus"
                >
                  {speciesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getConservationStatusColor(entry.conservationStatus)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Parameters</CardTitle>
          <CardDescription>Water quality and threat level trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="waterQuality"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Water Quality"
              />
              <Area
                type="monotone"
                dataKey="threatLevel"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Threat Level"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Monitoring Stations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recent Monitoring Data
          </CardTitle>
          <CardDescription>Latest data from monitoring stations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {biodiversityData.slice(0, 5).map((station) => (
              <div key={station.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{station.location}</h4>
                    <Badge style={{ backgroundColor: getThreatLevelColor(station.threatLevel) }} className="text-white">
                      {station.threatLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {station.speciesCount} species • {station.waterQuality} water quality • {station.depth}m depth
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{new Date(station.date).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {station.coordinates[0].toFixed(2)}, {station.coordinates[1].toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
