'use client'

import { useMemo, useState } from 'react'
import DetectionPerformanceChart from '../viz/DetectionPerformanceChart'
import ConfusionMatrixHeatmap from '../viz/ConfusionMatrixHeatmap'
import EnhancementImpactScatter from '../viz/EnhancementImpactScatter'

export default function AnalyticsTab() {
  const [missionId, setMissionId] = useState('M-042')
  const [turbidity, setTurbidity] = useState('All')
  const [dateRange, setDateRange] = useState('Last 7 days')

  const options = useMemo(() => ({
    missions: ['M-042', 'M-041', 'M-040'],
    turbidities: ['All', 'Low', 'Medium', 'High'],
    ranges: ['Last 24h', 'Last 7 days', 'Last 30 days'],
  }), [])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60 mb-1">Mission ID</div>
          <select value={missionId} onChange={(e) => setMissionId(e.target.value)} className="w-full bg-black/30 text-white text-sm rounded p-2 border border-white/10">
            {options.missions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60 mb-1">Date Range</div>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full bg.black/30 text-white text-sm rounded p-2 border border-white/10">
            {options.ranges.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60 mb-1">Turbidity Level</div>
          <select value={turbidity} onChange={(e) => setTurbidity(e.target.value)} className="w-full bg-black/30 text-white text-sm rounded p-2 border border-white/10">
            {options.turbidities.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="px-1 pb-2 text-white font-medium">Detection Performance (mAP vs Turbidity)</div>
          <DetectionPerformanceChart />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="px-1 pb-2 text-white font-medium">Confusion Matrix</div>
          <ConfusionMatrixHeatmap />
        </div>

        <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="px-1 pb-2 text-white font-medium">Enhancement Impact (UIQM vs Detection Confidence)</div>
          <EnhancementImpactScatter />
        </div>
      </div>
    </div>
  )
}


