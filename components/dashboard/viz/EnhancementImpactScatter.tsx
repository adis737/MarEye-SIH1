'use client'

import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, Tooltip } from 'recharts'

const data = Array.from({ length: 40 }).map((_, i) => ({
  uiqm: Math.round(40 + Math.random() * 60),
  conf: Math.round(50 + Math.random() * 50),
}))

export default function EnhancementImpactScatter() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <XAxis type="number" dataKey="uiqm" name="UIQM" unit="" stroke="#cbd5e1" />
          <YAxis type="number" dataKey="conf" name="Confidence" unit="%" stroke="#cbd5e1" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          <Scatter name="Frames" data={data} fill="#34d399" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}


