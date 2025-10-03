import { spawn } from "child_process"
import fs from "fs/promises"
import path from "path"

function resolveFfmpegExecutable(): string {
  // 1) Allow explicit override
  const fromEnv = process.env.FFMPEG_PATH
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv

  // 2) Common Windows install paths
  if (process.platform === "win32") {
    const candidates = [
      "C:/Program Files/FFmpeg/bin/ffmpeg.exe",
      "C:/Program Files (x86)/FFmpeg/bin/ffmpeg.exe",
    ]
    for (const p of candidates) {
      try { require("fs").accessSync(p) ; return p } catch {}
    }
  }

  // 3) Fallback to PATH
  return "ffmpeg"
}

export async function transcodeToMp4(inputPath: string, outputMp4Path: string): Promise<{ transcoded: boolean, outPath?: string }>{
  // Try ffmpeg. If it fails or is missing, report no transcode so caller can fallback to original file.
  try {
    const ffmpegExe = resolveFfmpegExecutable()
    const { code } = await new Promise<{ code: number }>((resolve) => {
      const child = spawn(ffmpegExe, [
        "-y",
        "-i", inputPath,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        outputMp4Path,
      ], { stdio: ["ignore", "ignore", "ignore"] })
      child.on("error", () => resolve({ code: 1 }))
      child.on("close", (code) => resolve({ code: code ?? 0 }))
    })
    if (code === 0) {
      return { transcoded: true, outPath: outputMp4Path }
    }
  } catch {}
  return { transcoded: false }
}


