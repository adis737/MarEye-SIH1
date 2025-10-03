'use client'

import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const models = [
  { name: 'v1.0', mAP: 0.68, latency: 45 },
  { name: 'v1.1', mAP: 0.71, latency: 52 },
  { name: 'v2.0', mAP: 0.78, latency: 63 },
  { name: 'v2.1', mAP: 0.81, latency: 72 },
  { name: 'edge-lite', mAP: 0.65, latency: 28 },
  { name: 'edge-pro', mAP: 0.74, latency: 38 },
]

export default function AccuracySpeedPareto() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <XAxis type="number" dataKey="latency" name="Latency" unit="ms" stroke="#cbd5e1" />
          <YAxis type="number" dataKey="mAP" name="mAP" domain={[0.5, 0.9]} stroke="#cbd5e1" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
            if (!payload || payload.length === 0) return null
            const p = payload[0].payload as any
            return (
              <div style={{ background: 'rgba(0,0,0,0.8)', padding: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <div>Model: {p.name}</div>
                <div>mAP: {p.mAP}</div>
                <div>Latency: {p.latency} ms</div>
              </div>
            )
          }} />
          <Legend />
          <Scatter name="Models" data={models} fill="#ef4444" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}


