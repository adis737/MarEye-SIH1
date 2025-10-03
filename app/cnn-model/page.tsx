"use client"

import { useMemo, useRef, useState } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

export default function CnnModelPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{ psnr?: number | null; ssim?: number | null; uiqm?: number | null; uiqm_orig?: number | null; uiqm_enh?: number | null; series?: { frame: number; psnr?: number|null; ssim?: number|null; uiqm_enh?: number|null; uiqm_orig?: number|null }[] } | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResultUrl(null)
    if (!selectedFile) return
    setProcessing(true)
    setMetrics(null)
    try {
      const form = new FormData()
      form.append("file", selectedFile)
      const res = await fetch("/api/cnn-model/infer", {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || "Failed to run inference")
      }
      const txt = await res.text()
      let data: any
      try {
        data = JSON.parse(txt)
      } catch {
        throw new Error("Invalid response from server")
      }
      if (!data?.outputUrl) {
        throw new Error(data?.error || "Model did not return output")
      }
      setResultUrl((data.outputUrl as string) + `?v=${Date.now()}`)
      setMetrics(data.metrics ?? null)
    } catch (err: any) {
      setError(err?.message || "Unexpected error")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6 relative z-20">
      <div className="max-w-3xl mx-auto bg-slate-900/70 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-cyan-200 mb-4">CNN Model Inference</h1>
        <p className="text-slate-300 mb-6">Upload an underwater image or a video file. The model will enhance it and return the processed result.</p>

        <div className="mb-4 p-5 border-2 border-dashed border-cyan-500/40 rounded-lg bg-slate-900/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-slate-200 text-sm">
              {selectedFile ? (
                <div>
                  <div className="font-medium">Selected:</div>
                  <div className="text-cyan-200 break-all">{selectedFile.name} ({Math.ceil(selectedFile.size/1024)} KB)</div>
                </div>
              ) : (
                <div className="text-slate-400">No file selected</div>
              )}
              <div className="text-slate-400 mt-1">Accepted: images (jpg, png) and videos (mp4)</div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                id="cnn-file-input"
                className="hidden"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setSelectedFile(f)
                  setResultUrl(null)
                  setError(null)
                  if (originalUrl) URL.revokeObjectURL(originalUrl)
                  setOriginalUrl(f ? URL.createObjectURL(f) : null)
                }}
              />
              <label
                htmlFor="cnn-file-input"
                className="cursor-pointer inline-flex items-center px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
              >
                Choose file
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <button disabled={processing || !selectedFile} className="px-5 py-3 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium">
            {processing ? "Processing..." : "Run Inference"}
          </button>
        </form>

        {error && <div className="mt-4 text-red-400">{error}</div>}

        {resultUrl && selectedFile && selectedFile.type.startsWith("video/") && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-cyan-200 mb-3">Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-slate-300 mb-2">Original</div>
                <video src={originalUrl ?? undefined} controls className="rounded border border-slate-700 w-full" />
              </div>
              <div>
                <div className="text-slate-300 mb-2">Result</div>
                <video key={resultUrl} controls preload="metadata" className="rounded border border-slate-700 w-full">
                  <source src={resultUrl || undefined} type={resultUrl?.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                </video>
              </div>
            </div>
            {metrics && (
              <div className="mt-4 text-slate-200 text-sm flex gap-6 flex-wrap">
                {typeof metrics.psnr === 'number' && <div>Avg PSNR (Peak Signal-to-Noise Ratio): <span className="text-cyan-300">{metrics.psnr.toFixed(2)} dB</span></div>}
                {typeof metrics.ssim === 'number' && <div>Avg SSIM (Structural Similarity Index): <span className="text-cyan-300">{metrics.ssim.toFixed(3)}</span></div>}
                {typeof metrics.uiqm === 'number' && <div>Avg UIQM (Underwater Image Quality Measure): <span className="text-cyan-300">{metrics.uiqm.toFixed(2)}</span></div>}
              </div>
            )}
            <a href={resultUrl} download className="mt-3 inline-block text-cyan-300 underline">Download result</a>
          </div>
        )}

        {resultUrl && selectedFile && selectedFile.type.startsWith("image/") && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-cyan-200 mb-3">Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-slate-300 mb-2">Original</div>
                <img src={originalUrl ?? undefined} alt="Original" className="rounded border border-slate-700 w-full" />
              </div>
              <div>
                <div className="text-slate-300 mb-2">Result</div>
                <img src={resultUrl} alt="Enhanced output" className="rounded border border-slate-700 w-full" />
              </div>
            </div>
            {metrics && (
              <div className="mt-4 text-slate-200 text-sm flex gap-6 flex-wrap">
                {typeof metrics.psnr === 'number' && <div>PSNR (Peak Signal-to-Noise Ratio): <span className="text-cyan-300">{metrics.psnr.toFixed(2)} dB</span></div>}
                {typeof metrics.ssim === 'number' && <div>SSIM (Structural Similarity Index): <span className="text-cyan-300">{metrics.ssim.toFixed(3)}</span></div>}
                {typeof metrics.uiqm === 'number' && <div>UIQM (Underwater Image Quality Measure): <span className="text-cyan-300">{metrics.uiqm.toFixed(2)}</span></div>}
              </div>
            )}
            <a href={resultUrl} download className="mt-3 inline-block text-cyan-300 underline">Download result</a>
          </div>
        )}

        {metrics?.series && selectedFile && selectedFile.type.startsWith("video/") && (
          <div className="mt-6 rounded-xl bg-slate-900/60 border border-slate-700 p-4">
            <div className="text-cyan-200 font-medium mb-3">Quality Metrics Over Time</div>
            <ChartsGrid series={metrics.series} />
          </div>
        )}
      </div>
    </div>
  )
}
function MiniLineChart({ data }: { data: { frame: number; psnr?: number|null; ssim?: number|null; uiqm?: number|null }[] }) {
  // Lightweight inline chart using SVG to avoid pulling recharts on this page
  const width = 600
  const height = 160
  const padding = 28
  const ps = useMemo(() => data.map(d => (d.psnr ?? 0)), [data])
  const ss = useMemo(() => data.map(d => (d.ssim ?? 0)), [data])
  const maxX = Math.max(1, data.length)
  const minP = Math.min(...ps)
  const maxP = Math.max(...ps)
  const minS = Math.min(...ss)
  const maxS = Math.max(...ss)
  // Avoid flat-looking lines by normalizing to min-max range with small padding
  const rangeP = Math.max(0.001, maxP - minP)
  const rangeS = Math.max(0.001, maxS - minS)
  const toX = (i: number) => padding + (i / (maxX - 1)) * (width - padding * 2)
  const toYNorm = (v: number, min: number, range: number) => height - padding - ((v - min) / range) * (height - padding * 2)
  const path = (vals: number[], min: number, range: number) => vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toYNorm(v, min, range)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      <rect x={0} y={0} width={width} height={height} fill="none" />
      <path d={path(ps, minP, rangeP)} stroke="#38bdf8" fill="none" strokeWidth={2} />
      <path d={path(ss, minS, rangeS)} stroke="#34d399" fill="none" strokeWidth={2} />
      <text x={padding} y={18} className="fill-cyan-300 text-[10px]">PSNR</text>
      <text x={padding+44} y={18} className="fill-emerald-300 text-[10px]">SSIM</text>
    </svg>
  )
}

