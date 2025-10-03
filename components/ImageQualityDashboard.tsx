'use client'

import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

type FrameMetrics = {
  frame: number
  psnr: number
  ssim: number
  uiqm: number
}

type MetricKey = 'psnr' | 'ssim' | 'uiqm'

function KpiCard({ label, value, unit, accent }: { label: string; value: number; unit?: string; accent: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="text-white/70 text-xs">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">
        {value.toFixed(2)}
        {unit ? <span className="ml-1 text-sm text-white/70">{unit}</span> : null}
      </div>
      <div className={`mt-2 h-1.5 rounded-full ${accent}`} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <div className="text-[10px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-base font-semibold text-white">{value.toFixed(2)}</div>
    </div>
  )
}

export default function ImageQualityDashboard() {
  // Placeholder dataset: 180 frames (~6 seconds at 30 fps)
  const data: FrameMetrics[] = useMemo(() => {
    const arr: FrameMetrics[] = []
    let basePSNR = 22
    let baseSSIM = 0.78
    let baseUIQM = 45
    for (let i = 0; i < 180; i++) {
      // Simulate gradual improvement with small noise
      basePSNR += Math.sin(i / 14) * 0.12
      baseSSIM += Math.sin(i / 21) * 0.004
      baseUIQM += Math.sin(i / 18) * 0.25
      const noiseP = (Math.random() - 0.5) * 0.4
      const noiseS = (Math.random() - 0.5) * 0.01
      const noiseU = (Math.random() - 0.5) * 0.8
      arr.push({
        frame: i + 1,
        psnr: Math.max(10, Math.min(40, basePSNR + noiseP)),
        ssim: Math.max(0.4, Math.min(1, baseSSIM + noiseS)),
        uiqm: Math.max(20, Math.min(80, baseUIQM + noiseU)),
      })
    }
    return arr
  }, [])

  const [currentIndex, setCurrentIndex] = useState<number>(data.length - 1)
  const [visible, setVisible] = useState<Record<MetricKey, boolean>>({ psnr: true, ssim: true, uiqm: true })

  const current = data[currentIndex]

  const summary = useMemo(() => {
    const acc = {
      psnr: { min: Number.POSITIVE_INFINITY, max: 0, sum: 0 },
      ssim: { min: Number.POSITIVE_INFINITY, max: 0, sum: 0 },
      uiqm: { min: Number.POSITIVE_INFINITY, max: 0, sum: 0 },
    }
    for (const d of data) {
      acc.psnr.min = Math.min(acc.psnr.min, d.psnr)
      acc.psnr.max = Math.max(acc.psnr.max, d.psnr)
      acc.psnr.sum += d.psnr
      acc.ssim.min = Math.min(acc.ssim.min, d.ssim)
      acc.ssim.max = Math.max(acc.ssim.max, d.ssim)
      acc.ssim.sum += d.ssim
      acc.uiqm.min = Math.min(acc.uiqm.min, d.uiqm)
      acc.uiqm.max = Math.max(acc.uiqm.max, d.uiqm)
      acc.uiqm.sum += d.uiqm
    }
    const n = data.length
    return {
      psnr: { avg: acc.psnr.sum / n, min: acc.psnr.min, max: acc.psnr.max },
      ssim: { avg: acc.ssim.sum / n, min: acc.ssim.min, max: acc.ssim.max },
      uiqm: { avg: acc.uiqm.sum / n, min: acc.uiqm.min, max: acc.uiqm.max },
    }
  }, [data])

  return (
    <div className="w-full">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Left: Side-by-Side Viewer (60%) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white/80 text-sm">Side-by-Side Viewer</div>
            <div className="text-white/60 text-xs">Frame: {current.frame} / {data.length}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60">
              <div className="px-3 py-2 text-xs text-white/70 border-b border-white/10">Original</div>
              <div className="h-72 sm:h-[24rem] bg-black flex items-center justify-center">
                <img src="/cnn_output_1759498990834.png" alt="Original" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60">
              <div className="px-3 py-2 text-xs text-white/70 border-b border-white/10">AI-Enhanced</div>
              <div className="h-72 sm:h-[24rem] bg-black flex items-center justify-center">
                <img src="/cnn_output_1759499097364.png" alt="Enhanced" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Frame selector */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="min-w-[60px]">Frame</div>
              <input
                type="range"
                min={0}
                max={data.length - 1}
                value={currentIndex}
                onChange={(e) => setCurrentIndex(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-16 text-right">{currentIndex + 1}</div>
            </div>
          </div>
        </div>

        {/* Right: Metrics (40%) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Section A: Real-Time Quality Scores */}
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="PSNR" value={current.psnr} unit="dB" accent="bg-sky-400/60" />
            <KpiCard label="SSIM" value={current.ssim} accent="bg-emerald-400/60" />
            <KpiCard label="UIQM" value={current.uiqm} accent="bg-violet-400/60" />
          </div>

          {/* Section B: Time-Series Line Chart */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="px-1 pb-2 text-white font-medium">Quality Metrics Over Time</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="frame" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  <Legend
                    onClick={(e: any) => {
                      const key = (e?.dataKey || '') as MetricKey
                      if (!key) return
                      setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
                    }}
                    wrapperStyle={{ cursor: 'pointer' }}
                  />
                  {visible.psnr && <Line type="monotone" dataKey="psnr" name="PSNR (dB)" stroke="#38bdf8" dot={false} strokeWidth={2} />}
                  {visible.ssim && <Line type="monotone" dataKey="ssim" name="SSIM" stroke="#34d399" dot={false} strokeWidth={2} />}
                  {visible.uiqm && <Line type="monotone" dataKey="uiqm" name="UIQM" stroke="#a78bfa" dot={false} strokeWidth={2} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section C: Mission Summary Statistics */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="px-1 pb-3 text-white font-medium">Mission Summary Statistics</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-xs text-white/70">PSNR (dB)</div>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Avg" value={summary.psnr.avg} />
                  <StatCard label="Min" value={summary.psnr.min} />
                  <StatCard label="Max" value={summary.psnr.max} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-white/70">SSIM</div>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Avg" value={summary.ssim.avg} />
                  <StatCard label="Min" value={summary.ssim.min} />
                  <StatCard label="Max" value={summary.ssim.max} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-white/70">UIQM</div>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Avg" value={summary.uiqm.avg} />
                  <StatCard label="Min" value={summary.uiqm.min} />
                  <StatCard label="Max" value={summary.uiqm.max} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


