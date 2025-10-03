'use client'

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { turbidity: 'Low', mAP: 0.82 },
  { turbidity: 'Med', mAP: 0.76 },
  { turbidity: 'High', mAP: 0.63 },
]

export default function DetectionPerformanceChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="turbidity" stroke="#cbd5e1" />
          <YAxis domain={[0, 1]} stroke="#cbd5e1" />
          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          <Legend />
          <Line type="monotone" dataKey="mAP" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


