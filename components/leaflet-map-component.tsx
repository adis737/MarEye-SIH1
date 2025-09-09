"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import { Badge } from "@/components/ui/badge"

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

interface LeafletMapComponentProps {
  waterQualityData: WaterQualityPoint[]
  selectedMetric: "quality" | "contamination" | "temperature" | "pollutants"
}

export default function LeafletMapComponent({ waterQualityData, selectedMetric }: LeafletMapComponentProps) {
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

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Water Quality Points */}
      {waterQualityData.map((point) => (
        <CircleMarker
          key={point._id}
          center={[point.location.latitude, point.location.longitude]}
          radius={getCircleRadius(point)}
          pathOptions={{
            color: getContaminationColor(point.contaminationLevel),
            fillColor: getContaminationColor(point.contaminationLevel),
            fillOpacity: 0.7,
            weight: 2,
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-2">{point.location.region}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Quality Index:</span>
                  <span className="font-bold">{point.qualityIndex}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contamination:</span>
                  <Badge 
                    style={{ 
                      backgroundColor: getContaminationColor(point.contaminationLevel),
                      color: 'white'
                    }}
                  >
                    {point.contaminationLevel}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Temperature:</span>
                  <span>{point.measurements.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Depth:</span>
                  <span>{point.location.depth}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Microplastics:</span>
                  <span>{point.measurements.pollutants.microplastics.toFixed(1)} p/m³</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(point.samplingDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
