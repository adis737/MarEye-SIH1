"use client"

import { useRef, useState } from "react"

type ModelKey = "divers" | "mines" | "submarines"

export default function DetectionPage() {
  const [model, setModel] = useState<ModelKey>("divers")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const endpoint = `/api/detection/${model}`

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResultUrl(null)
    if (!selectedFile) return
    setProcessing(true)
    try {
      const form = new FormData()
      form.append("file", selectedFile)
      const res = await fetch(endpoint, { method: "POST", body: form })
      const txt = await res.text()
      if (!res.ok) throw new Error(txt || "Failed to run detection")
      let data: any
      try {
        data = JSON.parse(txt)
      } catch {
        throw new Error("Invalid response from server")
      }
      if (!data?.outputUrl) throw new Error("No output returned")
      setResultUrl(`${data.outputUrl}?v=${Date.now()}`)
    } catch (err: any) {
      setError(err?.message || "Unexpected error")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-slate-900/70 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-cyan-200 mb-2">Object Detection</h1>
        <p className="text-slate-300 mb-6">Run YOLO detections for scuba divers, mines, or submarines.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["divers","mines","submarines"] as ModelKey[]).map((key) => (
            <button
              key={key}
              onClick={() => { setModel(key); setResultUrl(null); setError(null) }}
              className={`px-3 py-1.5 rounded border text-sm ${model===key?"bg-cyan-600 border-cyan-500 text-white":"bg-white/5 border-white/10 text-cyan-100 hover:bg-white/10"}`}
            >
              {key.charAt(0).toUpperCase()+key.slice(1)}
            </button>
          ))}
        </div>

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
                id="det-file-input"
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
                htmlFor="det-file-input"
                className="cursor-pointer inline-flex items-center px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
              >
                Choose file
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <button disabled={processing || !selectedFile} className="px-5 py-3 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium">
            {processing ? "Detecting..." : "Run Detection"}
          </button>
        </form>

        {error && <div className="mt-4 text-red-400">{error}</div>}

        {resultUrl && selectedFile && selectedFile.type.startsWith("video/") && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-cyan-200 mb-3">Result</h2>
            <div className="text-slate-400 text-sm mb-2">Output: {resultUrl}</div>
            <video 
              key={resultUrl} 
              controls 
              preload="metadata" 
              className="rounded border border-slate-700 w-full"
              onError={(e) => {
                console.error("Video error:", e)
                setError("Video failed to load. Try downloading the file directly.")
              }}
              onLoadStart={() => console.log("Video loading started")}
              onCanPlay={() => console.log("Video can play")}
            >
              <source src={resultUrl} type="video/mp4" />
              <source src={resultUrl} type="video/webm" />
              <source src={resultUrl} type="video/avi" />
              Your browser does not support the video tag.
            </video>
            <div className="mt-2">
              <a 
                href={resultUrl} 
                download 
                className="text-cyan-300 underline text-sm hover:text-cyan-200"
              >
                Download result video
              </a>
            </div>
          </div>
        )}

        {resultUrl && selectedFile && selectedFile.type.startsWith("image/") && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-cyan-200 mb-3">Result</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-slate-300 mb-2">Original</div>
                <img src={originalUrl ?? undefined} alt="Original" className="rounded border border-slate-700 w-full" />
              </div>
              <div>
                <div className="text-slate-300 mb-2">Detections</div>
                <img src={resultUrl} alt="Detections" className="rounded border border-slate-700 w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


