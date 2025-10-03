'use client'

import EdgeResourceMonitor from '../viz/EdgeResourceMonitor'
import LatencyHistogram from '../viz/LatencyHistogram'
import AccuracySpeedPareto from '../viz/AccuracySpeedPareto'

export default function SystemHealthTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
        <div className="px-1 pb-2 text-white font-medium">Edge Resource Monitor</div>
        <EdgeResourceMonitor />
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
        <div className="px-1 pb-2 text-white font-medium">Latency Distribution</div>
        <LatencyHistogram />
      </div>

      <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-3">
        <div className="px-1 pb-2 text-white font-medium">Accuracy vs Speed Trade-off</div>
        <AccuracySpeedPareto />
      </div>
    </div>
  )
}


