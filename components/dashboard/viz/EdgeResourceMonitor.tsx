'use client'

import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const timeline = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}:00`,
  cpu: Math.round(30 + Math.random() * 50),
  gpu: Math.round(25 + Math.random() * 60),
  vram: Math.round(2 + Math.random() * 8),
  power: Math.round(40 + Math.random() * 40),
}))

export default function EdgeResourceMonitor() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timeline} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="t" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          <Legend />
          <Line type="monotone" dataKey="cpu" stroke="#60a5fa" name="CPU %" dot={false} />
          <Line type="monotone" dataKey="gpu" stroke="#f472b6" name="GPU %" dot={false} />
          <Line type="monotone" dataKey="vram" stroke="#a78bfa" name="VRAM GB" dot={false} />
          <Line type="monotone" dataKey="power" stroke="#34d399" name="Power W" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


