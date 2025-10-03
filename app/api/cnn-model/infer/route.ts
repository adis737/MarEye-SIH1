import { NextRequest, NextResponse } from "next/server"
import * as path from "path"
import * as fs from "fs/promises"
import { spawn } from "child_process"

export const runtime = "nodejs"

async function runPython(scriptPath: string, args: string[], cwd: string) {
  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
    const py = process.env.PYTHON_EXEC || (process.platform === "win32" ? "python" : "python3")
    const child = spawn(py, [scriptPath, ...args], { cwd })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (d) => (stdout += d.toString()))
    child.stderr.on("data", (d) => (stderr += d.toString()))
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }))
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const repoRoot = process.cwd()
    const modelRoot = path.join(repoRoot, "proj", "Deep_Sea-NN-main")

    // Mirror TRAINING_CONFIG defaults without importing the .py module
    const testDir = path.join(modelRoot, "data", "test_imgs")
    const outDir = path.join(modelRoot, "data", "test_output", "unetssim")

    await fs.mkdir(testDir, { recursive: true })
    await fs.mkdir(outDir, { recursive: true })

    const script = path.join(modelRoot, "web_infer.py")

    let outputPublicUrl = ""
    let metrics: any = null
    if ((file as any).type && (file as any).type.startsWith("video/")) {
      const tmpIn = path.join(modelRoot, `tmp_in_${Date.now()}.mp4`)
      await fs.writeFile(tmpIn, buffer)
      const outMp4 = path.join(modelRoot, `tmp_out_${Date.now()}.mp4`)
      const { stdout, stderr, code } = await runPython(script, ["video", tmpIn, outMp4], modelRoot)
      if (code !== 0) {
        return NextResponse.json({ error: stderr || stdout || "Python error" }, { status: 500 })
      }
      // Script now prints JSON { path, metrics }
      let jsonLine = stdout.trim().split(/\r?\n/).pop() as string
      let vidMetrics: any = null
      try {
        const parsed = JSON.parse(jsonLine)
        if (parsed.path) {
          // overwrite outMp4 to whatever script returned
          const abs = path.isAbsolute(parsed.path) ? parsed.path : path.join(modelRoot, parsed.path)
          const bytesTmp = await fs.readFile(abs)
          const publicName = `cnn_output_${Date.now()}.mp4`
          const publicDir = path.join(repoRoot, "public")
          await fs.mkdir(publicDir, { recursive: true })
          const publicPath = path.join(publicDir, publicName)
          await fs.writeFile(publicPath, bytesTmp)
          outputPublicUrl = `/${publicName}`
        }
        vidMetrics = parsed.metrics ?? null
      } catch {
        const bytes = await fs.readFile(outMp4)
        const publicName = `cnn_output_${Date.now()}.mp4`
        const publicDir = path.join(repoRoot, "public")
        await fs.mkdir(publicDir, { recursive: true })
        const publicPath = path.join(publicDir, publicName)
        await fs.writeFile(publicPath, bytes)
        outputPublicUrl = `/${publicName}`
      }
      metrics = vidMetrics
    } else {
      const safeName = `upload_${Date.now()}.png`
      const inPath = path.join(testDir, safeName)
      await fs.writeFile(inPath, buffer)
      const { stdout, stderr, code } = await runPython(script, ["image", safeName], modelRoot)
      if (code !== 0) {
        return NextResponse.json({ error: stderr || stdout || "Python error" }, { status: 500 })
      }
      // Script now prints JSON { path, metrics }
      let jsonLine = stdout.trim().split(/\r?\n/).pop() as string
      let outputPath = jsonLine
      try {
        const parsed = JSON.parse(jsonLine)
        outputPath = parsed.path
        metrics = parsed.metrics ?? null
      } catch {}
      const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.join(modelRoot, outputPath)
      const fileBytes = await fs.readFile(absoluteOutputPath)
      const publicName = `cnn_output_${Date.now()}.png`
      const publicDir = path.join(repoRoot, "public")
      await fs.mkdir(publicDir, { recursive: true })
      const publicPath = path.join(publicDir, publicName)
      await fs.writeFile(publicPath, fileBytes)
      outputPublicUrl = `/${publicName}`
    }

    if (!outputPublicUrl) {
      return NextResponse.json({ error: "Model did not produce an output." }, { status: 500 })
    }
    return NextResponse.json({ outputUrl: outputPublicUrl, metrics })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


