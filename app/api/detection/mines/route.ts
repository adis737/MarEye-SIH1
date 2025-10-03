import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { runPythonCommand } from "@/lib/python-runner"
import { transcodeToMp4 } from "@/lib/video-transcode"

async function runPython(args: string[], cwd: string) { return runPythonCommand(args, cwd) }

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const repoRoot = process.cwd()
    const weightsDir = path.join(repoRoot, "Detection model", "mines")
    let weightsPath = path.join(weightsDir, "best.pt")
    // Resolve a .pt weight if best.pt is not present
    try {
      await fs.stat(weightsPath)
    } catch {
      try {
        const files = await fs.readdir(weightsDir)
        const pt = files.find(f => f.toLowerCase().endsWith('.pt'))
        if (!pt) {
          return NextResponse.json({ error: `No .pt weights found in ${weightsDir}` }, { status: 404 })
        }
        weightsPath = path.join(weightsDir, pt)
      } catch (e: any) {
        return NextResponse.json({ error: `Weights directory not accessible: ${weightsDir}` }, { status: 404 })
      }
    }

    const tmpDir = path.join(repoRoot, "temp")
    await fs.mkdir(tmpDir, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const inputName = `mines_${Date.now()}` + (file.type.startsWith("video/") ? ".mp4" : ".jpg")
    const inputPath = path.join(tmpDir, inputName)
    await fs.writeFile(inputPath, buffer)

    const outDir = path.join(tmpDir, "yolo_mines")
    await fs.mkdir(outDir, { recursive: true })

    const scriptPath = path.join(repoRoot, "scripts", "yolo_detect.py")
    const media = (file as any).type && (file as any).type.startsWith("video/") ? "video" : "image"
    const args = [scriptPath, "--weights", weightsPath, "--input", inputPath, "--outdir", outDir, "--media", media]
    const { stdout, stderr, code } = await runPython(args, repoRoot)
    if (code !== 0) {
      return NextResponse.json({ error: stderr || stdout || "Detection failed" }, { status: 500 })
    }

    let outputPath = stdout.trim().split(/\r?\n/).pop() || ""
    try {
      const parsed = JSON.parse(outputPath)
      outputPath = parsed.path
    } catch {}

    const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.join(repoRoot, outputPath)
    const isVideo = media === "video"
    let publicName = `mines_${Date.now()}` + (isVideo ? ".mp4" : path.extname(absoluteOutputPath))
    const publicDir = path.join(repoRoot, "public")
    await fs.mkdir(publicDir, { recursive: true })
    const publicPath = path.join(publicDir, publicName)
    if (isVideo) {
      const result = await transcodeToMp4(absoluteOutputPath, publicPath)
      if (!result.transcoded) {
        // Fall back to serving original file if transcode unavailable
        const origExt = path.extname(absoluteOutputPath)
        publicName = `mines_${Date.now()}${origExt || ".avi"}`
        const fallbackPath = path.join(publicDir, publicName)
        const bytes = await fs.readFile(absoluteOutputPath)
        await fs.writeFile(fallbackPath, bytes)
        return NextResponse.json({ outputUrl: `/${publicName}` })
      }
    } else {
      const bytes = await fs.readFile(absoluteOutputPath)
      await fs.writeFile(publicPath, bytes)
    }

    return NextResponse.json({ outputUrl: `/${publicName}` })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


