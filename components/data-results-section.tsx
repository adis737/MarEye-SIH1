"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Droplets, MapPin, Globe } from "lucide-react"
import dynamic from "next/dynamic"

// Simple fallback map component
const SimpleMap = ({ waterQualityData }: any) => (
  <div className="h-80 w-full rounded-lg bg-gradient-to-br from-blue-900 to-blue-950 relative overflow-hidden">
    {/* Ocean Background */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950"></div>
    
    {/* Data points */}
    <div className="absolute inset-0 p-4">
      {waterQualityData.map((point: any, index: number) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{
            left: `${((point.lng + 180) / 360) * 100}%`,
            top: `${((90 - point.lat) / 180) * 100}%`,
          }}
        >
          <div
            className={`w-5 h-5 rounded-full ${
              point.level === 'Excellent' ? 'bg-green-500' :
              point.level === 'Good' ? 'bg-blue-500' :
              point.level === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
            } animate-pulse border-2 border-white shadow-lg group-hover:scale-125 transition-transform`}
          >
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="font-medium">{point.region}</div>
              <div>Quality: {point.quality}%</div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Legend */}
    <div className="absolute bottom-2 left-2 bg-black/80 rounded-lg p-2">
      <div className="text-white text-xs font-medium mb-1">Water Quality</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-white text-xs">Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-white text-xs">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-white text-xs">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-white text-xs">Poor</span>
        </div>
      </div>
    </div>
  </div>
)

export function DataResultsSection() {
  const waterQualityData = [
    { region: "Monterey Bay", quality: 78, level: "Good", lat: 36.7783, lng: -119.4179 },
    { region: "Florida Straits", quality: 52, level: "Moderate", lat: 25.7617, lng: -80.1918 },
    { region: "Mariana Trench", quality: 85, level: "Excellent", lat: 11.3733, lng: 142.5917 },
    { region: "Mid-Atlantic Ridge", quality: 45, level: "Poor", lat: 0, lng: -25 },
  ]

  const getQualityColor = (level: string) => {
    switch (level) {
      case "Excellent":
        return "bg-green-500"
      case "Good":
        return "bg-blue-500"
      case "Moderate":
        return "bg-yellow-500"
      case "Poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <section id="data" className="py-20 bg-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Data & Results</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Real-time monitoring data from deep ocean research stations worldwide, providing insights into marine
            biodiversity and ecosystem health.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Water Quality Map */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Global Water Quality Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple Map */}
              <div className="h-80 w-full rounded-lg overflow-hidden border border-cyan-400/20">
                <SimpleMap waterQualityData={waterQualityData} />
              </div>

              {/* Water Quality Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">65</div>
                  <div className="text-sm text-muted-foreground">Avg Quality Index</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">24</div>
                  <div className="text-sm text-muted-foreground">Monitoring Stations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research Statistics */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Research Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Research Contamination Map */}
                <div className="relative bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg h-48 overflow-hidden border border-cyan-400/20 mb-6">
                  {/* World Map Background */}
                  <div className="absolute inset-0">
                    {/* Ocean Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950"></div>
                    
                    {/* Simplified World Map SVG */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 1000 500"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Continents - Simplified World Map */}
                      <path d="M 100 150 Q 200 140 300 150 Q 400 160 500 150 L 500 200 Q 400 210 300 200 Q 200 190 100 200 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 200 250 Q 300 240 400 250 Q 500 260 600 250 L 600 350 Q 500 360 400 350 Q 300 340 200 350 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 450 120 Q 550 110 650 120 Q 750 130 850 120 L 850 180 Q 750 190 650 180 Q 550 170 450 180 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 500 200 Q 600 190 700 200 Q 800 210 900 200 L 900 350 Q 800 360 700 350 Q 600 340 500 350 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 750 300 Q 850 290 950 300 L 950 350 Q 850 360 750 350 Z" fill="#2d5a27" opacity="0.5" />
                    </svg>
                  </div>
                  
                  {/* Animated Research Points */}
                  <div className="absolute inset-0 p-4">
                    {[
                      { region: "Pacific Research", lat: 36.7783, lng: -119.4179, discoveries: 45, contamination: "low" },
                      { region: "Atlantic Research", lat: 25.7617, lng: -80.1918, discoveries: 32, contamination: "moderate" },
                      { region: "Indian Research", lat: -33.9249, lng: 18.4241, discoveries: 28, contamination: "low" },
                      { region: "Arctic Research", lat: 60.4720, lng: 8.4689, discoveries: 51, contamination: "low" },
                    ].map((point, index) => (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{
                          left: `${((point.lng + 180) / 360) * 100}%`,
                          top: `${((90 - point.lat) / 180) * 100}%`,
                        }}
                      >
                        {/* Research Discovery Heatmap */}
                        <div 
                          className="absolute -inset-3 rounded-full opacity-40 animate-pulse"
                          style={{
                            backgroundColor: point.contamination === 'low' ? '#10b981' : '#f59e0b',
                            filter: 'blur(6px)'
                          }}
                        ></div>
                        
                        {/* Research Point */}
                        <div className={`w-5 h-5 rounded-full ${point.contamination === 'low' ? 'bg-green-500' : 'bg-yellow-500'} border-2 border-white shadow-lg group-hover:scale-125 transition-transform relative z-10`}>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="font-medium">{point.region}</div>
                            <div>Discoveries: {point.discoveries}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Research Legend */}
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 border border-cyan-400/20">
                    <div className="text-white text-xs font-medium mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Research Stations
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">Low Contamination</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">Moderate Contamination</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">2,847</div>
                    <div className="text-sm text-muted-foreground">Species Catalogued</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">156</div>
                    <div className="text-sm text-muted-foreground">New Discoveries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chart-2">89%</div>
                    <div className="text-sm text-muted-foreground">AI Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chart-4">12.5K</div>
                    <div className="text-sm text-muted-foreground">Samples Analyzed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Conservation Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Conservation Alerts Contamination Map */}
                <div className="relative bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg h-48 overflow-hidden border border-cyan-400/20 mb-6">
                  {/* World Map Background */}
                  <div className="absolute inset-0">
                    {/* Ocean Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950"></div>
                    
                    {/* Simplified World Map SVG */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 1000 500"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Continents - Simplified World Map */}
                      <path d="M 100 150 Q 200 140 300 150 Q 400 160 500 150 L 500 200 Q 400 210 300 200 Q 200 190 100 200 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 200 250 Q 300 240 400 250 Q 500 260 600 250 L 600 350 Q 500 360 400 350 Q 300 340 200 350 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 450 120 Q 550 110 650 120 Q 750 130 850 120 L 850 180 Q 750 190 650 180 Q 550 170 450 180 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 500 200 Q 600 190 700 200 Q 800 210 900 200 L 900 350 Q 800 360 700 350 Q 600 340 500 350 Z" fill="#2d5a27" opacity="0.5" />
                      <path d="M 750 300 Q 850 290 950 300 L 950 350 Q 850 360 750 350 Z" fill="#2d5a27" opacity="0.5" />
                    </svg>
                  </div>
                  
                  {/* Animated Alert Points */}
                  <div className="absolute inset-0 p-4">
                    {[
                      { region: "North Pacific", lat: 36.7783, lng: -119.4179, alert: "Microplastic Increase", severity: "high", contamination: "severe" },
                      { region: "Atlantic Ridge", lat: 0, lng: -25, alert: "Species Migration", severity: "moderate", contamination: "moderate" },
                      { region: "Mariana Trench", lat: 11.3733, lng: 142.5917, alert: "New Discovery", severity: "low", contamination: "low" },
                    ].map((point, index) => (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{
                          left: `${((point.lng + 180) / 360) * 100}%`,
                          top: `${((90 - point.lat) / 180) * 100}%`,
                        }}
                      >
                        {/* Alert Heatmap */}
                        <div 
                          className="absolute -inset-4 rounded-full opacity-50 animate-pulse"
                          style={{
                            backgroundColor: point.severity === 'high' ? '#ef4444' : point.severity === 'moderate' ? '#f59e0b' : '#10b981',
                            filter: 'blur(8px)'
                          }}
                        ></div>
                        
                        {/* Alert Point */}
                        <div className={`w-6 h-6 rounded-full ${point.severity === 'high' ? 'bg-red-500' : point.severity === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'} border-2 border-white shadow-lg group-hover:scale-125 transition-transform relative z-10`}>
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="font-medium">{point.region}</div>
                            <div>{point.alert}</div>
                            <div>Severity: {point.severity}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Alert Legend */}
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 border border-cyan-400/20">
                    <div className="text-white text-xs font-medium mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Alert Levels
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">High Priority</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">Monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">Research</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-card-foreground">Microplastic Increase</div>
                      <div className="text-sm text-muted-foreground">
                        North Pacific deep waters showing 40% increase
                      </div>
                      <Badge variant="destructive" className="mt-1">
                        High Priority
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-card-foreground">Species Migration</div>
                      <div className="text-sm text-muted-foreground">Unusual migration patterns in Atlantic ridge</div>
                      <Badge variant="secondary" className="mt-1">
                        Monitoring
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-card-foreground">New Species Discovery</div>
                      <div className="text-sm text-muted-foreground">Potential new cephalopod species identified</div>
                      <Badge className="mt-1 bg-primary text-primary-foreground">Research</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
