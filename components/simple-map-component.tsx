"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import { Badge } from "@/components/ui/badge"

interface WaterQualityPoint {
  region: string
  quality: number
  level: string
  lat: number
  lng: number
}

interface SimpleMapComponentProps {
  waterQualityData: WaterQualityPoint[]
}

export default function SimpleMapComponent({ waterQualityData }: SimpleMapComponentProps) {
  const getQualityColor = (level: string) => {
    switch (level) {
      case "Excellent":
        return "#10b981" // green
      case "Good":
        return "#3b82f6" // blue
      case "Moderate":
        return "#f59e0b" // yellow
      case "Poor":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
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
      {waterQualityData.map((point, index) => (
        <CircleMarker
          key={index}
          center={[point.lat, point.lng]}
          radius={Math.max(8, (point.quality / 100) * 20)}
          pathOptions={{
            color: getQualityColor(point.level),
            fillColor: getQualityColor(point.level),
            fillOpacity: 0.7,
            weight: 2,
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-2">{point.region}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Quality Index:</span>
                  <span className="font-bold">{point.quality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Level:</span>
                  <Badge 
                    style={{ 
                      backgroundColor: getQualityColor(point.level),
                      color: 'white'
                    }}
                  >
                    {point.level}
                  </Badge>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
