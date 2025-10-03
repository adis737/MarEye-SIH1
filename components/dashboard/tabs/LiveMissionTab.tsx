'use client'

import { useMemo, useState } from 'react'

type ThreatItem = {
  id: string
  time: string
  type: string
  confidence: number
  thumb: string
}

function KpiCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">
        {value}
        <span className="ml-1 text-sm text-white/70">{unit}</span>
      </div>
    </div>
  )
}

function ComparisonSlider() {
  const [pos, setPos] = useState(50)

  return (
    <div className="relative w-full h-72 sm:h-[28rem] rounded-xl overflow-hidden bg-black/60">
      <img src="/cnn_output_1759499097364.png" alt="AI Enhanced" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ width: `${pos}%`, overflow: 'hidden' }}>
        <img src="/cnn_output_1759498990834.png" alt="Original" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0" style={{ left: `${pos}%` }}>
        <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-white/70" />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-x-4 bottom-4 w-[calc(100%-2rem)]"
      />
      {/* Example bounding boxes */}
      <div className="absolute border-2 border-red-400/80 rounded" style={{ top: '20%', left: '60%', width: '18%', height: '18%' }} />
      <div className="absolute border-2 border-yellow-400/80 rounded" style={{ top: '55%', left: '25%', width: '22%', height: '20%' }} />
    </div>
  )
}

export default function LiveMissionTab() {
  const threats: ThreatItem[] = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: `T-${1000 + i}`,
        time: new Date(Date.now() - i * 45000).toLocaleTimeString(),
        type: ['Mine', 'ROV', 'Unknown Object'][i % 3],
        confidence: Math.round(70 + Math.random() * 30),
        thumb: '/cnn_output_1759477421151.png',
      })),
    []
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
      {/* Left 70% */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-white/80 text-sm">Original vs AI-Enhanced</div>
          <div className="text-white/60 text-xs">Mission: M-042 | Camera: A1 | Live</div>
        </div>
        <ComparisonSlider />
      </div>

      {/* Right 30% */}
      <div className="lg:col-span-3 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="FPS" value={28} unit="fps" />
          <KpiCard label="Latency" value={86} unit="ms" />
          <KpiCard label="Power" value={72} unit="W" />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-white font-medium">Live Threat Log</div>
            <div className="text-xs text-white/60">Last 10 min</div>
          </div>
          <div className="max-h-[28rem] overflow-y-auto divide-y divide-white/5">
            {threats.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
                <img src={t.thumb} alt={t.type} className="w-14 h-10 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-white/90 text-sm">{t.type}</div>
                    <div className="text-white/50 text-xs">{t.time}</div>
                  </div>
                  <div className="text-xs text-emerald-400">Confidence: {t.confidence}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


