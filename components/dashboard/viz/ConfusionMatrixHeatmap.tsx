'use client'

import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip } from 'recharts'

// We'll emulate a heatmap using bubble sizes and colors
const labels = ['Mine', 'ROV', 'Unknown']
const raw = [
  // true, pred, value
  { x: 0, y: 0, v: 85 },
  { x: 0, y: 1, v: 10 },
  { x: 0, y: 2, v: 5 },
  { x: 1, y: 0, v: 8 },
  { x: 1, y: 1, v: 86 },
  { x: 1, y: 2, v: 6 },
  { x: 2, y: 0, v: 12 },
  { x: 2, y: 1, v: 9 },
  { x: 2, y: 2, v: 79 },
]

const data = raw.map((d) => ({ x: d.x, y: d.y, v: d.v, size: d.v }))

export default function ConfusionMatrixHeatmap() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 30 }}>
          <XAxis type="number" dataKey="x" domain={[0, 2]} tickFormatter={(v) => labels[v]} stroke="#cbd5e1" ticks={[0, 1, 2]} />
          <YAxis type="number" dataKey="y" domain={[0, 2]} tickFormatter={(v) => labels[v]} stroke="#cbd5e1" ticks={[0, 1, 2]} />
          <ZAxis type="number" dataKey="size" range={[50, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
            if (!payload || payload.length === 0) return null
            const p = payload[0].payload as any
            return (
              <div style={{ background: 'rgba(0,0,0,0.8)', padding: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <div>True: {labels[p.y]}</div>
                <div>Pred: {labels[p.x]}</div>
                <div>Count: {p.v}</div>
              </div>
            )
          }} />
          <Scatter data={data} fill="#60a5fa" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}