function ChartsGrid({ series }: { series: { frame: number; psnr?: number|null; ssim?: number|null; uiqm_enh?: number|null; uiqm_orig?: number|null }[] }) {
  const commonTooltip = { background: "rgba(2,6,23,0.95)", border: "1px solid rgba(148,163,184,0.25)", color: "#e2e8f0" }
  return (
    <div className="grid grid-cols-1 gap-8">
      <div>
        <div className="text-slate-200 text-sm mb-2">PSNR (Peak Signal-to-Noise Ratio)</div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 12, right: 16, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="frame" stroke="#a3bffa" tickMargin={8} />
              <YAxis stroke="#a3bffa" label={{ value: "PSNR (dB)", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
              <Tooltip contentStyle={commonTooltip} />
              <Line type="monotone" dataKey="psnr" name="PSNR (dB)" stroke="#38bdf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-slate-200 text-sm mb-2">SSIM (Structural Similarity Index)</div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 12, right: 16, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="frame" stroke="#a3bffa" tickMargin={8} />
              <YAxis stroke="#a3bffa" label={{ value: "SSIM", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
              <Tooltip contentStyle={commonTooltip} />
              <Line type="monotone" dataKey="ssim" name="SSIM" stroke="#34d399" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-slate-200 text-sm mb-2">UIQM (Underwater Image Quality Measure)</div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 24, right: 16, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="frame" stroke="#a3bffa" tickMargin={8} />
              <YAxis stroke="#a3bffa" label={{ value: "UIQM", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
              <Tooltip contentStyle={commonTooltip} />
              <Legend verticalAlign="top" height={20} wrapperStyle={{ color: "#cbd5e1" }} />
              <Line type="monotone" dataKey="uiqm_orig" name="UIQM Original" stroke="#94a3b8" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="uiqm_enh" name="UIQM Enhanced" stroke="#a78bfa" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


